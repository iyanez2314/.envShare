import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./theme-provider";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowRight,
  Settings,
  Moon,
  Sun,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { logoutFn } from "@/server-functions/auth-functions";
import { toast } from "sonner";

interface NavigationProps {
  onGetStarted?: () => void;
  showGetStarted?: boolean;
  isAuthenticated?: boolean;
  currentUser?: {
    name?: string;
    email: string;
  } | null;
}

export function Navigation({
  onGetStarted,
  showGetStarted = true,
  isAuthenticated = false,
  currentUser = null,
}: NavigationProps) {
  const { setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await logoutFn();
      if (result.success) {
        toast.success("Logged out successfully");
        router.navigate({ to: "/" });
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-mono text-xl font-bold text-foreground">
              .envShare
            </span>
          </div>

          {/* Marketing Links - Show only when not authenticated */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu - Show only when authenticated */}
            {isAuthenticated && currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">
                      {currentUser.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.navigate({ to: "/dashboard" })}
                  >
                    <LayoutDashboard className="mr-2 size-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.navigate({ to: "/dashboard/settings" })
                    }
                  >
                    <Settings className="mr-2 size-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Get Started Button - Show when not authenticated */}
            {showGetStarted && !isAuthenticated && (
              <Button onClick={onGetStarted}>
                Get Started <ArrowRight className="ml-2 size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
