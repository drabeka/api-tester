import React, { useEffect, useRef } from 'react';

/**
 * Modal-Dialog als Ersatz für native confirm() und alert()
 * @param {Object} props
 * @param {string} props.message - Anzuzeigende Nachricht
 * @param {Function} props.onConfirm - Callback bei Bestätigung
 * @param {Function} [props.onCancel] - Callback bei Abbruch (entfällt bei variant='alert')
 * @param {string} [props.confirmLabel='Löschen'] - Text des Bestätigungs-Buttons
 * @param {string} [props.cancelLabel='Abbrechen'] - Text des Abbruch-Buttons
 * @param {boolean} [props.danger=true] - Danger-Styling für Bestätigungs-Button
 * @param {'confirm'|'alert'} [props.variant='confirm'] - Dialog-Typ
 * @param {'success'|'error'|'info'} [props.type] - Visueller Typ für alert-Variante
 * @param {number} [props.autoClose] - Auto-Close nach ms (nur für alert-Variante)
 */
export default function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel = 'Abbrechen',
  danger = true,
  variant = 'confirm',
  type,
  autoClose,
}) {
  const isAlert = variant === 'alert';
  const btnLabel = confirmLabel || (isAlert ? 'OK' : 'Löschen');
  const close = isAlert ? onConfirm : onCancel;
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') close();
      if (isAlert && e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', handleKey);
    confirmBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [close, onConfirm, isAlert]);

  useEffect(() => {
    if (autoClose && autoClose > 0) {
      const timer = setTimeout(() => close(), autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, close]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  const alertIcon = type === 'success' ? '\u2705' : type === 'error' ? '\u274C' : null;
  const btnClass = isAlert ? 'btn-primary' : (danger ? 'btn-danger' : 'btn-primary');

  return (
    <div className="confirm-overlay" onClick={handleOverlayClick}>
      <div className="confirm-dialog">
        <p className="confirm-message">
          {alertIcon && <span className="confirm-icon">{alertIcon}</span>}
          {message}
        </p>
        <div className="confirm-actions">
          {!isAlert && (
            <button className="btn-secondary btn-sm" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            ref={confirmBtnRef}
            className={`${btnClass} btn-sm`}
            onClick={onConfirm}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
