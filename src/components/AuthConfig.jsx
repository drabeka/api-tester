import React, { useState, useEffect } from 'react';
import { getAuthConfig, setAuthConfig, clearAuthConfig } from '../utils/storage.js';
import FormField from './FormField.jsx';
import EmptyState from './EmptyState.jsx';
import useDialog from '../hooks/useDialog.js';

/**
 * Auth-Konfiguration für APIs
 * @param {Object} props
 * @param {string} props.apiId - API-ID
 */
export default function AuthConfig({ apiId }) {
  const [authType, setAuthType] = useState('none');
  const [bearerToken, setBearerToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [keyName, setKeyName] = useState('X-API-Key');
  const [keyLocation, setKeyLocation] = useState('header');
  const { showAlert, showConfirm, DialogRenderer } = useDialog();

  // Auth-Config aus LocalStorage laden
  useEffect(() => {
    if (apiId) {
      const config = getAuthConfig(apiId);
      if (config) {
        setAuthType(config.type);
        setBearerToken(config.token || '');
        setApiKey(config.apiKey || '');
        setKeyName(config.keyName || config.headerName || 'X-API-Key');
        setKeyLocation(config.keyLocation || 'header');
      } else {
        // Reset bei API-Wechsel
        setAuthType('none');
        setBearerToken('');
        setApiKey('');
        setKeyName('X-API-Key');
        setKeyLocation('header');
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
      config.keyName = keyName;
      config.keyLocation = keyLocation;
    }

    setAuthConfig(apiId, config);
    showAlert('Auth-Konfiguration gespeichert!', 'success');
  };

  const handleClear = () => {
    if (!apiId) return;
    showConfirm('Möchten Sie die Auth-Konfiguration wirklich löschen?', () => {
      clearAuthConfig(apiId);
      setAuthType('none');
      setBearerToken('');
      setApiKey('');
      setKeyName('X-API-Key');
      setKeyLocation('header');
      showAlert('Auth-Konfiguration gelöscht!', 'success');
    });
  };

  if (!apiId) {
    return (
      <div className="auth-config">
        <EmptyState icon="🔐" message="Bitte wählen Sie zuerst eine API aus." />
      </div>
    );
  }

  return (
    <div className="auth-config">
      <h3>Authentifizierung</h3>

      <FormField
        label="Auth-Typ:"
        type="select"
        name="auth-type"
        value={authType}
        onChange={(e) => setAuthType(e.target.value)}
        options={[
          { value: 'none', label: 'Keine' },
          { value: 'bearer', label: 'Bearer Token' },
          { value: 'apikey', label: 'API Key' }
        ]}
      />

      {authType === 'bearer' && (
        <FormField
          label="Bearer Token:"
          type="text"
          name="bearer-token"
          value={bearerToken}
          onChange={(e) => setBearerToken(e.target.value)}
          placeholder="Token eingeben..."
        >
          <small className="warning">
            ⚠️ Nur für Testzwecke! Token wird in LocalStorage gespeichert.
          </small>
        </FormField>
      )}

      {authType === 'apikey' && (
        <>
          <FormField
            label="API Key:"
            type="text"
            name="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API Key eingeben..."
          />
          <FormField
            label="Key-Name:"
            type="text"
            name="key-name"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="z.B. api_key, X-API-Key"
          />
          <FormField
            label="Senden als:"
            type="select"
            name="key-location"
            value={keyLocation}
            onChange={(e) => setKeyLocation(e.target.value)}
            options={[
              { value: 'header', label: 'Header' },
              { value: 'query', label: 'Query Parameter' },
              { value: 'cookie', label: 'Cookie' }
            ]}
          >
            <small className="warning">
              ⚠️ Nur für Testzwecke! Key wird in LocalStorage gespeichert.
            </small>
          </FormField>
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
      <DialogRenderer />
    </div>
  );
}
