import React from 'react';

/**
 * Wiederverwendbare EmptyState-Komponente
 * @param {Object} props
 * @param {string} props.icon - Optional: Emoji oder Icon
 * @param {string} props.message - Anzuzeigende Nachricht
 * @param {React.ReactNode} props.children - Optional: Zusätzlicher Inhalt
 * @param {string} props.className - Zusätzliche CSS-Klassen
 */
export default function EmptyState({ icon, message, children, className = '' }) {
  return (
    <div className={`no-history ${className}`.trim()}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p>{message}</p>
      {children}
    </div>
  );
}
