/**
 * ==============================================================================
 * Main Application Orchestrator Component (App.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS FILE?
 * This is the master coordinator for the entire frontend website. Think of it as
 * the director of a play: it decides when the loading screen should stay or go,
 * fetches all data from the backend, passes settings to each section (About, Projects,
 * Skills, etc.), and sets up nice visual scroll animations.
 *
 * KEY RESPONSIBILITIES:
 * 1. Global Theme: Provides Dark/Light mode context to the whole site.
 * 2. Data Fetching: Calls the backend API through `usePortfolioData`.
 * 3. Loading Screen: Shows the animated loading typewriter until data is ready or times out.
 * 4. Visitor Logging: Records anonymous visitor stats (device, screen size, page visited).
 * 5. Scroll Animations: Uses the browser's `IntersectionObserver` to fade sections in as you scroll.
 * 6. Dynamic Sections: Checks if any section was disabled in the Django admin panel.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { usePortfolioData } from './hooks/usePortfolioData';
import { logVisitorVisit } from './services/visitorLog';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { SkillsSection } from './sections/SkillsSection';
import { EducationSection } from './sections/EducationSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { AchievementsSection } from './sections/AchievementsSection';
import { ContactSection } from './sections/ContactSection';
import './styles/styles.css';

function PortfolioApp() {
  // Theme state: allows switching between Apple-style light and dark modes
  const { theme, toggleTheme } = useTheme();

  // Custom hook that pulls all portfolio data (projects, skills, about copy) from Django
  const { data, loading, error, apiStatus, refetch, applyDesignTokens } = usePortfolioData();

  // State to track if the introductory loading animation is completely done
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);

  // --------------------------------------------------------------------------
  // EFFECT 1: Apply Dynamic Theme Variables
  // --------------------------------------------------------------------------
  // Whenever the active theme (light/dark) or design settings change, update
  // the CSS custom properties (variables) on the webpage so colors update immediately.
  useEffect(() => {
    if (data?.design) {
      applyDesignTokens(data.design, theme);
    }
  }, [theme, data?.design, applyDesignTokens]);

  // --------------------------------------------------------------------------
  // EFFECT 2: Anonymous Visitor Telemetry
  // --------------------------------------------------------------------------
  // Records a lightweight, privacy-friendly log of the visit without asking for
  // personal details or showing annoying popups. Also listens for page navigation.
  useEffect(() => {
    // Record initial visit with the current active theme
    logVisitorVisit(theme);

    // If the visitor clicks internal links (like #projects or #about), log the movement
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

  // Prevent page scrolling while the loading screen is active
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

  // --------------------------------------------------------------------------
  // EFFECT 3: Scroll Reveal Animations
  // --------------------------------------------------------------------------
  // Once the loading screen disappears, this watches for elements with the class
  // 'reveal'. When the user scrolls down and an element enters the screen,
  // we add the 'is-visible' class to smoothly fade it in.
  useEffect(() => {
    if (!isLoaderFinished) return;

    // IntersectionObserver is a browser tool that efficiently detects when an element is on screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Once it has animated in, stop observing it to save computer memory
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 } // Triggers when 12% of the element is visible in the viewport
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    // Cleanup observer if the component unmounts
    return () => observer.disconnect();
  }, [isLoaderFinished, data]);

  // --------------------------------------------------------------------------
  // MEMOIZED SECTION CONFIGURATION
  // --------------------------------------------------------------------------
  // Converts the backend's array of section settings into an easy lookup object.
  // Example: sectionConfigs['projects'] -> { is_visible: true, title: "Projects" }
  const sectionConfigs = useMemo(() => {
    const map = {};
    if (data.sections) {
      data.sections.forEach((sec) => {
        map[sec.section_key] = sec;
      });
    }
    return map;
  }, [data.sections]);

  // Helper function to check if a specific section should be displayed
  const isSectionVisible = (key) => {
    // If the section isn't mentioned in the backend config, default to showing it
    if (!sectionConfigs[key]) return true;
    return sectionConfigs[key].is_visible !== false;
  };

  return (
    <>
      {/* 
        Step 1: If the site is still loading or connecting to the backend,
        display the typewriter loading screen with 30s delay warnings and 90s timeout fallback.
      */}
      {!isLoaderFinished && (
        <LoadingScreen
          apiStatus={apiStatus}
          error={error}
          onRetry={refetch}
          onReadyToDismiss={() => setIsLoaderFinished(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          site={data?.site}
        />
      )}

      {/* 
        Step 2: Main portfolio content shell.
        Hidden with visibility: hidden until the API is available and loader finishes.
      */}
      <div
        className="site-shell"
        style={{
          visibility: (apiStatus === 'success' || isLoaderFinished) ? 'visible' : 'hidden',
          opacity: isLoaderFinished ? 1 : 0,
          pointerEvents: isLoaderFinished ? 'auto' : 'none',
          transition: 'opacity 0.4s ease-out'
        }}
        aria-hidden={!isLoaderFinished}
      >
        {/* Top navigation bar with menu links and dark/light mode toggle */}
        <Navbar
          site={data.site}
          navigation={data.navigation}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

          {/* Main content area containing each portfolio section */}
          <main>
            {/* Hero section: Big welcoming headline and core introduction */}
            <HeroSection site={data.site} heroMetrics={data.hero_metrics} />

            {/* About Me Section */}
            {isSectionVisible('about') && (
              <AboutSection
                site={data.site}
                stats={data.about_stats}
                sectionConfig={sectionConfigs['about']}
              />
            )}

            {/* Featured Projects Section */}
            {isSectionVisible('projects') && (
              <ProjectsSection
                projects={data.projects}
                site={data.site}
                sectionConfig={sectionConfigs['projects']}
              />
            )}

            {/* Technical Skills & Tools Section */}
            {isSectionVisible('skills') && (
              <SkillsSection
                skills={data.skills}
                sectionConfig={sectionConfigs['skills']}
              />
            )}

            {/* Education History Section */}
            {isSectionVisible('education') && (
              <EducationSection
                education={data.education}
                sectionConfig={sectionConfigs['education']}
              />
            )}

            {/* Professional Certifications Section */}
            {isSectionVisible('certifications') && (
              <CertificationsSection
                certifications={data.certifications}
                sectionConfig={sectionConfigs['certifications']}
              />
            )}

            {/* Achievements & Milestones Section */}
            {isSectionVisible('achievements') && (
              <AchievementsSection
                achievements={data.achievements}
                sectionConfig={sectionConfigs['achievements']}
              />
            )}

            {/* Contact Form Section */}
            {isSectionVisible('contact') && (
              <ContactSection
                site={data.site}
                sectionConfig={sectionConfigs['contact']}
              />
            )}
          </main>

          {/* Website Footer with copyright and social links */}
          <Footer site={data.site} />
        </div>
    </>
  );
}

/**
 * Top-level root component.
 * Wraps PortfolioApp with the ThemeProvider so every child component can access
 * the current theme (light or dark) and switch themes whenever requested.
 */
export function App() {
  return (
    <ThemeProvider>
      <PortfolioApp />
    </ThemeProvider>
  );
}

export default App;
