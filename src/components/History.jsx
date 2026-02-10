import React, { useState, useEffect } from 'react';
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
  toggleFavorite,
  isFavorite,
} from '../utils/storage.js';
import EmptyState from './EmptyState.jsx';
import HistoryItem from './HistoryItem.jsx';

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
              className="btn-danger btn-sm"
              onClick={handleClearAll}
            >
              Alle löschen
            </button>
          )}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <EmptyState
          icon={filter === 'favorites' ? '⭐' : '📜'}
          message={filter === 'favorites' ? 'Keine Favoriten vorhanden.' : 'Noch keine Requests in der Historie.'}
        />
      ) : (
        <div className="history-list">
          {filteredHistory.map(item => (
            <HistoryItem
              key={item.id}
              item={item}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={handleToggleFavorite}
              onReplay={handleReplay}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
