/**
 * ==============================================================================
 * Marquee Ticker Section (TickerSection.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS COMPONENT?
 * This component renders an animated horizontal moving ribbon (marquee) displaying
 * core data analytics skills: PYTHON · SQL · POWER BI · EXCEL · PANDAS · DAX · POSTGRESQL.
 *
 * HOW DOES THE INFINITE LOOP WORK?
 * In CSS animation, to make text scroll forever without a visible jump or pause,
 * we duplicate the list (`[...tickerList, ...tickerList]`). When the first half
 * scrolls completely off screen, the second half is seamlessly in place, creating
 * an endless ribbon effect!
 */
import React from 'react';

export function TickerSection({ items }) {
  // Use backend items if provided, or default to standard technical competencies
  const tickerList = items?.length > 0
    ? items
    : ["PYTHON", "SQL", "POWER BI", "EXCEL", "PANDAS", "DAX", "POSTGRESQL", "DATA STORYTELLING", "DATA CLEANING"];

  // Duplicate items array so the CSS marquee loops seamlessly without an empty gap
  const trackItems = [...tickerList, ...tickerList];

  return (
    <section className="ticker-section" aria-label="Core tools">
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


