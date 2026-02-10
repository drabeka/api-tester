import React, { useState, useEffect, useRef } from 'react';
import { formatResponse } from '../utils/apiClient.js';
import Badge from './Badge.jsx';

/**
 * Response-Viewer mit Syntax-Highlighting und Headers
 * @param {Object} props
 * @param {Object} props.response - Response-Objekt
 */
export default function ResponseViewer({ response }) {
  const preRef = useRef(null);
  const [showHeaders, setShowHeaders] = useState(false);

  // Einfaches JSON-Syntax-Highlighting
  const highlightJSON = (json) => {
    if (typeof json !== 'string') {
      json = formatResponse(json);
    }

    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/: (null)/g, ': <span class="json-null">$1</span>')
      .replace(/: (-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>');
  };

  useEffect(() => {
    if (preRef.current && response && response.data !== null) {
      const formattedData = formatResponse(response.data);
      const highlighted = highlightJSON(formattedData);
      preRef.current.innerHTML = highlighted;
    }
  }, [response]);

  if (!response) {
    return (
      <div className="response-viewer">
        <h3>Response</h3>
        <pre className="response-content">
          Noch keine Anfrage gesendet.
        </pre>
      </div>
    );
  }

  return (
    <div className="response-viewer">
      <div className="response-header">
        <h3>Response</h3>
        <Badge variant="status" type={response.ok ? 'success' : 'error'}>
          HTTP {response.status} {response.statusText}
        </Badge>
        {response.duration && (
          <Badge variant="duration">
            {response.duration}ms
          </Badge>
        )}
      </div>

      {/* Response Headers */}
      {response.headers && Object.keys(response.headers).length > 0 && (
        <div className="response-headers-section">
          <button
            className="response-headers-toggle"
            onClick={() => setShowHeaders(!showHeaders)}
          >
            <span className="response-headers-arrow">{showHeaders ? '▾' : '▸'}</span>
            Headers ({Object.keys(response.headers).length})
          </button>
          {showHeaders && (
            <div className="response-headers-list">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="response-header-item">
                  <span className="response-header-key">{key}</span>
                  <span className="response-header-value">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {response.error ? (
        <pre className="response-content error">
          Fehler: {response.error}
        </pre>
      ) : (
        <pre
          ref={preRef}
          className="response-content"
        >
          {/* Content wird via useEffect gesetzt */}
        </pre>
      )}
    </div>
  );
}
