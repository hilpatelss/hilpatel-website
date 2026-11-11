/**
 * ==============================================================================
 * Professional Certifications Section (CertificationsSection.jsx)
 * ==============================================================================
 */

import React, { useState, useMemo } from 'react';
import { Award, Search, ArrowDownRight, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export function CertificationsSection({ sectionConfig }) {
  const { data } = usePortfolio();
  const { certifications } = data;

  const [certFilter, setCertFilter] = useState("All");
  const [certSearch, setCertSearch] = useState("");

  const indexLabel = sectionConfig?.index_label || "05 / CERTIFICATIONS";
  const titleLine1 = sectionConfig?.title_line1 || "Learning that";
  const titleLine2 = sectionConfig?.title_line2 || "keeps moving.";
  const headingNote = sectionConfig?.heading_note || "Credentials listed on my resume, grouped by learning area.";

  const categories = useMemo(() => {
    const list = certifications?.map((c) => c.category_name).filter(Boolean) || [];
    return ["All", ...Array.from(new Set(list))];
  }, [certifications]);

  const visibleCerts = useMemo(() => {
    return (certifications || []).filter((c) => {
      const matchesCategory = certFilter === "All" || c.category_name === certFilter;
      const searchTarget = `${c.title} ${c.issuer} ${c.category_name || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(certSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [certifications, certFilter, certSearch]);

  return (
    <section className="section-block cert-section" id="certifications">
      <div className="section-wrap">
        <div className="section-heading reveal">
          <span className="section-index">{indexLabel}</span>
          <h2>
            {titleLine1}
            <br />
            <span>{titleLine2}</span>
          </h2>
          {headingNote && <p className="heading-note">{headingNote}</p>}
        </div>

        {/* Filter Controls: Category Buttons + Live Search Input */}
        <div className="cert-controls reveal">
          <div className="filter-pills" role="tablist" aria-label="Filter certifications by category">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={certFilter === c}
                className={certFilter === c ? "active" : ""}
                onClick={() => setCertFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="cert-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="text"
              value={certSearch}
              onChange={(e) => setCertSearch(e.target.value)}
              placeholder="Search certifications"
              aria-label="Search certifications"
            />
          </label>
        </div>

        {/* Grid of Certification Cards */}
        <div className="cert-grid">
          {visibleCerts.map((c) => (
            <article className="cert-card reveal" key={c.id || c.title}>
              <div className="cert-card-top">
                <span className="cert-icon" aria-hidden="true">
                  <Award size={21} />
                </span>
                <span className="cert-status">
                  <i aria-hidden="true" /> {c.status_text || 'RESUME LISTED'}
                </span>
              </div>

              <div className="cert-category">{c.category_name}</div>
              <h3>{c.title}</h3>
              <p className="cert-issuer">{c.issuer}</p>

              <div className="cert-meta">
                <span>{c.issue_date_display || 'Verified'}</span>
                {c.credential_url ? (
                  <a
                    href={c.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-link"
                    aria-label={`Verify credential for ${c.title} (opens in a new tab)`}
                  >
                    <span>Verify</span> <ExternalLink size={13} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="cert-link">
                    <span>Listed</span> <ArrowDownRight size={14} aria-hidden="true" />
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CertificationsSection;
