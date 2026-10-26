import React from 'react';

export function DynamicArtGraphic({ project, index = 0 }) {
  // If a custom image was uploaded and art_type is custom_image, render the image
  if (project.custom_art_type === 'custom_image' && project.thumbnail_url) {
    return (
      <img
        src={project.thumbnail_url}
        alt={project.title}
        className="uploaded-thumbnail"
        loading="lazy"
      />
    );
  }

  // Type 1: KPI bars (Digital Wellbeing style)
  if (project.custom_art_type === 'kpi_bars' || index === 0) {
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

  // Type 2: Donut & Sparkline (BMI & Risk style)
  if (project.custom_art_type === 'donut_chart' || index === 1) {
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

  // Type 3: Billing chart (Smart Bill style)
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

