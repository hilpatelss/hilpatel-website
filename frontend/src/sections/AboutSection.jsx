import React from 'react';
import {
  Linkedin,
  Github,
  Mail,
  ExternalLink,
  ArrowRight,
  ChartNoAxesCombined,
  Target,
  Sparkles,
  BarChart3,
  TrendingUp,
  Database,
  Award,
  Zap,
  PieChart,
  Brain,
  Code2,
  Briefcase,
} from 'lucide-react';

export function AboutSection({ site, stats, sectionConfig }) {
  const indexLabel = sectionConfig?.index_label || "01 / ABOUT";
  const titleLine1 = sectionConfig?.title_line1 || "Curious by nature.";
  const titleLine2 = sectionConfig?.title_line2 || "Analytical by design.";

  const renderStatIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'target':
        return <Target size={28} />;
      case 'sparkles':
        return <Sparkles size={28} />;
      case 'barchart3':
      case 'barchart':
        return <BarChart3 size={28} />;
      case 'trendingup':
        return <TrendingUp size={28} />;
      case 'database':
        return <Database size={28} />;
      case 'award':
        return <Award size={28} />;
      case 'zap':
        return <Zap size={28} />;
      case 'piechart':
        return <PieChart size={28} />;
      case 'brain':
        return <Brain size={28} />;
      case 'code2':
      case 'code':
        return <Code2 size={28} />;
      case 'briefcase':
        return <Briefcase size={28} />;
      case 'chartnoaxescombined':
      default:
        return <ChartNoAxesCombined size={28} />;
    }
  };

  return (
    <section className="section-wrap section-block" id="about">
      <div className="section-heading reveal">
        <span className="section-index">{indexLabel}</span>
        <h2>
          {titleLine1}
          <br />
          <span>{titleLine2}</span>
        </h2>
      </div>

      <div className="about-layout">
        <div className="about-main reveal">
          <p className="large-copy">{site?.about_large_copy}</p>
          <p className="body-copy">{site?.about_body_copy}</p>

          <div className="about-links">
            {site?.linkedin_url && (
              <a href={site.linkedin_url} target="_blank" rel="noreferrer">
                <Linkedin size={17} /> LinkedIn <ExternalLink size={13} />
              </a>
            )}
            {site?.github_url && (
              <a href={site.github_url} target="_blank" rel="noreferrer">
                <Github size={17} /> GitHub <ExternalLink size={13} />
              </a>
            )}
            {site?.email && (
              <a href={`mailto:${site.email}`}>
                <Mail size={17} /> Email <ArrowRight size={14} />
              </a>
            )}
          </div>
        </div>

        <div className="stats-grid reveal">
          {stats?.map((stat, idx) => {
            const isAccent = stat.is_accent;
            const hasValidNumber = Boolean(stat.number && stat.number !== '0' && stat.number.trim() !== '');

            return (
              <div
                key={stat.id || idx}
                className={`stat-card ${isAccent ? 'stat-card-accent' : ''}`}
              >
                {hasValidNumber ? (
                  <span className="stat-number">
                    {stat.number.replace('+', '')}
                    {stat.number.includes('+') && <span className="stat-plus">+</span>}
                  </span>
                ) : (
                  <span className="stat-symbol">
                    {renderStatIcon(stat.icon_name)}
                  </span>
                )}
                <span className="stat-label">{stat.label}</span>
                <span className="stat-detail">{stat.detail}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

