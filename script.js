document.addEventListener('DOMContentLoaded', function () {
    const mobileFrame = document.querySelector('.mobile-frame');

    function resizeAndPositionFrame() {
        const aspectRatio = 9 / 16;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let frameWidth;
        let frameHeight;

        // Determine the limiting dimension to maintain the aspect ratio within the viewport
        if ((viewportWidth / viewportHeight) > aspectRatio) {
            // Viewport is wider than 9:16, so height is the limiting factor
            frameHeight = viewportHeight;
            frameWidth = frameHeight * aspectRatio;
        } else {
            // Viewport is taller or equal to 9:16, so width is the limiting factor
            frameWidth = viewportWidth;
            frameHeight = frameWidth / aspectRatio;
        }

        // Apply the new dimensions
        mobileFrame.style.width = `${frameWidth}px`;
        mobileFrame.style.height = `${frameHeight}px`;
    }
    const GRAPHQL_ENDPOINT = 'https://portal.commarilia.com/graphql';
    const newsWrapper = document.getElementById('news-wrapper');
    const categoriesWrapper = document.getElementById('categories-wrapper');
    const modal = document.getElementById('read-more-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const onboardingOverlay = document.getElementById('onboarding-overlay');
    const loaderContainer = document.getElementById('loader-container');

    let mainSwiper;
    let newsData = [];
    let selectedCategory = 'Todas';
    let categoriesSwiperInitialized = false;

    const CONTENT_POSITION_CLASSES = {
        top: 'justify-start',
        center: 'justify-center',
        bottom: 'justify-end'
    };

    const TEXT_SIZE_CLASSES = {
        small: 'text-xl lg:text-2xl',
        medium: 'text-2xl lg:text-3xl',
        large: 'text-3xl lg:text-4xl'
    };

    const DESCRIPTION_SIZE_CLASSES = {
        small: 'text-xs lg:text-sm',
        medium: 'text-sm lg:text-base',
        large: 'text-base lg:text-lg'
    };

    window.addEventListener('resize', () => {
        resizeAndPositionFrame();
        // Update swipers to recalculate their dimensions, crucial for responsiveness
        if (mainSwiper && mainSwiper.slides.length > 0) {
            mainSwiper.update();
            mainSwiper.slides.forEach(slide => {
                const horizontalSwiper = slide.querySelector('.swiper-container-h')?.swiper;
                if (horizontalSwiper) {
                    horizontalSwiper.update();
                }
            });
        }
    });

    const GQL_QUERY = `
        query GetStories {
            posts(first: 50) {
                nodes {
                    title
                    content
                    featuredImage {
                        node {
                            sourceUrl(size: LARGE)
                        }
                    }
                    categories {
                        nodes {
                            name
                        }
                    }
                    conteudoDosStories {
                        conteudo {
                            slides {
                                media {
                                    node {
                                        mediaItemUrl
                                        mimeType
                                    }
                                }
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
            if (json.errors) {
                throw new Error('GraphQL Error: ' + json.errors.map(e => e.message).join('\n'));
            }
            return transformData(json.data.posts.nodes);
        } catch (error) {
            console.error("Failed to fetch news data:", error);
            loaderContainer.innerHTML = `<p class="text-white text-center">Não foi possível carregar o conteúdo.<br>Tente novamente mais tarde.</p>`;
            return null;
        }
    }

    function generateDescription(html) {
        if (!html) return '';
        const div = document.createElement('div');
        div.innerHTML = html;

        const listItems = div.querySelectorAll('li');

        if (listItems.length > 0) {
            let htmlContent = '';
            listItems.forEach(li => {
                // Adiciona um bullet, o texto do item e uma quebra de linha HTML.
                htmlContent += `• ${li.textContent.trim()}<br>`;
            });
            // Retorna o conteúdo completo formatado como HTML, sem truncar.
            return htmlContent;
        } else {
            // Para textos sem lista, retorna o texto completo sem truncar.
            const text = div.textContent || div.innerText || '';
            return text;
        }
    }
    
    function transformData(nodes) {
        return nodes.map(post => {
                    const slides = post.conteudoDosStories?.conteudo?.slides || [];
                    return {
                        category: post.categories?.nodes[0]?.name || 'Geral',
                        postTitle: post.title,
                        postContent: post.content || '<p>Conteúdo principal não disponível.</p>',
                        featuredImageUrl: post.featuredImage?.node?.sourceUrl,
                        segments: slides.map(slide => ({
                            mediaUrl: slide.media?.node?.mediaItemUrl,
                            mediaType: slide.media?.node?.mimeType,
                            title: (slide.title || '').trim(),
                            description: generateDescription(slide.text),
                            fullContent: slide.text || '',
                            contentPosition: slide.contentPosition || 'bottom',
                            textSize: slide.textSize || 'medium',
                            showOverlay: slide.showOverlay !== false,
                            showButton: slide.showButton !== false
                        }))
            };
        }).filter(story => story.segments.length > 0);
    }
    
    function createSegmentHTML(segment, newsIndex, segmentIndex) {
        const isVideo = segment.mediaType && segment.mediaType.startsWith('video/');
        const mediaTag = isVideo
            ? `<video class="slide-video-bg" autoplay muted loop playsinline src="${segment.mediaUrl}"></video>`
            : '';
                const backgroundStyle = isVideo ? '' : `style="background-image: url('${segment.mediaUrl}')"`;
                const contentPositionKey = segment.contentPosition || 'bottom';
                const textSizeKey = segment.textSize || 'medium';
                const contentPositionClass = CONTENT_POSITION_CLASSES[contentPositionKey] || CONTENT_POSITION_CLASSES.bottom;
                const textSizeClass = TEXT_SIZE_CLASSES[textSizeKey] || TEXT_SIZE_CLASSES.medium;
                const descriptionSizeClass = DESCRIPTION_SIZE_CLASSES[textSizeKey] || DESCRIPTION_SIZE_CLASSES.medium;
                const hasTitle = Boolean(segment.title && segment.title.trim());
                const hasDescription = Boolean(segment.description && segment.description.trim());
                const titleMarkup = hasTitle ? `<h2 class="font-poppins font-bold mb-2 text-shadow ${textSizeClass}">${segment.title}</h2>` : '';
                const descriptionMarkup = hasDescription ? `<div class="text-shadow ${descriptionSizeClass}">${segment.description}</div>` : '';
                const infoMarkup = (hasTitle || hasDescription)
                    ? `<div class="mb-10">${titleMarkup}${descriptionMarkup}</div>`
                    : '';

                return `
                    <div class="swiper-slide" ${backgroundStyle}>
                        ${mediaTag}
                        ${segment.showOverlay ? '<div class="slide-overlay"></div>' : ''}
                        <div class="z-10 p-6 flex flex-col ${contentPositionClass} h-full w-full text-left">
                            ${infoMarkup}
                            ${segment.showButton ? `
                            <button 
                                class="read-more-btn btn-glass font-bold text-sm self-start transition-transform hover:scale-105 flex items-center gap-2 group"
                                data-news-index="${newsIndex}"
                                data-segment-index="${segmentIndex}">
                                <span>Leia Mais</span>
                        
                    </button>` : ''}
                </div>
            </div>
        `;
    }

    function createVerticalSlide(newsItem, newsIndex) {
        const verticalSlide = document.createElement('div');
        verticalSlide.className = 'swiper-slide';
        verticalSlide.dataset.category = newsItem.category;
        const segmentsHTML = newsItem.segments
            .map((segment, segmentIndex) => createSegmentHTML(segment, newsIndex, segmentIndex))
            .join('');

        verticalSlide.innerHTML = `
            <div class="swiper swiper-container-h">
                <div class="swiper-wrapper">${segmentsHTML}</div>
                <div class="swiper-pagination"></div>
            </div>
        `;

        return verticalSlide;
    }

    function renderCategories() {
        categoriesWrapper.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const categories = ['Todas', ...new Set(newsData.map(item => item.category))];

        categories.forEach(category => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide !w-auto';
            slide.innerHTML = `
                <a href="#" class="category-link inline-block text-white/80 text-xs py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300" data-category="${category}">${category}</a>
            `;
            fragment.appendChild(slide);
        });

        categoriesWrapper.appendChild(fragment);
    }

    function renderNews(category = 'Todas') {
        newsWrapper.innerHTML = '';
        const fragment = document.createDocumentFragment();

        newsData.forEach((newsItem, originalIndex) => {
            if (category !== 'Todas' && newsItem.category !== category) return;
            fragment.appendChild(createVerticalSlide(newsItem, originalIndex));
        });

        newsWrapper.appendChild(fragment);
    }
    function initSwipers() {
        if (!categoriesSwiperInitialized) {
            new Swiper('.swiper-container-categories', { slidesPerView: 'auto', spaceBetween: 10, freeMode: true });
            categoriesSwiperInitialized = true;
        }

        mainSwiper = new Swiper('.swiper-container-v', {
            direction: 'vertical',
            speed: 500,
            on: {
                init: function () {
                   this.slides.forEach(slide => {
                        new Swiper(slide.querySelector('.swiper-container-h'), { pagination: { el: '.swiper-pagination', clickable: true }, speed: 500 });
                    });
                    updateActiveCategory();
                },
                slideChange: function() { updateActiveCategory(); }
            },
        });
    }

    function updateActiveCategory() {
        // Respect the explicitly selectedCategory instead of inferring from slide
        document.querySelectorAll('.category-link').forEach(link => {
            link.classList.toggle('active', link.dataset.category === selectedCategory);
        });
    }

    function applyCategoryFilter(category) {
        selectedCategory = category || 'Todas';
        if (mainSwiper) {
            try { mainSwiper.destroy(true, true); } catch (e) { /* ignore */ }
        }
        renderNews(selectedCategory);
        initSwipers();
        updateActiveCategory();
    }
    
    function openModal(newsIndex, segmentIndex) {
        const story = newsData[newsIndex];
        const segment = story.segments[segmentIndex];

        const imageUrl = story.featuredImageUrl || segment.mediaUrl;
        
        document.getElementById('modal-img').src = imageUrl || '';
        document.getElementById('modal-img').style.display = imageUrl ? 'block' : 'none';
        
        document.getElementById('modal-title').innerText = story.postTitle;
        document.getElementById('modal-body').innerHTML = story.postContent;
        modal.classList.remove('invisible', 'opacity-0');
        // Trigger slide-up animation on open
        setTimeout(() => modal.classList.add('open'), 20);
    }

    function closeModal() {
        modal.classList.remove('open');
        setTimeout(() => modal.classList.add('invisible', 'opacity-0'), 200);
    }

    function setupEventListeners() {
        categoriesWrapper.addEventListener('click', (e) => {
            const link = e.target.closest('.category-link');
            if (link) {
                e.preventDefault();
                const category = link.dataset.category || 'Todas';
                applyCategoryFilter(category);
            }
        });

        newsWrapper.addEventListener('click', (e) => {
            const readMoreBtn = e.target.closest('.read-more-btn');
            if (readMoreBtn) {
                const { newsIndex, segmentIndex } = readMoreBtn.dataset;
                openModal(newsIndex, segmentIndex);
            }
        });

        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        if (onboardingOverlay) {
            onboardingOverlay.addEventListener('click', () => {
                onboardingOverlay.classList.add('opacity-0', 'pointer-events-none');
                setTimeout(() => onboardingOverlay.style.display = 'none', 500);
            });
        }
    }

    async function main() {
        // Call initially to set the size as soon as the DOM is ready
        resizeAndPositionFrame();
        
        const fetchedData = await fetchNewsData();
        if (fetchedData) {
            newsData = fetchedData;
            renderCategories();
            // Force "Todas" active and show all on load
            applyCategoryFilter('Todas');
            setupEventListeners();
            loaderContainer.classList.add('hidden');

            const isFirstVisit = !localStorage.getItem('hasVisitedComMarilia');
            if (isFirstVisit) {
                onboardingOverlay.classList.remove('hidden');
                onboardingOverlay.classList.add('flex'); // Make sure it's a flex container
                setTimeout(() => onboardingOverlay.classList.add('opacity-100'), 50);
                localStorage.setItem('hasVisitedComMarilia', 'true');
            }
        }
    }

    main();
});



