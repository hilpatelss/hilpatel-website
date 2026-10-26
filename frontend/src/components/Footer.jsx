import React from 'react';
import { ExternalLink } from 'lucide-react';

export function Footer({ site }) {
  return (
    <footer className="footer">
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
        <p style={{ whiteSpace: 'pre-line' }}>
          {site?.footer_tagline || 'Turning questions into insights,\none dataset at a time.'}
        </p>
        <a className="back-top" href="#home">
          BACK TO TOP <ExternalLink size={14} />
        </a>
      </div>
      <div className="footer-bottom">
        <span>{site?.footer_copyright || '© 2026 Hil Patel. Built with intention.'}</span>
        <span>{site?.footer_tech_stack || 'REACT · DJANGO REST FRAMEWORK'}</span>
        <span>{site?.footer_location || 'GUJARAT, INDIA'}</span>
      </div>
    </footer>
  );
}

