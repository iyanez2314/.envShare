import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Github,
  Users,
  Shield,
  Zap,
  Settings,
  Eye,
  Edit3,
  Star,
} from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export default function LandingPage() {
  const { setTheme } = useTheme();
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-mono text-xl font-bold text-foreground">
                .envShar
              </span>
            </div>

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

            <div className="flex items-center space-x-4">
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
              <Button asChild>
                <Link to="/">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Star className="w-3 h-3 mr-1" />
              Trusted by 10,000+ developers
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-mono font-bold text-foreground mb-6 leading-tight">
              Share <span className="text-primary">Environment Variables</span>{" "}
              Securely
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Never worry about .env files again. Centrally manage and securely
              share environment variables across your team. Run dev locally
              without the hassle.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/dashboard">
                  Start Building <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>

            {/* Dashboard Preview */}
          </div>
        </div>
      </section>

      {/* CLI Setup Section */}
      <section className="py-20 bg-gradient-to-br from-muted/20 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-4">
              Get Started Locally
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Run this command to set up your project and automatically fetch
              environment variables from the cloud.
            </p>
          </div>

          <Card className="bg-gradient-to-br from-card to-muted/10 border-2 border-primary/20 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-mono">
                    $
                  </span>
                </div>
                <span>CLI Command</span>
              </CardTitle>
              <CardDescription>
                Run this command in your project directory to start development
                with cloud-synced environment variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 rounded-lg p-4 relative group">
                <pre className="text-green-400 font-mono text-sm sm:text-base overflow-x-auto">
                  <code>npm run dev</code>
                </pre>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Automatic Environment Setup
                    </p>
                    <p className="text-sm text-muted-foreground">
                      No need to manage .env files locally - all variables are
                      fetched securely from the cloud
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Team Synchronization
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Always up-to-date with your team's latest environment
                      configurations
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Secure by Default
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Environment variables are encrypted and only accessible to
                      authorized team members
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-4">
              Environment Variables Made Simple
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Centralized environment variable management that eliminates .env
              file hassles and keeps your team in sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Settings,
                title: "Centralized .env Management",
                description:
                  "Store all environment variables in the cloud. No more copying .env files or sharing secrets through Slack.",
              },
              {
                icon: Zap,
                title: "Instant Development Setup",
                description:
                  "Run 'npm run dev' and automatically fetch all required environment variables. Zero local configuration needed.",
              },
              {
                icon: Users,
                title: "Team Synchronization",
                description:
                  "Everyone on your team gets the same environment variables automatically. No more 'it works on my machine'.",
              },
              {
                icon: Shield,
                title: "Security First",
                description:
                  "End-to-end encryption ensures your secrets stay secret. Role-based access controls who can see what.",
              },
              {
                icon: Github,
                title: "GitHub Integration",
                description:
                  "Seamlessly connects with your GitHub repositories. Environment variables follow your project structure.",
              },
              {
                icon: Eye,
                title: "Environment Monitoring",
                description:
                  "Track which variables are being used, when they were last updated, and by whom for better oversight.",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-mono font-bold text-foreground mb-6">
                Team Environment Management
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Control who can access environment variables with granular
                permissions. Keep sensitive data secure while enabling
                collaboration.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Eye,
                    title: "Read-Only Access",
                    description:
                      "Developers can view environment variables needed for development",
                  },
                  {
                    icon: Edit3,
                    title: "Variable Management",
                    description:
                      "Senior team members can update and add new environment variables",
                  },
                  {
                    icon: Shield,
                    title: "Admin Control",
                    description:
                      "Project owners control team access and security settings",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="bg-gradient-to-br from-card to-muted/20 border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Team Members</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Sarah Chen", role: "Owner", avatar: "SC" },
                    { name: "Mike Johnson", role: "Editor", avatar: "MJ" },
                    { name: "Alex Rivera", role: "Viewer", avatar: "AR" },
                    { name: "Emma Davis", role: "Editor", avatar: "ED" },
                  ].map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {member.avatar}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <Badge
                        variant={
                          member.role === "Owner" ? "default" : "secondary"
                        }
                      >
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-mono font-bold mb-6">
            Stop Managing .env Files
          </h2>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Join thousands of developers who have eliminated environment
            variable headaches with .envShare.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link to="/">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-mono text-xl font-bold text-foreground">
                  .envShare
                </span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Secure environment variable sharing that eliminates .env file
                management for development teams.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 .envShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: LandingPage,
});
