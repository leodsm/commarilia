/**
 * ComMarília - Google Analytics 4 Utility
 * ID: G-LHENCH2RVQ
 *
 * Todos os eventos de rastreamento da plataforma devem passar por aqui.
 * Para adicionar um novo evento, basta criar uma nova função exportada.
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_ID = 'G-LHENCH2RVQ';

/** Dispara um evento customizado no GA4 */
function trackEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, { ...params });
}

// ─── HOME ─────────────────────────────────────────────────────────────────────

/** Usuário clicou em um card de Story na tela Home */
export function trackStoryCardClick(storyId: string, storyTitle: string, category: string) {
  trackEvent('story_card_click', {
    story_id: storyId,
    story_title: storyTitle,
    category,
  });
}

/** Usuário clicou em um filtro de categoria na Home */
export function trackCategoryFilter(category: string) {
  trackEvent('category_filter_click', { category });
}

// ─── PLAYER ───────────────────────────────────────────────────────────────────

/** Player de Story foi aberto */
export function trackPlayerOpen(storyId: string, storyTitle: string, category: string) {
  trackEvent('player_open', {
    story_id: storyId,
    story_title: storyTitle,
    category,
  });
}

/** Player de Story foi fechado */
export function trackPlayerClose(storyId: string, slideReached: number, totalSlides: number) {
  trackEvent('player_close', {
    story_id: storyId,
    slide_reached: slideReached,
    total_slides: totalSlides,
    completion_pct: Math.round((slideReached / totalSlides) * 100),
  });
}

/** Usuário avançou para o próximo slide dentro do player */
export function trackStorySlideChange(storyId: string, slideIndex: number, totalSlides: number) {
  // Só dispara para o último slide (conclusão da story)
  if (slideIndex === totalSlides - 1) {
    trackEvent('story_complete', {
      story_id: storyId,
      total_slides: totalSlides,
    });
  }
}

/** Usuário clicou no botão "Leia Mais" / "Acessar Link" */
export function trackReadMore(storyId: string, storyTitle: string, hasExternalLink: boolean) {
  trackEvent('read_more_click', {
    story_id: storyId,
    story_title: storyTitle,
    has_external_link: hasExternalLink,
  });
}

/** Usuário clicou em um link externo dentro de um slide */
export function trackExternalLinkClick(storyId: string, url: string) {
  trackEvent('external_link_click', {
    story_id: storyId,
    link_url: url,
  });
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

/** Modal da notícia completa foi aberto */
export function trackModalOpen(storyId: string, storyTitle: string, category: string) {
  trackEvent('modal_open', {
    story_id: storyId,
    story_title: storyTitle,
    category,
  });
}

/** Modal da notícia completa foi fechado */
export function trackModalClose(storyId: string, scrollDepthPct: number) {
  trackEvent('modal_close', {
    story_id: storyId,
    scroll_depth_pct: scrollDepthPct,
  });
}

/** Usuário chegou ao fim do conteúdo do Modal (leu até o fim) */
export function trackModalComplete(storyId: string, storyTitle: string) {
  trackEvent('modal_read_complete', {
    story_id: storyId,
    story_title: storyTitle,
  });
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

/** Tela de Onboarding foi exibida */
export function trackOnboardingShown() {
  trackEvent('onboarding_shown');
}

/** Usuário dispensou o Onboarding */
export function trackOnboardingDismissed() {
  trackEvent('onboarding_dismissed');
}

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

/** Rastreia scroll depth — passe a porcentagem já calculada */
export function trackScrollDepth(pageName: string, depthPct: 25 | 50 | 75 | 100) {
  trackEvent('scroll_depth', {
    page_name: pageName,
    depth_pct: depthPct,
  });
}

/** Alias genérico — use apenas como fallback para eventos não mapeados acima */
export { trackEvent };
