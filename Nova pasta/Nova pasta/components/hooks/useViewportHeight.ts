import { useEffect, useState } from 'react';

const DEFAULT_HEIGHT = '100vh';

/**
 * Keeps a CSS variable in sync with the real viewport height.
 * Mobile Safari reports dynamic heights; using visualViewport avoids cropped players.
 */
export function useViewportHeight(): string {
  const [height, setHeight] = useState<string>(DEFAULT_HEIGHT);

  useEffect(() => {
    const updateHeight = () => {
      if (typeof window === 'undefined') return;

      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const vhUnit = `${viewportHeight * 0.01}px`;

      document.documentElement.style.setProperty('--app-vh', vhUnit);
      setHeight(`calc(var(--app-vh, 1vh) * 100)`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    window.visualViewport?.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      window.visualViewport?.removeEventListener('resize', updateHeight);
    };
  }, []);

  return height;
}