import React, { useState } from 'react';
import { convertOpenAPIToConfig } from '../utils/openapi-converter.js';
import yaml from 'js-yaml';

/**
 * Aufklappbares Inline-Panel zum Importieren von OpenAPI 3.0 Spezifikationen
 * @param {Object} props
 * @param {Function} props.onImport - Callback mit importierten APIs
 * @param {Function} props.onClose - Callback zum Schließen
 */
export default function OpenAPIImportDialog({ onImport, onClose }) {
  const [importMode, setImportMode] = useState('url');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleUrlImport = async () => {
    if (!url.trim()) {
      setError('Bitte geben Sie eine URL ein');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      const text = await response.text();
      let openApiSpec;

      if (contentType?.includes('application/json')) {
        openApiSpec = JSON.parse(text);
      } else if (contentType?.includes('yaml') || contentType?.includes('yml') || url.endsWith('.yaml') || url.endsWith('.yml')) {
        openApiSpec = yaml.load(text);
      } else {
        try {
          openApiSpec = JSON.parse(text);
        } catch (jsonErr) {
          try {
            openApiSpec = yaml.load(text);
          } catch (yamlErr) {
            throw new Error('Konnte weder als JSON noch als YAML geparst werden');
          }
        }
      }

      processOpenAPISpec(openApiSpec, url);
    } catch (err) {
      setError(`Import fehlgeschlagen: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let openApiSpec;

        if (file.name.endsWith('.json')) {
          openApiSpec = JSON.parse(content);
        } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
          openApiSpec = yaml.load(content);
        } else {
          try {
            openApiSpec = JSON.parse(content);
          } catch (jsonErr) {
            openApiSpec = yaml.load(content);
          }
        }

        processOpenAPISpec(openApiSpec);
      } catch (err) {
        setError(`Datei-Parse fehlgeschlagen: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const processOpenAPISpec = (spec, sourceUrl = null) => {
    try {
      const options = {};

      if (sourceUrl) {
        try {
          const urlObj = new URL(sourceUrl);
          options.sourceOrigin = urlObj.origin;
        } catch (e) {
          console.warn('Could not parse source URL:', sourceUrl);
        }
      }

      const apis = convertOpenAPIToConfig(spec, options);
      if (apis.length === 0) {
        setError('Keine importierbaren APIs gefunden');
        return;
      }
      setPreview(apis);
      setError(null);
    } catch (err) {
      setError(`Konvertierung fehlgeschlagen: ${err.message}`);
    }
  };

  const handleConfirmImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview);
    }
  };

  const methodColors = {
    GET: '#27ae60',
    POST: '#2980b9',
    PUT: '#e67e22',
    PATCH: '#f39c12',
    DELETE: '#e74c3c',
  };

  return (
    <div className="import-panel">
      <div className="import-panel-header">
        <span className="import-panel-title">OpenAPI 3.0 Import</span>
        <div className="import-panel-modes">
          <button
            className={`import-mode-btn ${importMode === 'url' ? 'active' : ''}`}
            onClick={() => setImportMode('url')}
          >
            URL
          </button>
          <button
            className={`import-mode-btn ${importMode === 'file' ? 'active' : ''}`}
            onClick={() => setImportMode('file')}
          >
            Datei
          </button>
        </div>
        <button className="import-panel-close" onClick={onClose}>✕</button>
      </div>

      <div className="import-panel-body">
        {importMode === 'url' && (
          <div className="import-url-row">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/openapi.json"
              disabled={isLoading}
              className="import-url-input"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
            />
            <button
              className="btn-primary"
              onClick={handleUrlImport}
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? 'Lädt...' : 'Importieren'}
            </button>
          </div>
        )}

        {importMode === 'file' && (
          <div className="import-file-row">
            <label className="import-file-btn">
              <input
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              Datei wählen (.json, .yaml)
            </label>
          </div>
        )}

        {error && (
          <div className="import-error">
            {error}
          </div>
        )}

        {preview && preview.length > 0 && (
          <div className="import-preview">
            <div className="import-preview-header">
              <span>{preview.length} APIs gefunden</span>
              <button
                className="btn-primary"
                onClick={handleConfirmImport}
              >
                Alle importieren
              </button>
            </div>
            <div className="import-preview-list">
              {preview.map((api, index) => (
                <div key={index} className="import-preview-item">
                  <span
                    className="api-method-badge"
                    style={{ backgroundColor: methodColors[api.method] || '#95a5a6' }}
                  >
                    {api.method}
                  </span>
                  <span className="import-preview-name">{api.name}</span>
                  <span className="import-preview-fields">{api.fields?.length || 0} Felder</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
