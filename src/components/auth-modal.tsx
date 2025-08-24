import type React from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@/hooks/useMutation";
import { loginFn, signUpFn } from "@/routes/_authed";
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
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter();

  const handleLogin = (email: string, password: string) => {
    loginMutation.mutate({ data: { email, password } });
  };

  const handleSignup = (name: string, email: string, password: string) => {
    signupMutation.mutate({ data: { name, email, password } });
  };

  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        await router.invalidate();
        router.navigate({ to: "/dashboard" });
        return;
      }
    },
  });

  const signupMutation = useMutation({
    fn: signUpFn,
    onSuccess: async (ctx) => {
      if (ctx.data?.userExists) {
        toast.info("Seems like you already have an account. Please log in.");
        return;
      }

      if (!ctx.data?.error) {
        await router.invalidate();
        router.navigate({ to: "/dashboard" });
        return;
      }
    },
  });

  const { status: signupStatus } = signupMutation;

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
            <SignupForm status={signupStatus} onSubmit={handleSignup} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
