import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Key } from "lucide-react";
import { useEnvironmentSecurity } from "@/hooks/useEnvironmentSecurity";
import { updateProjectEnvVarsFn } from "@/server-functions/project-functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BulkEnvImport, AddSingleEnvVar, EnvVarsList } from "./env-vars";
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
  const queryClient = useQueryClient();

  const updateEnvVarsMutation = useMutation({
    mutationFn: updateProjectEnvVarsFn,
  });

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
    bulkImportVariables,
    toggleEncryption,
  } = useEnvironmentSecurity();

  // Load existing variables on mount
  useEffect(() => {
    if (project.envVars && project.envVars.length > 0) {
      loadVariables(project.envVars);
    }
  }, [project.envVars, loadVariables]);

  const handleSave = () => {
    const allVars = getAllVariables();
    toast.promise(
      updateEnvVarsMutation.mutateAsync({
        data: {
          projectId: project.id,
          envVars: allVars,
        },
      }),
      {
        loading: "Saving environment variables...",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["organization-projects"],
          });
          onClose();
          return "Environment variables saved successfully!";
        },
        error: (error) => {
          return "Failed to save environment variables";
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-popover text-popover-foreground overflow-hidden flex flex-col">
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

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Bulk Import Section */}
          {canEdit && (
            <BulkEnvImport
              onImport={bulkImportVariables}
              disabled={updateEnvVarsMutation.isPending}
            />
          )}

          {/* Add New Environment Variable */}
          {canEdit && (
            <AddSingleEnvVar
              onAdd={setEnvironmentVariable}
              isSensitiveKey={isSensitiveKey}
              disabled={updateEnvVarsMutation.isPending}
            />
          )}

          {/* Existing Environment Variables */}
          <EnvVarsList
            secureVars={secureVars}
            getDisplayValue={getDisplayValue}
            getPlainTextValue={getPlainTextValue}
            getEncryptedValue={getEncryptedValue}
            onRemove={removeEnvironmentVariable}
            onToggleEncryption={toggleEncryption}
            canEdit={canEdit}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t bg-popover sticky bottom-0">
          <Button variant="outline" onClick={onClose}>
            {canEdit ? "Cancel" : "Close"}
          </Button>
          {canEdit && (
            <Button
              onClick={handleSave}
              disabled={updateEnvVarsMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateEnvVarsMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
