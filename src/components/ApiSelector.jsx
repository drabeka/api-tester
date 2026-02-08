import React, { useState, useMemo, useEffect, useRef } from 'react';

/**
 * API-Auswahl als Combobox mit Tag-Gruppierung
 * @param {Object} props
 * @param {Array} props.apis - Liste der verfügbaren APIs
 * @param {string} props.selectedApiId - Aktuell ausgewählte API-ID
 * @param {Function} props.onSelect - Callback bei API-Auswahl
 */
export default function ApiSelector({ apis, selectedApiId, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedTags, setCollapsedTags] = useState({});
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // HTTP-Methoden Farben
  const methodColors = {
    GET: '#27ae60',
    POST: '#2980b9',
    PUT: '#e67e22',
    PATCH: '#f39c12',
    DELETE: '#e74c3c',
  };

  // Ausgewählte API finden
  const selectedApi = useMemo(() => {
    return apis.find(api => api.id === selectedApiId) || null;
  }, [apis, selectedApiId]);

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

  // APIs filtern und nach Tags gruppieren
  const groupedApis = useMemo(() => {
    const filtered = apis.filter(api => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        api.name.toLowerCase().includes(term) ||
        api.endpoint?.toLowerCase().includes(term) ||
        api.method?.toLowerCase().includes(term) ||
        api.tag?.toLowerCase().includes(term)
      );
    });

    const groups = {};
    filtered.forEach(api => {
      const tag = api.tag || 'Sonstige';
      if (!groups[tag]) {
        groups[tag] = [];
      }
      groups[tag].push(api);
    });

    return groups;
  }, [apis, searchTerm]);

  const tagNames = Object.keys(groupedApis).sort();
  const totalFiltered = Object.values(groupedApis).reduce((sum, arr) => sum + arr.length, 0);

  const toggleTag = (tag) => {
    setCollapsedTags(prev => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  const handleSelect = (api) => {
    onSelect(api);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputClick = () => {
    setIsOpen(true);
    setSearchTerm('');
    // Focus auf Input nach dem Öffnen
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="api-selector" ref={containerRef}>
      {/* Combobox Trigger */}
      {!isOpen ? (
        <div className="api-combobox-trigger" onClick={handleInputClick}>
          {selectedApi ? (
            <div className="api-combobox-selected">
              <span
                className="api-method-badge"
                style={{ backgroundColor: methodColors[selectedApi.method] || '#95a5a6' }}
              >
                {selectedApi.method}
              </span>
              <span className="api-combobox-name">{selectedApi.name}</span>
              {selectedApi.tag && (
                <span className="api-combobox-tag">{selectedApi.tag}</span>
              )}
            </div>
          ) : (
            <span className="api-combobox-placeholder">API auswählen...</span>
          )}
          <span className="api-combobox-arrow"></span>
        </div>
      ) : (
        <div className="api-search">
          <input
            ref={inputRef}
            type="text"
            placeholder="APIs suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="api-search-input"
            autoFocus
          />
          {searchTerm && (
            <span className="api-search-count">{totalFiltered} Treffer</span>
          )}
        </div>
      )}

      {/* Dropdown Liste */}
      {isOpen && (
        <div className="api-dropdown-list">
          {tagNames.map(tag => (
            <div key={tag} className="api-tag-group">
              <div
                className="api-tag-header"
                onClick={() => toggleTag(tag)}
              >
                <span className="api-tag-toggle">{collapsedTags[tag] ? '▸' : '▾'}</span>
                <span className="api-tag-name">{tag}</span>
                <span className="api-tag-count">{groupedApis[tag].length}</span>
              </div>

              {!collapsedTags[tag] && (
                <div className="api-tag-items">
                  {groupedApis[tag].map(api => (
                    <div
                      key={api.id}
                      className={`api-item ${selectedApiId === api.id ? 'api-item-active' : ''}`}
                      onClick={() => handleSelect(api)}
                      title={api.description || api.endpoint}
                    >
                      <span
                        className="api-method-badge"
                        style={{ backgroundColor: methodColors[api.method] || '#95a5a6' }}
                      >
                        {api.method}
                      </span>
                      <span className="api-item-name">{api.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {tagNames.length === 0 && (
            <div className="api-empty">
              {searchTerm ? 'Keine APIs gefunden' : 'Keine APIs geladen'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
