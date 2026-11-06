/**
 * ==============================================================================
 * Website Header & Navigation Bar (Navbar.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS COMPONENT?
 * This is the fixed top bar that stays at the top of the browser as you scroll.
 * 
 * WHAT FEATURES DOES IT INCLUDE?
 * 1. Brand Logo: The "H." monogram and "HIL PATEL / PORTFOLIO 2026" title.
 * 2. Navigation Links: Dynamic links to sections (About, Projects, Skills, etc.).
 * 3. Mobile Hamburger Menu: On small phone screens, collapses the links into an
 *    expandable slide-out menu.
 * 4. Theme Switcher Button: Lets visitors instantly flip between Dark Mode and Light Mode.
 * 5. Direct Resume Button: Opens Hil Patel's latest PDF resume in a new browser tab.
 */
import React, { useState } from 'react';
import { Download, Sun, Moon, Menu, X, ArrowDownRight } from 'lucide-react';

export function Navbar({ site, navigation, theme, onToggleTheme }) {
  // State to track whether the mobile menu dropdown is open or closed
  const [menuOpen, setMenuOpen] = useState(false);

  // If the backend provided custom navigation items, use them; otherwise use standard defaults
  const navItems = navigation?.length > 0 ? navigation : [
    { label: "About", url: "#about" },
    { label: "Projects", url: "#projects" },
    { label: "Skills", url: "#skills" },
    { label: "Education", url: "#education" },
    { label: "Certifications", url: "#certifications" },
  ];

  // Resume PDF URL: Prioritizes admin-configured links from Django, falling back to local /resume.pdf
  const resumeUrl = site?.resume_download_url || site?.resume_url || site?.hero_secondary_button_url || "/resume.pdf";

  return (
    <header className="topbar">
      {/* Brand logo that scrolls back to the top when clicked */}
      <a className="brand" href="#home" aria-label={`${site?.owner_name || 'Hil Patel'} home`}>
        <span className="brand-mark">
          {site?.brand_mark_initial || 'H'}<span>{site?.brand_mark_accent || '.'}</span>
        </span>
        <span className="brand-name">
          {(site?.owner_name || 'HIL PATEL').toUpperCase()} <small>PORTFOLIO / 2026</small>
        </span>
      </a>

      {/* Main navigation links list (collapses on mobile when menuOpen is false) */}
      <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.url}
            target={item.is_external ? "_blank" : undefined}
            rel={item.is_external ? "noreferrer" : undefined}
            onClick={() => setMenuOpen(false)} // Closes mobile menu when a link is clicked
          >
            {item.label}
          </a>
        ))}
        {/* Contact quick jump button */}
        <a
          className="nav-contact"
          href="#contact"
          onClick={() => setMenuOpen(false)}
        >
          Let's talk <ArrowDownRight size={15} />
        </a>
      </nav>

      {/* Action buttons on the right side: Theme toggle, Resume, and Mobile hamburger button */}
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
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* View / Download Resume Button */}
        <a
          className="resume-small"
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume <Download size={14} />
        </a>

        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}


