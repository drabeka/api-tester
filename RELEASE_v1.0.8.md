# API Test Framework v1.0.8 - Form Validation & Advanced Features 🚀

**Major Feature Release** - Umfassende Validierung, UX-Verbesserungen und Advanced Features!

## ✨ Neue Features

### Phase 1: Validation 🔒

**Field-Level Validation:**
- ✅ **Number-Validierung:** `min`, `max` mit custom Error-Messages
- ✅ **String-Validierung:** `minLength`, `maxLength`
- ✅ **Pattern/Regex:** `pattern` für Text-Felder (E-Mail, PLZ, etc.)
- ✅ **Custom Error Messages:** Alle Validierungen anpassbar

**Config-Beispiel:**
```json
{
  "name": "age",
  "type": "number",
  "min": 18,
  "max": 99,
  "minError": "Sie müssen mindestens 18 Jahre alt sein",
  "maxError": "Maximalalter ist 99 Jahre"
},
{
  "name": "email",
  "type": "text",
  "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
  "patternError": "Bitte gültige E-Mail-Adresse eingeben"
}
```

### Phase 2: UX Features 🎨

**Verbessertes User Experience:**
- ✅ **HelpText:** `helpText` für Erklärungen unter Feldern
- ✅ **Beispielwerte-Button:** Füllt alle Felder mit `exampleValue`/`defaultValue`
- ✅ **Date-Felder:** `type="date"` mit min/max Validierung
- ✅ **Placeholder:** `placeholder` für alle Input-Typen

**Config-Beispiel:**
```json
{
  "name": "username",
  "type": "text",
  "minLength": 3,
  "maxLength": 20,
  "helpText": "3-20 Zeichen, nur Buchstaben, Zahlen und Unterstriche",
  "placeholder": "max_mustermann",
  "exampleValue": "max_mustermann"
},
{
  "name": "birthdate",
  "type": "date",
  "min": "1920-01-01",
  "max": "2010-12-31",
  "helpText": "Sie müssen zwischen 1920 und 2010 geboren sein"
}
```

### Phase 3: Advanced Features 🎯

**Field Groups & Conditional Logic:**
- ✅ **Sections:** `sections` statt `fields` für gruppierte Darstellung
- ✅ **Conditional Fields:** `showIf` für dynamische Feldanzeige
- ✅ **Array-Unterstützung:** showIf akzeptiert einzelnen Wert oder Array

**Sections-Beispiel:**
```json
{
  "sections": [
    {
      "title": "👤 Persönliche Daten",
      "description": "Grundlegende Informationen über Sie",
      "fields": [...]
    },
    {
      "title": "🏠 Wohnsituation",
      "description": "Angaben zu Ihrem Wohnsitz",
      "fields": [...]
    }
  ]
}
```

**Conditional Fields-Beispiel:**
```json
{
  "name": "otherNationality",
  "label": "Welche Staatsangehörigkeit?",
  "type": "text",
  "required": true,
  "showIf": {
    "field": "nationality",
    "value": "OTHER"
  }
},
{
  "name": "monthlyIncome",
  "type": "number",
  "showIf": {
    "field": "employmentStatus",
    "value": ["EMPLOYED", "SELFEMPLOYED"]
  }
}
```

## 🐛 Bugfixes

- ✅ **Conditional Fields:** Unsichtbare Felder werden nicht mehr an API gesendet
- ✅ **Validierung:** Nur sichtbare Felder werden validiert

## 📊 Metriken

### Build-Statistik
- **Bundle:** 16.3KB (v1.0.7: 14.1KB, +2.2KB für alle Features)
- **CSS:** 9.1KB (mit Section-Styles)
- **Neue Config-Properties:** 15
- **Breaking Changes:** ❌ Keine

### Code-Qualität
- ✅ Erweiterte Validierungs-Engine
- ✅ Smart Conditional Rendering
- ✅ Separate Section-Styles
- ✅ Browser-native Date-Picker

## 📦 Installation

### Neu-Installation

1. **Download**: `api-tester-v1.0.8.tar.gz`
2. **Entpacken**: `tar -xzf api-tester-v1.0.8.tar.gz`
3. **Starten**: Doppelklick auf `start.bat` (Windows) oder `node server.js`
4. **Öffnen**: `http://localhost:3000`

### Upgrade von v1.0.7

**Keine Breaking Changes!** Einfaches Update:

1. **Stoppen** Sie den Server (Strg+C)
2. **Backup** Ihrer `config/apis.json` (optional)
3. **Ersetzen** Sie folgende Dateien:
   - `dist/bundle.js` ← Neue Validierung & Features
   - `dist/styles.css` ← Section-Styles
   - `src/` ← Erweiterte Komponenten
4. **Starten** Sie den Server neu

Ihre `config/apis.json` bleibt kompatibel!

### Upgrade von v1.0.0-v1.0.6

Empfehlung: Komplettes Projekt ersetzen, nur `config/apis.json` behalten.

## 🔄 Changelog

### v1.0.8 (2026-02-07)

**[ADDED]** 🔒 Phase 1 - Validation
- ✅ Number min/max mit custom Errors
- ✅ String minLength/maxLength
- ✅ Pattern/Regex für Text-Felder
- ✅ Custom Error Messages für alle Validierungen
- ✅ requiredError für Pflichtfelder

**[ADDED]** 🎨 Phase 2 - UX Features
- ✅ helpText für Feld-Erklärungen
- ✅ "📋 Beispielwerte füllen"-Button
- ✅ Date-Feldtyp mit min/max
- ✅ exampleValue Property

**[ADDED]** 🎯 Phase 3 - Advanced Features
- ✅ Sections für gruppierte Felder
- ✅ Conditional Fields (showIf)
- ✅ Array-Syntax für showIf (mehrere Werte)
- ✅ Section-Titel und Beschreibung

**[IMPROVED]** 🔧
- ✅ Validierung nur für sichtbare Felder
- ✅ API-Payload nur mit sichtbaren Feldern
- ✅ Browser-native Date-Picker
- ✅ Bessere Error-Messages

**[FIXED]** 🐛
- ✅ Conditional Fields: Unsichtbare Felder nicht mehr im Payload
- ✅ Validierung: Versteckte Felder werden ignoriert

**[TECHNICAL]**
- Bundle: 16.3KB (+2.2KB für alle Features)
- CSS: 9.1KB (mit Section-Styles)
- Neue Demo-APIs: 2 (Validation Demo, Advanced Features Demo)
- Keine Breaking Changes

## 🧪 Demo-APIs

### 1. Validation Demo API
Zeigt alle Validierungs-Features:
- Number min/max (Alter 18-99, Gehalt 0-1M)
- String minLength/maxLength (Username 3-20)
- Pattern (E-Mail, PLZ)
- Date mit Bereich (1920-2010)
- Custom Error Messages

### 2. Advanced Features Demo
Zeigt Sections & Conditional Fields:
- 3 Sections: Persönliche Daten, Wohnsituation, Finanzen
- Conditional: Staatsangehörigkeit → Extra-Feld
- Conditional: Wohnsituation → Miete oder Eigentum
- Conditional: Beschäftigungsstatus → Einkommen & Firma/Name

## 🎓 Für Entwickler

### Alle neuen Config-Properties

```json
{
  "fields": [
    {
      "name": "fieldName",
      "type": "text|number|select|textarea|date",

      // Validation (NEU)
      "min": 18,                    // Number/Date minimum
      "max": 99,                    // Number/Date maximum
      "minLength": 3,               // String minimum length
      "maxLength": 20,              // String maximum length
      "pattern": "^[a-zA-Z0-9_]+$", // Regex pattern

      // Custom Errors (NEU)
      "minError": "Custom message",
      "maxError": "Custom message",
      "minLengthError": "Custom message",
      "maxLengthError": "Custom message",
      "patternError": "Custom message",
      "requiredError": "Custom message",

      // UX (NEU)
      "helpText": "Erklärung",
      "placeholder": "Beispiel",
      "exampleValue": "max_mustermann",

      // Conditional (NEU)
      "showIf": {
        "field": "dependentField",
        "value": "expectedValue"      // oder ["value1", "value2"]
      }
    }
  ]
}
```

### Sections statt Fields

```json
{
  "sections": [
    {
      "title": "👤 Sektion-Titel",
      "description": "Optional: Beschreibung",
      "fields": [...]
    }
  ]
}
```

## 🔗 Links

- **GitHub Release**: https://github.com/drabeka/api-tester/releases/tag/v1.0.8
- **Download**: https://github.com/drabeka/api-tester/releases/download/v1.0.8/api-tester-v1.0.8.tar.gz
- **Issues**: https://github.com/drabeka/api-tester/issues
- **Previous Release**: [v1.0.7](RELEASE_v1.0.7.md)

## ⚙️ Voraussetzungen

- Node.js v16+ (keine Änderung)
- Kein npm install erforderlich für Endnutzer
- Moderne Browser mit Date-Picker-Support

## 🎯 Migration Guide

### Von v1.0.7 zu v1.0.8

**Keine Breaking Changes!** Alle bestehenden APIs funktionieren weiter.

**Was ist neu:**
- Alle bestehenden Fields können mit Validierung erweitert werden
- Sections ist optional (kann neben fields verwendet werden)
- Conditional Fields sind optional
- Alle neuen Properties sind optional

**Empfohlene Erweiterungen:**
1. Füge `min`/`max` zu Zahlenfeldern hinzu
2. Füge `pattern` zu E-Mail/PLZ-Feldern hinzu
3. Füge `helpText` für komplexe Felder hinzu
4. Füge `exampleValue` für schnelleres Testing hinzu

### Backward Compatibility

✅ **100% kompatibel** - Alle v1.0.0-v1.0.7 Configs funktionieren ohne Änderung!

---

**Empfehlung**: **Upgrade auf v1.0.8** für professionelle Validierung und bessere UX!

Built with ❤️ using React, esbuild & Node.js
