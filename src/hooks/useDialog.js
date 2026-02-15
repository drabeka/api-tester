import React, { useState, useCallback } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

/**
 * Hook fuer zentrales Dialog-Management (confirm + alert).
 * Eliminiert Boilerplate: kein manueller State, kein JSX pro Komponente.
 *
 * @returns {{ showAlert, showConfirm, DialogRenderer }}
 *
 * @example
 * const { showAlert, showConfirm, DialogRenderer } = useDialog();
 * showAlert('Gespeichert!', 'success');
 * showConfirm('Wirklich loeschen?', () => doDelete());
 * // Im JSX: <DialogRenderer />
 */
export default function useDialog() {
  const [dialog, setDialog] = useState(null);

  const close = useCallback(() => setDialog(null), []);

  const showAlert = useCallback((message, type, autoClose = 2000) => {
    setDialog({ variant: 'alert', message, type, autoClose, onConfirm: close });
  }, [close]);

  const showConfirm = useCallback((message, onConfirm, options = {}) => {
    setDialog({
      variant: 'confirm',
      message,
      onConfirm: () => { onConfirm(); close(); },
      onCancel: close,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      danger: options.danger !== undefined ? options.danger : true,
    });
  }, [close]);

  const DialogRenderer = useCallback(() => {
    if (!dialog) return null;
    return React.createElement(ConfirmDialog, { ...dialog, onCancel: dialog.onCancel || close });
  }, [dialog, close]);

  return { showAlert, showConfirm, DialogRenderer };
}
