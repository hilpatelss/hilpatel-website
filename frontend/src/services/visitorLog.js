// Lightweight, asynchronous visitor logging service
// Completely isolated and fire-and-forget: failure NEVER impacts the website

const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://api.hilpatel.site/api/v1';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');
const LOG_ENDPOINT = `${BASE_URL}/analytics/log/`;

// Heuristic client device detection
function detectDeviceCategory() {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth || (window.screen && window.screen.width) || 0;
  const ua = (navigator.userAgent || '').toLowerCase();

  if (/ipad|tablet|playbook|silk/i.test(ua) || (width >= 768 && width <= 1024)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua) || width < 768) {
    return 'mobile';
  }
  return 'desktop';
}

// Browser screen resolution
function getScreenResolution() {
  if (typeof window === 'undefined' || !window.screen) return 'unknown';
  const w = window.screen.width || 0;
  const h = window.screen.height || 0;
  return w && h ? `${w}x${h}` : 'unknown';
}

// In-memory / sessionStorage deduplication cache
const recentLogs = new Map();

function isDuplicateLog(key, dedupeWindowMs = 15000) {
  const now = Date.now();
  const lastTime = recentLogs.get(key);
  if (lastTime && now - lastTime < dedupeWindowMs) {
    return true;
  }
  recentLogs.set(key, now);

  // Clean old keys periodically
  if (recentLogs.size > 50) {
    for (const [k, time] of recentLogs.entries()) {
      if (now - time > dedupeWindowMs * 2) {
        recentLogs.delete(k);
      }
    }
  }
  return false;
}

/**
 * Records an anonymous visitor log event.
 * Must never throw or block UI rendering under any circumstances.
 *
 * @param {string} activeTheme - 'dark' | 'light' from centralized theme state
 * @param {string} [customPath] - optional custom path or route
 */
export async function logVisitorVisit(activeTheme, customPath) {
  // 1. Check optional environment disable toggle
  const isEnabled = import.meta.env.VITE_ENABLE_VISITOR_LOGGING !== 'false';
  if (!isEnabled) {
    return;
  }

  // 2. Determine route path
  const currentPath = customPath || (typeof window !== 'undefined'
    ? `${window.location.pathname || '/'}${window.location.hash || ''}`
    : '/');

  // 3. Normalize theme
  const normalizedTheme = (activeTheme === 'light' || activeTheme === 'dark')
    ? activeTheme
    : 'unknown';

  // 4. Duplicate prevention (avoids double-counting React 18 strict mode re-mounts)
  const dedupeKey = `${currentPath}|${normalizedTheme}`;
  if (isDuplicateLog(dedupeKey)) {
    return;
  }

  // 5. Fire asynchronous request with strict timeout
  try {
    const payload = {
      path: currentPath,
      device_category: detectDeviceCategory(),
      screen_resolution: getScreenResolution(),
      active_theme: normalizedTheme,
      referrer: (typeof document !== 'undefined' && document.referrer) ? document.referrer.slice(0, 500) : '',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true,
      credentials: 'omit',
    });

    clearTimeout(timeoutId);
  } catch (err) {
    // Deliberately swallow errors: visitor logging must never throw or alert the visitor
  }
}

