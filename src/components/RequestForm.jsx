import React, { useState, useEffect } from 'react';
import { makeApiRequest, validateFields } from '../utils/apiClient.js';
import { getAuthConfig } from '../utils/storage.js';
import FormField from './FormField.jsx';
import EmptyState from './EmptyState.jsx';

/**
 * Dynamisches Formular für API-Requests
 * @param {Object} props
 * @param {Object} props.api - API-Definition
 * @param {Function} props.onResponse - Callback mit Response-Daten
 * @param {Object} props.initialValues - Vorausgefüllte Werte (z.B. aus Historie)
 */
export default function RequestForm({ api, onResponse, initialValues = null, domains = {}, envVariables = null }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialisiere Formular mit Defaultwerten oder initialValues
  useEffect(() => {
    if (api) {
      const defaultData = {};
      const allFields = getAllFields(api);

      allFields.forEach(field => {
        if (initialValues && initialValues[field.name] !== undefined) {
          defaultData[field.name] = initialValues[field.name];
        } else if (field.type === 'array') {
          defaultData[field.name] = field.defaultValue !== undefined ? field.defaultValue : [];
        } else {
          defaultData[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
        }
      });
      setFormData(defaultData);
      setErrors({});
    }
  }, [api, initialValues]);

  // Hilfsfunktion: Alle Felder sammeln (aus fields oder sections)
  const getAllFields = (api) => {
    if (api.sections) {
      // Sections-Modus: Alle Felder aus allen Sections sammeln
      return api.sections.flatMap(section => section.fields || []);
    }
    // Legacy-Modus: Direkte fields
    return api.fields || [];
  };

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    // Fehler löschen bei Eingabe
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Nur sichtbare Felder validieren
    const allFields = getAllFields(api);
    const visibleFields = allFields.filter(field => shouldShowField(field));

    const validation = validateFields(visibleFields, formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Nur sichtbare Feld-Werte für Payload verwenden
      const visiblePayload = {};
      visibleFields.forEach(field => {
        if (formData[field.name] !== undefined) {
          visiblePayload[field.name] = formData[field.name];
        }
      });

      // Auth-Konfiguration laden
      const authConfig = getAuthConfig(api.id);

      // API-Request durchführen
      const response = await makeApiRequest({
        endpoint: api.endpoint,
        method: api.method,
        payload: visiblePayload,  // Nur sichtbare Felder
        fields: visibleFields,    // Field-Definitionen für Parameter-Verarbeitung
        authConfig,
        apiId: api.id,
        apiName: api.name,
        contentType: api.contentType, // Custom Content-Type aus Config
        accept: api.accept,           // Custom Accept Header aus Config
        useProxy: api.corsProxy !== false, // Default true, false wenn explizit deaktiviert
        envVariables, // Environment-Variablen für {{var}} Substitution
      });

      // Response an Parent weitergeben
      onResponse(response);

    } catch (error) {
      onResponse({
        ok: false,
        status: 0,
        statusText: 'Error',
        data: null,
        error: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter zum Absenden
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleFillExamples = () => {
    if (!api) return;

    const exampleData = {};
    const allFields = getAllFields(api);

    allFields.forEach(field => {
      // Verwende exampleValue falls vorhanden, sonst defaultValue
      const valueToUse = field.exampleValue !== undefined
        ? field.exampleValue
        : field.defaultValue;

      if (valueToUse !== undefined) {
        exampleData[field.name] = valueToUse;
      } else if (field.type === 'array' && !exampleData[field.name]) {
        exampleData[field.name] = [];
      }
    });

    setFormData(exampleData);
    setErrors({});
  };

  if (!api) {
    return (
      <div className="request-form">
        <EmptyState icon="📝" message="Bitte wählen Sie eine API aus." />
      </div>
    );
  }

  // Prüft, ob ein Feld angezeigt werden soll (showIf-Bedingung)
  const shouldShowField = (field) => {
    if (!field.showIf) return true;

    const { field: dependentField, value: expectedValue } = field.showIf;
    const currentValue = formData[dependentField];

    // Unterstützt String-Vergleich und Array (mehrere mögliche Werte)
    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(currentValue);
    }

    return currentValue === expectedValue;
  };

  // Rendert ein einzelnes Feld
  const renderField = (field) => {
    // Prüfe showIf-Bedingung
    if (!shouldShowField(field)) {
      return null;
    }

    const handleFieldChange = (e) => {
      const value = field.type === 'number'
        ? (e.target.value === '' ? '' : parseFloat(e.target.value))
        : e.target.value;
      handleChange(field.name, value);
    };

    const handleArrayFieldChange = (newArray) => {
      handleChange(field.name, newArray);
    };

    return (
      <FormField
        key={field.name}
        label={field.label}
        type={field.type}
        name={field.name}
        value={formData[field.name]}
        onChange={handleFieldChange}
        onArrayChange={handleArrayFieldChange}
        required={field.required}
        error={errors[field.name]}
        placeholder={field.placeholder}
        helpText={field.helpText}
        step={field.step}
        rows={field.rows || 4}
        options={field.options}
        min={field.min}
        max={field.max}
        minLength={field.minLength}
        maxLength={field.maxLength}
        pattern={field.pattern}
        paramType={field.paramType || 'body'}
        itemType={field.itemType}
        itemOptions={field.itemOptions}
        itemFields={field.itemFields}
        domain={field.type === 'domain' ? domains[field.domain] : undefined}
        domainName={field.domain}
      />
    );
  };

  return (
    <form className="request-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
      {api.sections ? (
        // Sections-Modus: Gruppierte Felder
        api.sections.map((section, index) => (
          <div key={index} className="form-section">
            {section.title && (
              <h4 className="section-title">{section.title}</h4>
            )}
            {section.description && (
              <p className="section-description">{section.description}</p>
            )}
            <div className="section-fields">
              {(section.fields || []).map(field => renderField(field))}
            </div>
          </div>
        ))
      ) : (
        // Legacy-Modus: Flache Felderliste
        (api.fields || []).map(field => renderField(field))
      )}

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary btn-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sende...' : 'API aufrufen'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleFillExamples}
        >
          📋 Beispielwerte füllen
        </button>
        <small className="hint">Tipp: Strg+Enter zum Absenden</small>
      </div>
    </form>
  );
}
