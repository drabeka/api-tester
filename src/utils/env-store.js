// Environment-Variablen Store (localStorage-basiert)

const STORAGE_KEY = 'api_tester_environments';
const ACTIVE_ENV_KEY = 'api_tester_active_env';

const DEFAULT_ENVIRONMENTS = [
  {
    name: 'Development',
    variables: {
      baseUrl: 'http://localhost:3000',
      apiKey: 'dev-key-123',
      timeout: '5000',
    },
  },
  {
    name: 'Staging',
    variables: {
      baseUrl: 'https://staging.example.com',
      apiKey: 'staging-key-456',
      timeout: '15000',
    },
  },
  {
    name: 'Production',
    variables: {
      baseUrl: 'https://api.example.com',
      apiKey: 'prod-key-789',
      timeout: '30000',
    },
  },
];

// --- Persistence ---

export function getEnvironments() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Fehler beim Laden der Environments:', e);
  }
  return DEFAULT_ENVIRONMENTS;
}

export function saveEnvironments(environments) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(environments));
  } catch (e) {
    console.error('Fehler beim Speichern der Environments:', e);
  }
}

export function getActiveEnvName() {
  try {
    return localStorage.getItem(ACTIVE_ENV_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function setActiveEnvName(name) {
  try {
    localStorage.setItem(ACTIVE_ENV_KEY, name);
  } catch (e) {
    console.error('Fehler beim Speichern des aktiven Environments:', e);
  }
}

// --- Variable Resolution ---

/**
 * Ersetzt {{variableName}} Platzhalter in einem String
 * @param {string} text - Text mit Platzhaltern
 * @param {Object} variables - Key-Value Map der Variablen
 * @returns {string} Text mit aufgelösten Variablen
 */
export function resolveVariables(text, variables) {
  if (!text || typeof text !== 'string' || !variables) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

/**
 * Findet alle {{variableName}} Platzhalter in einem String
 * @param {string} text - Text mit Platzhaltern
 * @returns {string[]} Gefundene Variablennamen
 */
export function findVariables(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = [];
  const regex = /\{\{(\w+)\}\}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }
  return matches;
}
