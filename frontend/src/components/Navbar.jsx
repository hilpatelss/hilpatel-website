/**
 * ==============================================================================
 * Website Header & Navigation Bar (Navbar.jsx) — Redesign 2.0
 * ==============================================================================
 *
 * WHAT IS THIS COMPONENT?
 * This is the sticky top navigation header that floats at the top of the browser.
 * 
 * FEATURES:
 * 1. Brand Logo: The "H." monogram badge and "HIL PATEL / PORTFOLIO 2026" label.
 * 2. Real-time Scroll Progress Bar: Subtle accent line tracking reading progress.
 * 3. Active Section Indicator: Automatically highlights the section currently in view.
 * 4. Responsive Mobile Drawer: Smooth slide-down menu with touch targets for phones.
 * 5. Theme Switcher Button: Seamless instant toggle between Dark and Light mode.
 * 6. Direct Resume Button: Opens Hil Patel's latest PDF resume in a new tab.
 */
import React, { useState, useEffect } from 'react';
import { Download, Sun, Moon, Menu, X, ArrowDownRight } from 'lucide-react';

export function Navbar({ site, navigation, theme, onToggleTheme }) {
  // Mobile drawer open/close state
  const [menuOpen, setMenuOpen] = useState(false);
  // Real-time reading scroll progress (0 to 100 percent)
  const [scrollProgress, setScrollProgress] = useState(0);
  // Currently active section identifier (e.g. 'about', 'projects', 'skills')
  const [activeSection, setActiveSection] = useState('home');

  // Fallback navigation items if Django settings are not yet loaded
  const navItems = navigation?.length > 0 ? navigation : [
    { label: "About", url: "#about" },
    { label: "Projects", url: "#projects" },
    { label: "Skills", url: "#skills" },
    { label: "Education", url: "#education" },
    { label: "Certifications", url: "#certifications" },
  ];

  // Resume PDF URL from site settings or project default
  const resumeUrl = site?.resume_download_url || site?.resume_url || site?.hero_secondary_button_url || "/resume.pdf";

  // Track window scroll progress and active visible section
  useEffect(() => {
    const handleScroll = () => {
      // 1. Calculate scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }

      // 2. Detect which section is currently in view
      const sections = ['home', 'about', 'projects', 'skills', 'education', 'certifications', 'achievements', 'contact'];
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="topbar" role="banner">
      {/* Real-time reading scroll progress bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Brand logo link (scrolls smoothly to #home) */}
      <a className="brand" href="#home" aria-label={`${site?.owner_name || 'Hil Patel'} home`}>
        <span className="brand-mark" aria-hidden="true">
          {site?.brand_mark_initial || 'H'}<span>{site?.brand_mark_accent || '.'}</span>
        </span>
        <span className="brand-name">
          {(site?.owner_name || 'HIL PATEL').toUpperCase()}{' '}
          <small>PORTFOLIO / 2026</small>
        </span>
      </a>

      {/* Desktop Navigation Links */}
      <nav
        id="nav-menu"
        className={`nav-links ${menuOpen ? "nav-open" : ""}`}
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const targetSection = item.url?.replace('#', '');
          const isActive = activeSection === targetSection;

          return (
            <a
              key={item.label}
              href={item.url}
              className={isActive ? "nav-link-active" : ""}
              target={item.is_external ? "_blank" : undefined}
              rel={item.is_external ? "noreferrer" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
              {isActive && <span className="active-pill-dot" aria-hidden="true" />}
            </a>
          );
        })}
        {/* Contact jump link */}
        <a
          className={`nav-contact ${activeSection === 'contact' ? 'nav-link-active' : ''}`}
          href="#contact"
          onClick={() => setMenuOpen(false)}
        >
          Let's talk <ArrowDownRight size={15} aria-hidden="true" />
        </a>
      </nav>

      {/* Right Actions: Theme Toggle, Resume Download, Hamburger */}
      <div className="top-actions">
        {/* Dark / Light Mode Switcher */}
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleTheme();
            }
          }}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>

        {/* View / Download Resume Button */}
        <a
          className="resume-small"
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download resume PDF (opens in new tab)"
        >
          <span>Resume</span> <Download size={14} aria-hidden="true" />
        </a>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
