import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name: string;
  email: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8", 
  lg: "h-10 w-10",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2); // Limit to 2 characters max
}

export function MemberAvatar({ 
  name, 
  email, 
  imageUrl, 
  size = "md", 
  className 
}: MemberAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}