import React from 'react';

export function TickerSection({ items }) {
  const tickerList = items?.length > 0
    ? items
    : ["PYTHON", "SQL", "POWER BI", "EXCEL", "PANDAS", "DAX", "POSTGRESQL", "DATA STORYTELLING", "DATA CLEANING"];

  // Duplicate items for seamless continuous looping marquee
  const trackItems = [...tickerList, ...tickerList];

  return (
    <section className="section-wrap" aria-label="Core tools">
      <div className="ticker">
        <div className="ticker-track">
          {trackItems.map((item, idx) => (
            <span key={idx} aria-hidden={idx >= tickerList.length ? "true" : undefined}>
              <i /> {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

