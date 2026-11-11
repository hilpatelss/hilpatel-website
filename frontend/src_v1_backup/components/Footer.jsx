/**
 * ==============================================================================
 * Website Footer Component (Footer.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS COMPONENT?
 * This component renders the very bottom section of the portfolio.
 * 
 * WHAT DOES IT SHOW?
 * 1. The Hil Patel brand badge and professional title.
 * 2. An inspiring analytics philosophy tagline.
 * 3. A "BACK TO TOP" button that smoothly scrolls the visitor back to the top of the page.
 * 4. Technology credits (React + Django REST Framework) and location (Gujarat, India).
 * 
 * HOW DOES IT CONNECT TO DJANGO?
 * All text values come from the `site` data prop. If the site owner edits the tagline
 * or location in the Django admin panel, the footer updates dynamically!
 */
import React from 'react';
import { ExternalLink } from 'lucide-react';

export function Footer({ site }) {
  return (
    <footer className="footer-wrap">
      <div className="footer section-wrap">
        {/* Upper footer area: brand mark, tagline, and scroll-to-top button */}
        <div className="footer-top">
          <a className="brand" href="#home">
            <span className="brand-mark">
              {site?.brand_mark_initial || 'H'}<span>{site?.brand_mark_accent || '.'}</span>
            </span>
            <span className="brand-name">
              {(site?.owner_name || 'HIL PATEL').toUpperCase()}{' '}
              <small>{(site?.professional_headline || 'DATA ANALYST').toUpperCase()} / 2026</small>
            </span>
          </a>

          {/* Tagline text from site settings */}
          <p style={{ whiteSpace: 'pre-line' }}>
            {site?.footer_tagline || 'Turning questions into insights,\none dataset at a time.'}
          </p>

          {/* Quick jump to page top */}
          <a className="back-top" href="#home">
            BACK TO TOP <ExternalLink size={14} />
          </a>
        </div>

        {/* Lower footer bar: copyright notice, tech stack credentials, and location */}
        <div className="footer-bottom">
          <span>{site?.footer_copyright || '© 2026 Hil Patel. Built with intention.'}</span>
          <span>{site?.footer_tech_stack || 'REACT · DJANGO REST FRAMEWORK'}</span>
          <span>{site?.footer_location || 'GUJARAT, INDIA'}</span>
        </div>
      </div>
    </footer>
  );
}


