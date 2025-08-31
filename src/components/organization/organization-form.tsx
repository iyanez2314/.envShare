import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Organization } from "@/interfaces";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationFormProps {
  organization?: Organization;
  status?: "idle" | "pending" | "success" | "error";
  onSubmit: (data: {
    name: string;
    description?: string;
  }) => void;
  onClose: () => void;
}

export function OrganizationForm({
  organization,
  onSubmit,
  status = "idle",
  onClose,
}: OrganizationFormProps) {
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    description: organization?.description || "",
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit(formData);
  };

  const renderButtonText = () => {
    if (status === "pending") {
      return organization ? (
        <>
          <LoaderIcon className="mr-2 size-4 animate-spin" />
          <p> Updating... </p>
        </>
      ) : (
        <>
          <LoaderIcon className="mr-2 size-4 animate-spin" />
          <p> Creating... </p>
        </>
      );
    }

    if (status === "error") {
      return organization ? "Retry Update" : "Retry Create";
    }

    return organization ? "Update Organization" : "Create Organization";
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-popover text-popover-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {organization ? "Edit Organization" : "Create New Organization"}
          </DialogTitle>
          <DialogDescription>
            {organization
              ? "Update your organization details."
              : "Create a new organization to group your projects."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Organization Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="My Company"
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of your organization..."
                rows={3}
                className="bg-input border-border resize-none"
              />
            </div>
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!formData.name.trim() || status === "pending"}
              type="submit"
              className={cn(
                "bg-primary text-primary-foreground hover:bg-primary/90",
                {
                  "opacity-70 cursor-not-allowed": status === "pending",
                  "bg-red-600 hover:bg-red-700": status === "error",
                },
              )}
            >
              {renderButtonText()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
