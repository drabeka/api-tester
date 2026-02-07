import React from 'react';

/**
 * Wiederverwendbare FormField-Komponente
 * @param {Object} props
 * @param {string} props.label - Label-Text
 * @param {string} props.type - Input-Typ: 'text' | 'number' | 'select' | 'textarea'
 * @param {string} props.name - Field name/id
 * @param {any} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.required - Pflichtfeld
 * @param {string} props.error - Fehlermeldung
 * @param {string} props.placeholder - Placeholder-Text
 * @param {number} props.step - Für number inputs
 * @param {number} props.rows - Für textarea
 * @param {Array} props.options - Für select: [{ value, label }]
 * @param {React.ReactNode} props.children - Zusätzlicher Inhalt unter dem Feld
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
  step,
  rows = 4,
  options = [],
  children,
  className = ''
}) {
  const inputId = name || `field-${Math.random().toString(36).substr(2, 9)}`;

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
        />
      );
    }

    return (
      <input
        type={type}
        id={inputId}
        value={value || ''}
        onChange={onChange}
        step={step}
        required={required}
        placeholder={placeholder}
      />
    );
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

      {children}
    </div>
  );
}
