// Utility for parsing bulk environment variable imports

export interface ParsedEnvVar {
  key: string;
  value: string;
  line: number;
  isValid: boolean;
  error?: string;
}

export interface ParseResult {
  valid: ParsedEnvVar[];
  invalid: ParsedEnvVar[];
  duplicates: string[];
  totalLines: number;
}

/**
 * Parse environment variables from text input
 * Supports various formats:
 * - KEY=value
 * - KEY="value with spaces"
 * - KEY='value with spaces'
 * - export KEY=value
 * - # comments (ignored)
 * - empty lines (ignored)
 */
export function parseEnvText(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const valid: ParsedEnvVar[] = [];
  const invalid: ParsedEnvVar[] = [];
  const seenKeys = new Set<string>();
  const duplicates: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      continue;
    }

    const parsed = parseSingleEnvLine(line, lineNumber);
    
    if (parsed.isValid && parsed.key) {
      // Check for duplicates
      if (seenKeys.has(parsed.key)) {
        duplicates.push(parsed.key);
        invalid.push({
          ...parsed,
          isValid: false,
          error: `Duplicate key: ${parsed.key}`,
        });
      } else {
        seenKeys.add(parsed.key);
        valid.push(parsed);
      }
    } else {
      invalid.push(parsed);
    }
  }

  return {
    valid,
    invalid,
    duplicates: Array.from(new Set(duplicates)),
    totalLines: lines.length,
  };
}

/**
 * Parse a single environment variable line
 */
function parseSingleEnvLine(line: string, lineNumber: number): ParsedEnvVar {
  const base: ParsedEnvVar = {
    key: '',
    value: '',
    line: lineNumber,
    isValid: false,
  };

  try {
    // Remove 'export ' prefix if present
    let cleanLine = line.replace(/^export\s+/, '');
    
    // Find the first = sign
    const equalIndex = cleanLine.indexOf('=');
    if (equalIndex === -1) {
      return {
        ...base,
        error: 'Missing = sign',
      };
    }

    const key = cleanLine.substring(0, equalIndex).trim();
    const rawValue = cleanLine.substring(equalIndex + 1);

    // Validate key format
    if (!isValidEnvKey(key)) {
      return {
        ...base,
        key,
        error: 'Invalid key format. Keys should contain only letters, numbers, and underscores.',
      };
    }

    // Parse value (handle quotes)
    const value = parseEnvValue(rawValue);

    return {
      ...base,
      key,
      value,
      isValid: true,
    };
  } catch (error) {
    return {
      ...base,
      error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Validate environment variable key format
 */
function isValidEnvKey(key: string): boolean {
  if (!key) return false;
  
  // Keys should start with letter or underscore, followed by letters, numbers, or underscores
  const keyRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return keyRegex.test(key);
}

/**
 * Parse environment variable value, handling quotes and escaping
 */
function parseEnvValue(rawValue: string): string {
  const trimmed = rawValue.trim();
  
  if (!trimmed) {
    return '';
  }

  // Handle double quotes
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1) {
    const content = trimmed.slice(1, -1);
    // Handle escaped characters in double quotes
    return content
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  // Handle single quotes (no escaping in single quotes)
  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length > 1) {
    return trimmed.slice(1, -1);
  }

  // Handle unquoted values (stop at first # for comments)
  const commentIndex = trimmed.indexOf('#');
  if (commentIndex !== -1) {
    return trimmed.substring(0, commentIndex).trim();
  }

  return trimmed;
}

/**
 * Convert parsed env vars to the format expected by useEnvironmentSecurity
 */
export function convertToEnvironmentVariables(parsed: ParsedEnvVar[]): Array<{ key: string; value: string }> {
  return parsed
    .filter(item => item.isValid)
    .map(item => ({
      key: item.key,
      value: item.value,
    }));
}

/**
 * Generate a summary of the parse results
 */
export function generateParseSummary(result: ParseResult): string {
  const { valid, invalid, duplicates, totalLines } = result;
  
  const parts = [
    `Processed ${totalLines} lines`,
    `${valid.length} valid variables`,
  ];

  if (invalid.length > 0) {
    parts.push(`${invalid.length} invalid lines`);
  }

  if (duplicates.length > 0) {
    parts.push(`${duplicates.length} duplicates`);
  }

  return parts.join(', ');
}