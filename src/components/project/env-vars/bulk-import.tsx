import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Upload, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { toast } from "sonner";
import type { ParseResult } from "@/lib/env-parser";

interface BulkEnvImportProps {
  onImport: (envText: string, options: { overwrite: boolean }) => Promise<ParseResult>;
  disabled?: boolean;
}

export function BulkEnvImport({ onImport, disabled = false }: BulkEnvImportProps) {
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleBulkImport = async () => {
    if (!bulkImportText.trim()) {
      toast.error("Please enter some environment variables to import");
      return;
    }

    setIsImporting(true);
    try {
      const result = await onImport(bulkImportText, { 
        overwrite: overwriteExisting 
      });

      const { valid, invalid, duplicates } = result;
      
      if (valid.length > 0) {
        toast.success(
          `Successfully imported ${valid.length} variable${valid.length === 1 ? '' : 's'}!`
        );
      }

      if (invalid.length > 0) {
        toast.warning(
          `${invalid.length} line${invalid.length === 1 ? '' : 's'} could not be imported. Check the format.`
        );
      }

      if (duplicates.length > 0 && !overwriteExisting) {
        toast.info(
          `${duplicates.length} duplicate${duplicates.length === 1 ? '' : 's'} skipped. Enable "Overwrite existing" to replace them.`
        );
      }

      // Clear the form
      setBulkImportText("");
      setShowBulkImport(false);
    } catch (error) {
      console.error("Bulk import failed:", error);
      toast.error("Failed to import environment variables");
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setBulkImportText("");
    setShowBulkImport(false);
  };

  return (
    <Collapsible open={showBulkImport} onOpenChange={setShowBulkImport}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          type="button"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bulk Import Environment Variables
          </div>
          {showBulkImport ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Paste your .env file contents below
            </div>
            
            <Textarea
              placeholder={`DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY="your-secret-key-here"
DEBUG=true
# Comments are supported
REDIS_URL=redis://localhost:6379`}
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              rows={8}
              className="font-mono text-sm bg-input border-border resize-none min-h-[200px] max-h-[300px] overflow-y-auto"
              disabled={isImporting}
            />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="overwrite-existing"
                  checked={overwriteExisting}
                  onCheckedChange={setOverwriteExisting}
                  disabled={isImporting}
                />
                <Label htmlFor="overwrite-existing" className="text-sm">
                  Overwrite existing variables
                </Label>
              </div>
              
              <div className="flex gap-2 sm:justify-end w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkImport}
                  disabled={!bulkImportText.trim() || isImporting}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isImporting ? (
                    <>Importing...</>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1" />
                      Import
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Supports KEY=value, KEY="value", and KEY='value' formats</p>
              <p>• Lines starting with # are treated as comments</p>
              <p>• Variables matching sensitive patterns will be automatically encrypted</p>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}