/**
 * ==============================================================================
 * Anonymous Visitor Analytics Service (visitorLog.js)
 * ==============================================================================
 *
 * WHAT IS THIS FILE?
 * This service collects simple, anonymous statistics whenever someone visits
 * the portfolio website. It helps the site owner understand how many people
 * visited, what device type they used (phone, tablet, or laptop), and what screen
 * size they have.
 *
 * PRIVACY FIRST:
 * - It DOES NOT collect names, phone numbers, or exact addresses.
 * - It never shows intrusive permission popups to the visitor.
 * - It is "fire-and-forget": if the logging request fails or the server is slow,
 *   it fails silently in the background and NEVER interrupts the user's browsing experience.
 */

const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://api.hilpatel.site/api/v1';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');
const LOG_ENDPOINT = `${BASE_URL}/analytics/log/`;

/**
 * Figure out whether the visitor is using a mobile phone, tablet, or desktop computer.
 * It checks the browser's screen width and user-agent string.
 * 
 * @returns {'mobile' | 'tablet' | 'desktop' | 'unknown'}
 */
function detectDeviceCategory() {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth || (window.screen && window.screen.width) || 0;
  const ua = (navigator.userAgent || '').toLowerCase();

  // Tablets typically have screen widths between 768px and 1024px or identify as iPad/tablet
  if (/ipad|tablet|playbook|silk/i.test(ua) || (width >= 768 && width <= 1024)) {
    return 'tablet';
  }
  // Mobile phones typically have screen widths under 768px or identify as iPhone/Android
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua) || width < 768) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Returns the visitor's screen resolution (e.g., "1920x1080").
 * This helps the developer know what screen sizes to test for responsive layouts.
 * 
 * @returns {string} - Resolution in "WIDTHxHEIGHT" format or 'unknown'
 */
function getScreenResolution() {
  if (typeof window === 'undefined' || !window.screen) return 'unknown';
  const w = window.screen.width || 0;
  const h = window.screen.height || 0;
  return w && h ? `${w}x${h}` : 'unknown';
}

// In-memory cache to remember recently logged visits and avoid duplicate counts
const recentLogs = new Map();

/**
 * Prevents counting the same page view multiple times within a short time window.
 * React 18 in development mode intentionally mounts components twice; this filter
 * ensures we only record one clean visit.
 * 
 * @param {string} key - Unique visit identifier (route + theme)
 * @param {number} dedupeWindowMs - Time window in milliseconds (default 15 seconds)
 * @returns {boolean} - True if this was recently logged, false if it is new
 */
function isDuplicateLog(key, dedupeWindowMs = 15000) {
  const now = Date.now();
  const lastTime = recentLogs.get(key);
  if (lastTime && now - lastTime < dedupeWindowMs) {
    return true; // Already logged recently!
  }
  recentLogs.set(key, now);

  // Periodically clean up old timestamps to prevent the memory map from growing indefinitely
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
 * Sends an anonymous visit report to the Django backend.
 * 
 * @param {string} activeTheme - Current theme ('dark' or 'light')
 * @param {string} [customPath] - Optional page route (e.g. '/#projects')
 */
export async function logVisitorVisit(activeTheme, customPath) {
  // 1. Check if visitor logging is explicitly disabled in environment settings
  const isEnabled = import.meta.env.VITE_ENABLE_VISITOR_LOGGING !== 'false';
  if (!isEnabled) {
    return;
  }

  // 2. Determine current webpage address / hash
  const currentPath = customPath || (typeof window !== 'undefined'
    ? `${window.location.pathname || '/'}${window.location.hash || ''}`
    : '/');

  // 3. Clean and standardize theme value
  const normalizedTheme = (activeTheme === 'light' || activeTheme === 'dark')
    ? activeTheme
    : 'unknown';

  // 4. Duplicate prevention check
  const dedupeKey = `${currentPath}|${normalizedTheme}`;
  if (isDuplicateLog(dedupeKey)) {
    return;
  }

  // 5. Fire asynchronous request with a 3.5-second timeout
  try {
    // Detect timezone (e.g., "Asia/Kolkata" or "America/New_York") without asking for permissions
    let timezone = '';
    try {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      }
    } catch (e) {}

    // Check if high-precision GPS coordinates were ALREADY granted by the user on this browser.
    // Notice: We query permission state FIRST and ONLY read coordinates if 'granted'.
    // We NEVER pop up an annoying browser alert asking for location!
    let latitude = null;
    let longitude = null;
    if (typeof navigator !== 'undefined' && 'permissions' in navigator && 'geolocation' in navigator) {
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        if (perm.state === 'granted') {
          const pos = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (p) => resolve(p),
              () => resolve(null),
              { timeout: 1200, maximumAge: 300000 }
            );
          });
          if (pos && pos.coords) {
            latitude = Number(pos.coords.latitude.toFixed(6));
            longitude = Number(pos.coords.longitude.toFixed(6));
          }
        }
      } catch (e) {
        // Safe fallback: non-blocking
      }
    }

    // Assemble the clean anonymous payload
    const payload = {
      path: currentPath,
      device_category: detectDeviceCategory(),
      screen_resolution: getScreenResolution(),
      active_theme: normalizedTheme,
      referrer: (typeof document !== 'undefined' && document.referrer) ? document.referrer.slice(0, 500) : '',
      timezone,
      latitude,
      longitude,
    };

    // Use AbortController to abort the request after 3.5 seconds if network is slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    // Send the data to Django
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true, // Allows request to complete even if the visitor closes the browser tab
      credentials: 'omit',
    });

    clearTimeout(timeoutId);
  } catch (err) {
    // Deliberately swallow errors: visitor logging is non-essential telemetry
    // and must never produce an alert or error for the user.
  }
}


