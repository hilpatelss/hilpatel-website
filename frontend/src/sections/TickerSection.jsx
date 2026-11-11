/**
 * ==============================================================================
 * Marquee Ticker Section Component (TickerSection.jsx)
 * ==============================================================================
 */

import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export function TickerSection() {
  const { data } = usePortfolio();
  const items = data.ticker;

  const tickerList = items?.length > 0
    ? items
    : ["PYTHON", "SQL", "POWER BI", "EXCEL", "PANDAS", "DAX", "POSTGRESQL", "DATA STORYTELLING", "DATA CLEANING"];

  const trackItems = [...tickerList, ...tickerList];

  return (
    <section className="ticker-section" aria-label="Core Technical Skills">
      <div className="ticker">
        <div className="ticker-track">
          {trackItems.map((item, idx) => (
            <span key={idx} aria-hidden={idx >= tickerList.length ? "true" : undefined}>
              <i aria-hidden="true" /> {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TickerSection;
