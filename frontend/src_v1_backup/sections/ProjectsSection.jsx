/**
 * ==============================================================================
 * Featured Projects Section (ProjectsSection.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This is the portfolio showcase where visitors explore Hil Patel's practical
 * analytics case studies and software projects.
 *
 * WHAT DOES EACH PROJECT CARD DISPLAY?
 * 1. Project Number & Category: (e.g. 01 / Power BI Dashboard)
 * 2. Technology Tags: Badges for the tools used (Python, SQL, DAX, Excel, PostgreSQL)
 * 3. Title & Description: Clear explanation of what problem the project solved
 * 4. Key Highlights: Bullet points with green checkmarks listing specific achievements
 * 5. Repository Link: "View repository" button opening the GitHub codebase
 * 6. Visual Preview: A procedural data visualization card drawn by `<DynamicArtGraphic />`
 */
import React from 'react';
import {
  Check,
  ExternalLink,
  BarChart3,
  ChartNoAxesCombined,
  Database,
  Code2,
} from 'lucide-react';
import { DynamicArtGraphic } from '../components/DynamicArtGraphic';

export function ProjectsSection({ projects, site, sectionConfig }) {
  // Configurable headings from Django CMS
  const indexLabel = sectionConfig?.index_label || "02 / SELECTED WORK";
  const titleLine1 = sectionConfig?.title_line1 || "Projects with a";
  const titleLine2 = sectionConfig?.title_line2 || "point of view.";
  const headingNote = sectionConfig?.heading_note || "Practical analytics work, from exploration to interactive reporting.";

  // Picks an appropriate icon for the project header card
  const renderProjectIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'chartnoaxescombined':
        return <ChartNoAxesCombined size={18} />;
      case 'database':
        return <Database size={18} />;
      case 'code2':
        return <Code2 size={18} />;
      case 'barchart3':
      default:
        return <BarChart3 size={18} />;
    }
  };

  return (
    <section className="section-block projects-section" id="projects">
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

        {/* List of Project Cards */}
        <div className="projects-list">
          {projects?.length > 0 ? (
            projects.map((p, i) => {
              // Direct GitHub repository URL or fallback to main profile
              const repoUrl = p.repository_url || site?.github_url || "https://github.com/hilpatelss";
              const repoLabel = p.repository_url ? "View repository" : "View GitHub profile";

              return (
                <article className="project-card reveal" key={p.id || p.number || i}>
                  {/* Large background project index number (e.g. 01) */}
                  <div className="project-number">{p.number || `0${i + 1}`}</div>

                  {/* Left content: text, tags, highlights, and link */}
                  <div className="project-content">
                    <div className="project-topline">
                      <span className="project-type">{p.category_name}</span>
                      <div className="tag-list">
                        {p.tags?.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    </div>

                    <h3>{p.title}</h3>
                    <p>{p.short_description}</p>

                    {/* Bullet list of key project results */}
                    {p.highlights?.length > 0 && (
                      <ul>
                        {p.highlights.map((h, hIdx) => (
                          <li key={hIdx}>
                            <Check size={14} />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* GitHub Code link */}
                    <a
                      className="text-link"
                      href={repoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {repoLabel} <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Right visual: Dynamic graphic or custom uploaded image */}
                  <div className="project-art">
                    <div className="art-top">
                      <span>PROJECT / {p.number || `0${i + 1}`}</span>
                      {renderProjectIcon(p.icon_name)}
                    </div>

                    <div className={`art-graphic art-${(i % 3) + 1}`}>
                      <DynamicArtGraphic project={p} index={i} />
                    </div>

                    <div className="art-footer">
                      <span>ANALYTICS / BUILD</span>
                      <span>↗</span>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-state reveal" style={{ padding: '3rem 1rem', textAlign: 'center', opacity: 0.8 }}>
              <p>No published projects found at the moment.</p>
            </div>
          )}
        </div>

        {/* Helpful note explaining why some projects link to the GitHub profile */}
        {projects?.some((p) => !p.repository_url) && (
          <div className="project-disclaimer reveal">
            <span className="note-mark">i</span>
            <p>
              Repositories with private or pending codebases link to the GitHub profile until an individual repository URL is published in Django Admin.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}


