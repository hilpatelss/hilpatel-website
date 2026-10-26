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
  const indexLabel = sectionConfig?.index_label || "02 / SELECTED WORK";
  const titleLine1 = sectionConfig?.title_line1 || "Projects with a";
  const titleLine2 = sectionConfig?.title_line2 || "point of view.";
  const headingNote = sectionConfig?.heading_note || "Practical analytics work, from exploration to interactive reporting.";

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
    <section className="section-wrap section-block projects-section" id="projects">
      <div className="section-heading reveal">
        <span className="section-index">{indexLabel}</span>
        <h2>
          {titleLine1}
          <br />
          <span>{titleLine2}</span>
        </h2>
        {headingNote && <p className="heading-note">{headingNote}</p>}
      </div>

      <div className="projects-list">
        {projects?.map((p, i) => {
          const repoUrl = p.repository_url || site?.github_url || "https://github.com/hilpatelss";
          const repoLabel = p.repository_url ? "View repository" : "View GitHub profile";

          return (
            <article className="project-card reveal" key={p.id || p.number || i}>
              <div className="project-number">{p.number}</div>

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

                <a
                  className="text-link"
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {repoLabel} <ExternalLink size={14} />
                </a>
              </div>

              <div className="project-art">
                <div className="art-top">
                  <span>PROJECT / {p.number}</span>
                  {renderProjectIcon(p.icon_name)}
                </div>

                <div className={`art-graphic art-${i + 1}`}>
                  <DynamicArtGraphic project={p} index={i} />
                </div>

                <div className="art-footer">
                  <span>ANALYTICS / BUILD</span>
                  <span>↗</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="project-disclaimer reveal">
        <span className="note-mark">i</span>
        <p>
          Two dashboard repositories are linked. The Smart Bill Management System
          repository was not identifiable in the public repositories reviewed, so its
          card links to your GitHub profile until you provide the exact URL.
        </p>
      </div>
    </section>
  );
}

