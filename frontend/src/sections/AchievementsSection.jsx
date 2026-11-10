/**
 * ==============================================================================
 * Key Highlights & Outcomes Section (AchievementsSection.jsx) — Redesign 2.0
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This section highlights tangible business outcomes: "Work that turns into outcomes."
 * It summarizes Hil Patel's practical track record across dashboard building,
 * data cleaning, and end-to-end business reporting.
 *
 * FEATURES & PRESERVATION:
 * 1. Milestone Index: (e.g. 01, 02, 03).
 * 2. Visual Icon: Represents analytics, data exploration, or database architecture.
 * 3. Title: Summary headline (e.g. "Interactive BI dashboards").
 * 4. Description: Short explanation of what was achieved and the tools used.
 */
import React from 'react';
import { BarChart3, Search, Database, Award, CheckCircle } from 'lucide-react';

export function AchievementsSection({ achievements, sectionConfig }) {
  // Configurable headings from Django CMS
  const indexLabel = sectionConfig?.index_label || "06 / HIGHLIGHTS";
  const titleLine1 = sectionConfig?.title_line1 || "Work that turns";
  const titleLine2 = sectionConfig?.title_line2 || "into outcomes.";

  // Helper to pick the matching icon for each achievement card
  const renderIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'search':
        return <Search size={22} aria-hidden="true" />;
      case 'database':
        return <Database size={22} aria-hidden="true" />;
      case 'award':
        return <Award size={22} aria-hidden="true" />;
      case 'barchart3':
      default:
        return <BarChart3 size={22} aria-hidden="true" />;
    }
  };

  return (
    <section className="section-block achievements-section" id="achievements" aria-label="Key Outcomes and Highlights">
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

        {/* Milestone Cards Grid */}
        <div className="achievement-grid reveal">
          {achievements?.length > 0 ? (
            achievements.map((item, idx) => (
              <article className="achievement-card" key={item.id || idx}>
                <div className="achievement-top">
                  <span className="achievement-no">MILESTONE / {item.achievement_number || `0${idx + 1}`}</span>
                  <div className="achievement-icon" aria-hidden="true">
                    {renderIcon(item.icon_name)}
                  </div>
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="achievement-footer" aria-hidden="true">
                  <span className="achievement-pill">
                    <CheckCircle size={12} /> Verified Outcome
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '2rem 0', opacity: 0.7, gridColumn: '1 / -1' }}>
              <p>No achievements listed at this time.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AchievementsSection;
