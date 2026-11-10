/**
 * ==============================================================================
 * Website Footer Component (Footer.jsx) — Redesign 2.0
 * ==============================================================================
 *
 * WHAT IS THIS COMPONENT?
 * This component renders the very bottom section of the portfolio.
 * 
 * FEATURES & PRESERVATION:
 * 1. The Hil Patel brand badge and professional title.
 * 2. Inspiring analytics philosophy tagline.
 * 3. Live Indian Standard Time (IST) clock with live indicator dot.
 * 4. "BACK TO TOP" button that smoothly scrolls back to the top of the page.
 * 5. Technology credits (React + Django REST Framework) and location (Gujarat, India).
 */
import React, { useState, useEffect } from 'react';
import { ArrowUp, Clock } from 'lucide-react';

export function Footer({ site }) {
  // Live IST clock state
  const [istTime, setIstTime] = useState('');

  // Update IST time every second
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setIstTime(`${timeString} IST`);
      } catch (e) {
        setIstTime('');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-wrap" role="contentinfo" aria-label="Site footer">
      <div className="footer section-wrap">
        {/* Upper footer area: brand mark, tagline, and scroll-to-top button */}
        <div className="footer-top">
          <a className="brand" href="#home" aria-label={`${site?.owner_name || 'Hil Patel'} home`}>
            <span className="brand-mark" aria-hidden="true">
              {site?.brand_mark_initial || 'H'}<span>{site?.brand_mark_accent || '.'}</span>
            </span>
            <span className="brand-name">
              {(site?.owner_name || 'HIL PATEL').toUpperCase()}{' '}
              <small>{(site?.professional_headline || 'DATA ANALYST').toUpperCase()} / 2026</small>
            </span>
          </a>

          {/* Tagline text from site settings */}
          <p className="footer-tagline" style={{ whiteSpace: 'pre-line' }}>
            {site?.footer_tagline || 'Turning questions into insights,\none dataset at a time.'}
          </p>

          {/* Quick jump to page top with smooth scroll */}
          <a className="back-top" href="#home" onClick={handleScrollTop} aria-label="Scroll back to top of page">
            <span>BACK TO TOP</span> <ArrowUp size={14} aria-hidden="true" />
          </a>
        </div>

        {/* Lower footer bar: copyright notice, live clock, tech stack, and location */}
        <div className="footer-bottom">
          <span className="footer-copyright">
            {site?.footer_copyright || '© 2026 Hil Patel. Built with intention.'}
          </span>

          {istTime && (
            <span className="footer-clock" title="Current time in Gujarat, India (IST)">
              <span className="footer-live-dot" aria-hidden="true" />
              <Clock size={13} aria-hidden="true" />
              <span>{istTime}</span>
            </span>
          )}

          <span className="footer-stack">
            {site?.footer_tech_stack || 'REACT · DJANGO REST FRAMEWORK'}
          </span>
          <span className="footer-loc">
            {site?.footer_location || 'GUJARAT, INDIA'}
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
