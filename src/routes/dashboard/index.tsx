import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { OrganizationForm } from "@/components/organization-form";
import { OrganizationCard } from "@/components/organization-card";
import type { Organization, TeamMember } from "@/interfaces";
import { useMutation } from "@/hooks/useMutation";
import { createOrganizationFn } from "@/server-functions/organization-functions";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);
  const [selectedOrgForEdit, setSelectedOrgForEdit] =
    useState<Organization | null>(null);

  const createOrganizationMutation = useMutation({
    fn: createOrganizationFn,
  });

  const {
    status: createStatus,
    data: createOrgData,
    error: createOrgError,
  } = createOrganizationMutation;

  useEffect(() => {
    console.log("status", createStatus);
    console.log("data", createOrgData);
  }, [createStatus, createOrgData]);

  const addOrganization = async (
    orgData: Omit<Organization, "id" | "createdAt" | "teamMembers" | "ownerId">,
    teamMembers?: TeamMember[],
  ) => {
    createOrganizationMutation.mutate({
      data: { name: orgData.name, description: orgData.description },
    });
  };

  const updateOrganization = (updatedOrg: Organization) => {
    setOrganizations((prev) =>
      prev.map((org) => (org.id === updatedOrg.id ? updatedOrg : org)),
    );
  };

  const deleteOrganization = (orgId: number) => {
    setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
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
        {user?.organizations?.map((org) => (
          <OrganizationCard
            key={org.id}
            organization={org}
            projectCount={0}
            currentUserId={user?.id}
            onEdit={setSelectedOrgForEdit}
            onDelete={deleteOrganization}
            onUpdate={updateOrganization}
          />
        ))}
      </div>

      {/* Organization Form Modal */}
      {showOrganizationForm && (
        <OrganizationForm
          onSubmit={addOrganization}
          onClose={() => setShowOrganizationForm(false)}
        />
      )}

      {/* Edit Organization Modal */}
      {selectedOrgForEdit && (
        <OrganizationForm
          organization={selectedOrgForEdit}
          onSubmit={(data, teamMembers) => {
            const ownerMember = selectedOrgForEdit.teamMembers.find(
              (m) => m.role === "owner",
            );
            const updatedTeamMembers = ownerMember
              ? [ownerMember, ...(teamMembers || [])]
              : teamMembers || [];
            updateOrganization({
              ...selectedOrgForEdit,
              ...data,
              teamMembers: updatedTeamMembers,
            });
            setSelectedOrgForEdit(null);
          }}
          onClose={() => setSelectedOrgForEdit(null)}
        />
      )}
    </div>
  );
}
