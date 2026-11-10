/**
 * ==============================================================================
 * Interactive Horizontal Workflow & Skills Timeline (TickerSection.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS COMPONENT?
 * This component transforms the technical competencies ribbon into an interactive,
 * continuously animated horizontal milestone timeline.
 *
 * TIMELINE FEATURES:
 * 1. Continuous Horizontal Timeline Spine:
 *    A luminous axis line with an animated laser pulse running through every node.
 * 2. Sequential Milestone Nodes:
 *    Numbered step markers (01, 02, 03...), glowing milestone node pins with outer
 *    pulsing halos, and high-contrast typography.
 * 3. Scroll-Linked Interactive Inertia:
 *    The timeline automatically glides seamlessly in an infinite loop, and dynamically
 *    responds to user page scrolling with smooth physical momentum.
 * 4. Interactive Hover States:
 *    Hovering over any timeline milestone pauses the loop, highlights the node pin,
 *    and reveals an elevated milestone card.
 */
import React, { useEffect, useRef, useState } from 'react';
import { GitCommit, Sparkles } from 'lucide-react';

export function TickerSection({ items }) {
  // Use backend items if provided, or default to standard technical competencies
  const tickerList = items?.length > 0
    ? items
    : ["PYTHON", "SQL", "POWER BI", "EXCEL", "PANDAS", "DAX", "POSTGRESQL", "DATA STORYTELLING", "DATA CLEANING"];

  // Technical category / workflow phase mapping for each tool milestone
  const getToolPhase = (name) => {
    const n = (name || '').toUpperCase();
    if (n.includes('PYTHON') || n.includes('PANDAS')) return 'DATA ANALYSIS';
    if (n.includes('SQL') || n.includes('POSTGRESQL')) return 'DATABASE';
    if (n.includes('POWER BI') || n.includes('EXCEL')) return 'BUSINESS INTELLIGENCE';
    if (n.includes('DAX')) return 'ADVANCED MEASURES';
    if (n.includes('STORYTELLING') || n.includes('INSIGHT')) return 'COMMUNICATION';
    if (n.includes('CLEANING') || n.includes('ETL')) return 'DATA WRANGLING';
    return 'COMPETENCY';
  };

  // Duplicate items array so the timeline loops seamlessly without an empty gap
  const trackItems = [...tickerList, ...tickerList];

  const trackRef = useRef(null);
  const [scrollShift, setScrollShift] = useState(0);

  // Scroll-linked physical inertia: adds kinetic feel when scrolling the page
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastScrollY;
          lastScrollY = currentY;

          // Apply subtle velocity nudge (damped to prevent disruption)
          setScrollShift((prev) => (prev - delta * 0.35) % 1200);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="ticker-section timeline-track-section" aria-label="Technical skills & workflow timeline">
      {/* Top Timeline Context Bar */}
      <div className="timeline-bar-header">
        <div className="timeline-header-left">
          <span className="timeline-live-beacon" aria-hidden="true" />
          <span className="timeline-title-tag">WORKFLOW TIMELINE</span>
          <span className="timeline-separator">/</span>
          <span className="timeline-subtitle">CORE DATA ANALYTICS STACK</span>
        </div>
        <div className="timeline-header-right">
          <Sparkles size={13} className="timeline-sparkle" aria-hidden="true" />
          <span>{tickerList.length} MILESTONE TOOLS</span>
        </div>
      </div>

      {/* Main Horizontal Timeline Container */}
      <div className="ticker timeline-marquee">
        {/* Continuous Horizontal Axis Spine Line with Laser Scanner */}
        <div className="timeline-axis-spine" aria-hidden="true">
          <div className="timeline-axis-laser" />
        </div>

        {/* Moving Timeline Nodes Track */}
        <div
          ref={trackRef}
          className="ticker-track timeline-track"
          style={{ '--scroll-shift': `${scrollShift}px` }}
        >
          {trackItems.map((item, idx) => {
            const stepNumber = String((idx % tickerList.length) + 1).padStart(2, '0');
            const phaseLabel = getToolPhase(item);
            const isDuplicate = idx >= tickerList.length;

            return (
              <div
                key={idx}
                className="timeline-node"
                aria-hidden={isDuplicate ? "true" : undefined}
              >
                {/* Milestone Step Counter Pill */}
                <div className="timeline-step-badge">
                  <span className="timeline-step-num">{stepNumber}</span>
                  <span className="timeline-step-phase">{phaseLabel}</span>
                </div>

                {/* Glowing Node Pin centered on the horizontal axis spine */}
                <div className="timeline-node-pin" aria-hidden="true">
                  <span className="timeline-pin-core" />
                  <span className="timeline-pin-halo" />
                </div>

                {/* Technology Milestone Label */}
                <span className="timeline-node-label">
                  <GitCommit size={13} className="timeline-node-icon" aria-hidden="true" />
                  <span>{item}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TickerSection;
