import React from 'react';

/**
 * Reusable Card Container
 */
export function Card({ children, className = '', hoverable = true, ...rest }) {
  const classes = `ui-card ${hoverable ? 'ui-card-hover' : ''} ${className}`.trim();
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export default Card;
