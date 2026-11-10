/**
 * ==============================================================================
 * Featured Projects Section (ProjectsSection.jsx) — Redesign 2.0
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This is the portfolio showcase where visitors explore Hil Patel's practical
 * analytics case studies and software projects.
 *
 * FEATURES & PRESERVATION:
 * 1. Category Filtering: Tabs ("All", "Power BI", etc.) allowing visitors to filter work.
 * 2. Bento-Box 2.0 Cards: Project index, title, summary, tag pills, checkmarked highlights.
 * 3. Direct Codebase Action: "View repository" button linking to GitHub.
 * 4. Procedural Visuals: Rendered via `<DynamicArtGraphic />` for an authentic BI aesthetic.
 * 5. Repository disclaimer & zero-state handling.
 */
import React, { useState, useMemo } from 'react';
import {
  Check,
  ExternalLink,
  BarChart3,
  ChartNoAxesCombined,
  Database,
  Code2,
  Github,
  Layers,
} from 'lucide-react';
import { DynamicArtGraphic } from '../components/DynamicArtGraphic';

export function ProjectsSection({ projects, site, sectionConfig }) {
  // Category filter state (defaults to "All")
  const [activeCategory, setActiveCategory] = useState("All");

  // Configurable headings from Django CMS
  const indexLabel = sectionConfig?.index_label || "02 / SELECTED WORK";
  const titleLine1 = sectionConfig?.title_line1 || "Projects with a";
  const titleLine2 = sectionConfig?.title_line2 || "point of view.";
  const headingNote = sectionConfig?.heading_note || "Practical analytics work, from exploration to interactive reporting.";

  // Extract unique category names for filter pills
  const categories = useMemo(() => {
    const list = projects?.map((p) => p.category_name).filter(Boolean) || [];
    return ["All", ...Array.from(new Set(list))];
  }, [projects]);

  // Filter projects by active category tab
  const visibleProjects = useMemo(() => {
    if (activeCategory === "All") return projects || [];
    return (projects || []).filter((p) => p.category_name === activeCategory);
  }, [projects, activeCategory]);

  // Picks an appropriate icon for the project header card
  const renderProjectIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'chartnoaxescombined':
        return <ChartNoAxesCombined size={18} aria-hidden="true" />;
      case 'database':
        return <Database size={18} aria-hidden="true" />;
      case 'code2':
        return <Code2 size={18} aria-hidden="true" />;
      case 'barchart3':
      default:
        return <BarChart3 size={18} aria-hidden="true" />;
    }
  };

  return (
    <section className="section-block projects-section" id="projects" aria-label="Featured projects">
      <div className="section-wrap">
        {/* Section Heading & Subtitle Note */}
        <div className="section-heading reveal">
          <span className="section-index">{indexLabel}</span>
          <h2>
            {titleLine1}
            <br />
            <span>{titleLine2}</span>
          </h2>
          {headingNote && <p className="heading-note">{headingNote}</p>}
        </div>

        {/* Category Filter Tabs (shows if more than 1 distinct category exists) */}
        {categories.length > 2 && (
          <div className="project-filter-bar reveal" role="tablist" aria-label="Project categories">
            <span className="filter-label">
              <Layers size={14} aria-hidden="true" />
              <span>FILTER:</span>
            </span>
            <div className="filter-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={activeCategory === cat ? "active" : ""}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List of Project Cards */}
        <div className="projects-list">
          {visibleProjects?.length > 0 ? (
            visibleProjects.map((p, i) => {
              // Direct GitHub repository URL or fallback to main profile
              const repoUrl = p.repository_url || site?.github_url || "https://github.com/hilpatelss";
              const repoLabel = p.repository_url ? "View repository" : "View GitHub profile";

              return (
                <article className="project-card reveal" key={p.id || p.number || i}>
                  {/* Large project index number watermark */}
                  <div className="project-number" aria-hidden="true">{p.number || `0${i + 1}`}</div>

                  {/* Left content: text, tags, highlights, and link */}
                  <div className="project-content">
                    <div className="project-topline">
                      <span className="project-type">{p.category_name}</span>
                      <div className="tag-list" aria-label="Technologies used">
                        {p.tags?.map((t) => (
                          <span key={t} className="tech-tag">{t}</span>
                        ))}
                      </div>
                    </div>

                    <h3>{p.title}</h3>
                    <p className="project-description">{p.short_description}</p>

                    {/* Bullet list of key project results */}
                    {p.highlights?.length > 0 && (
                      <ul className="project-highlights" aria-label="Project highlights">
                        {p.highlights.map((h, hIdx) => (
                          <li key={hIdx}>
                            <span className="check-bullet" aria-hidden="true">
                              <Check size={13} />
                            </span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Action Links */}
                    <div className="project-actions">
                      <a
                        className="button-link project-cta"
                        href={repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.title} repository on GitHub (opens in a new tab)`}
                      >
                        <Github size={15} aria-hidden="true" />
                        <span>{repoLabel}</span>
                        <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  {/* Right visual: Dynamic graphic or custom uploaded image */}
                  <div className="project-art" aria-hidden="true">
                    <div className="art-top">
                      <span>CASE STUDY / {p.number || `0${i + 1}`}</span>
                      {renderProjectIcon(p.icon_name)}
                    </div>

                    <div className={`art-graphic art-${(i % 3) + 1}`}>
                      <DynamicArtGraphic project={p} index={i} />
                    </div>

                    <div className="art-footer">
                      <span>ANALYTICS / BUILD</span>
                      <span className="art-arrow">↗</span>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-state reveal" style={{ padding: '3rem 1rem', textAlign: 'center', opacity: 0.8 }}>
              <p>No published projects found in this category.</p>
            </div>
          )}
        </div>

        {/* Helpful note explaining repository accessibility */}
        {projects?.some((p) => !p.repository_url) && (
          <div className="project-disclaimer reveal">
            <span className="note-mark" aria-hidden="true">i</span>
            <p>
              Repositories with private or pending codebases link to the GitHub profile until an individual repository URL is published in Django Admin.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
