import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import { AvailableMemberRow } from "./available-member-row";

interface AvailableMember {
  id: number;
  name: string | null;
  email: string;
  organizationRole: "OWNER" | "MEMBER";
  joinedAt: Date;
}

interface AvailableMembersTableProps {
  availableMembers: AvailableMember[];
  onAddMember: (member: AvailableMember) => void;
}

export function AvailableMembersTable({
  availableMembers,
  onAddMember,
}: AvailableMembersTableProps) {
  return (
    <TabsContent value="available" className="mt-6 flex-1 overflow-hidden">
      <div className="rounded-md border h-full flex flex-col">
        {availableMembers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">All members are on the project</h3>
              <p className="text-muted-foreground">
                Every organization member is already part of this project
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Organization members who can be added to this project
              </p>
            </div>
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Organization Role</TableHead>
                    <TableHead>Joined Organization</TableHead>
                    <TableHead className="w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableMembers.map((member) => (
                    <AvailableMemberRow
                      key={member.id}
                      member={member}
                      onAdd={onAddMember}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </TabsContent>
  );
}