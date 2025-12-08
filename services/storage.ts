export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors (Safari private mode, ITP, etc.)
  }
}

