// API-Client mit Auth-Unterstützung

import { addToHistory } from './storage.js';

const DEFAULT_TIMEOUT = 30000; // 30 Sekunden

/**
 * Verarbeitet Parameter nach Typ (path, query, header, body)
 * @param {string} endpoint - Basis-Endpoint mit Platzhaltern
 * @param {Object} payload - Alle Feld-Werte
 * @param {Array} fields - Field-Definitionen mit paramType
 * @returns {Object} { finalEndpoint, bodyPayload, customHeaders }
 */
function processParameters(endpoint, payload, fields) {
  let finalEndpoint = endpoint;
  const bodyPayload = {};
  const customHeaders = {};
  const queryParams = [];

  fields.forEach(field => {
    const value = payload[field.name];
    const paramType = field.paramType || 'body';

    // Skip undefined/null values
    if (value === undefined || value === null || value === '') {
      return;
    }

    switch (paramType) {
      case 'path':
        // Ersetze {paramName} im Endpoint
        finalEndpoint = finalEndpoint.replace(`{${field.name}}`, encodeURIComponent(value));
        break;

      case 'query':
        // Füge zu Query-String hinzu - Arrays als repeated params
        if (Array.isArray(value)) {
          value.forEach(v => {
            if (v !== undefined && v !== null && v !== '') {
              queryParams.push(`${encodeURIComponent(field.name)}=${encodeURIComponent(v)}`);
            }
          });
        } else {
          queryParams.push(`${encodeURIComponent(field.name)}=${encodeURIComponent(value)}`);
        }
        break;

      case 'header':
        // Füge zu Custom-Headers hinzu
        customHeaders[field.name] = value;
        break;

      case 'body':
      default:
        // Füge zu Body-Payload hinzu
        bodyPayload[field.name] = value;
        break;
    }
  });

  // Query-String an Endpoint anhängen
  if (queryParams.length > 0) {
    const separator = finalEndpoint.includes('?') ? '&' : '?';
    finalEndpoint += separator + queryParams.join('&');
  }

  return { finalEndpoint, bodyPayload, customHeaders };
}

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
    fields = [],
    authConfig = null,
    apiId,
    apiName,
    timeout = DEFAULT_TIMEOUT,
    useProxy = true, // CORS-Proxy standardmäßig aktiviert
    contentType = 'application/json', // Default Content-Type
    accept = '*/*', // Default Accept Header
  } = options;

  // Parameter nach Typ verarbeiten
  let { finalEndpoint, bodyPayload, customHeaders } = processParameters(endpoint, payload, fields);

  // Headers vorbereiten
  const headers = { ...customHeaders };

  // Accept Header immer setzen (aus Config oder Default)
  if (accept) {
    headers['Accept'] = accept;
  }

  // Prüfen ob bodyPayload Inhalt hat (nicht leer)
  const hasPayload = bodyPayload &&
    (typeof bodyPayload === 'string' ? bodyPayload.length > 0 : Object.keys(bodyPayload).length > 0);

  // Content-Type nur bei POST/PUT/PATCH mit nicht-leerem Body setzen
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && hasPayload) {
    headers['Content-Type'] = contentType; // Aus Config oder Default
  }

  // Auth hinzufügen
  if (authConfig) {
    if (authConfig.type === 'bearer') {
      headers['Authorization'] = `Bearer ${authConfig.token}`;
    } else if (authConfig.type === 'apikey') {
      const keyName = authConfig.keyName || authConfig.headerName || 'X-API-Key';
      const keyLocation = authConfig.keyLocation || 'header';
      const keyValue = authConfig.apiKey;

      if (keyValue) {
        switch (keyLocation) {
          case 'query': {
            // API-Key als Query-Parameter
            const separator = finalEndpoint.includes('?') ? '&' : '?';
            finalEndpoint += `${separator}${encodeURIComponent(keyName)}=${encodeURIComponent(keyValue)}`;
            break;
          }
          case 'cookie':
            // API-Key als Cookie
            headers['Cookie'] = `${keyName}=${keyValue}`;
            break;
          case 'header':
          default:
            // API-Key als Header
            headers[keyName] = keyValue;
            break;
        }
      }
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
          url: finalEndpoint,
          method: method,
          headers: headers,
          body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? bodyPayload : undefined
        }),
        signal: controller.signal
      };
    } else {
      // Direkter Request (kann CORS-Fehler verursachen)
      fetchUrl = finalEndpoint;
      requestConfig = {
        method,
        headers,
        signal: controller.signal
      };

      // Body nur bei POST/PUT/PATCH hinzufügen
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        requestConfig.body = JSON.stringify(bodyPayload);
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
    endpoint: finalEndpoint,
    method,
    payload: bodyPayload,
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
