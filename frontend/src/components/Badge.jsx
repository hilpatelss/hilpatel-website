import React from 'react';

/**
 * Reusable Badge & Pill component
 */
export function Badge({ children, variant = 'default', className = '', ...rest }) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}

export default Badge;
