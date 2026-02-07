import React from 'react';

/**
 * Wiederverwendbare Badge-Komponente
 * @param {Object} props
 * @param {string} props.variant - Badge-Typ: 'status' | 'duration'
 * @param {string} props.type - Für status: 'success' | 'error'
 * @param {React.ReactNode} props.children - Badge-Inhalt
 * @param {string} props.className - Zusätzliche CSS-Klassen
 */
export default function Badge({ variant = 'status', type = 'success', children, className = '' }) {
  let badgeClass = '';

  if (variant === 'status') {
    badgeClass = `status-badge ${type === 'success' ? 'status-success' : 'status-error'}`;
  } else if (variant === 'duration') {
    badgeClass = 'duration-badge';
  }

  return (
    <div className={`${badgeClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
