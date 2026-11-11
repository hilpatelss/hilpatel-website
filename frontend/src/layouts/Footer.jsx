/**
 * ==============================================================================
 * Modern Footer Component (Footer.jsx)
 * ==============================================================================
 */

import React from 'react';
import { ArrowUp } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export function Footer() {
  const { data } = usePortfolio();
  const { site } = data;

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-wrap">
      <div className="footer section-wrap">
        <div className="footer-top">
          <a className="brand" href="#home" onClick={scrollToTop}>
            <span className="brand-mark">
              {site?.brand_mark_initial || 'H'}<span>{site?.brand_mark_accent || '.'}</span>
            </span>
            <span className="brand-name">
              {(site?.owner_name || 'HIL PATEL').toUpperCase()}{' '}
              <small>{(site?.professional_headline || 'DATA ANALYST').toUpperCase()} / 2026</small>
            </span>
          </a>

          <p style={{ whiteSpace: 'pre-line' }}>
            {site?.footer_tagline || 'Turning questions into insights,\none dataset at a time.'}
          </p>

          <a className="back-top" href="#home" onClick={scrollToTop} aria-label="Back to top">
            <span>BACK TO TOP</span>
            <ArrowUp size={14} aria-hidden="true" />
          </a>
        </div>

        <div className="footer-bottom">
          <span>{site?.footer_copyright || '© 2026 Hil Patel. Built with intention.'}</span>
          <span>{site?.footer_tech_stack || 'REACT · DJANGO REST FRAMEWORK'}</span>
          <span>{site?.footer_location || 'GUJARAT, INDIA'}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
