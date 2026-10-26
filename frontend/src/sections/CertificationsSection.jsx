import React, { useState, useMemo } from 'react';
import { Award, Search, ArrowDownRight, ExternalLink } from 'lucide-react';

export function CertificationsSection({ certifications, sectionConfig }) {
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
    <section className="section-wrap section-block cert-section" id="certifications">
      <div className="section-heading reveal">
        <span className="section-index">{indexLabel}</span>
        <h2>
          {titleLine1}
          <br />
          <span>{titleLine2}</span>
        </h2>
        {headingNote && <p className="heading-note">{headingNote}</p>}
      </div>

      <div className="cert-controls reveal">
        <div className="filter-pills">
          {categories.map((c) => (
            <button
              key={c}
              className={certFilter === c ? "active" : ""}
              onClick={() => setCertFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="cert-search">
          <Search size={16} />
          <input
            value={certSearch}
            onChange={(e) => setCertSearch(e.target.value)}
            placeholder="Search certifications"
            aria-label="Search certifications"
          />
        </label>
      </div>

      <div className="cert-grid">
        {visibleCerts.map((c) => (
          <article className="cert-card reveal" key={c.id || c.title}>
            <div className="cert-card-top">
              <span className="cert-icon">
                <Award size={21} />
              </span>
              <span className="cert-status">
                <i /> {c.status_text || 'RESUME LISTED'}
              </span>
            </div>

            <span className="cert-category">{c.category_name}</span>
            <h3>{c.title}</h3>
            <p>{c.issuer}</p>

            <div className="cert-card-bottom">
              {c.credential_url ? (
                <a
                  href={c.credential_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent)' }}
                >
                  Verify credential <ExternalLink size={12} />
                </a>
              ) : (
                <span>Verification link not supplied</span>
              )}

              <span className="cert-arrow">
                <ArrowDownRight size={17} />
              </span>
            </div>
          </article>
        ))}
      </div>

      {visibleCerts.length === 0 && (
        <div className="empty-state">
          No certifications match that search. Try another term.
        </div>
      )}

      <p className="section-footnote">
        Verification URLs and completion dates were not present in the supplied resume; add them when available.
      </p>
    </section>
  );
}

