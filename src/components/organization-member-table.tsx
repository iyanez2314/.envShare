import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Mail, UserCheck, Clock, Crown, Edit, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Organization } from "@/interfaces";

interface OrganizationMembersTableProps {
  organization: Organization;
  currentUserId: number | null;
  onUpdate: (organization: Organization) => void;
  onClose: () => void;
}

function getRoleBadgeVariant(role: string) {
  switch (role.toUpperCase()) {
    case "OWNER":
      return "destructive";
    case "MEMBER":
      return "secondary";
    default:
      return "secondary";
  }
}

function getRoleIcon(role: string) {
  switch (role.toUpperCase()) {
    case "OWNER":
      return <Crown className="h-3 w-3" />;
    case "MEMBER":
      return <Eye className="h-3 w-3" />;
    default:
      return <Eye className="h-3 w-3" />;
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "default";
    case "pending":
      return "secondary";
    case "expired":
      return "destructive";
    default:
      return "secondary";
  }
}

export function OrganizationMembersTable({
  organization,
  currentUserId,
  onUpdate,
  onClose,
}: OrganizationMembersTableProps) {
  const [activeTab, setActiveTab] = useState("members");

  // Get organization members with their roles
  const members = organization.users?.map((user) => {
    const userRole = organization.userRoles?.find(ur => ur.userId === user.id);
    const isOwner = organization.ownerId === user.id;
    
    return {
      id: user.id,
      name: user.name || "No Name",
      email: user.email,
      role: isOwner ? "OWNER" : (userRole?.role || "MEMBER"),
      status: "Active",
      joinedAt: user.createdAt,
    };
  }) || [];

  // Placeholder for invitations - will be implemented later
  const invitations: any[] = [];

  return (
    <div>
      <div className="mb-6">
        <p className="text-muted-foreground">
          View and manage organization members and pending invitations
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger
              value="invitations"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Invitations ({invitations.length})
            </TabsTrigger>
          </TabsList>

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
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem disabled={member.role === "OWNER" || member.id === currentUserId}>
                              Change role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              disabled={member.role === "OWNER" || member.id === currentUserId}
                            >
                              Remove member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="font-medium">{invitation.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(invitation.role)}>
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invitation.invitedBy}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {invitation.status === "Pending" && (
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          )}
                          <Badge
                            variant={getStatusBadgeVariant(invitation.status)}
                          >
                            {invitation.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(invitation.invitedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              Resend invitation
                            </DropdownMenuItem>
                            <DropdownMenuItem>Change role</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Cancel invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
