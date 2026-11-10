/**
 * ==============================================================================
 * Professional Certifications Section (CertificationsSection.jsx) — Redesign 2.0
 * ==============================================================================
 *
 * WHAT IS THIS SECTION?
 * This section showcases Hil Patel's professional certificates, credentials, and
 * completed training courses.
 *
 * FEATURES & PRESERVATION:
 * 1. Filter Pills: One-click category buttons ("All", "Data Analytics", "Development").
 * 2. Instant Search Bar: Real-time keyword filtering with clear action.
 * 3. Credential Cards: Title, issuer, category tag, verification link pill.
 * 4. Footnote & zero-state handling.
 */
import React, { useState, useMemo } from 'react';
import { Award, Search, ArrowDownRight, ExternalLink, X, ShieldCheck } from 'lucide-react';

export function CertificationsSection({ certifications, sectionConfig }) {
  // Category pill filter state
  const [certFilter, setCertFilter] = useState("All");
  // Search query text state
  const [certSearch, setCertSearch] = useState("");

  // Configurable headings from Django CMS
  const indexLabel = sectionConfig?.index_label || "05 / CERTIFICATIONS";
  const titleLine1 = sectionConfig?.title_line1 || "Learning that";
  const titleLine2 = sectionConfig?.title_line2 || "keeps moving.";
  const headingNote = sectionConfig?.heading_note || "Credentials listed on my resume, grouped by learning area.";

  // Computes unique category names
  const categories = useMemo(() => {
    const list = certifications?.map((c) => c.category_name).filter(Boolean) || [];
    return ["All", ...Array.from(new Set(list))];
  }, [certifications]);

  // Filters the list of certifications based on active category pill AND search keyword
  const visibleCerts = useMemo(() => {
    return (certifications || []).filter((c) => {
      const matchesCategory = certFilter === "All" || c.category_name === certFilter;
      const searchTarget = `${c.title} ${c.issuer} ${c.category_name || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(certSearch.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [certifications, certFilter, certSearch]);

  return (
    <section className="section-block cert-section" id="certifications" aria-label="Professional Certifications">
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
          <div className="filter-pills" role="tablist" aria-label="Certification categories">
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

          <div className="cert-search-wrap">
            <label className="cert-search" htmlFor="cert-search-input">
              <Search size={16} aria-hidden="true" />
              <input
                id="cert-search-input"
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="Search certifications or skills"
                aria-label="Search certifications or skills"
              />
              {certSearch && (
                <button
                  type="button"
                  className="cert-search-clear"
                  onClick={() => setCertSearch("")}
                  aria-label="Clear search query"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </label>
          </div>
        </div>

        {/* Results Counter if search is active */}
        {certSearch && (
          <div className="cert-search-stats reveal" aria-live="polite">
            Found {visibleCerts.length} {visibleCerts.length === 1 ? 'credential' : 'credentials'} matching "{certSearch}"
          </div>
        )}

        {/* Grid of Certification Cards */}
        <div className="cert-grid">
          {visibleCerts.map((c, i) => (
            <article className="cert-card reveal" key={c.id || c.title || i}>
              <div className="cert-card-top">
                <span className="cert-icon" aria-hidden="true">
                  <Award size={21} />
                </span>
                <span className="cert-status">
                  <ShieldCheck size={13} aria-hidden="true" />
                  <span>{c.status_text || 'RESUME LISTED'}</span>
                </span>
              </div>

              <span className="cert-category">{c.category_name}</span>
              <h3>{c.title}</h3>
              <p className="cert-issuer">{c.issuer}</p>

              <div className="cert-card-bottom">
                {c.credential_url ? (
                  <a
                    href={c.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-verify-link"
                    aria-label={`Verify ${c.title} credential (opens in new tab)`}
                  >
                    <span>Verify credential</span> <ExternalLink size={12} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="cert-unverified">Listed on resume</span>
                )}

                <span className="cert-arrow" aria-hidden="true">
                  <ArrowDownRight size={17} />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Message if no cards match search query */}
        {visibleCerts.length === 0 && (
          <div className="empty-state reveal" style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
            <p>No certifications match that search. Try another keyword or clear the search filter.</p>
          </div>
        )}

        <p className="section-footnote reveal">
          Verification URLs and completion dates are sourced directly from Hil Patel's professional records.
        </p>
      </div>
    </section>
  );
}

export default CertificationsSection;
