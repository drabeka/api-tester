import React from 'react';

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
  className = ''
}) {
  const inputId = name || `field-${Math.random().toString(36).substring(2, 11)}`;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          id={inputId}
          value={value || ''}
          onChange={onChange}
          required={required}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          value={value || ''}
          onChange={onChange}
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
      value: value || '',
      onChange,
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

  return (
    <div className={`form-group ${className}`.trim()}>
      <label htmlFor={inputId}>
        {label}
        {required && <span className="required">*</span>}
      </label>

      {renderInput()}

      {error && (
        <span className="error-message">{error}</span>
      )}

      {helpText && (
        <small className="help-text">{helpText}</small>
      )}

      {children}
    </div>
  );
}
