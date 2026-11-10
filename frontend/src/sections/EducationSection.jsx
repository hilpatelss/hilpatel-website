/**
 * ==============================================================================
 * Education Timeline Section (EducationSection.jsx) — Redesign 2.0
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This section showcases Hil Patel's formal academic credentials and university
 * engineering background in a clean vertical timeline.
 *
 * FEATURES & PRESERVATION:
 * 1. Graduation Cap Icon: Visual marker on the left timeline spine.
 * 2. Completion Year: (e.g. 2026, 2023).
 * 3. Degree & Major: Bachelor of Engineering in Computer Engineering.
 * 4. University: SVBIT · Gujarat Technological University (GTU).
 * 5. Status Badge: "COMPLETED" tag verifying successful graduation.
 */
import React from 'react';
import { GraduationCap, Calendar, CheckCircle2 } from 'lucide-react';

export function EducationSection({ education, sectionConfig }) {
  // Configurable headings from Django CMS
  const indexLabel = sectionConfig?.index_label || "04 / EDUCATION";
  const titleLine1 = sectionConfig?.title_line1 || "Built on a foundation";
  const titleLine2 = sectionConfig?.title_line2 || "of engineering.";

  return (
    <section className="section-block education-section" id="education" aria-label="Education history">
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

        {/* Academic Degree Timeline */}
        <div className="timeline">
          {education?.length > 0 ? (
            education.map((e, i) => (
              <article className="timeline-item reveal" key={e.id || e.degree || i}>
                <div className="timeline-marker" aria-hidden="true">
                  <GraduationCap size={18} />
                </div>

                <div className="timeline-year">
                  <Calendar size={13} aria-hidden="true" />
                  <span>{e.year_display}</span>
                </div>

                <div className="timeline-content">
                  <span className="timeline-count">EDUCATION / 0{i + 1}</span>
                  <h3>{e.degree}</h3>
                  <h4>{e.field_of_study}</h4>
                  <p className="timeline-institution">{e.institution}</p>
                  {e.detail && <small className="timeline-detail">{e.detail}</small>}
                </div>

                <span className="timeline-badge" aria-label={`Status: ${e.badge_text || 'COMPLETED'}`}>
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>{e.badge_text || 'COMPLETED'}</span>
                </span>
              </article>
            ))
          ) : (
            <div className="empty-state reveal" style={{ padding: '2rem 0', opacity: 0.7 }}>
              <p>No education history listed at this time.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default EducationSection;
