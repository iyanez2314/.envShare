import { Badge } from "@/components/ui/badge";
import { Key } from "lucide-react";
import { EnvVarRow } from "./env-var-row";

interface SecureEnvironmentVariable {
  key: string;
  plainText: string;
  encryptedValue: string | null;
  isEncrypted: boolean;
  isSensitive: boolean;
}

interface EnvVarsListProps {
  secureVars: Record<string, SecureEnvironmentVariable>;
  getDisplayValue: (key: string) => string;
  getPlainTextValue: (key: string) => string;
  getEncryptedValue: (key: string) => string | null;
  onRemove: (key: string) => void;
  onToggleEncryption: (key: string) => Promise<void>;
  canEdit: boolean;
}

export function EnvVarsList({
  secureVars,
  getDisplayValue,
  getPlainTextValue,
  getEncryptedValue,
  onRemove,
  onToggleEncryption,
  canEdit,
}: EnvVarsListProps) {
  const envVarEntries = Object.entries(secureVars);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Current Variables</h3>
        <Badge
          variant="secondary"
          className="bg-muted text-muted-foreground"
        >
          {envVarEntries.length} variables
        </Badge>
      </div>

      {envVarEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No environment variables yet</p>
          {canEdit && (
            <p className="text-sm">Add your first variable above</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {envVarEntries.map(([key, envVar]) => (
            <EnvVarRow
              key={key}
              envKey={key}
              envVar={envVar}
              getDisplayValue={getDisplayValue}
              getPlainTextValue={getPlainTextValue}
              getEncryptedValue={getEncryptedValue}
              onRemove={onRemove}
              onToggleEncryption={onToggleEncryption}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}