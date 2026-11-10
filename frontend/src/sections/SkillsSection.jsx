/**
 * ==============================================================================
 * Technical Skills & Toolkit Section (SkillsSection.jsx) — Redesign 2.0
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This section catalogs Hil Patel's technical competencies, programming languages,
 * and data visualization tools.
 *
 * FEATURES & PRESERVATION:
 * 1. UNIX Terminal Card (Left): A macOS CLI-style terminal window that runs
 *    `whoami` and `toolkit --list`, with copy command support and window controls.
 * 2. Categorized Skill Groups (Right): Organized rows grouped by discipline:
 *    - Languages (Python, SQL)
 *    - Data Analysis (Pandas, NumPy, EDA, Data Cleaning)
 *    - Visualization (Power BI, Excel, DAX, Matplotlib)
 *    - Databases (PostgreSQL, SQLite)
 *    - Development Tools (Git, GitHub, VS Code, Django, REST APIs)
 */
import React, { useState } from 'react';
import { Terminal, Copy, Check, Sparkles } from 'lucide-react';

export function SkillsSection({ skills, sectionConfig }) {
  // State for copying terminal command feedback
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Configurable headings from Django CMS
  const indexLabel = sectionConfig?.index_label || "03 / TOOLKIT";
  const titleLine1 = sectionConfig?.title_line1 || "Tools I use to";
  const titleLine2 = sectionConfig?.title_line2 || "find the story.";

  const handleCopyCommand = () => {
    const cmd = "whoami && toolkit --list";
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cmd);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2200);
    }
  };

  return (
    <section className="section-block skills-section" id="skills" aria-label="Skills and Toolkit">
      <div className="section-wrap">
        {/* Section Heading */}
        <div className="section-heading reveal">
          <span className="section-index">{indexLabel}</span>
          <h2>
            {titleLine1}
            <br />
            <span>{titleLine2}</span>
          </h2>
        </div>

        <div className="skills-layout">
          {/* Left Column: Simulated macOS UNIX Terminal Card */}
          <div className="skills-intro reveal">
            <div className="terminal-card" role="region" aria-label="Interactive developer terminal">
              <div className="terminal-bar">
                <div className="terminal-dots" aria-hidden="true">
                  <span className="dot-close" />
                  <span className="dot-min" />
                  <span className="dot-max" />
                </div>
                <small className="terminal-title">hil@portfolio:~</small>
                <button
                  type="button"
                  className="terminal-copy-btn"
                  onClick={handleCopyCommand}
                  aria-label="Copy terminal command to clipboard"
                  title="Copy terminal command"
                >
                  {copiedCmd ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                </button>
              </div>

              <div className="terminal-body" tabIndex="0" aria-label="Terminal output">
                <p className="terminal-prompt">
                  <b>$</b> whoami
                </p>
                <strong className="terminal-out-highlight">data_analyst</strong>

                <p className="terminal-prompt">
                  <b>$</b> toolkit --list
                </p>
                <div className="terminal-list">
                  <span>01</span> analysis & cleaning
                  <br />
                  <span>02</span> business intelligence
                  <br />
                  <span>03</span> databases & APIs
                  <br />
                  <span>04</span> data storytelling
                </div>

                <p className="terminal-ready">
                  <b aria-hidden="true">✓</b> ready to explore
                </p>
                <span className="cursor" aria-hidden="true">_</span>
              </div>
            </div>

            <p className="body-copy">
              A practical toolkit for preparing data, analysing patterns, and
              presenting findings clearly.
            </p>
          </div>

          {/* Right Column: Categorized Skill Pill Badges */}
          <div className="skill-groups reveal" aria-label="Skill categories">
            {skills?.length > 0 ? (
              skills.map((s, i) => (
                <div className="skill-group" key={s.id || s.name || i}>
                  <div className="skill-group-head">
                    <span className="skill-group-num">0{i + 1}</span>
                    <h3>{s.name}</h3>
                    <span className="skill-count">
                      {String(s.items?.length || 0).padStart(2, '0')} TOOLS
                    </span>
                  </div>
                  <div className="skill-pills" aria-label={`${s.name} tools`}>
                    {s.items?.map((item) => (
                      <span key={item} className="skill-pill">{item}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: '2rem 0', opacity: 0.7 }}>
                <p>No skills configured at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SkillsSection;
