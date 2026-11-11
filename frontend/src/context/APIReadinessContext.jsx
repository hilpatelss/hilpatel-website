/**
 * ==============================================================================
 * Central Application Readiness Provider (APIReadinessContext.jsx)
 * ==============================================================================
 *
 * Implements the required strict finite state machine:
 *
 *   INITIALIZING
 *        ↓
 *   API_LOADING
 *        ↓
 *   API_VALIDATING
 *        ↓
 *   API_READY
 *        ↓
 *   ANIMATING
 *        ↓
 *   INTERACTIVE
 *
 * (or API_ERROR with recoverable retry states)
 *
 * GUARANTEES:
 * 1. Main entrance animations start ONLY after required Django APIs are ready.
 * 2. Entrance animations execute exactly ONCE per application lifecycle (immune to StrictMode).
 * 3. Before API_READY: Main website is completely hidden, no broken images, no early animations.
 * 4. After API_READY: Loading screen fades out smoothly, entrance sequence runs, and then
 *    interactive controls and scroll observers are activated.
 */

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

export const APP_STATES = {
  INITIALIZING: 'INITIALIZING',
  API_LOADING: 'API_LOADING',
  API_VALIDATING: 'API_VALIDATING',
  API_READY: 'API_READY',
  ANIMATING: 'ANIMATING',
  INTERACTIVE: 'INTERACTIVE',
  API_ERROR: 'API_ERROR',
};

const APIReadinessContext = createContext(null);

export function APIReadinessProvider({ children }) {
  const [appState, setAppState] = useState(APP_STATES.INITIALIZING);
  const [apiError, setApiError] = useState(null);

  // Guards against multiple animation triggers across renders or React StrictMode
  const hasAnimatedRef = useRef(false);
  const animationTimerRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  /**
   * Set the app to API_LOADING state when requests begin.
   */
  const markApiLoading = useCallback(() => {
    setAppState((current) => {
      if (current === APP_STATES.INITIALIZING || current === APP_STATES.API_ERROR) {
        return APP_STATES.API_LOADING;
      }
      return current;
    });
  }, []);

  /**
   * Set the app to API_VALIDATING state while verifying payload integrity.
   */
  const markApiValidating = useCallback(() => {
    setAppState(APP_STATES.API_VALIDATING);
  }, []);

  /**
   * Mark that essential API endpoints responded with valid data.
   */
  const markApiReady = useCallback(() => {
    setApiError(null);
    setAppState(APP_STATES.API_READY);
  }, []);

  /**
   * Mark an essential API failure or network timeout.
   */
  const markApiError = useCallback((error) => {
    setApiError(error);
    setAppState(APP_STATES.API_ERROR);
  }, []);

  /**
   * Trigger the main entrance animation sequence once loading screen begins to dismiss.
   * Runs strictly once per application visit.
   */
  const triggerEntranceSequence = useCallback(() => {
    if (hasAnimatedRef.current) {
      setAppState(APP_STATES.INTERACTIVE);
      return;
    }

    hasAnimatedRef.current = true;
    setAppState(APP_STATES.ANIMATING);

    // After hero entrance animation completes (~850ms), transition to INTERACTIVE
    animationTimerRef.current = setTimeout(() => {
      setAppState(APP_STATES.INTERACTIVE);
    }, 850);
  }, []);

  /**
   * Resets readiness state if the user manually clicks "Retry"
   */
  const resetReadiness = useCallback(() => {
    hasAnimatedRef.current = false;
    setApiError(null);
    setAppState(APP_STATES.API_LOADING);
  }, []);

  const isApiReady = [
    APP_STATES.API_READY,
    APP_STATES.ANIMATING,
    APP_STATES.INTERACTIVE,
  ].includes(appState);

  const shouldAnimateHero = [
    APP_STATES.ANIMATING,
    APP_STATES.INTERACTIVE,
  ].includes(appState);

  const isInteractive = appState === APP_STATES.INTERACTIVE;

  const value = {
    appState,
    isApiReady,
    shouldAnimateHero,
    isInteractive,
    apiError,
    markApiLoading,
    markApiValidating,
    markApiReady,
    markApiError,
    triggerEntranceSequence,
    resetReadiness,
  };

  return (
    <APIReadinessContext.Provider value={value}>
      {children}
    </APIReadinessContext.Provider>
  );
}

export function useAPIReadiness() {
  const context = useContext(APIReadinessContext);
  if (!context) {
    throw new Error('useAPIReadiness must be used within an APIReadinessProvider');
  }
  return context;
}
