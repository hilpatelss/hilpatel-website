import React, { useEffect, useState, useMemo } from 'react';
import { usePortfolioData } from './hooks/usePortfolioData';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './sections/HeroSection';
import { TickerSection } from './sections/TickerSection';
import { AboutSection } from './sections/AboutSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { SkillsSection } from './sections/SkillsSection';
import { EducationSection } from './sections/EducationSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { AchievementsSection } from './sections/AchievementsSection';
import { ContactSection } from './sections/ContactSection';
import './styles/styles.css';

export function App() {
  const { data, loading, error, apiStatus, refetch, applyDesignTokens } = usePortfolioData();
  const [theme, setTheme] = useState(() => localStorage.getItem('hil-theme') || 'dark');
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);

  // Sync theme changes with DOM and DesignSettings CSS variables
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('hil-theme', theme);
    if (data?.design) {
      applyDesignTokens(data.design, theme);
    }
  }, [theme, data?.design, applyDesignTokens]);

  // Set up scroll reveal animations once loader is finished and DOM elements are rendered
  useEffect(() => {
    if (!isLoaderFinished) return;
0
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
  }, [isLoaderFinished, data]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Section configuration lookup map
  const sectionConfigs = useMemo(() => {
    const map = {};
    if (data.sections) {
      data.sections.forEach((sec) => {
        map[sec.section_key] = sec;
      });
    }
    return map;
  }, [data.sections]);

  // Check if a section is visible
  const isSectionVisible = (key) => {
    if (!sectionConfigs[key]) return true; // Default visible if not configured
    return sectionConfigs[key].is_visible !== false;
  };

  return (
    <>
      {!isLoaderFinished && (
        <LoadingScreen
          apiStatus={apiStatus}
          error={error}
          onRetry={refetch}
          onReadyToDismiss={() => setIsLoaderFinished(true)}
        />
      )}

      {isLoaderFinished && (
        <div className="site-shell">
          <Navbar
            site={data.site}
            navigation={data.navigation}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <main>
            <HeroSection site={data.site} heroMetrics={data.hero_metrics} />

            <TickerSection items={data.ticker} />

            {isSectionVisible('about') && (
              <AboutSection
                site={data.site}
                stats={data.about_stats}
                sectionConfig={sectionConfigs['about']}
              />
            )}

            {isSectionVisible('projects') && (
              <ProjectsSection
                projects={data.projects}
                site={data.site}
                sectionConfig={sectionConfigs['projects']}
              />
            )}

            {isSectionVisible('skills') && (
              <SkillsSection
                skills={data.skills}
                sectionConfig={sectionConfigs['skills']}
              />
            )}

            {isSectionVisible('education') && (
              <EducationSection
                education={data.education}
                sectionConfig={sectionConfigs['education']}
              />
            )}

            {isSectionVisible('certifications') && (
              <CertificationsSection
                certifications={data.certifications}
                sectionConfig={sectionConfigs['certifications']}
              />
            )}

            {isSectionVisible('achievements') && (
              <AchievementsSection
                achievements={data.achievements}
                sectionConfig={sectionConfigs['achievements']}
              />
            )}

            {isSectionVisible('contact') && (
              <ContactSection
                site={data.site}
                sectionConfig={sectionConfigs['contact']}
              />
            )}
          </main>

          <Footer site={data.site} />
        </div>
      )}
    </>
  );
}

export default App;

