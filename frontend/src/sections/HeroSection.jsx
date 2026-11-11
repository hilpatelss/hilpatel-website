/**
 * ==============================================================================
 * Hero Landing Section (HeroSection.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This is the first thing a visitor sees when entering hilpatel.site!
 * It introduces Hil Patel with an Apple-style large greeting headline, explains
 * his core mission as a Data Analyst, and provides clear call-to-action buttons.
 *
 * WHAT ARE THE MAIN PARTS?
 * 1. Left Column (Copy & Actions):
 *    - Status Pill: Shows "OPEN TO ENTRY-LEVEL OPPORTUNITIES" with a green pulse dot.
 *    - Main Headline: "Hi, I'm Hil. I make data make sense."
 *    - Bio Paragraph: Brief summary of background and technical specializations.
 *    - Buttons: "Explore my work" and "Download resume" (admin-managed link).
 *    - Metric Badges: Key skills (Python · SQL · Power BI) and Education.
 * 2. Right Column (Data Art Visual):
 *    - An interactive-looking mock dashboard graphic featuring rising bar charts,
 *      an SVG trend line, and the philosophy "Curiosity → Clarity".
 * 3. Bottom Cue: "SCROLL TO EXPLORE" arrow guiding visitors down to the About section.
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
import { motion } from 'framer-motion';
import { APPLE_EASE, fadeUp, scaleUp } from '../utils/animations';

export function HeroSection({ site, heroMetrics }) {
  // Resume download link: prioritizes the URL configured in Django Admin
  const resumeUrl = site?.resume_download_url || site?.resume_url || site?.hero_secondary_button_url || "/resume.pdf";

  // Helper to pick the appropriate Lucide icon based on name
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
    <section className="hero-section" id="home">
      {/* Subtle ambient animated gradient glow */}
      <div className="hero-ambient-glow" aria-hidden="true" />

      <div className="hero section-wrap">
        {/* Left Column: Headline, Bio text, Action buttons, and Key metric pills */}
        <motion.div
          className="hero-copy"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.05 },
            },
          }}
        >
          {/* Eyebrow badge showing career availability status */}
          <motion.div className="eyebrow" variants={fadeUp}>
            <span className="status-dot" /> {site?.hero_eyebrow || 'OPEN TO ENTRY-LEVEL OPPORTUNITIES'}
          </motion.div>

          <motion.p className="hero-kicker" variants={fadeUp}>
            {site?.hero_kicker || 'DATA ANALYTICS · BUSINESS INTELLIGENCE · PYTHON'}
          </motion.p>

          {/* Main big headline with staggered line slide-up */}
          <motion.h1 variants={fadeUp}>
            <span className="hero-greeting">{site?.hero_headline_greeting || "Hi, I'm Hil."}</span>
            <br />
            <span>{site?.hero_headline_line1 || 'I make data'}</span>
            <br />
            <span className="hero-title-accent">{site?.hero_headline_line2 || 'make sense'}</span>
            <span className="accent-dot">.</span>
          </motion.h1>

          {/* Intro summary description */}
          <motion.p className="hero-description" variants={fadeUp}>
            {site?.summary_text}
          </motion.p>
          
          {/* Call-to-action buttons */}
          <motion.div className="hero-buttons" variants={fadeUp}>
            <a
              className="button button-primary"
              href={site?.hero_primary_button_url || '#projects'}
            >
              <span>{site?.hero_primary_button_text || 'Explore my work'}</span>
              <ArrowRight size={17} className="btn-arrow-icon" />
            </a>
            <a
              className="button button-secondary"
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{site?.hero_secondary_button_text || 'Download resume'}</span>
              <Download size={16} />
            </a>
          </motion.div>

          {/* Technology pills / tags */}
          <motion.div className="hero-meta" variants={fadeUp}>
            {heroMetrics?.length > 0 ? (
              heroMetrics.map((metric, idx) => (
                <span key={idx} className="hero-meta-item">
                  <span className="meta-icon">{renderIcon(metric.icon_name)}</span>{' '}
                  {metric.text}
                </span>
              ))
            ) : (
              <>
                <span className="hero-meta-item">
                  <span className="meta-icon"><Code2 size={15} /></span> Python · SQL · Power BI
                </span>
                <span className="hero-meta-item">
                  <span className="meta-icon"><GraduationCap size={16} /></span> Computer Engineering · 2026
                </span>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Right Column: Illustrative Data Analytics Graphic */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.25, ease: APPLE_EASE }}
        >
          <div className="visual-top">
            <span>INSIGHT / 001</span>
            <span className="live-pill">
              <i /> ANALYTICS MODE
            </span>
          </div>
          <div className="visual-grid">
            <div className="visual-label">DATA → INSIGHT</div>
            {/* Rising trend chart illustration */}
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
                {/* SVG curved trendline representing data growth */}
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
          {/* Orbital background rings */}
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
        </motion.div>

        {/* Downward scrolling indicator link */}
        <a className="scroll-cue" href="#about">
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown size={15} />
        </a>
      </div>
    </section>
  );
}


