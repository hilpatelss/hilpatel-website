import React from 'react';
import { GraduationCap } from 'lucide-react';

export function EducationSection({ education, sectionConfig }) {
  const indexLabel = sectionConfig?.index_label || "04 / EDUCATION";
  const titleLine1 = sectionConfig?.title_line1 || "Built on a foundation";
  const titleLine2 = sectionConfig?.title_line2 || "of engineering.";

  return (
    <section className="section-wrap section-block education-section" id="education">
      <div className="section-heading reveal">
        <span className="section-index">{indexLabel}</span>
        <h2>
          {titleLine1}
          <br />
          <span>{titleLine2}</span>
        </h2>
      </div>

      <div className="timeline">
        {education?.map((e, i) => (
          <article className="timeline-item reveal" key={e.id || e.degree || i}>
            <div className="timeline-marker">
              <GraduationCap size={18} />
            </div>
            <div className="timeline-year">{e.year_display}</div>
            <div className="timeline-content">
              <span className="timeline-count">EDUCATION / 0{i + 1}</span>
              <h3>{e.degree}</h3>
              <h4>{e.field_of_study}</h4>
              <p>{e.institution}</p>
              <small>{e.detail}</small>
            </div>
            <span className="timeline-badge">{e.badge_text || 'COMPLETED'}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

