import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { OrganizationForm, OrganizationCard } from "@/components/organization";
import type { Organization } from "@/interfaces";
import {
  createOrganizationFn,
  deleteOrganizationFn,
  updateOrganizationFn,
  getUserOrganizationsFn,
} from "@/server-functions/organization-functions";
import { toast } from "sonner";
import type { User } from "@/interfaces";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);
  const [selectedOrgForEdit, setSelectedOrgForEdit] =
    useState<Organization | null>(null);

  const { data: organizationResponse } = useSuspenseQuery({
    queryKey: ["organizations"],
    queryFn: getUserOrganizationsFn,
  });

  const organizations = organizationResponse?.data || ([] as Organization[]);

  const createOrganizationMutation = useMutation({
    mutationFn: createOrganizationFn,
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: updateOrganizationFn,
  });

  const deleteOrganizationMutation = useMutation({
    mutationFn: async (orgId: string | number) => {
      return deleteOrganizationFn({ data: { orgId } });
    },
  });

  const { status: createStatus } = createOrganizationMutation;
  const { status: updateStatus } = updateOrganizationMutation;
  const { status: deleteStatus } = deleteOrganizationMutation;

  const handleDeleteOrganization = (orgId: string | number) => {
    setShowOrganizationForm(false);
    toast.promise(deleteOrganizationMutation.mutateAsync(orgId), {
      loading: "Deleting organization...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        return "Organization deleted successfully!";
      },
      error: "Failed to delete organization",
    });
  };

  const handleUpdateOrganization = (
    orgId: number,
    data: {
      name: string;
      description?: string;
    }
  ) => {
    setShowOrganizationForm(false);
    toast.promise(
      updateOrganizationMutation.mutateAsync({
        data: {
          orgId,
          name: data.name,
          description: data.description,
        },
      }),
      {
        loading: "Updating organization...",
        success: () => {
          setSelectedOrgForEdit(null);
          queryClient.invalidateQueries({ queryKey: ["organizations"] });
          return "Organization updated successfully!";
        },
        error: "Failed to update organization",
      },
    );
  };

  const addOrganization = (data: {
    name: string;
    description?: string;
  }) => {
    setShowOrganizationForm(false);
    toast.promise(
      createOrganizationMutation.mutateAsync({
        data: {
          name: data.name,
          description: data.description,
        },
      }),
      {
        loading: "Creating organization...",
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["organizations"] });
          return "Organization created successfully!";
        },
        error: "Failed to create organization",
      },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Your Organizations</h2>
          <p className="text-muted-foreground">
            Select an organization to manage its projects
          </p>
        </div>
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          {organizations.length}{" "}
          {organizations.length === 1 ? "organization" : "organizations"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Organization Card */}
        <div
          onClick={() => setShowOrganizationForm(true)}
          className="h-full bg-card border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5 transition-colors cursor-pointer rounded-lg"
        >
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-muted/50 p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              Create Organization
            </h3>
            <p className="text-sm text-muted-foreground">
              Add a new organization to group your projects
            </p>
          </div>
        </div>

        {/* Existing Organizations */}
        {organizations?.map((org) => (
          <OrganizationCard
            key={org.id}
            disableCardInteraction={
              !!(updateStatus === "pending" || deleteStatus === "pending")
            }
            organization={org}
            projectCount={org._count?.projects || org.projects?.length || 0}
            currentUserId={user?.id ?? null}
            onEdit={setSelectedOrgForEdit}
            onDelete={handleDeleteOrganization}
            onUpdate={handleUpdateOrganization}
          />
        ))}
      </div>

      {/* Organization Form Modal */}
      {showOrganizationForm && (
        <OrganizationForm
          status={createStatus}
          onSubmit={addOrganization}
          onClose={() => setShowOrganizationForm(false)}
        />
      )}

      {/* Edit Organization Modal */}
      {selectedOrgForEdit && (
        <OrganizationForm
          organization={selectedOrgForEdit}
          onSubmit={(data) => {
            handleUpdateOrganization(selectedOrgForEdit.id, data);
          }}
          onClose={() => setSelectedOrgForEdit(null)}
        />
      )}
    </div>
  );
}
