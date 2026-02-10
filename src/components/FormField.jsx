import React, { useState, useEffect } from 'react';
import DomainField from './DomainField.jsx';

/**
 * Wiederverwendbare FormField-Komponente
 * @param {Object} props
 * @param {string} props.label - Label-Text
 * @param {string} props.type - Input-Typ: 'text' | 'number' | 'select' | 'textarea' | 'date'
 * @param {string} props.name - Field name/id
 * @param {any} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.required - Pflichtfeld
 * @param {string} props.error - Fehlermeldung
 * @param {string} props.placeholder - Placeholder-Text
 * @param {string} props.helpText - Hilfetext unter dem Feld
 * @param {number} props.step - Für number inputs
 * @param {number} props.rows - Für textarea
 * @param {Array} props.options - Für select: [{ value, label }]
 * @param {number} props.min - Min-Wert für number/date, minLength für text/textarea
 * @param {number} props.max - Max-Wert für number/date, maxLength für text/textarea
 * @param {number} props.minLength - Min-Länge für text/textarea
 * @param {number} props.maxLength - Max-Länge für text/textarea
 * @param {string} props.pattern - Regex-Pattern für text-Validierung
 * @param {React.ReactNode} props.children - Zusätzlicher Inhalt unter dem Feld (z.B. Warnungen)
 * @param {string} props.className - Zusätzliche CSS-Klassen
 */
export default function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onArrayChange,
  required = false,
  error = null,
  placeholder = '',
  helpText = '',
  step,
  rows = 4,
  options = [],
  min,
  max,
  minLength,
  maxLength,
  pattern,
  children,
  className = '',
  paramType,          // 'body', 'query', 'path', 'header'
  itemType = 'text',  // Für array: 'text', 'number', 'select', 'object'
  itemOptions = [],   // Für array + select items
  itemFields = [],    // Für array + object items
  domain,             // Für domain: aufgelöstes Domain-Objekt
  domainName,         // Für domain: Domain-Schlüssel
}) {
  const inputId = name || `field-${Math.random().toString(36).substring(2, 11)}`;

  // Live-Validierung: State
  const [touched, setTouched] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // null | 'valid' | 'error'

  // Prüfen ob Feld Validierungsregeln hat
  const hasValidation = required || pattern ||
    min !== undefined || max !== undefined ||
    minLength !== undefined || maxLength !== undefined;

  // Einzelfeld-Validierung
  const validateValue = (val) => {
    if (val === undefined || val === null || val === '') {
      return required ? 'error' : null;
    }
    if (pattern && (type === 'text' || type === 'textarea')) {
      if (!new RegExp(pattern).test(String(val))) return 'error';
    }
    if (type === 'number') {
      const num = parseFloat(val);
      if (isNaN(num)) return 'error';
      if (min !== undefined && num < min) return 'error';
      if (max !== undefined && num > max) return 'error';
    }
    if (type === 'text' || type === 'textarea') {
      const len = String(val).length;
      if (minLength !== undefined && len < minLength) return 'error';
      if (maxLength !== undefined && len > maxLength) return 'error';
    }
    return 'valid';
  };

  const handleBlur = () => {
    if (!hasValidation) return;
    setTouched(true);
    setValidationStatus(validateValue(value));
  };

  const handleChange = (e) => {
    onChange(e);
    if (touched && hasValidation) {
      setValidationStatus(validateValue(e.target.value));
    }
  };

  // Validierung bei Wert-Änderung (extern oder initial)
  useEffect(() => {
    if (!hasValidation) return;
    if (touched) {
      setValidationStatus(validateValue(value));
    } else if (required || (value !== undefined && value !== null && value !== '')) {
      // Required-Felder sofort prüfen, oder Felder mit Initialwert
      setTouched(true);
      setValidationStatus(validateValue(value));
    }
  }, [value]);

  const validationClass = hasValidation && validationStatus ? `field-${validationStatus}` : '';

  // Array-Rendering
  const renderArrayInput = () => {
    const items = Array.isArray(value) ? value : [];

    const addItem = () => {
      if (itemType === 'object' && itemFields.length > 0) {
        // Neues leeres Objekt mit allen Feldern
        const newObj = {};
        itemFields.forEach(f => { newObj[f.name] = ''; });
        onArrayChange([...items, newObj]);
      } else {
        onArrayChange([...items, '']);
      }
    };

    const removeItem = (index) => {
      onArrayChange(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, newValue) => {
      const updated = [...items];
      updated[index] = newValue;
      onArrayChange(updated);
    };

    const updateObjectField = (itemIndex, fieldName, fieldValue) => {
      const updated = [...items];
      updated[itemIndex] = { ...updated[itemIndex], [fieldName]: fieldValue };
      onArrayChange(updated);
    };

    return (
      <div className="array-field-container">
        {items.map((item, index) => (
          itemType === 'object' && itemFields.length > 0 ? (
            // Object-Array Item
            <div key={index} className="array-object-item">
              <div className="array-object-header">
                <span className="array-item-label">Item {index + 1}</span>
                <button type="button" className="array-remove-btn" onClick={() => removeItem(index)} title="Entfernen">✕</button>
              </div>
              <div className="array-object-fields">
                {itemFields.map(subField => (
                  <div key={subField.name} className="array-object-field">
                    <label>{subField.label}</label>
                    {subField.type === 'select' && subField.options ? (
                      <select
                        value={item?.[subField.name] ?? ''}
                        onChange={(e) => updateObjectField(index, subField.name, e.target.value)}
                      >
                        <option value="">-- Auswählen --</option>
                        {subField.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={subField.type === 'number' ? 'number' : 'text'}
                        value={item?.[subField.name] ?? ''}
                        onChange={(e) => updateObjectField(index, subField.name, e.target.value)}
                        placeholder={subField.placeholder || subField.label}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Einfaches Array Item (string, number, select)
            <div key={index} className="array-item">
              {itemType === 'select' && itemOptions.length > 0 ? (
                <select
                  value={item ?? ''}
                  onChange={(e) => updateItem(index, e.target.value)}
                >
                  <option value="">-- Auswählen --</option>
                  {itemOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={itemType === 'number' ? 'number' : 'text'}
                  value={item ?? ''}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                />
              )}
              <button type="button" className="array-remove-btn" onClick={() => removeItem(index)} title="Entfernen">✕</button>
            </div>
          )
        ))}
        <button type="button" className="array-add-btn" onClick={addItem}>
          + Hinzufügen
        </button>
      </div>
    );
  };

  const renderInput = () => {
    if (type === 'array') {
      return renderArrayInput();
    }

    // Domain/Select: Validierung bei Auswahl
    const handleDomainChange = (e) => {
      onChange(e);
      if (hasValidation) {
        setTouched(true);
        setValidationStatus(validateValue(e.target.value));
      }
    };

    if (type === 'domain') {
      return (
        <DomainField
          id={inputId}
          domain={domain}
          domainName={domainName}
          value={value ?? ''}
          onChange={handleDomainChange}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder || '-- Auswählen --'}
        />
      );
    }

    if (type === 'select') {
      // Options ins Domain-Format konvertieren: {value,label} → {code,name,status}
      const selectDomain = {
        name: label,
        values: options.map(opt => ({
          code: opt.value,
          name: opt.label,
          status: 'V'
        }))
      };
      return (
        <DomainField
          id={inputId}
          domain={selectDomain}
          domainName={name}
          value={value ?? ''}
          onChange={handleDomainChange}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder || '-- Auswählen --'}
        />
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          value={value ?? ''}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          rows={rows}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
        />
      );
    }

    // Text, Number oder Date Input
    const inputProps = {
      type,
      id: inputId,
      value: value ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
      required,
      placeholder,
    };

    // Number-spezifische Props
    if (type === 'number') {
      if (step !== undefined) inputProps.step = step;
      if (min !== undefined) inputProps.min = min;
      if (max !== undefined) inputProps.max = max;
    }

    // Text-spezifische Props
    if (type === 'text') {
      if (minLength !== undefined) inputProps.minLength = minLength;
      if (maxLength !== undefined) inputProps.maxLength = maxLength;
      if (pattern) inputProps.pattern = pattern;
    }

    // Date-spezifische Props
    if (type === 'date') {
      if (min !== undefined) inputProps.min = min;
      if (max !== undefined) inputProps.max = max;
    }

    return <input {...inputProps} />;
  };

  // Parameter-Type Badge
  const paramLabels = { query: 'Query', path: 'Path', header: 'Header', body: 'Body' };
  const getParamTypeBadge = () => (
    <span className={`param-type-badge param-badge-${paramType || 'body'}`}>
      {paramLabels[paramType] || 'Body'}
    </span>
  );

  return (
    <div className={`form-group ${validationClass} ${className}`.trim()}>
      <label htmlFor={inputId}>
        {label}
        {helpText && (
          <span className="help-icon" data-tooltip={helpText}>i</span>
        )}
        {paramType && getParamTypeBadge()}
      </label>

      {renderInput()}

      {error && (
        <span className="error-message">{error}</span>
      )}

      {children}
    </div>
  );
}
