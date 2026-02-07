import React, { useState, useEffect } from 'react';
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
  toggleFavorite,
  isFavorite,
} from '../utils/storage.js';

/**
 * Request-Historie mit Favoriten
 * @param {Object} props
 * @param {Function} props.onReplay - Callback zum Wiederholen eines Requests
 */
export default function History({ onReplay }) {
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'favorites'

  const loadHistory = () => {
    const historyData = getHistory();
    setHistory(historyData);
    // Favorites aktualisieren
    const favIds = historyData
      .filter(item => isFavorite(item.id))
      .map(item => item.id);
    setFavorites(favIds);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = (id) => {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      deleteHistoryItem(id);
      loadHistory();
    }
  };

  const handleClearAll = () => {
    if (confirm('Möchten Sie die gesamte Historie wirklich löschen?')) {
      clearHistory();
      loadHistory();
    }
  };

  const handleToggleFavorite = (id) => {
    toggleFavorite(id);
    loadHistory();
  };

  const handleReplay = (item) => {
    onReplay({
      apiId: item.apiId,
      payload: item.payload,
    });
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const filteredHistory = filter === 'favorites'
    ? history.filter(item => favorites.includes(item.id))
    : history;

  return (
    <div className="history">
      <div className="history-header">
        <h3>Request-Historie</h3>
        <div className="history-controls">
          <div className="filter-buttons">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              Alle ({history.length})
            </button>
            <button
              className={filter === 'favorites' ? 'active' : ''}
              onClick={() => setFilter('favorites')}
            >
              ⭐ Favoriten ({favorites.length})
            </button>
          </div>
          {history.length > 0 && (
            <button
              className="btn-danger btn-small"
              onClick={handleClearAll}
            >
              Alle löschen
            </button>
          )}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <p className="no-history">
          {filter === 'favorites' ? 'Keine Favoriten vorhanden.' : 'Noch keine Requests in der Historie.'}
        </p>
      ) : (
        <div className="history-list">
          {filteredHistory.map(item => {
            const statusClass = item.status >= 200 && item.status < 300
              ? 'status-success'
              : 'status-error';

            return (
              <div key={item.id} className="history-item">
                <div className="history-item-header">
                  <span className="api-name">{item.apiName}</span>
                  <span className={`status ${statusClass}`}>
                    {item.status} {item.statusText}
                  </span>
                  <span className="timestamp">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>

                <div className="history-item-details">
                  <div className="endpoint">
                    <strong>{item.method}</strong> {item.endpoint}
                  </div>
                  {item.duration && (
                    <div className="duration">{item.duration}ms</div>
                  )}
                </div>

                <div className="history-item-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleToggleFavorite(item.id)}
                    title={favorites.includes(item.id) ? 'Favorit entfernen' : 'Als Favorit markieren'}
                  >
                    {favorites.includes(item.id) ? '⭐' : '☆'}
                  </button>
                  <button
                    className="btn-small btn-primary"
                    onClick={() => handleReplay(item)}
                  >
                    ↻ Wiederholen
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    🗑️ Löschen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
