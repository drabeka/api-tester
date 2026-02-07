import React from 'react';

/**
 * Dropdown zur Auswahl der API
 * @param {Object} props
 * @param {Array} props.apis - Liste der verfügbaren APIs
 * @param {string} props.selectedApiId - Aktuell ausgewählte API-ID
 * @param {Function} props.onSelect - Callback bei API-Auswahl
 */
export default function ApiSelector({ apis, selectedApiId, onSelect }) {
  const handleChange = (e) => {
    const apiId = e.target.value;
    const selectedApi = apis.find(api => api.id === apiId);
    onSelect(selectedApi);
  };

  return (
    <div className="api-selector">
      <label htmlFor="api-select">
        API auswählen:
      </label>
      <select
        id="api-select"
        value={selectedApiId || ''}
        onChange={handleChange}
        className="api-select-dropdown"
      >
        <option value="">-- Bitte API wählen --</option>
        {apis.map(api => (
          <option key={api.id} value={api.id}>
            {api.name} ({api.method})
          </option>
        ))}
      </select>
      {selectedApiId && (
        <div className="api-info">
          {apis.find(api => api.id === selectedApiId)?.description && (
            <p className="api-description">
              {apis.find(api => api.id === selectedApiId).description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
