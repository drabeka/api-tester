import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * Domain-Feld: Tree-View Dropdown für hierarchische Domain-Werte
 * @param {Object} props
 * @param {string} props.id - Input-ID
 * @param {Object} props.domain - Domain-Definition { name, values: [...] }
 * @param {string} props.domainName - Domain-Schlüssel
 * @param {string} props.value - Aktuell ausgewählter Code
 * @param {Function} props.onChange - Callback mit { target: { value: code } }
 * @param {boolean} props.required
 * @param {string} props.placeholder
 */
export default function DomainField({ id, domain, domainName, value, onChange, required, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Klick außerhalb schließt Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Eintrag per Code im Baum finden (rekursiv)
  const findEntryByCode = useCallback((values, code) => {
    if (!values || !code) return null;
    for (const entry of values) {
      if (entry.code === code) return entry;
      if (entry.values) {
        const found = findEntryByCode(entry.values, code);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Ausgewählter Eintrag
  const selectedEntry = useMemo(() => {
    if (!domain || !value) return null;
    return findEntryByCode(domain.values, value);
  }, [domain, value, findEntryByCode]);

  // Baum nach Suchbegriff filtern (rekursiv)
  const filterTree = useCallback((values, term) => {
    if (!term || !values) return values;
    const lowerTerm = term.toLowerCase();

    return values.reduce((acc, entry) => {
      const nameMatch = entry.name.toLowerCase().includes(lowerTerm);
      const codeMatch = entry.code.toLowerCase().includes(lowerTerm);

      if (entry.values) {
        const filteredChildren = filterTree(entry.values, term);
        if (nameMatch || codeMatch || filteredChildren.length > 0) {
          acc.push({ ...entry, values: filteredChildren.length > 0 ? filteredChildren : entry.values });
        }
      } else if (nameMatch || codeMatch) {
        acc.push(entry);
      }
      return acc;
    }, []);
  }, []);

  const filteredValues = useMemo(() => {
    if (!domain) return [];
    return filterTree(domain.values, searchTerm);
  }, [domain, searchTerm, filterTree]);

  const toggleNode = (code, e) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const handleSelect = (entry) => {
    if (entry.status !== 'V') return;
    onChange({ target: { value: entry.code } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleOpen = () => {
    setIsOpen(true);
    setSearchTerm('');
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Rekursives Rendering eines Baum-Knotens
  const renderTreeNode = (entry, depth) => {
    const hasChildren = entry.values && entry.values.length > 0;
    const isCollapsed = collapsedNodes[entry.code];
    const isSelected = entry.code === value;
    const isDisabled = entry.status === 'N' || entry.status === 'S';

    const statusClass = entry.status === 'N' ? 'domain-status-unavailable'
                      : entry.status === 'S' ? 'domain-status-locked'
                      : '';

    return (
      <div key={entry.code}>
        <div
          className={`domain-tree-item ${statusClass} ${isSelected ? 'domain-item-active' : ''}`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => !isDisabled && handleSelect(entry)}
          title={isDisabled
            ? (entry.status === 'N' ? 'Nicht verfügbar' : 'Nicht mehr auswählbar')
            : `${entry.code} – ${entry.name}`}
        >
          {hasChildren ? (
            <span className="domain-toggle" onClick={(e) => toggleNode(entry.code, e)}>
              {isCollapsed ? '▸' : '▾'}
            </span>
          ) : (
            <span className="domain-toggle-spacer"></span>
          )}

          <span className="domain-item-code">{entry.code}</span>
          <span className="domain-item-name">{entry.name}</span>

          {entry.status === 'S' && <span className="domain-lock-icon" title="Gesperrt">🔒</span>}
        </div>

        {hasChildren && !isCollapsed && (
          <div className="domain-tree-children">
            {entry.values.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Domain nicht gefunden
  if (!domain) {
    return (
      <div className="domain-field-error">
        Domain „{domainName}" nicht gefunden
      </div>
    );
  }

  return (
    <div className="domain-field" ref={containerRef}>
      {/* Trigger (geschlossen) */}
      {!isOpen ? (
        <div className="domain-trigger" onClick={handleOpen}>
          {selectedEntry ? (
            <span className="domain-selected-value">
              <span className="domain-selected-code">{selectedEntry.code}</span>
              <span className="domain-selected-name">{selectedEntry.name}</span>
            </span>
          ) : (
            <span className="domain-placeholder">{placeholder}</span>
          )}
          <span className="domain-arrow"></span>
        </div>
      ) : (
        /* Suchfeld (geöffnet) */
        <div className="domain-search">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="domain-search-input"
            autoFocus
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="domain-dropdown">
          {filteredValues.length > 0 ? (
            filteredValues.map(entry => renderTreeNode(entry, 0))
          ) : (
            <div className="domain-empty">
              {searchTerm ? 'Keine Treffer' : 'Keine Einträge'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
