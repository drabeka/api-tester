import React, { useState, useRef, useCallback } from 'react';
import useClickOutside from '../hooks/useClickOutside.js';

/**
 * Environment-Manager: Selector + Variablen-Editor
 * @param {Object} props
 * @param {Array} props.environments - Array von { name, variables: {} }
 * @param {string} props.activeEnvName - Aktiver Environment-Name ('' = keins)
 * @param {Function} props.onChangeActive - Callback(envName)
 * @param {Function} props.onUpdateEnvironments - Callback(newEnvironments)
 */
export default function EnvironmentManager({
  environments,
  activeEnvName,
  onChangeActive,
  onUpdateEnvironments,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); // false = selector, true = editor
  const [editingEnv, setEditingEnv] = useState(null); // Index des bearbeiteten Environments
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [newEnvName, setNewEnvName] = useState('');
  const containerRef = useRef(null);

  useClickOutside(containerRef, useCallback(() => {
    setIsOpen(false);
    setEditMode(false);
    setEditingEnv(null);
  }, []));

  const activeEnv = environments.find(e => e.name === activeEnvName);
  const varCount = activeEnv ? Object.keys(activeEnv.variables).length : 0;

  const handleSelectEnv = (name) => {
    onChangeActive(name === activeEnvName ? '' : name);
    setIsOpen(false);
  };

  const handleOpenEditor = (index) => {
    setEditingEnv(index);
    setEditMode(true);
    setNewVarKey('');
    setNewVarValue('');
  };

  const handleBackToSelector = () => {
    setEditMode(false);
    setEditingEnv(null);
  };

  // --- Environment CRUD ---

  const handleAddEnvironment = () => {
    const name = newEnvName.trim();
    if (!name || environments.some(e => e.name === name)) return;
    onUpdateEnvironments([...environments, { name, variables: {} }]);
    setNewEnvName('');
  };

  const handleDeleteEnvironment = (index) => {
    const env = environments[index];
    const updated = environments.filter((_, i) => i !== index);
    onUpdateEnvironments(updated);
    if (env.name === activeEnvName) {
      onChangeActive('');
    }
    setEditMode(false);
    setEditingEnv(null);
  };

  // --- Variable CRUD ---

  const handleAddVariable = () => {
    const key = newVarKey.trim();
    if (!key || editingEnv === null) return;
    const updated = [...environments];
    updated[editingEnv] = {
      ...updated[editingEnv],
      variables: { ...updated[editingEnv].variables, [key]: newVarValue },
    };
    onUpdateEnvironments(updated);
    setNewVarKey('');
    setNewVarValue('');
  };

  const handleUpdateVariable = (key, value) => {
    if (editingEnv === null) return;
    const updated = [...environments];
    updated[editingEnv] = {
      ...updated[editingEnv],
      variables: { ...updated[editingEnv].variables, [key]: value },
    };
    onUpdateEnvironments(updated);
  };

  const handleDeleteVariable = (key) => {
    if (editingEnv === null) return;
    const updated = [...environments];
    const vars = { ...updated[editingEnv].variables };
    delete vars[key];
    updated[editingEnv] = { ...updated[editingEnv], variables: vars };
    onUpdateEnvironments(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setEditMode(false);
      setEditingEnv(null);
    }
  };

  return (
    <div className="env-manager" ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        className={`env-trigger ${activeEnvName ? 'env-active' : ''}`}
        onClick={() => { setIsOpen(!isOpen); setEditMode(false); setEditingEnv(null); }}
        title={activeEnvName ? `Environment: ${activeEnvName}` : 'Kein Environment ausgewählt'}
      >
        <span className="env-icon">⚙</span>
        <span className="env-label">
          {activeEnvName || 'Env'}
        </span>
        {activeEnvName && (
          <span className="env-var-count">{varCount}</span>
        )}
        <span className="dropdown-arrow">{isOpen ? '▾' : '▸'}</span>
      </button>

      {/* Dropdown */}
      {isOpen && !editMode && (
        <div className="env-dropdown dropdown-panel">
          <div className="env-dropdown-header">
            <strong>Environments</strong>
          </div>

          {/* Environment-Liste */}
          <div className="env-list">
            {environments.length === 0 && (
              <div className="env-empty">Keine Environments definiert.</div>
            )}
            {environments.map((env, index) => (
              <div
                key={env.name}
                className={`env-item ${env.name === activeEnvName ? 'env-item-active' : ''}`}
              >
                <button
                  className="env-item-select"
                  onClick={() => handleSelectEnv(env.name)}
                >
                  <span className="env-item-radio">
                    {env.name === activeEnvName ? '●' : '○'}
                  </span>
                  <span className="env-item-name">{env.name}</span>
                  <span className="env-item-vars">
                    {Object.keys(env.variables).length} Var.
                  </span>
                </button>
                <button
                  className="env-item-edit"
                  onClick={() => handleOpenEditor(index)}
                  title="Bearbeiten"
                >
                  ✎
                </button>
              </div>
            ))}
          </div>

          {/* Neues Environment hinzufügen */}
          <div className="env-add-row">
            <input
              type="text"
              className="env-add-input"
              placeholder="Neues Environment..."
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEnvironment(); } }}
            />
            <button
              className="btn-sm btn-primary"
              onClick={handleAddEnvironment}
              disabled={!newEnvName.trim() || environments.some(e => e.name === newEnvName.trim())}
            >
              +
            </button>
          </div>

          {/* Aktive Variablen-Vorschau */}
          {activeEnv && Object.keys(activeEnv.variables).length > 0 && (
            <div className="env-preview">
              <div className="env-preview-title">Aktive Variablen:</div>
              {Object.entries(activeEnv.variables).map(([key, value]) => (
                <div key={key} className="env-preview-item">
                  <span className="env-preview-key">{`{{${key}}}`}</span>
                  <span className="env-preview-value">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Variable Editor */}
      {isOpen && editMode && editingEnv !== null && environments[editingEnv] && (
        <div className="env-dropdown dropdown-panel env-editor">
          <div className="env-editor-header">
            <button className="env-back-btn" onClick={handleBackToSelector}>← Zurück</button>
            <strong>{environments[editingEnv].name}</strong>
            <button
              className="btn-sm btn-danger"
              onClick={() => handleDeleteEnvironment(editingEnv)}
              title="Environment löschen"
            >
              🗑
            </button>
          </div>

          {/* Variablen-Liste */}
          <div className="env-vars-list">
            {Object.entries(environments[editingEnv].variables).length === 0 && (
              <div className="env-empty">Keine Variablen definiert.</div>
            )}
            {Object.entries(environments[editingEnv].variables).map(([key, value]) => (
              <div key={key} className="env-var-row">
                <span className="env-var-key">{key}</span>
                <input
                  type="text"
                  className="env-var-value-input"
                  value={value}
                  onChange={(e) => handleUpdateVariable(key, e.target.value)}
                />
                <button
                  className="env-var-delete"
                  onClick={() => handleDeleteVariable(key)}
                  title="Variable löschen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Neue Variable */}
          <div className="env-var-add">
            <input
              type="text"
              className="env-var-add-key"
              placeholder="Key"
              value={newVarKey}
              onChange={(e) => setNewVarKey(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVariable(); } }}
            />
            <input
              type="text"
              className="env-var-add-value"
              placeholder="Value"
              value={newVarValue}
              onChange={(e) => setNewVarValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVariable(); } }}
            />
            <button
              className="btn-sm btn-primary"
              onClick={handleAddVariable}
              disabled={!newVarKey.trim()}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
