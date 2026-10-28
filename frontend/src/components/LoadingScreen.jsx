import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getPersistedTheme } from '../context/ThemeContext';

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

export function LoadingScreen({
  apiStatus = 'pending',
  error = null,
  onRetry,
  onReadyToDismiss,
  theme,
}) {
  const [sessionKey, setSessionKey] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [hasWaited10s, setHasWaited10s] = useState(false);

  // Read theme directly from prop or persisted cookie/storage
  const activeTheme = theme || getPersistedTheme();

  const startTimeRef = useRef(Date.now());
  const typingCompleteTimeRef = useRef(null);
  const onReadyToDismissRef = useRef(onReadyToDismiss);

  useEffect(() => {
    onReadyToDismissRef.current = onReadyToDismiss;
  }, [onReadyToDismiss]);

  // Pick exactly one random message per session (stable across re-renders)
  const selectedMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    return LOADING_MESSAGES[randomIndex];
  }, [sessionKey]);

  // Reset timers, 10s wait flag, and typewriter on load or retry
  useEffect(() => {
    startTimeRef.current = Date.now();
    typingCompleteTimeRef.current = null;
    setDisplayedText('');
    setIsTypingComplete(false);
    setIsDismissing(false);
    setHasWaited10s(false);

    // Wait exactly 10s before showing polite status guidance if server takes longer
    const waitTimer = setTimeout(() => {
      setHasWaited10s(true);
    }, 10000);

    return () => clearTimeout(waitTimer);
  }, [sessionKey]);

  // Typewriter effect: ~35ms per character
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

  // Timing Coordinator for successful completion:
  // Requires:
  // 1. apiStatus === 'success'
  // 2. Total duration >= 4500ms
  // 3. Message typing complete AND >= 2000ms reading time
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
        setTimeout(() => {
          if (onReadyToDismissRef.current) {
            onReadyToDismissRef.current();
          }
        }, 550); // Match fade-out transition duration
      }
    }, 50);

    return () => clearInterval(evaluationInterval);
  }, [apiStatus, isTypingComplete, isDismissing]);

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

  // Only display the status guidance after 10s of waiting if API has not succeeded
  const showFailedState = hasWaited10s && apiStatus !== 'success';

  return (
    <aside
      className={`ai-loader-overlay ${isDismissing ? 'fade-out' : ''}`}
      data-theme={activeTheme}
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div className="ai-loader-container">
        {/* High-Performance Smoothly Spinning Modern Loader */}
        <div className="brand-spinner-container" aria-hidden="true">
          <svg className="brand-spinner-svg" viewBox="0 0 50 50">
            <defs>
              <linearGradient id="brand-spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--spinner-c1, #00f0ff)" />
                <stop offset="50%" stopColor="var(--spinner-c2, #10b981)" />
                <stop offset="100%" stopColor="var(--spinner-c3, #06b6d4)" />
              </linearGradient>
            </defs>
            {/* Background circular track */}
            <circle
              className="brand-spinner-track"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="3.5"
            />
            {/* High-contrast animated spinning arc */}
            <circle
              className="brand-spinner-arc"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="url(#brand-spinner-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <div className="brand-spinner-pulsar" />
        </div>

        {/* Loading Message with Typewriter Effect and Blinking Cursor */}
        <div className="ai-loader-message-wrap">
          <p className="ai-loader-message">
            {displayedText}
            <span className="ai-loader-cursor" aria-hidden="true">|</span>
          </p>
        </div>

        {/* Three Glowing Pulsing Dots Beneath Message */}
        <div className="ai-loader-dots" aria-hidden="true">
          <span className="ai-dot ai-dot-1" />
          <span className="ai-dot ai-dot-2" />
          <span className="ai-dot ai-dot-3" />
        </div>

        {/* Non-blocking Status & Guidance (Only after 10s wait state) */}
        {showFailedState && (
          <div className="ai-loader-status-card" role="alert">
            <p className="ai-status-text">
              {apiStatus === 'error'
                ? "Connecting to backend is taking a little longer (Render free tier wakes in ~30-50s)."
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
                className="ai-action-btn ai-proceed-btn"
                onClick={handleProceed}
              >
                Explore Portfolio →
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
