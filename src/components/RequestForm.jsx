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
export default function RequestForm({ api, onResponse, initialValues = null }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialisiere Formular mit Defaultwerten oder initialValues
  useEffect(() => {
    if (api) {
      const defaultData = {};
      api.fields.forEach(field => {
        if (initialValues && initialValues[field.name] !== undefined) {
          defaultData[field.name] = initialValues[field.name];
        } else {
          defaultData[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
        }
      });
      setFormData(defaultData);
      setErrors({});
    }
  }, [api, initialValues]);

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

    // Validierung
    const validation = validateFields(api.fields, formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Auth-Konfiguration laden
      const authConfig = getAuthConfig(api.id);

      // API-Request durchführen
      const response = await makeApiRequest({
        endpoint: api.endpoint,
        method: api.method,
        payload: formData,
        authConfig,
        apiId: api.id,
        apiName: api.name,
        contentType: api.contentType, // Custom Content-Type aus Config
        accept: api.accept,           // Custom Accept Header aus Config
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

  if (!api) {
    return (
      <div className="request-form">
        <EmptyState icon="📝" message="Bitte wählen Sie eine API aus." />
      </div>
    );
  }

  return (
    <form className="request-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      {api.fields.map(field => {
        const handleFieldChange = (e) => {
          const value = field.type === 'number'
            ? (e.target.value === '' ? '' : parseFloat(e.target.value))
            : e.target.value;
          handleChange(field.name, value);
        };

        return (
          <FormField
            key={field.name}
            label={field.label}
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={handleFieldChange}
            required={field.required}
            error={errors[field.name]}
            step={field.step}
            rows={field.rows || 4}
            options={field.options}
          />
        );
      })}

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary btn-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sende...' : 'API aufrufen'}
        </button>
        <small className="hint">Tipp: Strg+Enter zum Absenden</small>
      </div>
    </form>
  );
}
