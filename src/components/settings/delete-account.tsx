import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserX, AlertTriangle } from "lucide-react";

interface DeleteAccountProps {
  userEmail: string;
}

export function DeleteAccount({ userEmail }: DeleteAccountProps) {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    
    // TODO: Implement account deletion logic
    setTimeout(() => {
      setIsLoading(false);
      setIsDialogOpen(false);
      setConfirmEmail("");
    }, 2000);
  };

  const isEmailConfirmed = confirmEmail === userEmail;

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <UserX className="h-5 w-5" />
          Delete Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-destructive">Warning</h4>
                <p className="text-sm text-muted-foreground">
                  Deleting your account will permanently remove:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• All your projects and environment variables</li>
                  <li>• Organization memberships and team access</li>
                  <li>• Account settings and preferences</li>
                  <li>• All associated data and history</li>
                </ul>
              </div>
            </div>
          </div>

          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-email">
                      Type your email address <strong>{userEmail}</strong> to confirm:
                    </Label>
                    <Input
                      id="confirm-email"
                      type="email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmEmail("")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={!isEmailConfirmed || isLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isLoading ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}