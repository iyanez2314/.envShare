import type React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const handleLogin = (email: string, password: string) => {
    // TODO: Implement login logic
    console.log("[v0] Login attempt:", { email });
    // For now, just close the modal and redirect to dashboard
    onOpenChange(false);
    window.location.href = "/";
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // TODO: Implement signup logic
    console.log("[v0] Signup attempt:", { name, email });
    // For now, just close the modal and redirect to dashboard
    onOpenChange(false);
    window.location.href = "/";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Github className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>Welcome to .envShare</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <LoginForm onSubmit={handleLogin} />
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <SignupForm onSubmit={handleSignup} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
