import fs from 'fs';
import path from 'path';

const dir = 'd:/Leo/ComMarilia/Projeto_Cards';
const filesToUpdate = [
    'Rio_do_peixe.html',
    'bosque.html',
    'capita_nacional_alimentos.html',
    'curiosidades.html',
    'fatos_historicos.html',
    'personalidades.html',
    'saude_regional.html',
    'vale_silico.html'
];

for (const filename of filesToUpdate) {
    const filePath = path.join(dir, filename);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Check for export container presence. If it exists, update it. If not, add it before <script>
    if (!content.includes('id="export-container"')) {
        content = content.replace(/<script>/, '<div id="export-container"></div>\n\n    <script>');
    }

    // 2. Replace the HTML-TO-IMAGE library if it's the old html2canvas
    content = content.replace(
        /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas\/[^"]+"><\/script>/g,
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js"></script>'
    );

    // 3. Replace the entire exportarCardIndividual function
    const exportIndividualRegex = /async function exportarCardIndividual\(e, btn\) \{[\s\S]*?icone\.className = classeOriginal;\s*exportContainer\.innerHTML = '';\s*exportContainer\.style\.display = 'none';\s*\}/;
    
    // Extracted from ir_2026_ad.html line 982-1042
    const newExportIndividual = `async function exportarCardIndividual(e, btn) {
            e.stopPropagation();
            const cardOriginal = btn.closest('.storie-card');

            let exportContainer = document.getElementById('export-container');
            if(!exportContainer) {
                exportContainer = document.createElement('div');
                exportContainer.id = 'export-container';
                document.body.appendChild(exportContainer);
            }
            exportContainer.style.width = '1080px';
            exportContainer.style.height = currentExportHeight + 'px';
            exportContainer.style.position = 'fixed';
            exportContainer.style.top = '0';
            exportContainer.style.left = '-9999px';
            exportContainer.style.display = 'block';

            const clone = cardOriginal.cloneNode(true);
            clone.querySelectorAll('.image-controls, .zoom-panel, .upload-prompt').forEach(el => el.remove());
            clone.style.transform = 'none';
            clone.style.width = '1080px';
            clone.style.height = currentExportHeight + 'px';
            clone.style.position = 'relative';
            clone.style.left = '0';
            clone.style.top = '0';
            clone.style.margin = '0';
            clone.style.aspectRatio = 'auto';

            exportContainer.innerHTML = '';
            exportContainer.appendChild(clone);

            const icone = btn.querySelector('i');
            const classeOriginal = icone.className;
            icone.className = 'fa-solid fa-spinner fa-spin';

            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 300));

            try {
                const dataUrl = await htmlToImage.toPng(clone, {
                    pixelRatio: 1,
                    width: 1080,
                    height: currentExportHeight,
                    backgroundColor: getComputedStyle(cardOriginal).backgroundColor,
                    style: { transform: 'none' }
                });

                const titleEl = cardOriginal.querySelector('.storie-title');
                let titleText = titleEl ? titleEl.innerText.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15) : 'Card';
                const formatName = currentExportHeight === 1920 ? 'Story' : 'Feed';

                const link = document.createElement('a');
                link.download = \`ComMarilia_\${titleText}_\${formatName}.png\`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Erro na exportação:', error);
                alert('Erro ao exportar a imagem. Verifique o console.');
            }

            icone.className = classeOriginal;
            exportContainer.innerHTML = '';
            exportContainer.style.display = 'none';
        }`;

    content = content.replace(exportIndividualRegex, newExportIndividual);

    // 4. Replace the entire exportarImagens function
    const exportImagensRegex = /async function exportarImagens\(\) \{[\s\S]*?exportContainer\.innerHTML = '';\s*exportContainer\.style\.display = 'none';\s*btn\.innerHTML = textoOriginal;\s*btn\.disabled = false;\s*\}/;

    const newExportImagens = `async function exportarImagens() {
            const btn = document.getElementById('download-btn');
            const cards = document.querySelectorAll('.storie-card[data-export="true"]');

            const textoOriginal = btn.innerHTML;
            btn.disabled = true;

            let exportContainer = document.getElementById('export-container');
            if(!exportContainer) {
                exportContainer = document.createElement('div');
                exportContainer.id = 'export-container';
                document.body.appendChild(exportContainer);
            }
            exportContainer.style.width = '1080px';
            exportContainer.style.height = currentExportHeight + 'px';
            exportContainer.style.position = 'fixed';
            exportContainer.style.top = '0';
            exportContainer.style.left = '-9999px';
            exportContainer.style.display = 'block';

            await document.fonts.ready;

            for (let i = 0; i < cards.length; i++) {
                try {
                    btn.innerHTML = \`<i class="fa-solid fa-spinner fa-spin"></i> Exportando (\${i + 1}/\${cards.length})...\`;

                    const clone = cards[i].cloneNode(true);
                    clone.querySelectorAll('.image-controls, .zoom-panel, .upload-prompt').forEach(el => el.remove());

                    clone.style.transform = 'none';
                    clone.style.width = '1080px';
                    clone.style.height = currentExportHeight + 'px';
                    clone.style.position = 'relative';
                    clone.style.left = '0';
                    clone.style.top = '0';
                    clone.style.margin = '0';
                    clone.style.aspectRatio = 'auto';

                    exportContainer.innerHTML = '';
                    exportContainer.appendChild(clone);

                    await new Promise(resolve => setTimeout(resolve, 300));

                    const dataUrl = await htmlToImage.toPng(clone, {
                        pixelRatio: 1,
                        width: 1080,
                        height: currentExportHeight,
                        backgroundColor: getComputedStyle(cards[i]).backgroundColor,
                        style: { transform: 'none' }
                    });

                    const formatName = currentExportHeight === 1920 ? 'Story' : 'Feed';
                    const link = document.createElement('a');
                    link.download = \`ComMarilia_\${formatName}_0\${i + 1}.png\`;
                    link.href = dataUrl;

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (error) {
                    console.error("Erro ao gerar card " + (i + 1), error);
                }
            }

            exportContainer.innerHTML = '';
            exportContainer.style.display = 'none';
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }`;

    content = content.replace(exportImagensRegex, newExportImagens);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated " + filename);
}
