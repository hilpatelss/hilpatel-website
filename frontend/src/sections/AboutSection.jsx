/**
 * ==============================================================================
 * About Section Component (AboutSection.jsx) — Redesign 2.0
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This section tells the visitor who Hil Patel is in greater depth.
 * It explains his analytical philosophy: "Curious by nature. Analytical by design."
 *
 * FEATURES & PRESERVATION:
 * 1. Narrative Bio: Focus on data cleaning, exploratory analysis, and clear reporting.
 * 2. Social Action Links: LinkedIn, GitHub, and Email with quick-copy feedback.
 * 3. Quick Stats Grid: 4 interactive summary cards:
 *    - Featured projects count (e.g. 03)
 *    - Tool categories (e.g. 05+)
 *    - Certifications count
 *    - Accented focus card with an icon.
 */
import React, { useState } from 'react';
import {
  Linkedin,
  Github,
  Mail,
  ExternalLink,
  ArrowRight,
  ChartNoAxesCombined,
  Target,
  Sparkles,
  BarChart3,
  TrendingUp,
  Database,
  Award,
  Zap,
  PieChart,
  Brain,
  Code2,
  Briefcase,
  Copy,
  Check,
} from 'lucide-react';

export function AboutSection({ site, stats, sectionConfig }) {
  // State for email copy-to-clipboard feedback
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Configurable headings from Django CMS
  const indexLabel = sectionConfig?.index_label || "01 / ABOUT";
  const titleLine1 = sectionConfig?.title_line1 || "Curious by nature.";
  const titleLine2 = sectionConfig?.title_line2 || "Analytical by design.";

  // Quick copy email address with visual confirmation
  const handleCopyEmail = (e) => {
    e.preventDefault();
    const emailToCopy = site?.email || "hilpatelss@gmail.com";
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(emailToCopy);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2400);
    } else {
      window.location.href = `mailto:${emailToCopy}`;
    }
  };

  // Helper function to pick the right Lucide icon for cards that display a symbol instead of a number
  const renderStatIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'target':
        return <Target size={28} aria-hidden="true" />;
      case 'sparkles':
        return <Sparkles size={28} aria-hidden="true" />;
      case 'barchart3':
      case 'barchart':
        return <BarChart3 size={28} aria-hidden="true" />;
      case 'trendingup':
        return <TrendingUp size={28} aria-hidden="true" />;
      case 'database':
        return <Database size={28} aria-hidden="true" />;
      case 'award':
        return <Award size={28} aria-hidden="true" />;
      case 'zap':
        return <Zap size={28} aria-hidden="true" />;
      case 'piechart':
        return <PieChart size={28} aria-hidden="true" />;
      case 'brain':
        return <Brain size={28} aria-hidden="true" />;
      case 'code2':
      case 'code':
        return <Code2 size={28} aria-hidden="true" />;
      case 'briefcase':
        return <Briefcase size={28} aria-hidden="true" />;
      case 'chartnoaxescombined':
      default:
        return <ChartNoAxesCombined size={28} aria-hidden="true" />;
    }
  };

  return (
    <section className="section-block about-section" id="about" aria-label="About Hil Patel">
      <div className="section-wrap">
        {/* Section Index & Title */}
        <div className="section-heading reveal">
          <span className="section-index">{indexLabel}</span>
          <h2>
            {titleLine1}
            <br />
            <span>{titleLine2}</span>
          </h2>
        </div>

        <div className="about-layout">
          {/* Left Column: Bio Narrative & Direct Profile Links */}
          <div className="about-main reveal">
            <p className="large-copy">{site?.about_large_copy}</p>
            <p className="body-copy">{site?.about_body_copy}</p>

            <div className="about-links" aria-label="Social and contact links">
              {site?.linkedin_url && (
                <a
                  href={site.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-link-pill"
                  aria-label="LinkedIn profile (opens in a new tab)"
                >
                  <Linkedin size={17} aria-hidden="true" />
                  <span>LinkedIn</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              )}
              {site?.github_url && (
                <a
                  href={site.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-link-pill"
                  aria-label="GitHub profile (opens in a new tab)"
                >
                  <Github size={17} aria-hidden="true" />
                  <span>GitHub</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              )}
              {site?.email && (
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="about-link-pill about-link-email"
                  aria-label={`Copy email ${site.email} to clipboard`}
                  title="Click to copy email address"
                >
                  {copiedEmail ? <Check size={16} aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
                  <span>{copiedEmail ? "Copied!" : "Email"}</span>
                  <Copy size={13} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Grid of 4 Stat / Highlight Cards */}
          <div className="stats-grid reveal" aria-label="Key highlights summary">
            {stats?.map((stat, idx) => {
              const isAccent = stat.is_accent;
              const hasValidNumber = Boolean(stat.number && stat.number !== '0' && stat.number.trim() !== '');

              return (
                <div
                  key={stat.id || idx}
                  className={`stat-card ${isAccent ? 'stat-card-accent' : ''}`}
                >
                  {/* If the stat has a number (like "03" or "05+"), show big text */}
                  {hasValidNumber ? (
                    <span className="stat-number">
                      {stat.number.replace('+', '')}
                      {stat.number.includes('+') && <span className="stat-plus" aria-hidden="true">+</span>}
                    </span>
                  ) : (
                    /* Otherwise, show a clean analytics icon */
                    <span className="stat-symbol">
                      {renderStatIcon(stat.icon_name)}
                    </span>
                  )}
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-detail">{stat.detail}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
