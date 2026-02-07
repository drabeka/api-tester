import React from 'react';

/**
 * Einzelner History-Eintrag
 * @param {Object} props
 * @param {Object} props.item - History-Item
 * @param {boolean} props.isFavorite - Ist als Favorit markiert
 * @param {Function} props.onToggleFavorite - Favorit togglen
 * @param {Function} props.onReplay - Request wiederholen
 * @param {Function} props.onDelete - Eintrag löschen
 */
export default function HistoryItem({ item, isFavorite, onToggleFavorite, onReplay, onDelete }) {
  const statusClass = item.status >= 200 && item.status < 300
    ? 'status-success'
    : 'status-error';

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

  return (
    <div className="history-item">
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
          onClick={() => onToggleFavorite(item.id)}
          title={isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
        <button
          className="btn-small btn-primary"
          onClick={() => onReplay(item)}
        >
          ↻ Wiederholen
        </button>
        <button
          className="btn-small btn-danger"
          onClick={() => onDelete(item.id)}
        >
          🗑️ Löschen
        </button>
      </div>
    </div>
  );
}
