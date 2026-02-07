import React from 'react';

/**
 * Wiederverwendbare Tabs-Komponente
 * @param {Object} props
 * @param {Array} props.tabs - Tab-Definitionen: [{ id: string, label: string }]
 * @param {string} props.activeTab - Aktuell aktiver Tab
 * @param {Function} props.onChange - Callback bei Tab-Wechsel
 * @param {string} props.className - Zusätzliche CSS-Klassen
 */
export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`tabs ${className}`.trim()}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
