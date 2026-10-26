import React from 'react';

export function SkillsSection({ skills, sectionConfig }) {
  const indexLabel = sectionConfig?.index_label || "03 / TOOLKIT";
  const titleLine1 = sectionConfig?.title_line1 || "Tools I use to";
  const titleLine2 = sectionConfig?.title_line2 || "find the story.";

  return (
    <section className="section-wrap section-block skills-section" id="skills">
      <div className="section-heading reveal">
        <span className="section-index">{indexLabel}</span>
        <h2>
          {titleLine1}
          <br />
          <span>{titleLine2}</span>
        </h2>
      </div>

      <div className="skills-layout">
        <div className="skills-intro reveal">
          <div className="terminal-card">
            <div className="terminal-bar">
              <span />
              <span />
              <span />
              <small>hil@portfolio:~</small>
            </div>
            <div className="terminal-body">
              <p>
                <b>$</b> whoami
              </p>
              <strong>data_analyst</strong>
              <p>
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
                <b>✓</b> ready to explore
              </p>
              <span className="cursor">_</span>
            </div>
          </div>
          <p className="body-copy">
            A practical toolkit for preparing data, analysing patterns, and
            presenting findings clearly.
          </p>
        </div>

        <div className="skill-groups reveal">
          {skills?.map((s, i) => (
            <div className="skill-group" key={s.id || s.name || i}>
              <div className="skill-group-head">
                <span>0{i + 1}</span>
                <h3>{s.name}</h3>
                <span className="skill-count">
                  {String(s.items?.length || 0).padStart(2, '0')} TOOLS
                </span>
              </div>
              <div className="skill-pills">
                {s.items?.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

