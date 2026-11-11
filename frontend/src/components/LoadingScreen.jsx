/**
 * ==============================================================================
 * Portfolio Loading & Timeout Experience Component (LoadingScreen.jsx)
 * ==============================================================================
 * 
 * Recreated to match the reference design:
 * 1. Background: Pure/near-black (#030507) with subtle dark blue radial glow.
 * 2. Terminal Icon: Rounded square (44px × 44px), blue border (#2196FF), navy core,
 *    subtle outer glow, vector terminal prompt icon (>_).
 * 3. Main Heading: "Just a moment..." in crisp bold white (27px desktop).
 * 4. Loading Message: Dynamic typewriter in bright blue (#2196FF) with blinking cursor,
 *    cycling through 25 professional natural loading messages every 10 seconds.
 * 5. 4-Segment Progress Indicator: Horizontal rounded segments (42px × 5px)
 *    blinking sequentially one after another in an infinite loop every 650ms.
 * 6. Bottom Status Caption: "Initializing experience • Please wait" in muted gray (14px).
 * 7. Progressive States:
 *    - STAGE 1 (0–30s): Clean minimal loader with 10s message cycling.
 *    - STAGE 2 (30–89s): Polite server delay warning notice (no buttons).
 *    - STAGE 3 (90s+): Connection timeout fallback card with Visit LinkedIn and Explore GitHub.
 * 8. Immediate Dismissal: The instant API data is ready (apiStatus === 'success'),
 *    fades out immediately with a smooth 400ms transition and reveals the main website!
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Linkedin, Github, Sun, Moon } from 'lucide-react';
import { getPersistedTheme } from '../context/ThemeContext';

/**
 * 25 professional, natural loading messages describing initialization
 * without falsely claiming any incomplete operation succeeded.
 * Prominently features the reference message:
 * - "Finalizing data synchronization..."
 */
export const LOADING_MESSAGES = [
  "Negotiating with the database...",
  "Convincing the API to cooperate...",
  "Waking up the backend services...",
  "Asking Django to work its magic...",
  "React is getting its components together...",
  "Fetching data faster than my coffee disappears...",
  "Synchronizing pixels with reality...",
  "Making sure the database remembers everything...",
  "Checking whether the server had its coffee...",
  "Connecting all the digital dots...",
  "Fetching professional achievements...",
  "Loading skills without showing off too much...",
  "Searching for bugs before they find us...",
  "Making friends with the API endpoints...",
  "Teaching the database some patience...",
  "Making frontend and backend talk nicely...",
  "Running background checks on incoming data...",
  "Making sure everything is where it belongs...",
  "Convincing JavaScript to behave...",
  "Fetching projects worth talking about...",
  "Polishing the digital experience...",
  "Synchronizing data without disturbing the universe...",
  "Checking if all services are still friends...",
  "Preparing something better than a loading screen...",
  "Making database queries feel important...",
  "Asking the server for one small favour...",
  "Loading technical skills and questionable coding habits...",
  "Making every component feel included...",
  "Double-checking everything because trust is expensive...",
  "Making sure no bugs sneak into production...",
  "Fetching portfolio data from its hiding place...",
  "Connecting services and avoiding awkward silences...",
  "Giving the backend a gentle reminder...",
  "Verifying that everything is running smoothly...",
  "Organizing digital information like a perfectionist...",
  "Loading experience, projects and a little ambition...",
  "Checking API responses for good behaviour...",
  "Making the server look busy...",
  "Turning database records into something beautiful...",
  "Preparing the final digital presentation...",
  "Almost ready, the server is just being dramatic...",
  "Processing requests like a professional...",
  "Making sure your browser gets the good stuff...",
  "Checking for errors we definitely don't want...",
  "Synchronizing everything behind the scenes...",
  "Fetching fresh data, not yesterday's leftovers...",
  "Making the internet a little more organized...",
  "Performing final checks before the big reveal...",
  "Getting all systems ready for your visit...",
  "Everything is coming together. Stay curious..."
];

export function LoadingScreen({
  apiStatus = 'pending',
  error = null,
  onRetry,
  onReadyToDismiss,
  disableDismissal = false,
  theme,
  onToggleTheme,
  site,
}) {
  // Session key increments on retry to reset timers cleanly
  const [sessionKey, setSessionKey] = useState(0);

  // Pick an initial random message so every visit starts with a fresh random message
  const [messageIndex, setMessageIndex] = useState(() => {
    return Math.floor(Math.random() * LOADING_MESSAGES.length);
  });

  // Track unplayed message indices in the current shuffle cycle to prevent duplicates
  const unplayedIndicesRef = useRef([]);

  // Helper to pick next random message without repeating the currently displayed one
  const getNextRandomIndex = useCallback((currentIndex) => {
    if (!unplayedIndicesRef.current || unplayedIndicesRef.current.length === 0) {
      // Create a pool of all indices except the currently showing one
      const pool = LOADING_MESSAGES.map((_, i) => i).filter((i) => i !== currentIndex);
      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      unplayedIndicesRef.current = pool;
    }
    const nextIdx = unplayedIndicesRef.current.pop();
    return typeof nextIdx === 'number' ? nextIdx : (currentIndex + 1) % LOADING_MESSAGES.length;
  }, []);

  // Progressive typewriter text buffer
  const [displayedText, setDisplayedText] = useState('');

  // 4-Segment progress indicator: 1 -> 2 -> 3 -> 4 -> 1 (sequential blinking)
  const [activeSegment, setActiveSegment] = useState(1);

  // Fade-out transition trigger
  const [isDismissing, setIsDismissing] = useState(false);

  // Progressive UI state machine: 'LOADING' (0-29s) | 'DELAY_WARNING' (30-89s) | 'CONNECTION_TIMEOUT' (90s+)
  const [uiState, setUiState] = useState('LOADING');

  const activeTheme = theme || getPersistedTheme();
  const linkedinUrl = site?.linkedin_url || "https://linkedin.com/in/hilpatelss";
  const githubUrl = site?.github_url || "https://github.com/hilpatelss";

  const onReadyToDismissRef = useRef(onReadyToDismiss);
  onReadyToDismissRef.current = onReadyToDismiss;

  const dismissTimerRef = useRef(null);
  const hasTriggeredDismissRef = useRef(false);

  // Clear dismiss timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // 1. Message Rotation: Changes to a RANDOM message every EXACTLY 10 seconds
  // --------------------------------------------------------------------------
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => getNextRandomIndex(prev));
    }, 10000);

    return () => clearInterval(messageInterval);
  }, [sessionKey, getNextRandomIndex]);

  // --------------------------------------------------------------------------
  // 2. Typewriter Effect: Synchronized with message changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    setDisplayedText('');
    const targetMessage = LOADING_MESSAGES[messageIndex] || '';
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      charIndex += 1;
      setDisplayedText(targetMessage.slice(0, charIndex));

      if (charIndex >= targetMessage.length) {
        clearInterval(typingInterval);
      }
    }, 28);

    return () => clearInterval(typingInterval);
  }, [messageIndex, sessionKey]);

  // --------------------------------------------------------------------------
  // 3. Four-Segment Progress Indicator: Sequential blinking 1 -> 2 -> 3 -> 4 -> 1
  // Only one segment is active at any moment, running continuously every 650ms
  // --------------------------------------------------------------------------
  useEffect(() => {
    const segmentInterval = setInterval(() => {
      setActiveSegment((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 650);

    return () => clearInterval(segmentInterval);
  }, []);

  // --------------------------------------------------------------------------
  // 4. Progressive States: 30s Server Delay Warning, 90s Connection Timeout
  // --------------------------------------------------------------------------
  useEffect(() => {
    const delayWarningTimer = setTimeout(() => {
      setUiState((current) => (current === 'LOADING' ? 'DELAY_WARNING' : current));
    }, 30000);

    const connectionTimeoutTimer = setTimeout(() => {
      setUiState('CONNECTION_TIMEOUT');
    }, 90000);

    return () => {
      clearTimeout(delayWarningTimer);
      clearTimeout(connectionTimeoutTimer);
    };
  }, [sessionKey]);

  // --------------------------------------------------------------------------
  // 5. CRITICAL: Immediate Dismissal when API succeeds (no artificial delay)
  // Suppressed if disableDismissal is true or onReadyToDismiss is not provided
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (disableDismissal || !onReadyToDismissRef.current) return;
    if (apiStatus !== 'success') return;
    if (hasTriggeredDismissRef.current) return;

    hasTriggeredDismissRef.current = true;
    setIsDismissing(true);

    // Smooth visual fade transition (400ms) before unmounting
    dismissTimerRef.current = setTimeout(() => {
      if (onReadyToDismissRef.current) {
        onReadyToDismissRef.current();
      }
    }, 400);

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [apiStatus, disableDismissal]);

  // Manual retry handler if visitor chooses to re-attempt after timeout
  const handleManualRetry = () => {
    setMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
    if (unplayedIndicesRef.current) unplayedIndicesRef.current = [];
    setSessionKey((prev) => prev + 1);
    setUiState('LOADING');
    hasTriggeredDismissRef.current = false;
    setIsDismissing(false);
    if (onRetry) onRetry();
  };

  return (
    <aside
      className={`ai-loader-overlay ${isDismissing ? 'fade-out' : ''}`}
      data-theme={activeTheme}
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      {/* Top-right Dark / Light Mode Switcher */}
      {onToggleTheme && (
        <button
          type="button"
          className="loader-theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${activeTheme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${activeTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {activeTheme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>
      )}

      {/* Subtle dark blue radial glow behind central loading content */}
      <div className="loader-ambient-glow" aria-hidden="true" />

      <div className="loader-card-content">
        {/* Terminal Icon: 44px × 44px, blue border, dark navy background, blue outer glow, vector prompt icon (>_) */}
        <div className="loader-terminal-icon" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="loader-terminal-svg"
            aria-hidden="true"
          >
            <polyline points="4 17 10 12 4 7" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </div>

        {/* Main Heading: "Just a moment..." (bold 700, 27px, crisp white) */}
        <h2 className="loader-main-title">Just a moment...</h2>

        {/* Normal Loading View (0–89s): Typewriter, 4 Segments, Status Caption */}
        {uiState !== 'CONNECTION_TIMEOUT' && (
          <>
            {/* Loading Message: 18px bright blue (#2196FF) with blinking cursor */}
            <div className="loader-message-wrap">
              <p className="loader-subtitle-message">
                <span>{displayedText}</span>
                <span className="loader-cursor" aria-hidden="true">|</span>
              </p>
            </div>

            {/* Four-Segment Progress Indicator (42px × 5px each, sequential blinking loop) */}
            <div className="loader-segmented-bar" aria-hidden="true">
              <span className={`loader-segment ${activeSegment === 1 ? 'is-active' : ''}`} />
              <span className={`loader-segment ${activeSegment === 2 ? 'is-active' : ''}`} />
              <span className={`loader-segment ${activeSegment === 3 ? 'is-active' : ''}`} />
              <span className={`loader-segment ${activeSegment === 4 ? 'is-active' : ''}`} />
            </div>

            {/* Bottom Status Text: "Initializing experience • Please wait" (14px muted gray) */}
            <p className="loader-caption-note">Initializing experience • Please wait</p>
          </>
        )}

        {/* STAGE 2 (30–89s): Server Delay Warning Notice (No buttons) */}
        {uiState === 'DELAY_WARNING' && apiStatus !== 'success' && (
          <div className="loader-delay-warning-box" role="status">
            <p className="loader-delay-warning-text">
              We&apos;re experiencing a slight delay in establishing a connection with the server.
              Please bear with us while we attempt to load the requested resources.
            </p>
          </div>
        )}

        {/* STAGE 3 (90s+): Connection Timeout Screen (ONLY TWO BUTTONS) */}
        {uiState === 'CONNECTION_TIMEOUT' && apiStatus !== 'success' && (
          <div className="loader-timeout-fallback-card" role="alert">
            <p className="loader-timeout-message">
              The server is currently taking longer than expected to respond.
              You can explore my professional profile and projects while the connection is being restored.
            </p>
            <div className="loader-fallback-buttons">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary loader-action-btn"
                aria-label="Visit LinkedIn profile (opens in a new tab)"
              >
                <Linkedin size={17} aria-hidden="true" />
                <span>Visit LinkedIn</span>
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-secondary loader-action-btn"
                aria-label="Explore GitHub profile (opens in a new tab)"
              >
                <Github size={17} aria-hidden="true" />
                <span>Explore GitHub</span>
              </a>
            </div>

            {/* Continuous background reconnection indicator */}
            <div className="loader-reconnect-pulse" role="status" aria-live="polite">
              <span className="pulse-glow" style={{ width: 7, height: 7, borderRadius: '50%', background: '#2196FF', display: 'inline-block' }} />
              <span>Connecting to server in background... Your portfolio will open automatically once connected.</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default LoadingScreen;
