import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, UserCheck } from "lucide-react";

interface TeamManagementTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  membersCount: number;
  invitationsCount: number;
}

export function TeamManagementTabs({
  activeTab,
  onTabChange,
  membersCount,
  invitationsCount,
}: TeamManagementTabsProps) {
  return (
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="members" className="flex items-center gap-2">
        <UserCheck className="h-4 w-4" />
        Members ({membersCount})
      </TabsTrigger>
      <TabsTrigger value="invitations" className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        Invitations ({invitationsCount})
      </TabsTrigger>
    </TabsList>
  );
}