import React, { useState, useRef, useMemo, useCallback } from 'react';
import useDropdown from '../hooks/useDropdown.js';

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
export default function DomainField({ id, domain, domainName, value, onChange, onBlur, required, placeholder }) {
  const { isOpen, searchTerm, setSearchTerm, close, open, containerRef } = useDropdown({
    onClose: onBlur,
  });
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

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

  // Sichtbare Einträge flach auflisten + Parent-Map (für Keyboard-Navigation)
  const { flatEntries, parentMap } = useMemo(() => {
    const result = [];
    const parents = {};
    const flatten = (values, parentCode) => {
      if (!values) return;
      for (const entry of values) {
        result.push(entry);
        if (parentCode) parents[entry.code] = parentCode;
        if (entry.values && entry.values.length > 0 && !collapsedNodes[entry.code]) {
          flatten(entry.values, entry.code);
        }
      }
    };
    flatten(filteredValues, null);
    return { flatEntries: result, parentMap: parents };
  }, [filteredValues, collapsedNodes]);

  const toggleNode = (code, e) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const handleSelect = (entry) => {
    if (entry.status !== 'V') return;
    onChange({ target: { value: entry.code } });
    close();
  };

  const handleOpen = () => {
    open();
    setSearchTerm('');
    setHighlightedIndex(-1);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  // Nächsten Index finden (alle Knoten erreichbar)
  const findNextIndex = useCallback((fromIndex, direction) => {
    const len = flatEntries.length;
    if (len === 0) return -1;
    const idx = fromIndex + direction;
    if (idx < 0) return len - 1;
    if (idx >= len) return 0;
    return idx;
  }, [flatEntries]);

  // Auto-Scroll des hervorgehobenen Eintrags
  const scrollToHighlighted = useCallback((index) => {
    if (!dropdownRef.current) return;
    const items = dropdownRef.current.querySelectorAll('.domain-tree-item');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      close();
      setHighlightedIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = findNextIndex(highlightedIndex, 1);
      if (nextIdx !== -1) {
        setHighlightedIndex(nextIdx);
        scrollToHighlighted(nextIdx);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = findNextIndex(highlightedIndex, -1);
      if (prevIdx !== -1) {
        setHighlightedIndex(prevIdx);
        scrollToHighlighted(prevIdx);
      }
      return;
    }

    // ArrowRight: Geschlossenen Knoten öffnen
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < flatEntries.length) {
        const entry = flatEntries[highlightedIndex];
        if (entry.values && entry.values.length > 0 && collapsedNodes[entry.code]) {
          setCollapsedNodes(prev => ({ ...prev, [entry.code]: false }));
        }
      }
      return;
    }

    // ArrowLeft: Geöffneten Knoten schließen, oder zum Eltern-Knoten springen
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < flatEntries.length) {
        const entry = flatEntries[highlightedIndex];
        if (entry.values && entry.values.length > 0 && !collapsedNodes[entry.code]) {
          // Knoten ist offen → schließen
          setCollapsedNodes(prev => ({ ...prev, [entry.code]: true }));
        } else {
          // Zum Eltern-Knoten springen und schließen
          const pCode = parentMap[entry.code];
          if (pCode) {
            const parentIdx = flatEntries.findIndex(e => e.code === pCode);
            if (parentIdx >= 0) {
              setHighlightedIndex(parentIdx);
              scrollToHighlighted(parentIdx);
              setCollapsedNodes(prev => ({ ...prev, [pCode]: true }));
            }
          }
        }
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < flatEntries.length) {
        handleSelect(flatEntries[highlightedIndex]);
      }
      return;
    }
  };

  // Rekursives Rendering eines Baum-Knotens
  const renderTreeNode = (entry, depth) => {
    const hasChildren = entry.values && entry.values.length > 0;
    const isCollapsed = collapsedNodes[entry.code];
    const isSelected = entry.code === value;
    const isDisabled = entry.status === 'N' || entry.status === 'S';
    const flatIdx = flatEntries.indexOf(entry);
    const isHighlighted = flatIdx === highlightedIndex;

    const statusClass = entry.status === 'N' ? 'domain-status-unavailable'
                      : entry.status === 'S' ? 'domain-status-locked'
                      : '';

    return (
      <div key={entry.code}>
        <div
          className={`domain-tree-item ${statusClass} ${isSelected ? 'domain-item-active' : ''} ${isHighlighted ? 'domain-item-highlighted' : ''}`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => !isDisabled && handleSelect(entry)}
          onMouseEnter={() => setHighlightedIndex(flatIdx)}
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
          <span className="dropdown-arrow"></span>
        </div>
      ) : (
        /* Suchfeld (geöffnet) */
        <div className="domain-search">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setHighlightedIndex(-1); }}
            onKeyDown={handleKeyDown}
            className="dropdown-search-input"
            autoFocus
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="dropdown-panel domain-dropdown" ref={dropdownRef}>
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
