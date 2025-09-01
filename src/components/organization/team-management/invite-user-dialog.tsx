import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail } from "lucide-react";

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  organizationName: string;
  onInvite: (data: { email: string; role: "OWNER" | "MEMBER" }) => void;
}

export function InviteUserDialog({
  open,
  onClose,
  organizationName,
  onInvite,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"OWNER" | "MEMBER">("MEMBER");

  const handleSubmit = () => {
    if (!email.trim()) return;
    
    onInvite({ email: email.trim(), role });
    
    // Reset form
    setEmail("");
    setRole("MEMBER");
  };

  const handleClose = () => {
    // Reset form on close
    setEmail("");
    setRole("MEMBER");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to join {organizationName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: "OWNER" | "MEMBER") => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!email.trim()}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}