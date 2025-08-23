import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { useEnvironmentSecurity } from "@/hooks/useEnvironmentSecurity";
import type { Project } from "@/interfaces";

interface EnvVarsDialogProps {
  project: Project;
  canEdit: boolean;
  onUpdate: (project: Project) => void;
  onClose: () => void;
}

export function EnvVarsDialog({
  project,
  canEdit,
  onUpdate,
  onClose,
}: EnvVarsDialogProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set());
  const [showEncrypted, setShowEncrypted] = useState<Set<string>>(new Set());

  const {
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
  } = useEnvironmentSecurity();

  // Load existing variables on mount
  useEffect(() => {
    if (project.envVars) {
      loadVariables(project.envVars);
    }
  }, [project.envVars, loadVariables]);

  const addEnvVar = async () => {
    if (!newKey.trim() || !newValue.trim()) return;

    await setEnvironmentVariable(newKey.trim(), newValue.trim());
    setNewKey("");
    setNewValue("");
  };

  const removeEnvVar = (key: string) => {
    removeEnvironmentVariable(key);
    setVisibleValues((prev) => {
      const updated = new Set(prev);
      updated.delete(key);
      return updated;
    });
  };

  const toggleValueVisibility = (key: string) => {
    setVisibleValues((prev) => {
      const updated = new Set(prev);
      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      return updated;
    });
  };

  const toggleEncryptedView = (key: string) => {
    setShowEncrypted((prev) => {
      const updated = new Set(prev);
      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      return updated;
    });
  };

  const handleSave = () => {
    const allVars = getAllVariables();
    onUpdate({ ...project, envVars: allVars });
    onClose();
  };

  const envVarEntries = Object.entries(secureVars);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-popover text-popover-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-accent" />
            Environment Variables
          </DialogTitle>
          <DialogDescription>
            {canEdit ? "Manage" : "View"} environment variables for{" "}
            <strong>{project.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Environment Variable */}
          {canEdit && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
              <h3 className="font-medium text-sm">Add New Variable</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="key">Key</Label>
                    {isSensitiveKey(newKey) && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" />
                        Will encrypt
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="key"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="API_KEY"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="your-secret-value"
                    className="bg-input border-border"
                    type={isSensitiveKey(newKey) ? "password" : "text"}
                  />
                </div>
              </div>
              <Button
                onClick={addEnvVar}
                disabled={!newKey.trim() || !newValue.trim()}
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </div>
          )}

          {/* Existing Environment Variables */}
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
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {envVarEntries.map(([key, envVar]) => (
                  <div
                    key={key}
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
                        <p className="font-mono text-sm">{key}</p>
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
                              onClick={() => toggleEncryptedView(key)}
                              className="h-5 px-1 text-xs"
                            >
                              {showEncrypted.has(key) ? "Plain" : "Encrypted"}
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm flex-1 truncate">
                            {(() => {
                              // Determine what to show based on state
                              const isVisible = visibleValues.has(key);
                              const showEncryptedVersion =
                                showEncrypted.has(key);

                              if (!isVisible) {
                                // Show masked version
                                return getDisplayValue(key);
                              }

                              if (envVar.isEncrypted && showEncryptedVersion) {
                                // Show encrypted version
                                return (
                                  getEncryptedValue(key) || envVar.plainText
                                );
                              }

                              // Show plain text version
                              return getPlainTextValue(key);
                            })()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleValueVisibility(key)}
                            className="h-6 w-6 p-0"
                          >
                            {visibleValues.has(key) ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {envVar.isEncrypted && visibleValues.has(key) && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {showEncrypted.has(key)
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
                        onClick={() => removeEnvVar(key)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            {canEdit ? "Cancel" : "Close"}
          </Button>
          {canEdit && (
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Changes
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
