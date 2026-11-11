/**
 * ==============================================================================
 * Modern Sticky Glass Navigation Bar (Navbar.jsx)
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Download, Sun, Moon, Menu, X, ArrowDownRight } from 'lucide-react';
import { useScrolled, useActiveSection } from '../hooks';
import { useTheme } from '../context/ThemeContext';
import { usePortfolio } from '../context/PortfolioContext';

export function Navbar() {
  const { data } = usePortfolio();
  const { site, navigation } = data;
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const isScrolled = useScrolled(20);
  const activeSection = useActiveSection();

  const navItems = navigation?.length > 0 ? navigation : [
    { label: "About", url: "#about" },
    { label: "Projects", url: "#projects" },
    { label: "Skills", url: "#skills" },
    { label: "Education", url: "#education" },
    { label: "Certifications", url: "#certifications" },
  ];

  const resumeUrl = site?.resume_download_url || site?.resume_url || site?.hero_secondary_button_url || "/resume.pdf";

  return (
    <header className={`topbar ${isScrolled ? "topbar-scrolled" : ""}`}>
      {/* Brand Logo */}
      <a className="brand" href="#home" aria-label={`${site?.owner_name || 'Hil Patel'} home`}>
        <span className="brand-mark">
          {site?.brand_mark_initial || 'H'}<span>{site?.brand_mark_accent || '.'}</span>
        </span>
        <span className="brand-name">
          {(site?.owner_name || 'HIL PATEL').toUpperCase()} <small>PORTFOLIO / 2026</small>
        </span>
      </a>

      {/* Main Navigation Links */}
      <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`} aria-label="Main Navigation">
        {navItems.map((item) => {
          const sectionId = item.url?.replace('#', '');
          const isActive = activeSection === sectionId;

          return (
            <a
              key={item.label}
              href={item.url}
              className={isActive ? "nav-link-active" : ""}
              target={item.is_external ? "_blank" : undefined}
              rel={item.is_external ? "noreferrer" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <span>{item.label}</span>
            </a>
          );
        })}

        <a
          className={`nav-contact ${activeSection === 'contact' ? "nav-contact-active" : ""}`}
          href="#contact"
          onClick={() => setMenuOpen(false)}
        >
          Let's talk <ArrowDownRight size={15} />
        </a>
      </nav>

      {/* Top Bar Actions: Theme Toggle, Resume, Mobile Menu Toggle */}
      <div className="top-actions">
        {/* Dark / Light Mode Switcher */}
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTheme();
            }
          }}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>

        {/* Resume Button */}
        <a
          className="resume-small"
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View or download resume (PDF)"
        >
          <span>Resume</span>
          <Download size={14} aria-hidden="true" />
        </a>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
