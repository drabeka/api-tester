import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import ApiSelector from './components/ApiSelector.jsx';
import RequestForm from './components/RequestForm.jsx';
import ResponseViewer from './components/ResponseViewer.jsx';
import AuthConfig from './components/AuthConfig.jsx';
import History from './components/History.jsx';
import Tabs from './components/Tabs.jsx';
import EmptyState from './components/EmptyState.jsx';
import OpenAPIImportDialog from './components/OpenAPIImportDialog.jsx';

function App() {
  const [apis, setApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [response, setResponse] = useState(null);
  const [initialFormValues, setInitialFormValues] = useState(null);
  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'auth' | 'history'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [domains, setDomains] = useState({});

  // API-Konfiguration laden
  useEffect(() => {
    loadApis();
  }, []);

  const loadApis = async () => {
    try {
      setLoading(true);

      // Parallel laden: apis.json (required) + domains.json (optional)
      const [apisResponse, domainsResponse] = await Promise.all([
        fetch('/config/apis.json'),
        fetch('/config/domains.json').catch(() => null)
      ]);

      if (!apisResponse.ok) {
        throw new Error(`Fehler beim Laden der APIs: ${apisResponse.statusText}`);
      }

      const data = await apisResponse.json();
      setApis(data.apis || []);

      // Domains laden (optional, Fehler werden toleriert)
      if (domainsResponse && domainsResponse.ok) {
        try {
          const domainsData = await domainsResponse.json();
          // Array → Map (code → domain) für schnellen Lookup
          const domainsMap = {};
          if (Array.isArray(domainsData)) {
            domainsData.forEach(d => { domainsMap[d.code] = d; });
          }
          setDomains(domainsMap);
        } catch (e) {
          console.warn('Domains konnten nicht geladen werden:', e);
        }
      }

      // Erste API automatisch auswählen
      if (data.apis && data.apis.length > 0) {
        setSelectedApi(data.apis[0]);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Fehler beim Laden der APIs:', err);
    }
  };

  const handleApiSelect = (api) => {
    setSelectedApi(api);
    setResponse(null);
    setInitialFormValues(null);
    setActiveTab('request'); // Zurück zum Request-Tab
  };

  const handleResponse = (responseData) => {
    setResponse(responseData);
  };

  const handleReplayFromHistory = (replayData) => {
    // API auswählen
    const api = apis.find(a => a.id === replayData.apiId);
    if (api) {
      setSelectedApi(api);
      setInitialFormValues(replayData.payload);
      setActiveTab('request');
    }
  };

  const handleSaveApis = async () => {
    try {
      const res = await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apis })
      });
      if (!res.ok) throw new Error('Speichern fehlgeschlagen');
      const result = await res.json();
      if (result.success) {
        alert('APIs erfolgreich gespeichert!');
      }
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
    }
  };

  const handleImportApis = (importedApis) => {
    const mergedApis = [...apis, ...importedApis];
    setApis(mergedApis);

    if (importedApis.length > 0) {
      setSelectedApi(importedApis[0]);
      setActiveTab('request');
    }

    setShowImportDialog(false);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Lade API-Konfiguration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <EmptyState icon="❌" message="Fehler beim Laden">
          <p style={{ marginTop: '10px' }}>{error}</p>
          <button onClick={loadApis} className="btn-primary" style={{ marginTop: '15px' }}>
            Erneut versuchen
          </button>
        </EmptyState>
      </div>
    );
  }

  if (apis.length === 0) {
    return (
      <div className="app-container">
        <EmptyState icon="⚙️" message="Keine APIs konfiguriert">
          <p style={{ marginTop: '10px' }}>Bitte fügen Sie API-Definitionen in <code>config/apis.json</code> hinzu.</p>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🚀 API Test Framework</h1>
            <p className="subtitle">Flexibles Testing für REST APIs</p>
          </div>
          <button
            onClick={handleSaveApis}
            className="btn-secondary btn-sm"
            title="APIs in config/apis.json speichern"
          >
            💾 APIs speichern
          </button>
          <button
            onClick={() => setShowImportDialog(!showImportDialog)}
            className={`btn-secondary btn-sm ${showImportDialog ? 'active' : ''}`}
            title="Import API from OpenAPI 3.0 Specification"
          >
            📥 Import OpenAPI
          </button>
        </div>
      </header>

      {showImportDialog && (
        <OpenAPIImportDialog
          onImport={handleImportApis}
          onClose={() => setShowImportDialog(false)}
        />
      )}

      <ApiSelector
        apis={apis}
        selectedApiId={selectedApi?.id}
        onSelect={handleApiSelect}
      />

      <div className="main-content">
        <div className="sidebar">
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'request', label: '📝 Request' },
              { id: 'auth', label: '🔐 Auth' },
              { id: 'history', label: '📜 Historie' }
            ]}
          />

          <div className="tab-content">
            {activeTab === 'request' && (
              <RequestForm
                api={selectedApi}
                onResponse={handleResponse}
                initialValues={initialFormValues}
                domains={domains}
              />
            )}

            {activeTab === 'auth' && (
              <AuthConfig apiId={selectedApi?.id} />
            )}

            {activeTab === 'history' && (
              <History onReplay={handleReplayFromHistory} />
            )}
          </div>
        </div>

        <div className="response-panel">
          <ResponseViewer response={response} />
        </div>
      </div>

      <footer className="app-footer">
        <p>API Test Framework v1.0 | React + esbuild</p>
      </footer>
    </div>
  );
}

// App mounten
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
