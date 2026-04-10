import fs from 'fs';
import path from 'path';

const dir = 'd:/Leo/ComMarilia/Projeto_Cards';
const filesToUpdate = [
    'Rio_do_peixe.html',
    'curiosidades.html',
    'fatos_historicos.html',
    'personalidades.html',
    'saude_regional.html',
    'vale_silico.html'
];

for (const filename of filesToUpdate) {
    const filePath = path.join(dir, filename);
    let content = fs.readFileSync(filePath, 'utf8');

    // MIGRATION 1: Replace html2canvas script with html-to-image
    content = content.replace(
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>',
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js"></script>'
    );

    // MIGRATION 2: Replace fileInput EventListener with URL.createObjectURL logic
    const newFileInput = `fileInput.addEventListener('change', function (e) {
            if (this.files && this.files.length > 0 && currentTargetZone) {
                const file = this.files[0];
                if (!file.type.startsWith('image/')) return;

                const imgURL = URL.createObjectURL(file);
                const oldImg = currentTargetZone.querySelector('.draggable-img');
                if (oldImg) {
                    URL.revokeObjectURL(oldImg.src); // Limpa a memória anterior
                    oldImg.remove();
                }

                const img = document.createElement('img');
                img.src = imgURL;
                img.classList.add('draggable-img');

                img.onload = function () {
                    const cw = 1080;
                    const ch = currentExportHeight;
                    const iw = img.naturalWidth;
                    const ih = img.naturalHeight;

                    img.style.width = iw + 'px';
                    img.style.height = ih + 'px';

                    const coverScale = Math.max(cw / iw, ch / ih);

                    img.dataset.baseScale = coverScale;
                    img.dataset.scale = coverScale;
                    img.dataset.tx = 0;
                    img.dataset.ty = 0;

                    updateImgTransform(img);

                    const slider = currentTargetZone.querySelector('.zoom-slider');
                    if (slider) slider.value = 1;
                };

                currentTargetZone.appendChild(img);
                currentTargetZone.classList.add('has-image');
            }
            this.value = '';
        });`;
    
    content = content.replace(/fileInput\.addEventListener\('change', function \(e\) \{[\s\S]*?this\.value\s*=\s*'';\s*\}\);/, newFileInput);

    // MIGRATION 3: Replace old cloning logic (that hides UI elements on original DOM) with direct clone modification
    const cloneSourceMatch = /const controls = cards\[i\]\.querySelectorAll\('\.image-controls'\);\s*const zoomPanels = cards\[i\]\.querySelectorAll\('\.zoom-panel'\);\s*controls\.forEach\(c => c\.style\.display = 'none'\);\s*zoomPanels\.forEach\(p => p\.style\.display = 'none'\);\s*const clone = cards\[i\]\.cloneNode\(true\);/;
    
    content = content.replace(
        cloneSourceMatch,
        `const clone = cards[i].cloneNode(true);\n\n                    // Remover elementos não exportáveis do CLONE para não piscarem na UI do usuário\n                    clone.querySelectorAll('.image-controls, .zoom-panel, .upload-prompt').forEach(el => el.remove());`
    );

    // Also remove the restore logic at the end of loop
    const restoreLogicRegex = /controls\.forEach\(c => \{[\s\S]*?\}\);\s*zoomPanels\.forEach\(p => \{[\s\S]*?\}\);/;
    content = content.replace(restoreLogicRegex, "");

    // MIGRATION 4: Replace html2canvas invocation with htmlToImage.toPng
    const canvasRegex = /const canvas = await html2canvas\(clone, \{\s*scale: 1,\s*width: 1080,\s*height: currentExportHeight,\s*windowWidth: 1080,\s*windowHeight: currentExportHeight,\s*backgroundColor:\s*'([^']+)',\s*logging: false,\s*useCORS: true,\s*allowTaint: true\s*\}\);/;
    
    const match = content.match(canvasRegex);
    if (!match) {
        console.log("Could not find html2canvas config in " + filename);
    } else {
        const bgColor = match[1];
        
        const newHtmlToImage = `const dataUrl = await htmlToImage.toPng(clone, {
                        pixelRatio: 1, // Impede borrões de Retina Display
                        height: currentExportHeight,
                        width: 1080,
                        backgroundColor: '${bgColor}',
                        style: {
                            transform: 'none'
                        }
                    });`;
        
        content = content.replace(canvasRegex, newHtmlToImage);
        
        // Update download href link
        content = content.replace(/link\.href = canvas\.toDataURL\('image\/png', 1\.0\);/, "link.href = dataUrl;");
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filename}`);
}

console.log("All HTML cards successfully migrated!");
