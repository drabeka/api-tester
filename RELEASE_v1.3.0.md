# API Test Framework v1.3.0 - Environment Variables, Response Headers & Refactoring

## New Features

### Environment Variables

- Environment-Manager im Header mit Selector-Dropdown
- Environments (Development, Staging, Production) mit Key-Value Variablen
- `{{variableName}}` Syntax in Endpoint-URLs wird automatisch aufgelöst
- Variablen-Editor: Environments und Variablen erstellen, bearbeiten, löschen
- Live-Vorschau der aktiven Variablen im Dropdown
- localStorage-Persistenz für Environments und aktive Auswahl

### Response Headers

- Aufklappbare Response-Headers-Sektion im ResponseViewer
- Zeigt Header-Anzahl und Key-Value Paare nach API-Aufruf

### Domain-Field Keyboard Navigation

- ArrowUp/Down navigiert zu allen Knoten (V, N, S Status)
- ArrowRight öffnet geschlossene Eltern-Knoten
- ArrowLeft schließt geöffnete Knoten oder springt zum Eltern-Knoten
- Enter selektiert nur bei Status V
- Standard Tree-View Verhalten (wie VS Code Explorer)

## Refactoring

- **useClickOutside Hook**: Gemeinsame Click-Outside-Logik aus ApiSelector und DomainField extrahiert
- **Shared Dropdown CSS**: Basis-Klassen `.dropdown-arrow`, `.dropdown-search-input`, `.dropdown-panel`
- **CSS Variables**: Alle verbleibenden Hardcoded-Farben durch CSS-Variablen ersetzt (~30 neue Variablen)
- **Method Badge CSS**: Inline-Styles durch `.method-get`/`.method-post`/etc. Klassen ersetzt
- **Param Badge CSS**: Inline-Styles durch `.param-badge-query`/`.param-badge-path`/etc. ersetzt
- **btn-small -> btn-sm**: Einheitliche Button-Klasse
- **Select CSS Scoping**: Globales Select-Styling auf Array/Object-Felder beschränkt

## Dateien

### Neu

- `src/components/EnvironmentManager.jsx` - Environment Selector + Editor
- `src/utils/env-store.js` - localStorage-Persistenz und Variable-Resolution
- `src/hooks/useClickOutside.js` - Gemeinsamer Click-Outside Hook

### Geändert

- `src/App.jsx` - Environment-State, EnvironmentManager im Header
- `src/components/RequestForm.jsx` - envVariables an apiClient weiterreichen
- `src/utils/apiClient.js` - `{{var}}` Substitution im Endpoint
- `src/components/DomainField.jsx` - Keyboard Navigation (Arrow Keys, Parent-Map)
- `src/components/ResponseViewer.jsx` - Response Headers Sektion
- `src/components/ApiSelector.jsx` - useClickOutside Hook, CSS-Klassen
- `src/components/FormField.jsx` - Param-Badge CSS-Klassen
- `src/components/History.jsx` - btn-sm Vereinheitlichung
- `src/components/HistoryItem.jsx` - btn-sm Vereinheitlichung
- `src/components/OpenAPIImportDialog.jsx` - Method Badge CSS-Klassen
- `src/styles/main.css` - ~400 neue Zeilen CSS (Env-Manager, Shared Dropdowns, Variables)
- `package.json` - Version 1.3.0

## Bundle

- **80.7kb** (von 74.7kb in v1.2.0)

## Installation

1. Download: `api-tester-v1.3.0.zip`
2. Entpacken
3. `node server.js` oder Doppelklick auf `start.bat`
4. Browser: `http://localhost:8080`

---

Built with React, esbuild & Node.js
