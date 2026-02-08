import React, { useState } from 'react';
import { convertOpenAPIToConfig } from '../utils/openapi-converter.js';
import Tabs from './Tabs.jsx';
import yaml from 'js-yaml';

/**
 * Dialog zum Importieren von API-Definitionen aus OpenAPI 3.0 Spezifikationen
 * @param {Object} props
 * @param {Function} props.onImport - Callback mit importierten APIs
 * @param {Function} props.onClose - Callback zum Schließen
 */
export default function OpenAPIImportDialog({ onImport, onClose }) {
  const [activeTab, setActiveTab] = useState('url');
  const [url, setUrl] = useState('');
  const [fileContent, setFileContent] = useState('');
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

      // Versuche zuerst JSON zu parsen
      if (contentType?.includes('application/json')) {
        openApiSpec = JSON.parse(text);
      } else if (contentType?.includes('yaml') || contentType?.includes('yml') || url.endsWith('.yaml') || url.endsWith('.yml')) {
        // YAML parsen
        openApiSpec = yaml.load(text);
      } else {
        // Fallback: Versuche JSON, dann YAML
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

        // Parse basierend auf Dateiendung
        if (file.name.endsWith('.json')) {
          openApiSpec = JSON.parse(content);
        } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
          openApiSpec = yaml.load(content);
        } else {
          // Fallback: Versuche JSON, dann YAML
          try {
            openApiSpec = JSON.parse(content);
          } catch (jsonErr) {
            openApiSpec = yaml.load(content);
          }
        }

        setFileContent(content);
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

      // Wenn Source-URL vorhanden, origin extrahieren für relative Server-URLs
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
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content import-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📥 API Import (OpenAPI 3.0)</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <Tabs
            tabs={[
              { id: 'url', label: 'URL Import' },
              { id: 'file', label: 'Datei Upload' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="tab-content">
            {activeTab === 'url' && (
              <div className="import-url">
                <label>
                  OpenAPI Specification URL:
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/openapi.json"
                    disabled={isLoading}
                  />
                </label>
                <button
                  className="btn-primary"
                  onClick={handleUrlImport}
                  disabled={isLoading || !url.trim()}
                >
                  {isLoading ? 'Lädt...' : '🔄 Importieren'}
                </button>

                <div className="help-text">
                  <strong>Beispiel:</strong>
                  <ul>
                    <li>https://petstore3.swagger.io/api/v3/openapi.json</li>
                  </ul>
                  <small style={{ display: 'block', marginTop: '8px', color: '#27ae60' }}>
                    ✓ JSON und YAML werden unterstützt
                  </small>
                </div>
              </div>
            )}

            {activeTab === 'file' && (
              <div className="import-file">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept=".json,.yaml,.yml"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="file-upload-area">
                    <div className="upload-icon">📁</div>
                    <div className="upload-text">
                      <strong>Datei auswählen</strong>
                      <br />
                      <small>OpenAPI JSON (.json) oder YAML (.yaml, .yml)</small>
                    </div>
                  </div>
                </label>

                {fileContent && (
                  <div className="file-info">
                    ✓ Datei geladen ({fileContent.length} Zeichen)
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {preview && preview.length > 0 && (
            <div className="import-preview">
              <h3>📋 Vorschau ({preview.length} APIs)</h3>
              <div className="preview-list">
                {preview.map((api, index) => (
                  <div key={index} className="preview-item">
                    <div className="preview-header">
                      <span className="api-method">{api.method}</span>
                      <strong>{api.name}</strong>
                    </div>
                    <div className="preview-details">
                      <small>{api.endpoint}</small>
                      <span className="field-count">{api.fields.length} Felder</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirmImport}
            disabled={!preview || preview.length === 0}
          >
            ✓ {preview ? `${preview.length} APIs importieren` : 'Importieren'}
          </button>
        </div>
      </div>
    </div>
  );
}
