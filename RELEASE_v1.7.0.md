# API Test Framework v1.7.0 - Shared Dropdown Hook

## Refactoring

### useDropdown Hook (NEU)
- Gemeinsame Dropdown-Basismechanik aus 3 Komponenten extrahiert
- Kapselt: `isOpen` State, `containerRef`, `searchTerm`, Click-Outside, Close-Logik
- Optionaler `onClose` Callback fuer komponentenspezifisches Cleanup
- API: `{ isOpen, containerRef, searchTerm, setSearchTerm, open, close, toggle }`
- Nutzt intern den bestehenden `useClickOutside` Hook

### Vereinfachte Komponenten
- **ApiSelector.jsx** - 28 Zeilen entfernt: eigener `isOpen`/`searchTerm` State, `useRef`, `useClickOutside`, Escape-Handler
- **DomainField.jsx** - 26 Zeilen entfernt: eigener `isOpen`/`searchTerm` State, `useRef`, `useClickOutside` mit `onBlur`-Callback, Escape-Handler (Arrow/Enter Navigation bleibt komponentenspezifisch)
- **EnvironmentManager.jsx** - 29 Zeilen entfernt: eigener `isOpen` State, `useRef`, `useClickOutside` mit Editor-Reset, `handleKeyDown` Funktion (Editor-Modus bleibt komponentenspezifisch)

## Dateien

### Neu
- `src/hooks/useDropdown.js` - Gemeinsamer Dropdown Hook (~50 Zeilen)

### Geaendert
- `src/components/ApiSelector.jsx` - useDropdown statt manueller Dropdown-Logik
- `src/components/DomainField.jsx` - useDropdown mit onClose fuer onBlur-Weiterleitung
- `src/components/EnvironmentManager.jsx` - useDropdown mit onClose fuer Editor-Reset
- `package.json` - Version 1.7.0

## Bundle

- **84.1kb** (von 83.7kb in v1.6.0)

## Installation

1. Download: `api-tester-v1.7.0.zip`
2. Entpacken
3. `node server.js` oder Doppelklick auf `start.bat`
4. Browser: `http://localhost:8080`

---

Built with React, esbuild & Node.js
