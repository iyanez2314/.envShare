import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";
import { ProjectMemberRow } from "./project-member-row";
import type { ProjectRole } from "@/interfaces";

interface TeamMember {
  id: number;
  name: string | null;
  email: string;
  role: ProjectRole;
  addedAt: Date;
}

interface CurrentTeamTableProps {
  currentTeam: TeamMember[];
  currentUserId: number | null;
  projectOwnerId: number;
  onRoleChange: (userId: number, newRole: ProjectRole) => void;
  onRemoveMember: (member: TeamMember) => void;
}

export function CurrentTeamTable({
  currentTeam,
  currentUserId,
  projectOwnerId,
  onRoleChange,
  onRemoveMember,
}: CurrentTeamTableProps) {
  const isCurrentUserOwner = currentUserId === projectOwnerId;

  return (
    <TabsContent value="team" className="mt-6 flex-1 overflow-hidden">
      <div className="rounded-md border h-full flex flex-col">
        {currentTeam.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No team members yet</h3>
              <p className="text-muted-foreground mb-4">
                Add organization members to your project team
              </p>
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTeam.map((member) => (
                  <ProjectMemberRow
                    key={member.id}
                    member={member}
                    currentUserId={currentUserId}
                    projectOwnerId={projectOwnerId}
                    canEdit={isCurrentUserOwner}
                    onRoleChange={onRoleChange}
                    onRemove={onRemoveMember}
                  />
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </TabsContent>
  );
}