import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GitBranch, Building2 } from "lucide-react";
import { OrganizationForm } from "@/components/organization-form";
import { OrganizationCard } from "@/components/organization-card";
import ThemeToggle from "@/components/theme-toggle";
import type { Organization, TeamMember } from "@/interfaces";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);
  const [selectedOrgForEdit, setSelectedOrgForEdit] =
    useState<Organization | null>(null);
  const [currentUserId] = useState("current-user-id");

  useEffect(() => {
    const savedOrganizations = localStorage.getItem("github-organizations");
    if (savedOrganizations) {
      setOrganizations(JSON.parse(savedOrganizations));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("github-organizations", JSON.stringify(organizations));
  }, [organizations]);

  const addOrganization = (
    orgData: Omit<Organization, "id" | "createdAt" | "teamMembers" | "ownerId">,
    teamMembers?: TeamMember[],
  ) => {
    const ownerMember: TeamMember = {
      id: crypto.randomUUID(),
      email: "you@example.com",
      role: "owner",
      addedAt: new Date().toISOString(),
    };

    const newOrganization: Organization = {
      ...orgData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      teamMembers: [ownerMember, ...(teamMembers || [])],
      ownerId: currentUserId,
    };
    setOrganizations((prev) => [...prev, newOrganization]);
    setShowOrganizationForm(false);
  };

  const updateOrganization = (updatedOrg: Organization) => {
    setOrganizations((prev) =>
      prev.map((org) => (org.id === updatedOrg.id ? updatedOrg : org)),
    );
  };

  const deleteOrganization = (orgId: string) => {
    setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-6 w-6 text-accent" />
                <h1 className="text-xl font-semibold text-card-foreground">
                  GitHub Project Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Organizations View */}
      <main className="container mx-auto px-6 py-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Your Organizations</h2>
              <p className="text-muted-foreground">
                Select an organization to manage its projects
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-muted text-muted-foreground"
            >
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
            {organizations.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                projectCount={0}
                currentUserId={currentUserId}
                onEdit={setSelectedOrgForEdit}
                onDelete={deleteOrganization}
                onUpdate={updateOrganization}
              />
            ))}
          </div>
        </div>
      </main>

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
