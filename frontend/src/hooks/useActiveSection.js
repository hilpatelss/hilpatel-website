import { useState, useEffect } from 'react';

/**
 * Tracks the active on-screen section for navigation bar highlights.
 */
export function useActiveSection(sectionIds = ['home', 'about', 'projects', 'skills', 'education', 'certifications', 'achievements', 'contact']) {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}

export default useActiveSection;
