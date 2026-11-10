/**
 * ==============================================================================
 * Portfolio Loading & Timeout Experience Component (LoadingScreen.jsx)
 * ==============================================================================
 * 
 * WHAT IS THIS COMPONENT?
 * When a visitor first opens hilpatel.site, this component greets them with a clean,
 * Apple-inspired loading screen while React talks to the Django backend.
 * 
 * WHY IS THIS COMPONENT SPECIAL?
 * Cloud hosting platforms like Render often put free-tier servers to "sleep" when idle.
 * When a new visitor arrives, waking up the server can take 30 to 60 seconds.
 * Instead of showing a broken error or a frozen screen, this component provides a
 * 3-stage progressive experience:
 * 
 * 1. STAGE 1 (0 to 30 Seconds) - INITIAL LOADING:
 *    - Types out an authentic technical loading message character-by-character.
 *    - Keeps the user engaged and informs them that resources are loading.
 * 
 * 2. STAGE 2 (30 to 89 Seconds) - SERVER DELAY WARNING:
 *    - If the backend is taking longer to respond, fades in a polite notice:
 *      "We're experiencing a slight delay in establishing a connection with the server..."
 *    - No buttons are shown; requests continue safely in the background.
 * 
 * 3. STAGE 3 (90+ Seconds) - CONNECTION TIMEOUT:
 *    - If the server has still not responded after 90 seconds, transitions to a helpful card:
 *      "The server is currently taking longer than expected to respond..."
 *    - Gives the visitor two direct options: "Visit LinkedIn" or "Explore GitHub".
 * 
 * 4. AUTOMATIC RECOVERY:
 *    - If the backend finishes loading at ANY moment (even after 90 seconds), the screen
 *      immediately fades out and reveals the actual website!
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Linkedin, Github } from 'lucide-react';
import { getPersistedTheme } from '../context/ThemeContext';

/**
 * List of rotating inspirational & technical status messages displayed
 * with a typewriter effect during initial portfolio loading.
 */
const LOADING_MESSAGES = [
  "Establishing a secure connection to the server...",
  "Initializing portfolio resources...",
  "Retrieving the latest portfolio data...",
  "Synchronizing application components...",
  "Establishing database connectivity...",
  "Fetching project information...",
  "Loading professional experience and achievements...",
  "Retrieving technical skills and expertise...",
  "Processing incoming data requests...",
  "Validating data integrity...",
  "Preparing portfolio components...",
  "Synchronizing the latest updates...",
  "Connecting the frontend with backend services...",
  "Executing database queries...",
  "Loading project documentation and details...",
  "Verifying API connectivity...",
  "Processing application requests...",
  "Retrieving the latest content from the database...",
  "Initializing application services...",
  "Validating server responses...",
  "Preparing technical project highlights...",
  "Organizing skills, projects, and certifications...",
  "Optimizing content delivery...",
  "Loading essential application resources...",
  "Verifying data consistency across services...",
  "Establishing communication with API endpoints...",
  "Preparing professional portfolio information...",
  "Synchronizing frontend and backend resources...",
  "Performing final application checks...",
  "Ensuring all resources are ready...",
  "Finalizing data synchronization...",
  "Checking application service availability...",
  "Preparing your portfolio experience...",
  "Loading the latest professional updates...",
  "Validating all connected services...",
  "Optimizing the application experience...",
  "Retrieving verified portfolio information...",
  "Completing the initialization process...",
  "Performing final connectivity checks...",
  "Preparing everything for presentation...",
  "Your portfolio is almost ready...",
  "Finalizing application initialization...",
  "All systems are being prepared...",
  "Loading your work and professional achievements...",
  "Completing the final synchronization...",
  "Preparing the interface for seamless navigation...",
  "Ensuring a consistent user experience...",
  "Final checks are in progress...",
  "Your portfolio experience is being finalized...",
  "Initialization is nearly complete..."
];


/**
 * LoadingScreen Component
 * 
 * Orchestrates the portfolio's initial entry loading state with:
 * - 0–30s: INITIAL LOADING STATE (Typewriter message + animation).
 * - 30–89s: SERVER DELAY WARNING (Delicate warning card, no buttons).
 * - 90s+: CONNECTION TIMEOUT (Timeout message + Visit LinkedIn & Explore GitHub buttons).
 * - SUCCESS: Immediate seamless reveal of actual website whenever APIs load.
 * 
 * @param {string} apiStatus - Current API request state ('pending', 'success', 'error')
 * @param {Error|null} error - Any API error encountered
 * @param {Function} onRetry - Handler to trigger backend re-fetch
 * @param {Function} onReadyToDismiss - Callback when loading conditions are satisfied
 * @param {string} theme - Active theme override ('dark' or 'light')
 * @param {Object} site - Site configuration object containing social URLs
 */
export function LoadingScreen({
  apiStatus = 'pending',
  error = null,
  onRetry,
  onReadyToDismiss,
  theme,
  site,
}) {
  // Session key increments on retry to reset all timers and typewriter state cleanly
  const [sessionKey, setSessionKey] = useState(0);

  // Progressive typewriter text buffer
  const [displayedText, setDisplayedText] = useState('');

  // Flag indicating the random message has completely typed out
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Trigger for the CSS opacity fade-out transition before unmounting
  const [isDismissing, setIsDismissing] = useState(false);

  // UI state machine: 'LOADING' (0-30s) | 'DELAY_WARNING' (30-89s) | 'CONNECTION_TIMEOUT' (90s+)
  const [uiState, setUiState] = useState('LOADING');

  // Resolve active theme: prioritizes direct prop, then cookie ('site-theme'), then localStorage
  const activeTheme = theme || getPersistedTheme();

  // Social profile URLs from site settings or project defaults
  const linkedinUrl = site?.linkedin_url || "https://linkedin.com/in/hilpatelss";
  const githubUrl = site?.github_url || "https://github.com/hilpatelss";

  // Reference timestamps for elapsed time calculations
  const startTimeRef = useRef(Date.now());
  const onReadyToDismissRef = useRef(onReadyToDismiss);
  const hasTriggeredDismissRef = useRef(false);
  const dismissTimerRef = useRef(null);

  // Keep dismiss callback ref current across re-renders
  useEffect(() => {
    onReadyToDismissRef.current = onReadyToDismiss;
  }, [onReadyToDismiss]);

  // Clean up any pending dismiss timer on final unmount only
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  // Select exactly one random loading message per session cycle
  const selectedMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    return LOADING_MESSAGES[randomIndex];
  }, [sessionKey]);

  // Session lifecycle: initialize timers for state progression
  useEffect(() => {
    startTimeRef.current = Date.now();
    hasTriggeredDismissRef.current = false;
    setDisplayedText('');
    setIsTypingComplete(false);
    setIsDismissing(false);
    setUiState('LOADING');

    // Timer 1: 30s Server Delay Warning threshold
    const delayWarningTimer = setTimeout(() => {
      setUiState((current) => (current === 'LOADING' ? 'DELAY_WARNING' : current));
    }, 30000);

    // Timer 2: 90s Connection Timeout threshold
    const connectionTimeoutTimer = setTimeout(() => {
      setUiState('CONNECTION_TIMEOUT');
    }, 90000);

    return () => {
      clearTimeout(delayWarningTimer);
      clearTimeout(connectionTimeoutTimer);
    };
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
      }
    }, 35);

    return () => clearInterval(typingInterval);
  }, [selectedMessage]);

  /**
   * Immediate and Reliable Main Page Reveal on API Success:
   * Rule: "If all required APIs load successfully, immediately display the website normally."
   * 
   * When apiStatus becomes 'success' (whether on initial load or recovering after delay/timeout):
   * 1. Fades out the loading overlay with a smooth 280ms transition.
   * 2. Calls onReadyToDismiss() without cancellation race-conditions.
   */
  useEffect(() => {
    if (apiStatus !== 'success') return;
    if (hasTriggeredDismissRef.current) return;

    hasTriggeredDismissRef.current = true;
    setIsDismissing(true);

    // Reliable dismissal timer: NOT cancelled by re-renders
    dismissTimerRef.current = setTimeout(() => {
      if (onReadyToDismissRef.current) {
        onReadyToDismissRef.current();
      }
    }, 280);
  }, [apiStatus]);

  return (
    <aside
      className={`ai-loader-overlay ${isDismissing ? 'fade-out' : ''}`}
      data-theme={activeTheme}
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div className="ai-loader-container">
        {/* Subtle ambient lighting orb behind loader */}
        <div className="loader-ambient-glow" aria-hidden="true" />

        {/* Existing Loading Animation: Typewriter message with blinking cursor */}
        <div className="ai-loader-message-wrap">
          <p className="ai-loader-message">
            {displayedText}
            <span className="ai-loader-cursor" aria-hidden="true">|</span>
          </p>
        </div>

        {/* State 2 (30–89 Seconds): Server Delay Warning (No buttons) */}
        {uiState === 'DELAY_WARNING' && apiStatus !== 'success' && (
          <div className="ai-loader-warning-card" role="status">
            <p className="ai-delay-warning-text">
              We're experiencing a slight delay in establishing a connection with the server. Please bear with us while we attempt to load the requested resources.
            </p>
          </div>
        )}

        {/* State 3 (After 90 Seconds): Connection Timeout Screen (ONLY TWO BUTTONS) */}
        {uiState === 'CONNECTION_TIMEOUT' && apiStatus !== 'success' && (
          <div className="ai-loader-timeout-card" role="alert">
            <p className="ai-timeout-message-text">
              The server is currently taking longer than expected to respond. You can explore my professional profile and projects while the connection is being restored.
            </p>

            <div className="timeout-actions">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="timeout-btn"
                aria-label="Visit LinkedIn profile (opens in a new tab)"
              >
                <Linkedin size={18} aria-hidden="true" />
                <span>Visit LinkedIn</span>
              </a>

              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="timeout-btn"
                aria-label="Explore GitHub profile (opens in a new tab)"
              >
                <Github size={18} aria-hidden="true" />
                <span>Explore GitHub</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
