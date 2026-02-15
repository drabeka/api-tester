import { useState, useRef, useCallback } from 'react';
import useClickOutside from './useClickOutside.js';

/**
 * Hook fuer gemeinsame Dropdown-Logik (open/close, click-outside, search, Escape).
 * @param {Object} [options]
 * @param {Function} [options.onClose] - Zusaetzlicher Callback beim Schliessen
 * @returns {{ isOpen, setIsOpen, containerRef, searchTerm, setSearchTerm, open, close, toggle, getContainerProps }}
 */
export default function useDropdown(options = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
    options.onClose?.();
  }, [options.onClose]);

  const open = useCallback(() => setIsOpen(true), []);
  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (prev) {
        setSearchTerm('');
        options.onClose?.();
      }
      return !prev;
    });
  }, [options.onClose]);

  useClickOutside(containerRef, close);

  const getContainerProps = useCallback((extraOnKeyDown) => ({
    ref: containerRef,
    onKeyDown: (e) => {
      if (e.key === 'Escape') { close(); e.stopPropagation(); }
      extraOnKeyDown?.(e);
    },
  }), [close]);

  return {
    isOpen, setIsOpen,
    containerRef,
    searchTerm, setSearchTerm,
    open, close, toggle,
    getContainerProps,
  };
}
