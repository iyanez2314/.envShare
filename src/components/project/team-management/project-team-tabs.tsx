import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus } from "lucide-react";

interface ProjectTeamTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentTeamCount: number;
  availableMembersCount: number;
}

export function ProjectTeamTabs({
  activeTab,
  onTabChange,
  currentTeamCount,
  availableMembersCount,
}: ProjectTeamTabsProps) {
  return (
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger
        value="team"
        className="flex items-center gap-2"
        onClick={() => onTabChange("team")}
      >
        <Users className="h-4 w-4" />
        Project Team
        <Badge variant="secondary" className="ml-1">
          {currentTeamCount}
        </Badge>
      </TabsTrigger>
      <TabsTrigger
        value="available"
        className="flex items-center gap-2"
        onClick={() => onTabChange("available")}
      >
        <UserPlus className="h-4 w-4" />
        Add Members
        <Badge variant="secondary" className="ml-1">
          {availableMembersCount}
        </Badge>
      </TabsTrigger>
    </TabsList>
  );
}