import { useEffect } from 'react';

/**
 * Hook: Schließt ein Element wenn außerhalb geklickt wird
 * @param {React.RefObject} ref - Referenz auf das Container-Element
 * @param {Function} onClickOutside - Callback bei Klick außerhalb
 */
export default function useClickOutside(ref, onClickOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClickOutside();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClickOutside]);
}
