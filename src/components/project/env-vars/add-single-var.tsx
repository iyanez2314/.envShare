import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield } from "lucide-react";

interface AddSingleEnvVarProps {
  onAdd: (key: string, value: string) => Promise<void>;
  isSensitiveKey: (key: string) => boolean;
  disabled?: boolean;
}

export function AddSingleEnvVar({ onAdd, isSensitiveKey, disabled = false }: AddSingleEnvVarProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newKey.trim() || !newValue.trim()) return;

    setIsAdding(true);
    try {
      await onAdd(newKey.trim(), newValue.trim());
      setNewKey("");
      setNewValue("");
    } catch (error) {
      console.error("Failed to add environment variable:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newKey.trim() && newValue.trim()) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
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
            onKeyPress={handleKeyPress}
            placeholder="API_KEY"
            className="bg-input border-border"
            disabled={disabled || isAdding}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="your-secret-value"
            className="bg-input border-border"
            type={isSensitiveKey(newKey) ? "password" : "text"}
            disabled={disabled || isAdding}
          />
        </div>
      </div>
      <Button
        onClick={handleAdd}
        disabled={!newKey.trim() || !newValue.trim() || disabled || isAdding}
        size="sm"
        className="bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        {isAdding ? "Adding..." : "Add Variable"}
      </Button>
    </div>
  );
}