import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Key, Eye, EyeOff, Shield } from "lucide-react";

interface SecureEnvironmentVariable {
  key: string;
  plainText: string;
  encryptedValue: string | null;
  isEncrypted: boolean;
  isSensitive: boolean;
}

interface EnvVarRowProps {
  envKey: string;
  envVar: SecureEnvironmentVariable;
  getDisplayValue: (key: string) => string;
  getPlainTextValue: (key: string) => string;
  getEncryptedValue: (key: string) => string | null;
  onRemove: (key: string) => void;
  canEdit: boolean;
}

export function EnvVarRow({
  envKey,
  envVar,
  getDisplayValue,
  getPlainTextValue,
  getEncryptedValue,
  onRemove,
  canEdit,
}: EnvVarRowProps) {
  const [isValueVisible, setIsValueVisible] = useState(false);
  const [showEncrypted, setShowEncrypted] = useState(false);

  const toggleValueVisibility = () => {
    setIsValueVisible(!isValueVisible);
  };

  const toggleEncryptedView = () => {
    setShowEncrypted(!showEncrypted);
  };

  const getValueToDisplay = () => {
    if (!isValueVisible) {
      return getDisplayValue(envKey);
    }

    if (envVar.isEncrypted && showEncrypted) {
      return getEncryptedValue(envKey) || envVar.plainText;
    }

    return getPlainTextValue(envKey);
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        envVar.isSensitive
          ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
          : "bg-card border-border"
      }`}
    >
      <div className="flex-1 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Label className="text-xs text-muted-foreground">
              Key
            </Label>
            {envVar.isSensitive && (
              <Badge
                variant="outline"
                className="text-xs flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                Sensitive
              </Badge>
            )}
            {envVar.isEncrypted && (
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                <Key className="w-3 h-3" />
                Encrypted
              </Badge>
            )}
          </div>
          <p className="font-mono text-sm">{envKey}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Label className="text-xs text-muted-foreground">
              Value
            </Label>
            {envVar.isEncrypted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEncryptedView}
                className="h-5 px-1 text-xs"
              >
                {showEncrypted ? "Plain" : "Encrypted"}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm flex-1 truncate">
              {getValueToDisplay()}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleValueVisibility}
              className="h-6 w-6 p-0"
            >
              {isValueVisible ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          </div>
          {envVar.isEncrypted && isValueVisible && (
            <div className="mt-1 text-xs text-muted-foreground">
              {showEncrypted
                ? "Showing encrypted value"
                : "Showing plain text value"}
            </div>
          )}
        </div>
      </div>
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(envKey)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}