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
    contentType = 'application/json', // Default Content-Type
    accept = '*/*', // Default Accept Header
  } = options;

  // Headers vorbereiten
  const headers = {};

  // Accept Header immer setzen (aus Config oder Default)
  if (accept) {
    headers['Accept'] = accept;
  }

  // Prüfen ob payload Inhalt hat (nicht leer)
  const hasPayload = payload &&
    (typeof payload === 'string' ? payload.length > 0 : Object.keys(payload).length > 0);

  // Content-Type nur bei POST/PUT/PATCH mit nicht-leerem Body setzen
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && hasPayload) {
    headers['Content-Type'] = contentType; // Aus Config oder Default
  }

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
    const value = values[field.name];

    // Required-Validierung
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = field.requiredError || `${field.label} ist erforderlich`;
      return;
    }

    // Weitere Validierungen nur wenn Wert vorhanden
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Number-Validierungen
    if (field.type === 'number') {
      const numValue = parseFloat(value);

      if (isNaN(numValue)) {
        errors[field.name] = `${field.label} muss eine Zahl sein`;
        return;
      }

      if (field.min !== undefined && numValue < field.min) {
        errors[field.name] = field.minError || `${field.label} muss mindestens ${field.min} sein`;
        return;
      }

      if (field.max !== undefined && numValue > field.max) {
        errors[field.name] = field.maxError || `${field.label} darf maximal ${field.max} sein`;
        return;
      }
    }

    // String-Validierungen
    if (field.type === 'text' || field.type === 'textarea') {
      const strValue = String(value);

      if (field.minLength !== undefined && strValue.length < field.minLength) {
        errors[field.name] = field.minLengthError || `${field.label} muss mindestens ${field.minLength} Zeichen lang sein`;
        return;
      }

      if (field.maxLength !== undefined && strValue.length > field.maxLength) {
        errors[field.name] = field.maxLengthError || `${field.label} darf maximal ${field.maxLength} Zeichen lang sein`;
        return;
      }

      // Pattern/Regex-Validierung
      if (field.pattern) {
        const regex = new RegExp(field.pattern);
        if (!regex.test(strValue)) {
          errors[field.name] = field.patternError || `${field.label} hat ein ungültiges Format`;
          return;
        }
      }
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
