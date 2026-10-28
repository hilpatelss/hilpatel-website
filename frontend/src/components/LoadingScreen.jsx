import React, { useState, useEffect, useRef, useMemo } from 'react';

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
];

export function LoadingScreen({ apiStatus = 'pending', error = null, onRetry, onReadyToDismiss }) {
  const [sessionKey, setSessionKey] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [hasWaited10s, setHasWaited10s] = useState(false);

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

    // Wait exactly 10s after loading / refresh before displaying Failed to fetch message
    const waitTimer = setTimeout(() => {
      setHasWaited10s(true);
    }, 15000);

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

  // Only display the failed message after 10s of waiting if API has not succeeded
  const showFailedState = hasWaited10s && apiStatus !== 'success';

  return (
    <aside
      className={`ai-loader-overlay ${isDismissing ? 'fade-out' : ''}`}
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div className="ai-loader-container">
        {/* Only One Loader: The Top Animated Liquid Glowing Orb */}
        <div className="ai-liquid-orb-stage">
          {/* Ambient Breathing Glow Aura */}
          <div className="ai-liquid-aura" aria-hidden="true" />

          {/* Liquid Glass Orb Container */}
          <div className="ai-liquid-orb">
            <svg
              className="ai-liquid-svg"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ai-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="60%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="ai-grad-magenta" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff007f" />
                  <stop offset="55%" stopColor="#e026de" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="ai-grad-violet" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9d00ff" />
                  <stop offset="50%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#e026de" />
                </linearGradient>
                <radialGradient id="ai-grad-core" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="45%" stopColor="#8b5cf6" />
                  <stop offset="85%" stopColor="#e026de" />
                  <stop offset="100%" stopColor="#0284c7" />
                </radialGradient>
                <filter id="ai-liquid-goo" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 19 -8"
                    result="goo"
                  />
                  <feBlend in="SourceGraphic" in2="goo" />
                </filter>
              </defs>
              <g filter="url(#ai-liquid-goo)">
                {/* Central Breathing Liquid Core */}
                <circle cx="50" cy="50" r="22" fill="url(#ai-grad-core)">
                  <animate
                    attributeName="r"
                    values="19; 25; 20; 26; 19"
                    dur="4.5s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Flowing Fluid Drop 1 (Cyan/Blue Orbiting Ellipse) */}
                <ellipse cx="50" cy="34" rx="14" ry="17" fill="url(#ai-grad-cyan)">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="360 50 50"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="rx"
                    values="13; 17; 11; 15; 13"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </ellipse>

                {/* Flowing Fluid Drop 2 (Magenta/Purple Orbiting Ellipse) */}
                <ellipse cx="50" cy="66" rx="16" ry="13" fill="url(#ai-grad-magenta)">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="-360 50 50"
                    dur="5.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="ry"
                    values="13; 18; 12; 17; 13"
                    dur="3.8s"
                    repeatCount="indefinite"
                  />
                </ellipse>

                {/* Floating Satellite Bubble 3 (Violet/Cyan) */}
                <circle cx="33" cy="50" r="12" fill="url(#ai-grad-violet)">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="360 50 50"
                    dur="3.4s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Floating Satellite Bubble 4 (Cyan/Emerald) */}
                <circle cx="67" cy="50" r="11" fill="url(#ai-grad-cyan)">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="-360 50 50"
                    dur="4.2s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Floating Morphing Blob 5 (Central organic wobble) */}
                <ellipse cx="50" cy="50" rx="15" ry="21" fill="url(#ai-grad-magenta)">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="30 50 50"
                    to="390 50 50"
                    dur="6.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="ry"
                    values="19; 14; 22; 15; 19"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </ellipse>
              </g>
            </svg>
            {/* Specular glass reflection */}
            <div className="ai-liquid-sheen" aria-hidden="true" />
          </div>
        </div>

        {/* Loading Message with Typewriter Effect and Blinking Cursor */}
        <div className="ai-loader-message-wrap">
          <p className="ai-loader-message">
            {displayedText}
            <span className="ai-loader-cursor" aria-hidden="true">|</span>
          </p>
        </div>

        {/* Wait 10s after loading / refresh to display Failed to fetch box */}
        {showFailedState && (
          <div className="ai-loader-error-box" role="alert">
            <p className="ai-error-text">Failed to fetch</p>
            <div className="ai-slow-actions">
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
