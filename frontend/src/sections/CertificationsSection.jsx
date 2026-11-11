/**
 * ==============================================================================
 * Professional Certifications Section (CertificationsSection.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This section showcases Hil Patel's professional certificates, credentials, and
 * completed training courses.
 *
 * INTERACTIVE FEATURES:
 * 1. Filter Pills: Buttons ("All", "Data Analytics", "Python") that let visitors
 *    filter credentials by topic with a single click.
 * 2. Instant Search Bar: Allows typing keywords (like "Power BI" or "Google") to
 *    filter the certificates in real-time as you type.
 * 3. Credential Cards: Show the certification title, issuing organization,
 *    and a link to verify the certificate online.
 */
import React, { useState, useMemo } from 'react';
import { Award, Search, ArrowDownRight, ExternalLink } from 'lucide-react';

export function CertificationsSection({ certifications, sectionConfig }) {
  // State to track which category pill is selected (defaults to "All")
  const [certFilter, setCertFilter] = useState("All");
  // State to track what the user has typed into the search box
  const [certSearch, setCertSearch] = useState("");

  // Configurable headings from Django CMS
  const indexLabel = sectionConfig?.index_label || "05 / CERTIFICATIONS";
  const titleLine1 = sectionConfig?.title_line1 || "Learning that";
  const titleLine2 = sectionConfig?.title_line2 || "keeps moving.";
  const headingNote = sectionConfig?.heading_note || "Credentials listed on my resume, grouped by learning area.";

  // Computes unique category names from the certifications list (e.g., ["All", "Data Analytics"])
  const categories = useMemo(() => {
    const list = certifications?.map((c) => c.category_name).filter(Boolean) || [];
    return ["All", ...Array.from(new Set(list))];
  }, [certifications]);

  // Filters the list of certifications based on the active category pill AND search text
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

        {/* Filter Controls: Category Buttons + Live Search Input */}
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

        {/* Grid of Certification Cards */}
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

        {/* Message if no cards match search query */}
        {visibleCerts.length === 0 && (
          <div className="empty-state">
            No certifications match that search. Try another term.
          </div>
        )}

        <p className="section-footnote">
          Verification URLs and completion dates were not present in the supplied resume; add them when available.
        </p>
      </div>
    </section>
  );
}


