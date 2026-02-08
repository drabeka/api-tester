/**
 * OpenAPI 3.0 zu apis.json Converter
 * Konvertiert OpenAPI/Swagger Spezifikationen in unser Config-Format
 */

/**
 * Hauptfunktion: Konvertiert OpenAPI Spec zu apis.json Config
 * @param {Object} openApiSpec - OpenAPI 3.0 Specification
 * @param {Object} options - Conversion Options
 * @returns {Array} Array von API-Configs
 */
export function convertOpenAPIToConfig(openApiSpec, options = {}) {
  const {
    baseUrl = '',
    selectedPaths = null, // null = alle Paths importieren
    sourceOrigin = null, // Origin der Import-URL für relative Server-URLs
  } = options;

  if (!openApiSpec || !openApiSpec.paths) {
    throw new Error('Ungültige OpenAPI Specification: "paths" fehlt');
  }

  const apis = [];
  const paths = openApiSpec.paths;

  // Iteriere über alle Paths
  for (const [path, pathItem] of Object.entries(paths)) {
    // Für jeden HTTP-Verb (GET, POST, PUT, DELETE, etc.)
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
        continue; // Skip non-HTTP methods (parameters, etc.)
      }

      // Wenn selectedPaths gesetzt ist, nur diese importieren
      if (selectedPaths && !selectedPaths.includes(`${method.toUpperCase()} ${path}`)) {
        continue;
      }

      const apiConfig = convertOperationToConfig(
        path,
        method,
        operation,
        openApiSpec,
        baseUrl,
        sourceOrigin
      );

      if (apiConfig) {
        apis.push(apiConfig);
      }
    }
  }

  return apis;
}

/**
 * Konvertiert eine einzelne Operation zu API-Config
 */
function convertOperationToConfig(path, method, operation, spec, baseUrl, sourceOrigin = null) {
  // Generate API ID from operationId or path
  const apiId = (operation.operationId || `${method}_${path}`)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');

  // API Name aus summary oder operationId
  const apiName = operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`;

  // Endpoint URL
  const endpoint = baseUrl ? `${baseUrl}${path}` : getBaseUrlFromSpec(spec, sourceOrigin) + path;

  // Request Body Fields extrahieren
  const bodyFields = extractFieldsFromRequestBody(operation.requestBody, spec);

  // Parameter Fields extrahieren (query, path, header)
  const parameterFields = extractFieldsFromParameters(operation.parameters, spec);

  // Merge Body Fields und Parameters
  const fields = [...parameterFields, ...bodyFields];

  // Auth-Type extrahieren
  const auth = extractAuthConfig(spec, operation);

  // Tag aus Operation extrahieren (erstes Tag verwenden)
  const tag = (operation.tags && operation.tags.length > 0)
    ? operation.tags[0]
    : 'Sonstige';

  return {
    id: apiId,
    name: apiName,
    description: operation.description || operation.summary || '',
    endpoint: endpoint,
    method: method.toUpperCase(),
    auth: auth,
    fields: fields,
    tag: tag,
  };
}

/**
 * Extrahiert Felder aus RequestBody Schema
 */
function extractFieldsFromRequestBody(requestBody, spec) {
  if (!requestBody || !requestBody.content) {
    return [];
  }

  // Suche nach application/json Content-Type
  const jsonContent = requestBody.content['application/json'];
  if (!jsonContent || !jsonContent.schema) {
    return [];
  }

  const schema = jsonContent.schema;
  const fields = convertSchemaToFields(schema, [], spec);

  // Markiere alle Body-Fields mit paramType
  fields.forEach(field => {
    field.paramType = 'body';
  });

  return fields;
}

/**
 * Extrahiert Felder aus OpenAPI Parameters (query, path, header)
 */
function extractFieldsFromParameters(parameters, spec) {
  if (!parameters || parameters.length === 0) {
    return [];
  }

  const fields = [];

  for (let param of parameters) {
    // Resolve $ref if present
    if (param.$ref && spec) {
      param = resolveRef(param.$ref, spec);
      if (!param) continue;
    }

    // Nur query, path und header Parameters verarbeiten
    if (!['query', 'path', 'header'].includes(param.in)) {
      continue;
    }

    const field = {
      name: param.name,
      label: formatLabel(param.name),
      required: param.required || param.in === 'path', // Path params sind immer required
      paramType: param.in, // 'query', 'path', 'header'
    };

    // Schema extrahieren
    const schema = param.schema || {};

    // Type Mapping
    switch (schema.type) {
      case 'string':
        field.type = 'text';
        break;
      case 'integer':
      case 'number':
        field.type = 'number';
        break;
      case 'boolean':
        field.type = 'select';
        field.options = [
          { value: 'true', label: 'true' },
          { value: 'false', label: 'false' },
        ];
        break;
      case 'array':
        field.type = 'array';
        if (schema.items) {
          if (schema.items.enum) {
            field.itemType = 'select';
            field.itemOptions = schema.items.enum.map(v => ({
              value: v.toString(),
              label: v.toString(),
            }));
          } else if (schema.items.type === 'integer' || schema.items.type === 'number') {
            field.itemType = 'number';
          } else {
            field.itemType = 'text';
          }
        } else {
          field.itemType = 'text';
        }
        break;
      default:
        field.type = 'text';
    }

    // Enum → Select (nur für nicht-Arrays)
    if (schema.enum && field.type !== 'array') {
      field.type = 'select';
      field.options = schema.enum.map(value => ({
        value: value.toString(),
        label: value.toString(),
      }));
    }

    // Validierungen hinzufügen
    addValidations(field, schema);

    // Default Value
    if (schema.default !== undefined) {
      field.defaultValue = schema.default;
    }

    // Description → helpText
    if (param.description) {
      field.helpText = param.description;
    }

    // Example → exampleValue
    if (schema.example !== undefined) {
      field.exampleValue = schema.example;
    } else if (param.example !== undefined) {
      field.exampleValue = param.example;
    }

    fields.push(field);
  }

  return fields;
}

/**
 * Konvertiert JSON Schema zu Field-Definitionen
 */
function convertSchemaToFields(schema, required = [], spec = null) {
  const fields = [];

  // Resolve $ref if present
  if (schema.$ref && spec) {
    schema = resolveRef(schema.$ref, spec);
  }

  if (!schema || !schema.properties) {
    return fields;
  }

  // required array aus Schema extrahieren
  const requiredFields = schema.required || required;

  for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
    // Resolve $ref für einzelne Properties
    let resolvedFieldSchema = fieldSchema;
    if (fieldSchema.$ref && spec) {
      resolvedFieldSchema = resolveRef(fieldSchema.$ref, spec);
    }

    const field = convertPropertyToField(fieldName, resolvedFieldSchema, requiredFields.includes(fieldName), spec);
    if (field) {
      fields.push(field);
    }
  }

  return fields;
}

/**
 * Konvertiert eine einzelne Property zu Field-Definition
 */
function convertPropertyToField(name, schema, isRequired, spec = null) {
  const field = {
    name: name,
    label: schema.title || formatLabel(name),
    required: isRequired,
  };

  // Type Mapping
  switch (schema.type) {
    case 'string':
      field.type = mapStringType(schema);
      break;
    case 'integer':
    case 'number':
      field.type = 'number';
      break;
    case 'boolean':
      field.type = 'select';
      field.options = [
        { value: true, label: 'Ja' },
        { value: false, label: 'Nein' },
      ];
      break;
    case 'array':
      field.type = 'array';
      if (schema.items) {
        let itemSchema = schema.items;
        // Resolve $ref in items
        if (itemSchema.$ref && spec) {
          itemSchema = resolveRef(itemSchema.$ref, spec);
        }
        if (itemSchema) {
          if (itemSchema.type === 'object' || itemSchema.properties) {
            // Object-Array: Items haben Sub-Felder
            field.itemType = 'object';
            field.itemFields = convertSchemaToFields(itemSchema, [], spec);
          } else if (itemSchema.enum) {
            // Enum-Array: Items sind Select-Felder
            field.itemType = 'select';
            field.itemOptions = itemSchema.enum.map(v => ({
              value: v.toString(),
              label: v.toString(),
            }));
          } else if (itemSchema.type === 'integer' || itemSchema.type === 'number') {
            field.itemType = 'number';
          } else {
            field.itemType = 'text';
          }
        } else {
          field.itemType = 'text';
        }
      } else {
        field.itemType = 'text';
      }
      break;
    default:
      field.type = 'text';
  }

  // Enum → Select
  if (schema.enum) {
    field.type = 'select';
    field.options = schema.enum.map(value => ({
      value: value,
      label: value.toString(),
    }));
  }

  // Validierungen hinzufügen
  addValidations(field, schema);

  // Default Value
  if (schema.default !== undefined) {
    field.defaultValue = schema.default;
  }

  // Description → helpText
  if (schema.description) {
    field.helpText = schema.description;
  }

  // Example → exampleValue
  if (schema.example !== undefined) {
    field.exampleValue = schema.example;
  }

  return field;
}

/**
 * Löst $ref Referenzen auf
 * @param {string} ref - Referenz-String wie "#/components/schemas/Pet"
 * @param {Object} spec - Vollständige OpenAPI Spec
 * @returns {Object} Aufgelöstes Schema
 */
function resolveRef(ref, spec) {
  if (!ref || !ref.startsWith('#/')) {
    return null;
  }

  // Entferne führendes "#/" und splitte nach "/"
  const parts = ref.substring(2).split('/');

  // Navigate durch das Spec-Objekt
  let current = spec;
  for (const part of parts) {
    if (!current || !current[part]) {
      console.warn(`Could not resolve $ref: ${ref}`);
      return null;
    }
    current = current[part];
  }

  return current;
}

/**
 * Map String-Type basierend auf Format
 */
function mapStringType(schema) {
  switch (schema.format) {
    case 'date':
    case 'date-time':
      return 'date';
    case 'email':
      return 'text'; // Mit pattern für E-Mail
    default:
      return schema.maxLength && schema.maxLength > 100 ? 'textarea' : 'text';
  }
}

/**
 * Fügt Validierungen zum Field hinzu
 */
function addValidations(field, schema) {
  // String-Validierungen
  if (schema.type === 'string') {
    if (schema.minLength !== undefined) {
      field.minLength = schema.minLength;
    }
    if (schema.maxLength !== undefined) {
      field.maxLength = schema.maxLength;
    }
    if (schema.pattern) {
      field.pattern = schema.pattern;
    }

    // Format-spezifische Pattern
    if (schema.format === 'email') {
      field.pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
      field.patternError = 'Bitte gültige E-Mail-Adresse eingeben';
    }
  }

  // Number-Validierungen
  if (schema.type === 'number' || schema.type === 'integer') {
    if (schema.minimum !== undefined) {
      field.min = schema.minimum;
    }
    if (schema.maximum !== undefined) {
      field.max = schema.maximum;
    }
    if (schema.type === 'integer') {
      field.step = 1;
    }
  }

  // Date-Validierungen
  if (schema.format === 'date' || schema.format === 'date-time') {
    if (schema.minimum !== undefined) {
      field.min = schema.minimum;
    }
    if (schema.maximum !== undefined) {
      field.max = schema.maximum;
    }
  }
}

/**
 * Extrahiert Auth-Config aus OpenAPI Spec
 */
function extractAuthConfig(spec, operation) {
  // Default: keine Auth
  let authConfig = { type: 'none' };

  // Prüfe security in Operation oder global
  const security = operation.security || spec.security;
  if (!security || security.length === 0) {
    return authConfig;
  }

  // Nimm erste Security-Definition
  const securityScheme = security[0];
  const schemeName = Object.keys(securityScheme)[0];

  if (!spec.components || !spec.components.securitySchemes) {
    return authConfig;
  }

  const scheme = spec.components.securitySchemes[schemeName];
  if (!scheme) {
    return authConfig;
  }

  // Map Security Scheme Type
  switch (scheme.type) {
    case 'http':
      if (scheme.scheme === 'bearer') {
        authConfig = { type: 'bearer' };
      }
      break;
    case 'apiKey':
      authConfig = {
        type: 'apikey',
        keyName: scheme.name || 'X-API-Key',
        keyLocation: scheme.in || 'header', // 'header', 'query', 'cookie'
      };
      break;
    default:
      authConfig = { type: 'none' };
  }

  return authConfig;
}

/**
 * Extrahiert Base-URL aus OpenAPI Spec
 * @param {Object} spec - OpenAPI Specification
 * @param {string} sourceOrigin - Origin der Import-URL (z.B. "https://petstore3.swagger.io")
 */
function getBaseUrlFromSpec(spec, sourceOrigin = null) {
  if (spec.servers && spec.servers.length > 0) {
    const serverUrl = spec.servers[0].url;

    // Wenn URL relativ ist (startet mit /), mit sourceOrigin kombinieren
    if (serverUrl && serverUrl.startsWith('/')) {
      if (sourceOrigin) {
        return sourceOrigin + serverUrl;
      } else {
        console.warn('⚠️ OpenAPI server URL ist relativ, aber keine sourceOrigin verfügbar:', serverUrl);
        return ''; // Können relative URL nicht auflösen
      }
    }

    return serverUrl || '';
  }

  console.warn('⚠️ Keine Server-Definition in OpenAPI Spec gefunden');
  return '';
}

/**
 * Formatiert Field-Name zu lesbarem Label
 */
function formatLabel(name) {
  return name
    .replace(/([A-Z])/g, ' $1') // camelCase → space
    .replace(/[_-]/g, ' ') // underscore/dash → space
    .replace(/\b\w/g, c => c.toUpperCase()) // Capitalize
    .trim();
}

/**
 * Exportiert APIs zu OpenAPI Format (Reverse)
 * @param {Array} apis - Array von API-Configs
 * @returns {Object} OpenAPI 3.0 Specification
 */
export function convertConfigToOpenAPI(apis) {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'API Test Framework Export',
      version: '1.0.0',
    },
    paths: {},
  };

  for (const api of apis) {
    const path = extractPathFromEndpoint(api.endpoint);
    const method = api.method.toLowerCase();

    if (!openApiSpec.paths[path]) {
      openApiSpec.paths[path] = {};
    }

    openApiSpec.paths[path][method] = {
      summary: api.name,
      description: api.description,
      operationId: api.id,
      requestBody: {
        content: {
          'application/json': {
            schema: convertFieldsToSchema(api.fields),
          },
        },
      },
      responses: {
        '200': {
          description: 'Successful response',
        },
      },
    };
  }

  return openApiSpec;
}

/**
 * Extrahiert Path aus Endpoint URL
 */
function extractPathFromEndpoint(endpoint) {
  try {
    const url = new URL(endpoint);
    return url.pathname;
  } catch (e) {
    // Falls keine vollständige URL, gib zurück wie ist
    return endpoint;
  }
}

/**
 * Konvertiert Fields zu JSON Schema
 */
function convertFieldsToSchema(fields) {
  const schema = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const field of fields) {
    const property = convertFieldToProperty(field);
    schema.properties[field.name] = property;

    if (field.required) {
      schema.required.push(field.name);
    }
  }

  return schema;
}

/**
 * Konvertiert Field zu JSON Schema Property
 */
function convertFieldToProperty(field) {
  const property = {};

  // Type Mapping (reverse)
  switch (field.type) {
    case 'number':
      property.type = 'number';
      break;
    case 'date':
      property.type = 'string';
      property.format = 'date';
      break;
    case 'textarea':
      property.type = 'string';
      break;
    case 'select':
      if (field.options) {
        property.enum = field.options.map(opt => opt.value);
      }
      property.type = 'string';
      break;
    default:
      property.type = 'string';
  }

  // Validierungen
  if (field.minLength !== undefined) property.minLength = field.minLength;
  if (field.maxLength !== undefined) property.maxLength = field.maxLength;
  if (field.min !== undefined) property.minimum = field.min;
  if (field.max !== undefined) property.maximum = field.max;
  if (field.pattern) property.pattern = field.pattern;

  // Metadata
  if (field.label) property.title = field.label;
  if (field.helpText) property.description = field.helpText;
  if (field.defaultValue !== undefined) property.default = field.defaultValue;
  if (field.exampleValue !== undefined) property.example = field.exampleValue;

  return property;
}
