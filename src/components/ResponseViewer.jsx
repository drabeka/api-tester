import React, { useEffect, useRef } from 'react';
import { formatResponse } from '../utils/apiClient.js';

/**
 * Response-Viewer mit Syntax-Highlighting
 * @param {Object} props
 * @param {Object} props.response - Response-Objekt
 */
export default function ResponseViewer({ response }) {
  const preRef = useRef(null);

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

  const statusClass = response.ok ? 'status-success' : 'status-error';

  return (
    <div className="response-viewer">
      <div className="response-header">
        <h3>Response</h3>
        <div className={`status-badge ${statusClass}`}>
          HTTP {response.status} {response.statusText}
        </div>
        {response.duration && (
          <div className="duration-badge">
            {response.duration}ms
          </div>
        )}
      </div>

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
