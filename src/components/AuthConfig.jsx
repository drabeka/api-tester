import React, { useState, useEffect } from 'react';
import { getAuthConfig, setAuthConfig, clearAuthConfig } from '../utils/storage.js';

/**
 * Auth-Konfiguration für APIs
 * @param {Object} props
 * @param {string} props.apiId - API-ID
 */
export default function AuthConfig({ apiId }) {
  const [authType, setAuthType] = useState('none');
  const [bearerToken, setBearerToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [headerName, setHeaderName] = useState('X-API-Key');

  // Auth-Config aus LocalStorage laden
  useEffect(() => {
    if (apiId) {
      const config = getAuthConfig(apiId);
      if (config) {
        setAuthType(config.type);
        setBearerToken(config.token || '');
        setApiKey(config.apiKey || '');
        setHeaderName(config.headerName || 'X-API-Key');
      } else {
        // Reset bei API-Wechsel
        setAuthType('none');
        setBearerToken('');
        setApiKey('');
        setHeaderName('X-API-Key');
      }
    }
  }, [apiId]);

  const handleSave = () => {
    if (!apiId) return;

    const config = { type: authType };

    if (authType === 'bearer') {
      config.token = bearerToken;
    } else if (authType === 'apikey') {
      config.apiKey = apiKey;
      config.headerName = headerName;
    }

    setAuthConfig(apiId, config);
    alert('Auth-Konfiguration gespeichert!');
  };

  const handleClear = () => {
    if (!apiId) return;
    clearAuthConfig(apiId);
    setAuthType('none');
    setBearerToken('');
    setApiKey('');
    setHeaderName('X-API-Key');
    alert('Auth-Konfiguration gelöscht!');
  };

  if (!apiId) {
    return (
      <div className="auth-config">
        <p>Bitte wählen Sie zuerst eine API aus.</p>
      </div>
    );
  }

  return (
    <div className="auth-config">
      <h3>Authentifizierung</h3>
      <div className="form-group">
        <label htmlFor="auth-type">Auth-Typ:</label>
        <select
          id="auth-type"
          value={authType}
          onChange={(e) => setAuthType(e.target.value)}
        >
          <option value="none">Keine</option>
          <option value="bearer">Bearer Token</option>
          <option value="apikey">API Key</option>
        </select>
      </div>

      {authType === 'bearer' && (
        <div className="form-group">
          <label htmlFor="bearer-token">Bearer Token:</label>
          <input
            type="text"
            id="bearer-token"
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
            placeholder="Token eingeben..."
          />
          <small className="warning">
            ⚠️ Nur für Testzwecke! Token wird in LocalStorage gespeichert.
          </small>
        </div>
      )}

      {authType === 'apikey' && (
        <>
          <div className="form-group">
            <label htmlFor="api-key">API Key:</label>
            <input
              type="text"
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key eingeben..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="header-name">Header-Name:</label>
            <input
              type="text"
              id="header-name"
              value={headerName}
              onChange={(e) => setHeaderName(e.target.value)}
              placeholder="z.B. X-API-Key"
            />
          </div>
          <small className="warning">
            ⚠️ Nur für Testzwecke! Key wird in LocalStorage gespeichert.
          </small>
        </>
      )}

      <div className="auth-actions">
        <button onClick={handleSave} className="btn-primary">
          Speichern
        </button>
        <button onClick={handleClear} className="btn-secondary">
          Löschen
        </button>
      </div>
    </div>
  );
}
