# API Test Framework v1.2.0 - Domain Fields, CSS Consistency & Unified Dropdowns

**Feature Release** - Domänenkonzept, einheitliche Styles und vereinheitlichte Dropdown-Komponente

## ✨ Neue Features

### Domain Fields
- **Wiederverwendbare Domänen-Daten** (`config/domains.json`) als eigenständige Konfigurationsdatei
- **Hierarchische Baumauswahl** mit auf-/zuklappbaren Gruppen
- **Status-System**: V=verfügbar, N=nicht verfügbar, S=nicht mehr auswählbar (ehemals gültig)
- **Suchfunktion** filtert rekursiv nach Code und Name
- **Code-Badge** zeigt den ausgewählten Wert prominent an
- Domänen werden als Array mit `code`, `name`, `values` definiert
- Felder referenzieren Domänen per `"type": "domain", "domain": "laender"`

### Unified Dropdown Component
- **Select-Felder** verwenden jetzt dieselbe DomainField-Komponente
- **Einheitliches Look & Feel** für alle Auswahl-Felder (select + domain)
- Natives `<select>`-Element durch Custom-Dropdown mit Suche ersetzt

### Save API Config
- **Server-Endpoint** `POST /api/save-config` zum Speichern der apis.json
- **Save-Button** im Header zum persistenten Speichern importierter APIs

## 🎨 CSS Consistency

- **25+ CSS-Variablen** in `:root` eingeführt (Farben, Backgrounds, Borders, Radii, Shadows)
- **60+ hardcodierte Farbwerte** durch Variablen ersetzt
- **Alle 20 `!important`-Deklarationen** entfernt
- **Einheitliche Button-Styles**: Header-Buttons nutzen `.btn-secondary.btn-sm` statt eigener Klassen
- **Bug Fix**: `array-sub-field` → `array-object-field` (CSS-Klasse stimmte nie überein)
- **Bug Fix**: `param-type-badge` von 8 Inline-Styles auf CSS-Klasse umgestellt
- **EmptyState**: Inline-Styles durch CSS-Klasse `.empty-state-icon` ersetzt

## 🐛 Bugfixes

- **Array-Validierung**: Required-Check für leere Arrays bei query-Parametern (z.B. findByTags)
- **Validierungs-Regression behoben**: `value.length === 0` statt Filter auf Default-Werte

## 📊 Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `config/domains.json` | **Neu** - Domänen-Definitionen (laender, ausbildung) |
| `src/components/DomainField.jsx` | **Neu** - Tree-View-Dropdown-Komponente |
| `src/styles/main.css` | CSS-Variablen, !important entfernt, Domain-Styles |
| `src/components/FormField.jsx` | Domain-Typ, Select→DomainField, Bug-Fixes |
| `src/App.jsx` | Domains laden, Save-Button, btn-Klassen |
| `src/components/RequestForm.jsx` | Domains Prop weiterleiten |
| `src/utils/apiClient.js` | Array-Validierung Fix |
| `src/components/EmptyState.jsx` | Inline-Styles → CSS-Klasse |
| `src/shims/react.js` | useCallback Export |
| `server.js` | POST /api/save-config Endpoint |
| `config/apis.json` | Domain-Demo-Felder, OpenAPI-Import |
| `package.json` | Version 1.2.0 |

## 📦 Installation

### Neu-Installation

1. **Download:** `api-tester-v1.2.0.zip` oder `api-tester-v1.2.0.tar.gz`
2. **Entpacken:** Entpacken Sie das Archiv
3. **Starten:**
   - Windows: Doppelklick auf `start.bat`
   - Linux/Mac: `node server.js`
4. **Öffnen:** `http://localhost:8080` im Browser

### Upgrade von v1.1.x

1. **Stoppen** Sie den Server (Strg+C)
2. **Ersetzen** Sie alle Dateien (Backup von `config/apis.json` empfohlen)
3. **Neu:** `config/domains.json` hinzufügen
4. **Starten** Sie den Server neu

## ⚙️ Voraussetzungen

- Node.js v16+
- Kein npm install erforderlich
- Moderne Browser

## 🔗 Links

- **Previous Release:** v1.1.3
- **GitHub:** https://github.com/drabeka/api-tester

---

Built with React, esbuild & Node.js
