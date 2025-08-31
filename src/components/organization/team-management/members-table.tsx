import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MemberRow } from "./member-row";

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
  onRoleChange: (memberId: number) => void;
  onRemoveMember: (memberId: number) => void;
}

export function MembersTable({
  members,
  currentUserId,
  onRoleChange,
  onRemoveMember,
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
                onRoleChange={onRoleChange}
                onRemove={onRemoveMember}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
}