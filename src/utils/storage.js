// LocalStorage-Wrapper für Historie, Favoriten und Auth-Konfigurationen

const STORAGE_KEYS = {
  HISTORY: 'api_tester_history',
  FAVORITES: 'api_tester_favorites',
  AUTH: 'api_tester_auth',
};

const MAX_HISTORY_ITEMS = 20;

// Helper-Funktionen
const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

// History-Management
export const getHistory = () => {
  return getFromStorage(STORAGE_KEYS.HISTORY, []);
};

export const addToHistory = (requestData) => {
  const history = getHistory();
  const newEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...requestData,
  };

  // Neueste zuerst, max. 20 Einträge (FIFO)
  const updatedHistory = [newEntry, ...history].slice(0, MAX_HISTORY_ITEMS);
  setToStorage(STORAGE_KEYS.HISTORY, updatedHistory);

  return newEntry;
};

export const deleteHistoryItem = (id) => {
  const history = getHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  setToStorage(STORAGE_KEYS.HISTORY, updatedHistory);
};

export const clearHistory = () => {
  setToStorage(STORAGE_KEYS.HISTORY, []);
};

// Favoriten-Management
export const getFavorites = () => {
  return getFromStorage(STORAGE_KEYS.FAVORITES, []);
};

export const toggleFavorite = (requestId) => {
  const favorites = getFavorites();
  const index = favorites.indexOf(requestId);

  if (index > -1) {
    // Entfernen
    favorites.splice(index, 1);
  } else {
    // Hinzufügen
    favorites.push(requestId);
  }

  setToStorage(STORAGE_KEYS.FAVORITES, favorites);
  return favorites;
};

export const isFavorite = (requestId) => {
  const favorites = getFavorites();
  return favorites.includes(requestId);
};

// Auth-Konfiguration pro API
export const getAuthConfig = (apiId) => {
  const allAuth = getFromStorage(STORAGE_KEYS.AUTH, {});
  return allAuth[apiId] || null;
};

export const setAuthConfig = (apiId, authConfig) => {
  const allAuth = getFromStorage(STORAGE_KEYS.AUTH, {});
  allAuth[apiId] = authConfig;
  setToStorage(STORAGE_KEYS.AUTH, allAuth);
};

export const clearAuthConfig = (apiId) => {
  const allAuth = getFromStorage(STORAGE_KEYS.AUTH, {});
  delete allAuth[apiId];
  setToStorage(STORAGE_KEYS.AUTH, allAuth);
};
