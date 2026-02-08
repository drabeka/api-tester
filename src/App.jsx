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

  // API-Konfiguration laden
  useEffect(() => {
    loadApis();
  }, []);

  const loadApis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/config/apis.json');

      if (!response.ok) {
        throw new Error(`Fehler beim Laden der APIs: ${response.statusText}`);
      }

      const data = await response.json();
      setApis(data.apis || []);

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

  const handleImportApis = (importedApis) => {
    // Merge imported APIs with existing ones
    const mergedApis = [...apis, ...importedApis];
    setApis(mergedApis);

    // Select first imported API
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
            onClick={() => setShowImportDialog(true)}
            className="btn-import"
            title="Import API from OpenAPI 3.0 Specification"
          >
            📥 Import OpenAPI
          </button>
        </div>
      </header>

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

      {showImportDialog && (
        <OpenAPIImportDialog
          onImport={handleImportApis}
          onClose={() => setShowImportDialog(false)}
        />
      )}
    </div>
  );
}

// App mounten
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
