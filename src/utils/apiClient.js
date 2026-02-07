// API-Client mit Auth-Unterstützung

import { addToHistory } from './storage.js';

const DEFAULT_TIMEOUT = 30000; // 30 Sekunden

/**
 * Führt einen API-Request mit Auth-Unterstützung durch
 * @param {Object} options - Request-Optionen
 * @param {string} options.endpoint - API-Endpoint URL
 * @param {string} options.method - HTTP-Methode (GET, POST, etc.)
 * @param {Object} options.payload - Request-Body
 * @param {Object} options.authConfig - Auth-Konfiguration
 * @param {string} options.apiId - API-ID für Historie
 * @param {string} options.apiName - API-Name für Historie
 * @returns {Promise<Object>} Response-Objekt mit status, data, headers
 */
export async function makeApiRequest(options) {
  const {
    endpoint,
    method = 'POST',
    payload = {},
    authConfig = null,
    apiId,
    apiName,
    timeout = DEFAULT_TIMEOUT,
    useProxy = true, // CORS-Proxy standardmäßig aktiviert
  } = options;

  // Headers vorbereiten
  const headers = {
    'Content-Type': 'application/json',
  };

  // Auth-Header hinzufügen
  if (authConfig) {
    if (authConfig.type === 'bearer') {
      headers['Authorization'] = `Bearer ${authConfig.token}`;
    } else if (authConfig.type === 'apikey') {
      headers[authConfig.headerName || 'X-API-Key'] = authConfig.apiKey;
    }
  }

  const startTime = Date.now();
  let response = null;
  let responseData = null;
  let error = null;

  try {
    // Timeout-Kontrolle
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let requestConfig;
    let fetchUrl;

    if (useProxy) {
      // CORS-Proxy verwenden
      fetchUrl = '/api/proxy';
      requestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: endpoint,
          method: method,
          headers: headers,
          body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? payload : undefined
        }),
        signal: controller.signal
      };
    } else {
      // Direkter Request (kann CORS-Fehler verursachen)
      fetchUrl = endpoint;
      requestConfig = {
        method,
        headers,
        signal: controller.signal
      };

      // Body nur bei POST/PUT/PATCH hinzufügen
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        requestConfig.body = JSON.stringify(payload);
      }
    }

    response = await fetch(fetchUrl, requestConfig);
    clearTimeout(timeoutId);

    // Response-Text lesen
    const responseText = await response.text();

    // Versuchen als JSON zu parsen, sonst als Text zurückgeben
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

  } catch (err) {
    error = err;

    if (err.name === 'AbortError') {
      error = new Error(`Request timeout after ${timeout}ms`);
    }
  }

  const duration = Date.now() - startTime;

  // In Historie speichern
  const historyEntry = {
    apiId,
    apiName,
    endpoint,
    method,
    payload,
    status: response ? response.status : 0,
    statusText: response ? response.statusText : 'Network Error',
    responseData,
    error: error ? error.message : null,
    duration,
  };

  addToHistory(historyEntry);

  // Fehler werfen bei Netzwerkproblemen
  if (error) {
    throw error;
  }

  // Response-Objekt zurückgeben
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data: responseData,
    headers: Object.fromEntries(response.headers.entries()),
    duration,
  };
}

/**
 * Formatiert Response-Daten für schöne Anzeige
 * @param {any} data - Response-Daten
 * @returns {string} Formatierter String
 */
export function formatResponse(data) {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

/**
 * Validiert Formular-Felder
 * @param {Array} fields - Feld-Definitionen
 * @param {Object} values - Feld-Werte
 * @returns {Object} Validierungs-Ergebnis { valid: boolean, errors: Object }
 */
export function validateFields(fields, values) {
  const errors = {};

  fields.forEach(field => {
    if (field.required && !values[field.name]) {
      errors[field.name] = `${field.label} ist erforderlich`;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
