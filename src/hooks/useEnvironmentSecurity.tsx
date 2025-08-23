import { useState, useCallback } from "react";

interface EnvironmentVariable {
  key: string;
  plainText: string;
  encryptedValue: string | null;
  isEncrypted: boolean;
  isSensitive: boolean;
}

export function useEnvironmentSecurity() {
  const [secureVars, setSecureVars] = useState<
    Record<string, EnvironmentVariable>
  >({});

  console.log("Secure Vars:", secureVars);

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

      // If it's already encrypted (starts with enc:), handle appropriately
      if (value.startsWith("enc:")) {
        // This is already encrypted data being loaded
        encryptedValue = value;
        // In a real app, you'd decrypt here to get plainText
        // For demo, we'll indicate it's encrypted but can't show plain text
        plainText = "[ENCRYPTED - Cannot decrypt in demo]";
      } else if (isSensitive) {
        // Encrypt sensitive values while keeping plain text
        const buffer = new TextEncoder().encode(value);
        const hash = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        encryptedValue = `enc:${hashHex}`;
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

  // Get all variables as a plain object (for saving) - automatically chooses correct version
  const getAllVariables = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {};
    Object.entries(secureVars).forEach(([key, envVar]) => {
      // For sensitive variables, save encrypted version; for others, save plain text
      if (envVar.isSensitive && envVar.encryptedValue) {
        result[key] = envVar.encryptedValue;
      } else {
        result[key] = envVar.plainText;
      }
    });
    return result;
  }, [secureVars]);

  // Get all variables with encryption info
  const getAllVariablesWithMeta = useCallback(() => {
    return secureVars;
  }, [secureVars]);

  // Load variables from a plain object
  const loadVariables = useCallback(
    async (vars: Record<string, string>) => {
      const newSecureVars: Record<string, EnvironmentVariable> = {};

      for (const [key, value] of Object.entries(vars)) {
        const isSensitive = isSensitiveKey(key);
        const isEncrypted = value.startsWith("enc:");

        let plainText = value;
        let encryptedValue: string | null = null;

        if (isEncrypted) {
          encryptedValue = value;
          plainText = "[ENCRYPTED - Cannot decrypt in demo]";
        } else if (isSensitive) {
          // Create encrypted version while keeping plain text
          const buffer = new TextEncoder().encode(value);
          const hash = await crypto.subtle.digest("SHA-256", buffer);
          const hashArray = Array.from(new Uint8Array(hash));
          const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          encryptedValue = `enc:${hashHex}`;
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
  };
}
