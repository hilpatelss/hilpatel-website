/**
 * ==============================================================================
 * Master Application Component (App.jsx)
 * ==============================================================================
 *
 * Ground-up recoded React application orchestrating:
 * 1. Global ThemeProvider (Apple dark / light mode)
 * 2. APIReadinessProvider (Strict finite state machine initialization)
 * 3. PortfolioProvider (Parallel data fetching & live fallbacks)
 * 4. MainLayout (Sticky navbar, sections, footer)
 * 5. Reference LoadingScreen (Terminal squircle, 10s non-repeating typewriter messages, 4-segment sequential blinking)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { APIReadinessProvider, useAPIReadiness } from './context/APIReadinessContext';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { MainLayout } from './layouts/MainLayout';
import { LoadingScreen } from './components/LoadingScreen';
import { logVisitorVisit } from './services/visitorLog';

import {
  HeroSection,
  TickerSection,
  AboutSection,
  ProjectsSection,
  SkillsSection,
  EducationSection,
  CertificationsSection,
  AchievementsSection,
  ContactSection,
} from './sections';

import './styles/styles.css';

function PortfolioContent() {
  const { theme, toggleTheme } = useTheme();
  const readiness = useAPIReadiness();
  const { data, error, apiStatus, refetch } = usePortfolio();

  const [isLoaderFinished, setIsLoaderFinished] = useState(false);

  // 1. Lock document scrolling while loading screen is visible
  useEffect(() => {
    if (!isLoaderFinished) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoaderFinished]);

  // 2. Anonymous visitor telemetry logging
  useEffect(() => {
    logVisitorVisit(theme);

    const handleRouteChange = () => {
      logVisitorVisit(theme);
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [theme]);

  // 3. Scroll Reveal Observer for subsequent content sections
  useEffect(() => {
    if (!isLoaderFinished && !readiness.isInteractive) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isLoaderFinished, readiness.isInteractive, data]);

  // Memoized section visibility configuration map
  const sectionConfigs = useMemo(() => {
    const map = {};
    if (data.sections) {
      data.sections.forEach((sec) => {
        map[sec.section_key] = sec;
      });
    }
    return map;
  }, [data.sections]);

  const isSectionVisible = (key) => {
    if (!sectionConfigs[key]) return true;
    return sectionConfigs[key].is_visible !== false;
  };

  const handleRetry = () => {
    readiness.resetReadiness();
    refetch();
  };

  return (
    <>
      {/* Step 1: Loading Screen overlay (Reference Design) */}
      {!isLoaderFinished && (
        <LoadingScreen
          apiStatus={apiStatus}
          error={error}
          onRetry={handleRetry}
          onReadyToDismiss={() => {
            setIsLoaderFinished(true);
            readiness.triggerEntranceSequence();
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
          site={data?.site}
        />
      )}

      {/* Step 2: Main Website Shell */}
      <div
        className="site-shell"
        style={{
          visibility: (readiness.isApiReady || isLoaderFinished) ? 'visible' : 'hidden',
          opacity: isLoaderFinished ? 1 : 0,
          pointerEvents: isLoaderFinished ? 'auto' : 'none',
          transition: 'opacity 0.4s ease-out',
        }}
        aria-hidden={!isLoaderFinished}
      >
        <MainLayout>
          {/* 1. Hero Section with dynamic readiness entrance animation */}
          <HeroSection />

          {/* 2. Core skills ticker ribbon */}
          {data.ticker?.length > 0 && <TickerSection />}

          {/* 3. About Me Section */}
          {isSectionVisible('about') && (
            <AboutSection sectionConfig={sectionConfigs['about']} />
          )}

          {/* 4. Featured Projects Section */}
          {isSectionVisible('projects') && (
            <ProjectsSection sectionConfig={sectionConfigs['projects']} />
          )}

          {/* 5. Technical Skills Toolkit Section */}
          {isSectionVisible('skills') && (
            <SkillsSection sectionConfig={sectionConfigs['skills']} />
          )}

          {/* 6. Education Timeline Section */}
          {isSectionVisible('education') && (
            <EducationSection sectionConfig={sectionConfigs['education']} />
          )}

          {/* 7. Professional Certifications Section */}
          {isSectionVisible('certifications') && (
            <CertificationsSection sectionConfig={sectionConfigs['certifications']} />
          )}

          {/* 8. Highlights & Milestones Section */}
          {isSectionVisible('achievements') && (
            <AchievementsSection sectionConfig={sectionConfigs['achievements']} />
          )}

          {/* 9. Contact Inquiry Section */}
          {isSectionVisible('contact') && (
            <ContactSection sectionConfig={sectionConfigs['contact']} />
          )}
        </MainLayout>
      </div>
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <APIReadinessProvider>
        <PortfolioProvider>
          <PortfolioContent />
        </PortfolioProvider>
      </APIReadinessProvider>
    </ThemeProvider>
  );
}

export default App;
