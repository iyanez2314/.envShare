import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TeamMember } from "@/interfaces";

interface TeamMemberAvatarProps {
  teamMembers: TeamMember[];
}

export function TeamMemberAvatar({ teamMembers }: TeamMemberAvatarProps) {
  const firstTwoMembers = teamMembers.slice(0, 2);
  return (
    <div className="flex -space-x-2 mr-1">
      {teamMembers &&
        firstTwoMembers.map((member) => (
          <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt={member.email}
            />
            <AvatarFallback className="text-[10px] font-medium">
              {member.email
                .split("@")[0]
                .split(".")
                .map((part) => part[0].toUpperCase())
                .join("")}
            </AvatarFallback>
          </Avatar>
        ))}
    </div>
  );
}
