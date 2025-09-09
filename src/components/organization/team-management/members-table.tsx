import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MemberRow } from "./member-row";
import type { OrganizationRole } from "@/interfaces";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: Date;
}

interface MembersTableProps {
  members: Member[];
  currentUserId: number | null;
  currentUserRole?: OrganizationRole;
  onRoleChange: (memberId: number, newRole: OrganizationRole) => void;
  onRemoveMember: (memberId: number) => void;
  onTransferOwnership?: (memberId: number) => void;
}

export function MembersTable({
  members,
  currentUserId,
  currentUserRole = "MEMBER",
  onRoleChange,
  onRemoveMember,
  onTransferOwnership,
}: MembersTableProps) {
  return (
    <TabsContent value="members" className="mt-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onRoleChange={onRoleChange}
                onRemove={onRemoveMember}
                onTransferOwnership={onTransferOwnership}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
}