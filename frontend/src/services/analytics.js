/**
 * Portfolio Visitor Analytics Engine for hilpatel.site
 *
 * Capabilities:
 * - Session tracking distinguishing active engagement time from total elapsed time.
 * - Active timing paused on visibilitychange (hidden tab) or 60s user inactivity threshold.
 * - Periodic active heartbeat every 25 seconds.
 * - Unload and tab-switch flushing via navigator.sendBeacon and keepalive fetch.
 * - SPA route and section view tracking (/ #about #projects #skills #education #certifications #contact).
 * - Automatic link and button click delegation (GitHub, LinkedIn, Resume, Projects, Nav, CTAs).
 * - Anonymous, privacy-respecting visitor and session identification (no fingerprinting).
 */

const SESSION_STORAGE_KEY = 'hil_analytics_session';
const VISITOR_STORAGE_KEY = 'hil_analytics_visitor';
const IDLE_THRESHOLD_MS = 60 * 1000; // 60 seconds of inactivity = idle
const HEARTBEAT_INTERVAL_MS = 25 * 1000; // 25 seconds active heartbeat
const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://api.hilpatel.site/api/v1';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');
const API_BASE = `${BASE_URL}/analytics`;
const isDev = Boolean(import.meta.env.DEV);

/**
 * Generates an anonymous random UUIDv4 string.
 * @returns {string}
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retrieves or creates anonymous visitor ID (persisted across sessions).
 * @returns {string}
 */
export function getOrCreateVisitorId() {
  try {
    let vid = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!vid || vid.length < 10) {
      vid = `vis_${generateUUID()}`;
      localStorage.setItem(VISITOR_STORAGE_KEY, vid);
    }
    return vid;
  } catch (e) {
    return `vis_${generateUUID()}`;
  }
}

/**
 * Retrieves or initializes current session ID.
 * @returns {string}
 */
export function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid || sid.length < 10) {
      sid = `sess_${generateUUID()}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch (e) {
    return `sess_${generateUUID()}`;
  }
}

/**
 * Detects device category.
 * @returns {'desktop'|'tablet'|'mobile'}
 */
export function getDeviceCategory() {
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Extracts UTM campaign parameters from current URL.
 * @returns {{utm_source: string, utm_medium: string, utm_campaign: string}}
 */
function getUTMParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
    };
  } catch (e) {
    return { utm_source: '', utm_medium: '', utm_campaign: '' };
  }
}

/**
 * Returns current normalized SPA route path (e.g. / or /#projects).
 * @returns {string}
 */
export function getCurrentRoute() {
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash || '';
  const pathname = window.location.pathname || '/';
  if (hash) {
    return `${pathname}${hash}`.replace('//', '/');
  }
  return pathname;
}

// Global Tracker State
class AnalyticsEngine {
  constructor() {
    this.isInitialized = false;
    this.sessionId = null;
    this.visitorId = null;
    this.currentPath = '/';
    this.lastActivityTime = Date.now();
    this.isActive = true;
    this.pendingActiveSeconds = 0;
    this.lastTickTime = Date.now();
    this.heartbeatTimer = null;
    this.tickTimer = null;
  }

  /**
   * Initializes session, active time accumulator, and global listeners.
   */
  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    this.sessionId = getOrCreateSessionId();
    this.visitorId = getOrCreateVisitorId();
    this.currentPath = getCurrentRoute();
    this.lastActivityTime = Date.now();
    this.lastTickTime = Date.now();
    this.isActive = document.visibilityState === 'visible';

    // 1. Send initial session handshake
    this.sendSessionInit();

    // 2. Setup user interaction listeners to update activity timestamp
    this.setupActivityListeners();

    // 3. Setup visibility change listener (pauses timing on hidden tab)
    this.setupVisibilityListener();

    // 4. Setup second tick timer to count active dwell time accurately
    this.startActiveTick();

    // 5. Setup periodic heartbeat flush
    this.startHeartbeat();

    // 6. Setup automatic link and button click delegation
    this.setupClickDelegation();

    // 7. Setup SPA route change listener
    this.setupNavigationListener();

    // 8. Setup unload/pagehide flush
    this.setupUnloadFlush();
  }

  sendSessionInit() {
    const utm = getUTMParams();
    const payload = {
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      landing_page: this.currentPath,
      current_page: this.currentPath,
      referrer: document.referrer || '',
      device_category: getDeviceCategory(),
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      active_seconds_delta: 0,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
    };

    if (isDev) {
      console.log('[Analytics] Handshake initiating with', `${API_BASE}/session/`);
    }

    fetch(`${API_BASE}/session/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (isDev && res.ok) {
          console.log('[Analytics] Session active:', this.sessionId);
        } else if (isDev) {
          console.warn('[Analytics] Session init status:', res.status);
        }
      })
      .catch((err) => {
        if (isDev) console.warn('[Analytics] Session init connection failure:', err);
      });
  }

  setupActivityListeners() {
    const markActive = () => {
      this.lastActivityTime = Date.now();
    };

    ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach((evt) => {
      window.addEventListener(evt, markActive, { passive: true });
    });
  }

  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.isActive = true;
        this.lastActivityTime = Date.now();
        this.lastTickTime = Date.now();
      } else {
        this.isActive = false;
        // Flush active seconds accrued right before tab was hidden
        this.flushPendingTime(false);
      }
    });
  }

  startActiveTick() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = setInterval(() => {
      const now = Date.now();
      const timeSinceLastTick = Math.max(0, Math.floor((now - this.lastTickTime) / 1000));
      this.lastTickTime = now;

      // Only accumulate if tab is visible AND user was active within IDLE_THRESHOLD_MS
      const isUserActive = now - this.lastActivityTime < IDLE_THRESHOLD_MS;
      if (this.isActive && isUserActive && timeSinceLastTick > 0) {
        this.pendingActiveSeconds += timeSinceLastTick;
      }
    }, 1000);
  }

  startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (this.pendingActiveSeconds > 0) {
        this.flushPendingTime(false);
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  flushPendingTime(isClosing = false) {
    const delta = this.pendingActiveSeconds;
    if (delta <= 0 && !isClosing) return;

    this.pendingActiveSeconds = 0;
    const payload = {
      session_id: this.sessionId,
      active_seconds_delta: delta,
      current_page: this.currentPath,
      is_closing: isClosing,
    };

    const url = `${API_BASE}/beacon/`;
    const bodyStr = JSON.stringify(payload);

    if (isDev && delta > 0) {
      console.log(`[Analytics] Flushing active dwell duration: +${delta}s`);
    }

    if (navigator.sendBeacon && typeof Blob !== 'undefined') {
      const blob = new Blob([bodyStr], { type: 'text/plain' });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    }

    // Fallback to fetch with keepalive: true
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: true,
      })
        .then((res) => {
          if (isDev && res.ok && delta > 0) {
            console.log(`[Analytics] Heartbeat flushed: +${delta}s`);
          }
        })
        .catch((err) => {
          if (isDev) console.warn('[Analytics] Heartbeat flush failed:', err);
        });
    } catch (e) {}
  }

  setupNavigationListener() {
    const onRoute = () => {
      const newPath = getCurrentRoute();
      if (newPath !== this.currentPath) {
        // Record pageview for new path
        this.trackPageView(newPath);
      }
    };

    window.addEventListener('hashchange', onRoute);
    window.addEventListener('popstate', onRoute);
  }

  trackPageView(pagePath) {
    this.currentPath = pagePath;
    const payload = {
      session_id: this.sessionId,
      page_path: pagePath,
      title: document.title || '',
      active_seconds_delta: this.pendingActiveSeconds,
    };
    this.pendingActiveSeconds = 0;

    fetch(`${API_BASE}/pageview/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (isDev && res.ok) console.log('[Analytics] PageView recorded:', pagePath);
      })
      .catch((err) => {
        if (isDev) console.warn('[Analytics] PageView dispatch failed:', err);
      });
  }

  setupClickDelegation() {
    document.addEventListener('click', (event) => {
      try {
        const target = event.target;
        if (!target) return;

        const clickable = target.closest('a, button');
        if (!clickable) return;

        let eventType = 'button_clicked';
        let elementCategory = clickable.tagName.toLowerCase();
        let destinationUrl = clickable.getAttribute('href') || '';
        let label = (clickable.innerText || clickable.getAttribute('aria-label') || clickable.title || '').trim().slice(0, 100);

        const hrefLower = destinationUrl.toLowerCase();
        if (hrefLower.includes('github.com')) {
          eventType = hrefLower.includes('hilpatelss/') && !hrefLower.endsWith('hilpatelss')
            ? 'project_link_clicked'
            : 'github_link_clicked';
          elementCategory = 'social';
        } else if (hrefLower.includes('linkedin.com')) {
          eventType = 'linkedin_link_clicked';
          elementCategory = 'social';
        } else if (hrefLower.includes('resume') || hrefLower.endsWith('.pdf')) {
          eventType = 'resume_download_clicked';
          elementCategory = 'download';
        } else if (hrefLower.startsWith('mailto:') || label.toLowerCase().includes('contact')) {
          eventType = 'contact_button_clicked';
          elementCategory = 'cta';
        } else if (hrefLower.startsWith('#')) {
          eventType = 'navigation_link_clicked';
          elementCategory = 'nav';
        } else if (destinationUrl.startsWith('http')) {
          eventType = 'external_link_clicked';
          elementCategory = 'external';
        }

        this.trackEvent({
          event_type: eventType,
          element_category: elementCategory,
          element_label: label || destinationUrl,
          destination_url: destinationUrl,
        });
      } catch (e) {
        // Safe fail
      }
    }, { capture: true, passive: true });
  }

  trackEvent({ event_type, element_category, element_label, destination_url }) {
    const payload = {
      session_id: this.sessionId,
      event_id: `ev_${generateUUID()}`,
      page_path: this.currentPath,
      event_type,
      element_category: element_category || 'button',
      element_label: (element_label || '').slice(0, 255),
      destination_url: (destination_url || '').slice(0, 500),
    };

    fetch(`${API_BASE}/event/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (isDev && res.ok) console.log(`[Analytics] Event tracked: ${event_type} (${element_label || '-'})`);
      })
      .catch((err) => {
        if (isDev) console.warn('[Analytics] Event dispatch failed:', err);
      });
  }

  setupUnloadFlush() {
    const onUnload = () => {
      this.flushPendingTime(true);
    };

    window.addEventListener('pagehide', onUnload);
    window.addEventListener('beforeunload', onUnload);
  }
}

// Singleton Engine Instance
export const analyticsEngine = new AnalyticsEngine();

/**
 * Initializes the global analytics tracking engine.
 */
export function initAnalytics() {
  analyticsEngine.init();
}

