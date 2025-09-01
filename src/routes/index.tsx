import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Github,
  Users,
  Shield,
  Zap,
  Settings,
  Eye,
  Star,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthModal } from "@/components/auth/auth-modal";
import { Navigation } from "@/components/layout/navigation";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureCard } from "@/components/marketing/feature-card";
import { CTASection } from "@/components/marketing/cta-section";
import { Footer } from "@/components/marketing/footer";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);

  const features = [
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
  ];
  return (
    <div className="min-h-screen bg-background">
      <Navigation onGetStarted={() => setShowModal(true)} />

      <HeroSection
        badge={{
          icon: <Star className="w-3 h-3 mr-1" />,
          text: "Trusted by 10,000+ developers",
        }}
        title={
          <>
            Share <span className="text-primary">Environment Variables</span>{" "}
            Securely
          </>
        }
        description="Never worry about .env files again. Centrally manage and securely share environment variables across your team. Run dev locally without the hassle."
        primaryAction={{
          text: (
            <>
              Start Building <ArrowRight className="ml-2 w-5 h-5" />
            </>
          ),
          onClick: () => setShowModal(true),
        }}
        secondaryAction={{
          text: "Watch Demo",
          onClick: () => {},
        }}
      />

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
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Stop Managing .env Files"
        description="Join thousands of developers who have eliminated environment variable headaches with .envShare."
        primaryAction={{
          text: "Start Free Trial",
          onClick: () => setShowModal(true),
        }}
        secondaryAction={{
          text: "Schedule Demo",
          onClick: () => {},
        }}
        variant="primary"
      />

      <Footer />

      <AuthModal open={showModal} onOpenChange={setShowModal} />
    </div>
  );
}
