document.addEventListener('DOMContentLoaded', function () {
    const GRAPHQL_ENDPOINT = 'https://portal.commarilia.com/graphql';
    
    // Elementos DOM
    const newsWrapper = document.getElementById('news-wrapper');
    const categoriesWrapper = document.getElementById('categories-wrapper');
    const modal = document.getElementById('read-more-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const onboardingOverlay = document.getElementById('onboarding-overlay');
    const loaderContainer = document.getElementById('loader-container');

    // Estado da Aplicação
    let mainSwiper;
    let newsData = [];
    let selectedCategory = 'Todas';
    let categoriesSwiperInitialized = false;
    let initialStoryId = null;
    let initialSegmentId = null;

    // Constantes de estilo
    const CONTENT_POSITION_CLASSES = { top: 'justify-start', center: 'justify-center', bottom: 'justify-end' };
    const TEXT_SIZE_CLASSES = { small: 'text-lg md:text-xl', medium: 'text-2xl md:text-3xl', large: 'text-3xl md:text-4xl' };

    // --- Otimização de Imagem e Vídeo (Lazy Load) ---
    
    // Função para pausar/tocar vídeos com base na visibilidade
    function manageMediaPlayback(slide, shouldPlay) {
        if (!slide) return;
        
        // Pausa vídeos no slide anterior/outros
        const allVideos = document.querySelectorAll('video');
        allVideos.forEach(v => {
            if (v !== slide.querySelector('video')) {
                v.pause();
            }
        });

        const video = slide.querySelector('video');
        if (video) {
            if (shouldPlay) {
                // Só tenta dar play se a fonte já estiver carregada
                if (video.readyState >= 2) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => console.log('Autoplay prevent:', error));
                    }
                } else {
                    // Se não estiver carregado, carrega e toca
                    loadMediaSource(video);
                    video.addEventListener('canplay', () => video.play(), { once: true });
                }
            } else {
                video.pause();
            }
        }
    }

    // Carrega a fonte real (src) a partir do data-src
    function loadMediaSource(element) {
        if (!element || element.getAttribute('src')) return; // Já carregado
        
        const dataSrc = element.getAttribute('data-src');
        if (dataSrc) {
            element.setAttribute('src', dataSrc);
            element.onload = () => {
                element.classList.remove('lazy-blur');
                element.classList.add('lazy-loaded');
            };
            // Para vídeo
            element.onloadeddata = () => {
                element.classList.remove('lazy-blur');
                element.classList.add('lazy-loaded');
            };
        }
    }

    // Lógica principal de Smart Loading: Carrega Atual, Próximo e Anterior
    function handleSmartLoading(swiperInstance) {
        const activeIndex = swiperInstance.activeIndex;
        const slides = swiperInstance.slides;

        // Índices para pré-carregar (Atual, Próximo, Anterior)
        const indicesToLoad = [activeIndex, activeIndex + 1, activeIndex - 1];

        indicesToLoad.forEach(idx => {
            if (slides[idx]) {
                const mediaEl = slides[idx].querySelector('[data-src]');
                if (mediaEl) loadMediaSource(mediaEl);
                
                // Se for um swiper vertical (stories), precisamos carregar a mídia do swiper horizontal interno
                const horizontalSwiperEl = slides[idx].querySelector('.swiper-container-h');
                if (horizontalSwiperEl && horizontalSwiperEl.swiper) {
                    const hIndex = horizontalSwiperEl.swiper.activeIndex;
                    const hSlides = horizontalSwiperEl.swiper.slides;
                    // Carrega slide horizontal atual e próximo
                    [hIndex, hIndex + 1].forEach(hIdx => {
                        if (hSlides[hIdx]) {
                            const hMedia = hSlides[hIdx].querySelector('[data-src]');
                            if (hMedia) loadMediaSource(hMedia);
                        }
                    });
                }
            }
        });

        // Gerencia autoplay apenas do slide ativo atual
        const activeSlide = slides[activeIndex];
        if (activeSlide) {
            // Se for slide vertical, verifica se tem horizontal dentro
            const hSwiper = activeSlide.querySelector('.swiper-container-h')?.swiper;
            if (hSwiper) {
                const activeHSlide = hSwiper.slides[hSwiper.activeIndex];
                manageMediaPlayback(activeHSlide, true);
            } else {
                // Caso seja slide simples (não deve ocorrer nesta estrutura, mas por segurança)
                manageMediaPlayback(activeSlide, true);
            }
        }
    }

    // --- Busca de Dados ---

    const GQL_QUERY = `
        query GetStories {
            posts(first: 40) {
                nodes {
                    id
                    slug
                    title
                    content
                    featuredImage { node { sourceUrl(size: LARGE) } }
                    categories { nodes { name } }
                    conteudoDosStories {
                        conteudo {
                            slides {
                                media { node { mediaItemUrl mimeType } }
                                title
                                text
                                contentPosition
                                textSize
                                showOverlay
                                showButton
                            }
                        }
                    }
                }
            }
        }`;

    async function fetchNewsData() {
        try {
            const response = await fetch(GRAPHQL_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: GQL_QUERY })
            });
            const json = await response.json();
            return transformData(json.data.posts.nodes);
        } catch (error) {
            console.error("Erro ao carregar:", error);
            loaderContainer.innerHTML = `<div class="text-white text-center p-4"><p>Erro de conexão.</p><button onclick="location.reload()" class="mt-4 px-4 py-2 bg-white text-black rounded">Tentar novamente</button></div>`;
            return null;
        }
    }

    function slugify(value) {
        return (value || '').normalize('NFD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
    }

    function generateDescription(html) {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        const listItems = tmp.querySelectorAll('li');
        if (listItems.length > 0) {
            return Array.from(listItems).map(li => `• ${li.textContent.trim()}`).join('<br>');
        }
        return tmp.textContent || tmp.innerText || '';
    }

    function transformData(nodes) {
        return nodes.map((post, postIndex) => {
            const slides = post.conteudoDosStories?.conteudo?.slides || [];
            if (slides.length === 0) return null; // Ignora posts sem stories
            
            return {
                category: post.categories?.nodes[0]?.name || 'Geral',
                postTitle: post.title,
                postContent: post.content, // HTML completo para o modal
                featuredImageUrl: post.featuredImage?.node?.sourceUrl,
                storyId: post.slug || slugify(post.title),
                segments: slides.map((slide, segmentIndex) => ({
                    segmentId: slugify(slide?.title) || `seg-${segmentIndex}`,
                    mediaUrl: slide.media?.node?.mediaItemUrl || 'https://picsum.photos/1080/1920', // Fallback
                    mediaType: slide.media?.node?.mimeType,
                    title: (slide.title || '').trim(),
                    description: generateDescription(slide.text),
                    contentPosition: slide.contentPosition || 'bottom',
                    textSize: slide.textSize || 'medium',
                    showOverlay: slide.showOverlay !== false,
                    showButton: slide.showButton !== false
                }))
            };
        }).filter(Boolean);
    }

    // --- Renderização DOM ---

    function createSegmentHTML(segment, newsIndex, segmentIndex) {
        const isVideo = segment.mediaType && segment.mediaType.startsWith('video/');
        
        // Usa data-src para lazy loading. Adiciona classe lazy-blur para efeito visual.
        const mediaTag = isVideo
            ? `<video class="slide-media-bg lazy-blur" playsinline loop muted data-src="${segment.mediaUrl}" poster="${segment.mediaUrl}?frame=0"></video>`
            : `<img class="slide-media-bg lazy-blur" data-src="${segment.mediaUrl}" alt="Story Image">`;

        const positionClass = CONTENT_POSITION_CLASSES[segment.contentPosition] || CONTENT_POSITION_CLASSES.bottom;
        const textSizeClass = TEXT_SIZE_CLASSES[segment.textSize] || TEXT_SIZE_CLASSES.medium;
        const paddingClass = segment.contentPosition === 'bottom' ? 'pb-24' : 'pb-12';

        let contentHTML = '';
        if (segment.title || segment.description) {
            contentHTML = `
                <div class="flex flex-col gap-2 max-w-full">
                    ${segment.title ? `<h2 class="font-poppins font-bold text-shadow leading-tight ${textSizeClass}">${segment.title}</h2>` : ''}
                    ${segment.description ? `<div class="text-shadow-sm text-sm md:text-base opacity-90 leading-snug font-medium">${segment.description}</div>` : ''}
                </div>`;
        }

        let buttonHTML = '';
        if (segment.showButton) {
            buttonHTML = `
                <button class="read-more-btn btn-glass mt-4 self-start"
                    data-news-index="${newsIndex}">
                    <span>Ler notícia completa</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>`;
        }

        return `
            <div class="swiper-slide" data-segment-id="${segment.segmentId}">
                ${mediaTag}
                ${segment.showOverlay ? '<div class="slide-overlay"></div>' : ''}
                <div class="z-10 p-6 absolute inset-0 flex flex-col ${positionClass} ${paddingClass} text-left w-full">
                    ${contentHTML}
                    ${buttonHTML}
                </div>
            </div>
        `;
    }

    function createStorySlide(story, index) {
        const div = document.createElement('div');
        div.className = 'swiper-slide';
        div.dataset.storyId = story.storyId;
        div.dataset.category = story.category;

        const segmentsHTML = story.segments.map((seg, segIdx) => createSegmentHTML(seg, index, segIdx)).join('');

        div.innerHTML = `
            <div class="swiper swiper-container-h w-full h-full">
                <div class="swiper-wrapper">${segmentsHTML}</div>
                <div class="swiper-pagination"></div>
                <!-- Áreas de toque para navegação -->
                <div class="absolute inset-y-0 left-0 w-1/4 z-20 nav-prev"></div>
                <div class="absolute inset-y-0 right-0 w-1/4 z-20 nav-next"></div>
            </div>
        `;
        return div;
    }

    // --- Categorias ---
    function renderCategories() {
        categoriesWrapper.innerHTML = '';
        const uniqueCategories = ['Todas', ...new Set(newsData.map(i => i.category))];
        
        uniqueCategories.forEach(cat => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide !w-auto';
            slide.innerHTML = `<a href="#" class="category-link ${cat === 'Todas' ? 'active' : ''}" data-category="${cat}">${cat}</a>`;
            categoriesWrapper.appendChild(slide);
        });
    }

    // --- Inicialização Swiper ---
    
    function initSwipers() {
        if (!categoriesSwiperInitialized) {
            new Swiper('.swiper-container-categories', { 
                slidesPerView: 'auto', 
                spaceBetween: 8, 
                freeMode: true 
            });
            categoriesSwiperInitialized = true;
        }

        mainSwiper = new Swiper('.swiper-container-v', {
            direction: 'vertical',
            speed: 400,
            spaceBetween: 0,
            threshold: 10, // Evita swipes acidentais
            mousewheel: true,
            on: {
                init: function () {
                    this.slides.forEach(setupHorizontalSwiper);
                    handleSmartLoading(this);
                    checkUrlParams(this);
                },
                slideChangeTransitionStart: function () {
                    handleSmartLoading(this);
                    updateActiveCategoryBySlide(this.slides[this.activeIndex]);
                },
                slideChangeTransitionEnd: function() {
                    // Atualiza URL para story atual
                    const activeSlide = this.slides[this.activeIndex];
                    if(activeSlide) updateUrl(activeSlide.dataset.storyId);
                }
            },
        });
    }

    function setupHorizontalSwiper(slide) {
        const container = slide.querySelector('.swiper-container-h');
        if (!container || container.swiper) return;

        const hSwiper = new Swiper(container, {
            speed: 300,
            nested: true, // Importante para scroll vertical funcionar
            pagination: { el: container.querySelector('.swiper-pagination'), clickable: true, type: 'bullets' },
            on: {
                slideChange: function() {
                    const activeHSlide = this.slides[this.activeIndex];
                    manageMediaPlayback(activeHSlide, true);
                }
            }
        });

        // Toque para navegar (melhor UX que apenas swipe)
        slide.querySelector('.nav-prev').addEventListener('click', () => {
            if (hSwiper.activeIndex === 0) mainSwiper.slidePrev();
            else hSwiper.slidePrev();
        });
        slide.querySelector('.nav-next').addEventListener('click', () => {
            if (hSwiper.isEnd) mainSwiper.slideNext();
            else hSwiper.slideNext();
        });
    }

    // --- Filtragem e Navegação ---

    function filterStories(category) {
        selectedCategory = category;
        
        // Atualiza UI Categoria
        document.querySelectorAll('.category-link').forEach(l => {
            l.classList.toggle('active', l.dataset.category === category);
        });

        // Filtra dados
        const filteredData = category === 'Todas' ? newsData : newsData.filter(d => d.category === category);
        
        if (mainSwiper) mainSwiper.destroy(true, true);
        newsWrapper.innerHTML = '';
        
        // Renderização em Chunks (Performance)
        // 1. Renderiza primeiros 2 imediatamente
        const firstBatch = filteredData.slice(0, 2);
        firstBatch.forEach((item, index) => {
            newsWrapper.appendChild(createStorySlide(item, category === 'Todas' ? newsData.indexOf(item) : index));
        });

        initSwipers();

        // 2. Renderiza o resto em background
        if (filteredData.length > 2) {
            setTimeout(() => {
                const remaining = filteredData.slice(2);
                const fragment = document.createDocumentFragment();
                remaining.forEach((item) => {
                    const originalIndex = newsData.indexOf(item); // Mantém referência para modal
                    fragment.appendChild(createStorySlide(item, originalIndex));
                });
                
                if (mainSwiper) {
                    mainSwiper.appendSlide(Array.from(fragment.children));
                    // Inicializa os novos swipers horizontais
                    mainSwiper.slides.slice(2).forEach(setupHorizontalSwiper);
                }
            }, 100);
        }
    }

    function updateActiveCategoryBySlide(slide) {
        if (!slide) return;
        const category = slide.dataset.category;
        if (selectedCategory === 'Todas' && category) {
             // Opcional: Destacar a categoria do slide atual visualmente na barra, mas manter filtro "Todas"
        }
    }

    function updateUrl(storyId) {
        const url = new URL(window.location);
        if (storyId) url.searchParams.set('story', storyId);
        else url.searchParams.delete('story');
        window.history.replaceState({}, '', url);
    }

    function checkUrlParams(swiper) {
        const params = new URLSearchParams(window.location.search);
        const storyId = params.get('story');
        if (storyId) {
            const index = Array.from(swiper.slides).findIndex(s => s.dataset.storyId === storyId);
            if (index >= 0) swiper.slideTo(index, 0);
        }
    }

    // --- Modal Logic ---

    function openModal(newsIndex) {
        const story = newsData[newsIndex];
        if (!story) return;

        const imgEl = document.getElementById('modal-img');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const contentContainer = document.getElementById('modal-content-scroll');

        // Reset scroll
        contentContainer.scrollTop = 0;

        imgEl.src = story.featuredImageUrl || story.segments[0].mediaUrl;
        titleEl.innerText = story.postTitle;
        // Injeção de HTML segura ou sanitizada (assumindo que vem limpa do WP)
        bodyEl.innerHTML = story.postContent || '<p>Conteúdo não disponível.</p>';

        modal.classList.remove('invisible', 'opacity-0');
        setTimeout(() => modal.classList.add('open'), 10);
        
        // Pausa vídeo de fundo
        const activeSlide = document.querySelector('.swiper-slide-active .swiper-slide-active video');
        if (activeSlide) activeSlide.pause();
    }

    function closeModal() {
        modal.classList.remove('open');
        setTimeout(() => modal.classList.add('invisible', 'opacity-0'), 300);
        
        // Retoma vídeo de fundo
        const activeSlide = document.querySelector('.swiper-slide-active .swiper-slide-active video');
        if (activeSlide) activeSlide.play();
    }

    // --- Init ---

    async function main() {
        // Pega parâmetros URL antes de limpar
        const params = new URLSearchParams(window.location.search);
        initialStoryId = params.get('story');

        const data = await fetchNewsData();
        
        // Remove loader com fade
        loaderContainer.style.opacity = '0';
        setTimeout(() => loaderContainer.style.display = 'none', 500);

        if (data && data.length > 0) {
            newsData = data;
            renderCategories();
            filterStories('Todas');

            // Event Listeners
            categoriesWrapper.addEventListener('click', (e) => {
                const link = e.target.closest('.category-link');
                if (link) {
                    e.preventDefault();
                    filterStories(link.dataset.category);
                }
            });

            newsWrapper.addEventListener('click', (e) => {
                const btn = e.target.closest('.read-more-btn');
                if (btn) openModal(btn.dataset.newsIndex);
            });

            closeModalBtn.addEventListener('click', closeModal);
            // Fecha modal ao clicar no backdrop (mas não no painel)
            modal.addEventListener('click', (e) => { 
                if (e.target === modal) closeModal(); 
            });

            // Onboarding Check
            if (!localStorage.getItem('onboardingSeen')) {
                onboardingOverlay.classList.remove('hidden');
                onboardingOverlay.addEventListener('click', () => {
                    onboardingOverlay.style.opacity = '0';
                    setTimeout(() => onboardingOverlay.style.display = 'none', 300);
                    localStorage.setItem('onboardingSeen', 'true');
                    // Tenta iniciar áudio/vídeo após interação do usuário
                    const activeVideo = document.querySelector('.swiper-slide-active video');
                    if (activeVideo) activeVideo.play().catch(()=>{});
                });
            }
        }
    }

    main();
});
