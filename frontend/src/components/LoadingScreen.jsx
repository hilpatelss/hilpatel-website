import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getPersistedTheme } from '../context/ThemeContext';

/**
 * List of rotating inspirational & technical status messages displayed
 * with a typewriter effect during initial portfolio loading.
 */
const LOADING_MESSAGES = [
  "Analyzing the data behind the scenes...",
  "Connecting the dots. Almost there...",
  "Fetching insights, one request at a time...",
  "Turning raw data into meaningful experiences...",
  "Initializing the portfolio experience...",
  "Querying the database for fresh insights...",
  "Every great insight starts with a little processing...",
  "Loading projects that turn ideas into reality...",
  "Gathering achievements and milestones...",
  "Building connections between data and decisions...",
  "Python is working its magic behind the scenes...",
  "Running a few final checks before takeoff...",
  "Making sure everything is ready for you...",
  "Bringing projects, skills, and ideas together...",
  "Good things take a little processing time...",
  "Establishing connections with the server...",
  "Waiting for the data to tell its story...",
  "A few more calculations, then we're ready...",
  "Preparing a closer look at my work...",
  "Fetching the latest portfolio information...",
  "Processing requests. Keeping things precise...",
  "Loading the details that matter most...",
  "Almost ready to turn curiosity into discovery...",
  "Syncing the data for a smoother experience...",
  "Thanks for your patience. Your portfolio is getting ready...",
  "Mapping your portfolio into place...",
  "Warming up the data pipeline...",
  "Aligning insights with the latest updates...",
  "Checking the connections powering this page...",
  "Preparing your project highlights...",
  "Calibrating the details for a clearer view...",
  "Fetching the latest information from the source...",
  "Bringing your portfolio components online...",
  "Verifying the data before it appears...",
  "Organizing skills, projects, and milestones...",
  "Setting the stage for meaningful insights...",
  "Bringing the important details into focus...",
  "Connecting the interface to fresh data...",
  "Checking that your latest content is ready...",
  "Shaping data into a smoother experience...",
  "Running the final synchronization...",
  "Your next discovery is on its way...",
  "Making sure every detail lines up...",
  "Preparing a clearer view of the work...",
  "Refreshing the information behind this page...",
  "Bringing your latest updates into view...",
  "Fine-tuning the experience, one detail at a time...",
  "Checking the data flow from end to end...",
  "Loading the work behind the results...",
  "Almost ready to explore...",
];

/**
 * LoadingSpinner Component
 * 
 * Renders a lightweight, hardware-accelerated dual-arc circular loading spinner.
 * Features:
 * - Scoped keyframe animation (@keyframes loader-spin) running at 0.85s linear.
 * - Single-color theme synchronization using emerald accent (--accent).
 * - Translucent background ring track for visual depth.
 * - "!important" flag guarantees animation runs reliably across all browser accessibility modes.
 */
export function LoadingSpinner({ label = "Loading" }) {
  return (
    <>
      <style>{`
        @keyframes loader-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loader-spinner {
          display: block;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3.5px solid rgba(16, 185, 129, 0.2);
          border-top-color: var(--accent, #10b981);
          border-right-color: var(--accent, #10b981);
          animation: loader-spin 0.85s linear infinite !important;
          margin: 0 auto clamp(1.8rem, 3.8vh, 2.8rem);
          box-sizing: border-box;
        }
        [data-theme="light"] .loader-spinner {
          border-color: rgba(5, 150, 105, 0.2);
          border-top-color: var(--accent, #059669);
          border-right-color: var(--accent, #059669);
          box-shadow: 0 0 12px rgba(5, 150, 105, 0.3);
        }
        [data-theme="dark"] .loader-spinner {
          border-color: rgba(16, 185, 129, 0.2);
          border-top-color: var(--accent, #10b981);
          border-right-color: var(--accent, #10b981);
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.45);
        }
      `}</style>
      <div className="loader-spinner" role="status" aria-label={label} />
    </>
  );
}

/**
 * LoadingScreen Component
 * 
 * Orchestrates the portfolio's initial entry loading state with:
 * - Single-color animated spinner.
 * - Progressive typewriter message display.
 * - Multi-condition timing coordinator to guarantee smooth visual rhythm.
 * - Non-blocking polite guidance card if the server backend is cold-starting.
 * 
 * @param {string} apiStatus - Current API request state ('pending', 'success', 'error')
 * @param {Error|null} error - Any API error encountered
 * @param {Function} onRetry - Handler to trigger backend re-fetch
 * @param {Function} onReadyToDismiss - Callback when loading conditions are satisfied
 * @param {string} theme - Active theme override ('dark' or 'light')
 */
export function LoadingScreen({
  apiStatus = 'pending',
  error = null,
  onRetry,
  onReadyToDismiss,
  theme,
}) {
  // Session key increments on retry to reset all timers and typewriter state cleanly
  const [sessionKey, setSessionKey] = useState(0);

  // Progressive typewriter text buffer
  const [displayedText, setDisplayedText] = useState('');

  // Flag indicating the random message has completely typed out
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Trigger for the CSS opacity fade-out transition before unmounting
  const [isDismissing, setIsDismissing] = useState(false);

  // Flag indicating extended wait threshold has elapsed without API success
  const [hasWaitedExtended, setHasWaitedExtended] = useState(false);

  // Resolve active theme: prioritizes direct prop, then cookie ('hil_theme'), then localStorage
  const activeTheme = theme || getPersistedTheme();

  // Reference timestamps for elapsed time calculations
  const startTimeRef = useRef(Date.now());
  const typingCompleteTimeRef = useRef(null);
  const onReadyToDismissRef = useRef(onReadyToDismiss);

  // Keep dismiss callback ref current across re-renders
  useEffect(() => {
    onReadyToDismissRef.current = onReadyToDismiss;
  }, [onReadyToDismiss]);

  // Select exactly one random loading message per session cycle
  const selectedMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    return LOADING_MESSAGES[randomIndex];
  }, [sessionKey]);

  // Session lifecycle: initialize timers and extended wait threshold
  useEffect(() => {
    startTimeRef.current = Date.now();
    typingCompleteTimeRef.current = null;
    setDisplayedText('');
    setIsTypingComplete(false);
    setIsDismissing(false);
    setHasWaitedExtended(false);

    // After 30 seconds of pending status, offer polite retry / refresh options
    const waitTimer = setTimeout(() => {
      setHasWaitedExtended(true);
    }, 30000);

    return () => clearTimeout(waitTimer);
  }, [sessionKey]);

  // Typewriter effect: appends 1 character every 35ms until string completion
  useEffect(() => {
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      charIndex += 1;
      setDisplayedText(selectedMessage.slice(0, charIndex));

      if (charIndex >= selectedMessage.length) {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
        typingCompleteTimeRef.current = Date.now();
      }
    }, 35);

    return () => clearInterval(typingInterval);
  }, [selectedMessage]);

  /**
   * Smooth Timing Coordinator:
   * Prevents jarring flashes by evaluating three required completion conditions:
   * 1. API request is successful (apiStatus === 'success').
   * 2. Total minimum display duration is satisfied (>= 4500ms).
   * 3. Message typing is complete AND visitor has had at least 2000ms reading time.
   */
  useEffect(() => {
    if (apiStatus !== 'success') return;

    const evaluationInterval = setInterval(() => {
      const now = Date.now();
      const totalElapsed = now - startTimeRef.current;
      const readingElapsed = typingCompleteTimeRef.current ? now - typingCompleteTimeRef.current : 0;

      const condition1 = apiStatus === 'success';
      const condition2 = totalElapsed >= 4500;
      const condition3 = isTypingComplete && typingCompleteTimeRef.current !== null && readingElapsed >= 2000;

      if (condition1 && condition2 && condition3 && !isDismissing) {
        setIsDismissing(true);
        clearInterval(evaluationInterval);
        // Wait 550ms to allow smooth CSS fade-out opacity transition before dismissal
        setTimeout(() => {
          if (onReadyToDismissRef.current) {
            onReadyToDismissRef.current();
          }
        }, 550);
      }
    }, 50);

    return () => clearInterval(evaluationInterval);
  }, [apiStatus, isTypingComplete, isDismissing]);

  // User Action Handlers
  const handleRetry = () => {
    setSessionKey((prev) => prev + 1);
    if (onRetry) {
      onRetry();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleProceed = () => {
    setIsDismissing(true);
    setTimeout(() => {
      if (onReadyToDismissRef.current) {
        onReadyToDismissRef.current();
      }
    }, 550);
  };

  // Only display fallback actions if extended wait has elapsed and API hasn't succeeded
  const showFailedState = hasWaitedExtended && apiStatus !== 'success';

  return (
    <aside
      className={`ai-loader-overlay ${isDismissing ? 'fade-out' : ''}`}
      data-theme={activeTheme}
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div className="ai-loader-container">
        {/* Animated Single-Color Loading Spinner */}
        <LoadingSpinner label="Loading portfolio" />

        {/* Loading Message with Typewriter Effect and Blinking Cursor */}
        <div className="ai-loader-message-wrap">
          <p className="ai-loader-message">
            {displayedText}
            <span className="ai-loader-cursor" aria-hidden="true">|</span>
          </p>
        </div>

        {/* Three Glowing Pulsing Dots Beneath Message */}
      
        {/* Non-blocking Status & Guidance (Only after 10s wait state) */}
        {showFailedState && (
          <div className="ai-loader-status-card" role="alert">
            <p className="ai-status-text">
              {apiStatus === 'error'
                ? "Connecting to backend is taking a little longer."
                : "Still initializing server connection... Thank you for your patience."}
            </p>
            <div className="ai-status-actions">
              <button
                type="button"
                className="ai-action-btn ai-retry-btn"
                onClick={handleRetry}
              >
                Retry Connection
              </button>
              <button
                type="button"
                className="ai-action-btn ai-refresh-btn"
                onClick={handleRefresh}
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
