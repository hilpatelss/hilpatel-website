import React from 'react';
import {
  ArrowRight,
  Download,
  Code2,
  GraduationCap,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export function HeroSection({ site, heroMetrics }) {
  const resumeUrl = site?.resume_download_url || site?.resume_url || site?.hero_secondary_button_url || "/resume.pdf";

  // Dynamic icon helper
  const renderIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'graduationcap':
        return <GraduationCap size={16} />;
      case 'code2':
      default:
        return <Code2 size={15} />;
    }
  };

  return (
    <section className="hero section-wrap" id="home">
      <div className="hero-copy reveal">
        <div className="eyebrow">
          <span className="status-dot" /> {site?.hero_eyebrow || 'OPEN TO ENTRY-LEVEL OPPORTUNITIES'}
        </div>
        <p className="hero-kicker">
          {site?.hero_kicker || 'DATA ANALYTICS · BUSINESS INTELLIGENCE · PYTHON'}
        </p>
        <h1>
          {site?.hero_headline_greeting || "Hi, I'm Hil."}
          <br />
          <span>{site?.hero_headline_line1 || 'I make data'}</span>
          <br />
          {site?.hero_headline_line2 || 'make sense'}
          <span className="accent-dot">.</span>
        </h1>
        <p className="hero-description">{site?.summary_text}</p>
        
        <div className="hero-buttons">
          <a
            className="button button-primary"
            href={site?.hero_primary_button_url || '#projects'}
          >
            {site?.hero_primary_button_text || 'Explore my work'} <ArrowRight size={17} />
          </a>
          <a
            className="button button-secondary"
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {site?.hero_secondary_button_text || 'Download resume'} <Download size={16} />
          </a>
        </div>

        <div className="hero-meta">
          {heroMetrics?.length > 0 ? (
            heroMetrics.map((metric, idx) => (
              <span key={idx}>
                <span className="meta-icon">{renderIcon(metric.icon_name)}</span>{' '}
                {metric.text}
              </span>
            ))
          ) : (
            <>
              <span>
                <span className="meta-icon"><Code2 size={15} /></span> Python · SQL · Power BI
              </span>
              <span>
                <span className="meta-icon"><GraduationCap size={16} /></span> Computer Engineering · 2026
              </span>
            </>
          )}
        </div>
      </div>

      <div className="hero-visual reveal">
        <div className="visual-top">
          <span>INSIGHT / 001</span>
          <span className="live-pill">
            <i /> ANALYTICS MODE
          </span>
        </div>
        <div className="visual-grid">
          <div className="visual-label">DATA → INSIGHT</div>
          <div className="chart-area">
            <div className="chart-y">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            <div className="chart-lines">
              <i />
              <i />
              <i />
              <i />
              <i />
              <div className="chart-bars">
                <b style={{ height: "31%" }} />
                <b style={{ height: "47%" }} />
                <b style={{ height: "38%" }} />
                <b style={{ height: "65%" }} />
                <b style={{ height: "55%" }} />
                <b style={{ height: "76%" }} />
                <b style={{ height: "61%" }} />
                <b style={{ height: "91%" }} />
                <b style={{ height: "73%" }} />
              </div>
              <svg
                viewBox="0 0 400 140"
                preserveAspectRatio="none"
                aria-label="Illustrative rising trend line"
              >
                <path
                  d="M0 112 C28 103, 30 77, 60 88 S94 105, 120 70 S153 86, 181 58 S216 70, 245 39 S285 66, 313 31 S355 42, 400 8"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                />
                <circle cx="400" cy="8" r="4" fill="var(--accent)" />
              </svg>
            </div>
          </div>
          <div className="chart-foot">
            <span>EXPLORATION</span>
            <span>MODELLING</span>
            <span>STORYTELLING</span>
          </div>
          <div className="visual-bottom">
            <div>
              <small>CORE APPROACH</small>
              <strong>Curiosity → Clarity</strong>
            </div>
            <div className="visual-stamp">
              <Sparkles size={20} />
            </div>
          </div>
        </div>
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
      </div>

      <a className="scroll-cue" href="#about">
        <span>SCROLL TO EXPLORE</span>
        <ChevronDown size={15} />
      </a>
    </section>
  );
}

