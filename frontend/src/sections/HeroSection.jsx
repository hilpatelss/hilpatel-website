/**
 * ==============================================================================
 * Hero Landing Section (HeroSection.jsx) — Redesign 2.0
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This is the signature welcoming section for hilpatel.site!
 * It introduces Hil Patel with an Apple Pro aesthetic, sets the narrative as
 * a Data Analyst, provides prominent CTAs, and renders an interactive analytics
 * visual along with the live infinite marquee ticker at the bottom.
 *
 * PRESERVED FEATURES:
 * 1. Eyebrow badge: "OPEN TO ENTRY-LEVEL OPPORTUNITIES" with glowing pulse dot.
 * 2. Kicker: "DATA ANALYTICS · BUSINESS INTELLIGENCE · PYTHON".
 * 3. Greeting: "Hi, I'm Hil. I make data make sense."
 * 4. Summary description from site settings.
 * 5. CTA buttons: "Explore my work" (#projects) and "Download resume" (PDF link).
 * 6. Metric pills: Python · SQL · Power BI, Computer Engineering · 2026.
 * 7. Mock Analytics Visual: DATA → INSIGHT chart, curved SVG trendline, Curiosity → Clarity.
 * 8. Scroll cue: "SCROLL TO EXPLORE" with animated chevron.
 * 9. Marquee Ticker: Seamless infinite ribbon wrapped at the bottom of the section.
 */
import React from 'react';
import {
  ArrowRight,
  Download,
  Code2,
  GraduationCap,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { TickerSection } from './TickerSection';

export function HeroSection({ site, heroMetrics, tickerItems }) {
  // Resume download link: prioritizes the URL configured in Django Admin
  const resumeUrl = site?.resume_download_url || site?.resume_url || site?.hero_secondary_button_url || "/resume.pdf";

  // Helper to pick the appropriate Lucide icon based on name
  const renderIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'graduationcap':
        return <GraduationCap size={16} aria-hidden="true" />;
      case 'code2':
      default:
        return <Code2 size={15} aria-hidden="true" />;
    }
  };

  return (
    <section className="hero-section" id="home" aria-label="Introduction">
      <div className="hero section-wrap">
        {/* Left Column: Headline, Bio text, Action buttons, and Key metric pills */}
        <div className="hero-copy reveal">
          {/* Eyebrow badge showing career availability status with pulse dot */}
          <div className="eyebrow" role="status">
            <span className="status-dot" aria-hidden="true" />
            <span>{site?.hero_eyebrow || 'OPEN TO ENTRY-LEVEL OPPORTUNITIES'}</span>
          </div>

          <p className="hero-kicker">
            {site?.hero_kicker || 'DATA ANALYTICS · BUSINESS INTELLIGENCE · PYTHON'}
          </p>

          {/* Main big headline */}
          <h1>
            {site?.hero_headline_greeting || "Hi, I'm Hil."}
            <br />
            <span>{site?.hero_headline_line1 || 'I make data'}</span>
            <br />
            {site?.hero_headline_line2 || 'make sense'}
            <span className="accent-dot" aria-hidden="true">.</span>
          </h1>

          {/* Intro summary description */}
          <p className="hero-description">{site?.summary_text}</p>
          
          {/* Call-to-action buttons */}
          <div className="hero-buttons">
            <a
              className="button button-primary"
              href={site?.hero_primary_button_url || '#projects'}
            >
              <span>{site?.hero_primary_button_text || 'Explore my work'}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a
              className="button button-secondary"
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download resume PDF (opens in new tab)"
            >
              <span>{site?.hero_secondary_button_text || 'Download resume'}</span>
              <Download size={16} aria-hidden="true" />
            </a>
          </div>

          {/* Technology pills / tags */}
          <div className="hero-meta" aria-label="Key competencies">
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
                  <span className="meta-icon"><Code2 size={15} aria-hidden="true" /></span> Python · SQL · Power BI
                </span>
                <span>
                  <span className="meta-icon"><GraduationCap size={16} aria-hidden="true" /></span> Computer Engineering · 2026
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Illustrative Data Analytics Graphic */}
        <div className="hero-visual reveal" aria-label="Data Analytics Visualization Preview">
          <div className="visual-top">
            <span>INSIGHT / 001</span>
            <span className="live-pill">
              <i aria-hidden="true" /> ANALYTICS MODE
            </span>
          </div>

          <div className="visual-grid">
            <div className="visual-label">DATA → INSIGHT</div>

            {/* Rising trend chart illustration */}
            <div className="chart-area" aria-hidden="true">
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
                  <b style={{ height: "31%" }} title="Stage 1" />
                  <b style={{ height: "47%" }} title="Stage 2" />
                  <b style={{ height: "38%" }} title="Stage 3" />
                  <b style={{ height: "65%" }} title="Stage 4" />
                  <b style={{ height: "55%" }} title="Stage 5" />
                  <b style={{ height: "76%" }} title="Stage 6" />
                  <b style={{ height: "61%" }} title="Stage 7" />
                  <b style={{ height: "91%" }} title="Stage 8" />
                  <b style={{ height: "73%" }} title="Stage 9" />
                </div>
                {/* SVG curved trendline representing continuous data growth */}
                <svg
                  viewBox="0 0 400 140"
                  preserveAspectRatio="none"
                  aria-label="Rising analytical trend line"
                >
                  <path
                    d="M0 112 C28 103, 30 77, 60 88 S94 105, 120 70 S153 86, 181 58 S216 70, 245 39 S285 66, 313 31 S355 42, 400 8"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="400" cy="8" r="4.5" fill="var(--accent)" className="trend-endpoint" />
                </svg>
              </div>
            </div>

            <div className="chart-foot" aria-hidden="true">
              <span>EXPLORATION</span>
              <span>MODELLING</span>
              <span>STORYTELLING</span>
            </div>

            <div className="visual-bottom">
              <div>
                <small>CORE APPROACH</small>
                <strong>Curiosity → Clarity</strong>
              </div>
              <div className="visual-stamp" aria-hidden="true">
                <Sparkles size={20} />
              </div>
            </div>
          </div>

          {/* Atmospheric background orbital glow rings */}
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />
        </div>

        {/* Downward scrolling indicator link */}
        <a className="scroll-cue" href="#about" aria-label="Scroll down to About section">
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown size={15} aria-hidden="true" />
        </a>
      </div>

      {/* Full-width continuous tool ticker ribbon wrapped at the bottom of hero */}
      <TickerSection items={tickerItems} />
    </section>
  );
}

export default HeroSection;
