/**
 * ==============================================================================
 * Dynamic Project Artwork Graphic Component (DynamicArtGraphic.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS COMPONENT?
 * When you look at the "Featured Projects" section on the website, each project card
 * has an attractive visual header illustrating analytics work.
 * 
 * HOW DOES IT WORK?
 * 1. Image Thumbnail: If the project has an actual uploaded preview image from Django,
 *    it displays that image.
 * 2. Simulated Analytics Dashboard: If no custom image was uploaded, it generates an
 *    Apple-style mini data visualization widget:
 *    - Type 1 ('kpi_bars'): A bar chart with Focus Score & Screen Time KPIs.
 *    - Type 2 ('donut_chart'): A radial donut chart and smooth sparkline curve.
 *    - Type 3 ('billing_chart'): A monthly revenue bar chart.
 * 
 * This ensures that every project looks sleek, polished, and data-driven without
 * requiring the user to create and upload manual screenshots for everything!
 */
import React from 'react';

export function DynamicArtGraphic({ project, index = 0 }) {
  // Option 1: If an uploaded thumbnail exists and art type is custom_image or not explicitly a chart
  if (project.thumbnail_url && (project.custom_art_type === 'custom_image' || !project.custom_art_type)) {
    return (
      <img
        src={project.thumbnail_url}
        alt={project.title}
        className="uploaded-thumbnail"
        loading="lazy"
      />
    );
  }

  // Determine chart style: respect project's explicit setting first, otherwise rotate based on index
  const artType = project.custom_art_type || (index % 3 === 0 ? 'kpi_bars' : index % 3 === 1 ? 'donut_chart' : 'billing_chart');

  // Option 2A: KPI bars (Digital Wellbeing style bar chart)
  if (artType === 'kpi_bars') {
    return (
      <>
        <div className="mini-kpis">
          <span>
            <small>FOCUS SCORE</small>
            <b>78.4</b>
            <i>↗</i>
          </span>
          <span>
            <small>SCREEN TIME</small>
            <b>5.2h</b>
            <i>↘</i>
          </span>
        </div>
        <div className="mini-bars">
          {[34, 54, 42, 70, 48, 82, 64, 91, 73, 60, 86, 75].map((h, j) => (
            <i key={j} style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mini-legend">
          <i /> Usage trends <i /> Focus metrics
        </div>
      </>
    );
  }

  // Option 2B: Donut & Sparkline (BMI & Risk style radial chart)
  if (artType === 'donut_chart') {
    return (
      <>
        <div className="donut-row">
          <div className="donut">
            <span>
              24.6<small>AVG BMI</small>
            </span>
          </div>
          <div className="donut-labels">
            <span><i /> Low risk</span>
            <span><i /> Moderate</span>
            <span><i /> Elevated</span>
          </div>
        </div>
        <div className="mini-line">
          <svg viewBox="0 0 280 70" preserveAspectRatio="none">
            <path
              d="M0 55 C28 42 37 52 62 34 S94 43 118 28 S153 45 179 19 S213 28 238 15 S260 20 280 5"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </>
    );
  }

  // Option 2C: Monthly revenue trend chart (Smart Bill style)
  return (
    <>
      <div className="billing-head">
        <span>MONTHLY REVENUE</span>
        <b>₹ Dashboard</b>
      </div>
      <div className="billing-chart">
        {[35, 52, 46, 66, 58, 78, 70, 91].map((h, j) => (
          <i key={j} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="billing-foot">
        <span>Customer insights</span>
        <span>Billing performance</span>
      </div>
    </>
  );
}

