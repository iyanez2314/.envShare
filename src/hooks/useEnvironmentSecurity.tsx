import { useState, useCallback } from "react";
import type { EnvironmentVariable } from "@/interfaces";
import { encryptValue, decryptValue, isEncryptedValue, safeDecrypt } from "@/lib/crypto-utils";
import { parseEnvText, convertToEnvironmentVariables, type ParseResult } from "@/lib/env-parser";

interface SecureEnvironmentVariable {
  key: string;
  plainText: string;
  encryptedValue: string | null;
  isEncrypted: boolean;
  isSensitive: boolean;
}

export function useEnvironmentSecurity() {
  const [secureVars, setSecureVars] = useState<
    Record<string, SecureEnvironmentVariable>
  >({});
  
  // Hook for managing environment variables with encryption support

  // Check if a key name suggests sensitive content
  const isSensitiveKey = useCallback((key: string): boolean => {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /private/i,
      /key/i,
      /token/i,
      /api[_-]?key/i,
      /auth/i,
      /credential/i,
      /jwt/i,
      /oauth/i,
      /webhook/i,
      /database[_-]?url/i,
      /connection[_-]?string/i,
    ];

    return sensitivePatterns.some((pattern) => pattern.test(key));
  }, []);

  // Add or update an environment variable with automatic encryption
  const setEnvironmentVariable = useCallback(
    async (key: string, value: string) => {
      const isSensitive = isSensitiveKey(key);
      let encryptedValue: string | null = null;
      let plainText = value;

      // If it's already encrypted, decrypt it first to get plain text
      if (isEncryptedValue(value)) {
        encryptedValue = value;
        plainText = await safeDecrypt(value);
      } else if (isSensitive) {
        // Encrypt sensitive values while keeping plain text
        encryptedValue = await encryptValue(value);
        plainText = value; // Store original plain text
      }

      setSecureVars((prev) => ({
        ...prev,
        [key]: {
          key,
          plainText,
          encryptedValue,
          isEncrypted: encryptedValue !== null,
          isSensitive,
        },
      }));
    },
    [isSensitiveKey],
  );

  // Get the display value (masked if sensitive and encrypted)
  const getDisplayValue = useCallback(
    (key: string): string => {
      const envVar = secureVars[key];
      if (!envVar) return "";

      if (envVar.isEncrypted && envVar.isSensitive) {
        return "•".repeat(Math.min(envVar.plainText.length, 20)); // Mask but show some length
      }

      return envVar.plainText;
    },
    [secureVars],
  );

  // Get the plain text value (unencrypted)
  const getPlainTextValue = useCallback(
    (key: string): string => {
      const envVar = secureVars[key];
      if (!envVar) return "";
      return envVar.plainText;
    },
    [secureVars],
  );

  // Get the encrypted value (if it exists)
  const getEncryptedValue = useCallback(
    (key: string): string | null => {
      const envVar = secureVars[key];
      if (!envVar) return null;
      return envVar.encryptedValue;
    },
    [secureVars],
  );

  // Remove an environment variable
  const removeEnvironmentVariable = useCallback((key: string) => {
    setSecureVars((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  // Check if a specific variable is sensitive
  const isVariableSensitive = useCallback(
    (key: string): boolean => {
      return secureVars[key]?.isSensitive || false;
    },
    [secureVars],
  );

  // Check if a specific variable is encrypted
  const isVariableEncrypted = useCallback(
    (key: string): boolean => {
      return secureVars[key]?.isEncrypted || false;
    },
    [secureVars],
  );

  // Get all variables as EnvironmentVariable array (for saving to Project interface)
  const getAllVariables = useCallback((): EnvironmentVariable[] => {
    return Object.entries(secureVars).map(([key, envVar], index) => ({
      id: index + 1, // Temporary ID for new variables
      key,
      value: envVar.isSensitive && envVar.encryptedValue ? envVar.encryptedValue : envVar.plainText,
      projectId: 0, // Will be set when saving to server
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }, [secureVars]);

  // Get all variables with encryption info
  const getAllVariablesWithMeta = useCallback(() => {
    return secureVars;
  }, [secureVars]);

  // Load variables from EnvironmentVariable array
  const loadVariables = useCallback(
    async (vars: EnvironmentVariable[]) => {
      const newSecureVars: Record<string, SecureEnvironmentVariable> = {};

      for (const envVar of vars) {
        const { key, value } = envVar;
        const isSensitive = isSensitiveKey(key);
        const isEncrypted = isEncryptedValue(value);

        let plainText = value;
        let encryptedValue: string | null = null;

        if (isEncrypted) {
          encryptedValue = value;
          // Properly decrypt the value to get plain text
          plainText = await safeDecrypt(value);
        } else if (isSensitive) {
          // Create encrypted version while keeping plain text
          encryptedValue = await encryptValue(value);
          plainText = value;
        }

        newSecureVars[key] = {
          key,
          plainText,
          encryptedValue,
          isEncrypted: encryptedValue !== null,
          isSensitive,
        };
      }

      setSecureVars(newSecureVars);
    },
    [isSensitiveKey],
  );

  // Bulk import environment variables from text
  const bulkImportVariables = useCallback(
    async (envText: string, options: { overwrite: boolean } = { overwrite: false }): Promise<ParseResult> => {
      const parseResult = parseEnvText(envText);
      const validVars = convertToEnvironmentVariables(parseResult.valid);
      
      // Process each valid variable
      for (const { key, value } of validVars) {
        // Check if variable already exists and overwrite is false
        if (!options.overwrite && secureVars[key]) {
          // Skip existing variables if overwrite is disabled
          continue;
        }
        
        // Use existing setEnvironmentVariable logic for proper encryption handling
        await setEnvironmentVariable(key, value);
      }
      
      return parseResult;
    },
    [secureVars, setEnvironmentVariable]
  );

  // Clear all environment variables
  const clearAllVariables = useCallback(() => {
    setSecureVars({});
  }, []);

  return {
    secureVars,
    setEnvironmentVariable,
    getDisplayValue,
    getPlainTextValue,
    getEncryptedValue,
    removeEnvironmentVariable,
    isVariableSensitive,
    isVariableEncrypted,
    isSensitiveKey,
    getAllVariables,
    getAllVariablesWithMeta,
    loadVariables,
    bulkImportVariables,
    clearAllVariables,
  };
}
