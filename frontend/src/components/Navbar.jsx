import React, { useState } from 'react';
import { Download, Sun, Moon, Menu, X, ArrowDownRight } from 'lucide-react';

export function Navbar({ site, navigation, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = navigation?.length > 0 ? navigation : [
    { label: "About", url: "#about" },
    { label: "Projects", url: "#projects" },
    { label: "Skills", url: "#skills" },
    { label: "Education", url: "#education" },
    { label: "Certifications", url: "#certifications" },
  ];

  const resumeUrl = site?.resume_download_url || site?.resume_url || site?.hero_secondary_button_url || "/resume.pdf";

  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label={`${site?.owner_name || 'Hil Patel'} home`}>
        <span className="brand-mark">
          {site?.brand_mark_initial || 'H'}<span>{site?.brand_mark_accent || '.'}</span>
        </span>
        <span className="brand-name">
          {(site?.owner_name || 'HIL PATEL').toUpperCase()} <small>PORTFOLIO / 2026</small>
        </span>
      </a>

      <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.url}
            target={item.is_external ? "_blank" : undefined}
            rel={item.is_external ? "noreferrer" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <a
          className="nav-contact"
          href="#contact"
          onClick={() => setMenuOpen(false)}
        >
          Let's talk <ArrowDownRight size={15} />
        </a>
      </nav>

      <div className="top-actions">
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <a
          className="resume-small"
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume <Download size={14} />
        </a>

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

