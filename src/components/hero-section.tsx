import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface HeroSectionProps {
  badge?: {
    icon?: ReactNode;
    text: string;
  };
  title: ReactNode;
  description: string;
  primaryAction: {
    text: ReactNode;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

export function HeroSection({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
}: HeroSectionProps) {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {badge && (
            <Badge variant="secondary" className="mb-6">
              {badge.icon}
              {badge.text}
            </Badge>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-mono font-bold text-foreground mb-6 leading-tight">
            {title}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" onClick={primaryAction.onClick}>
              {primaryAction.text}
            </Button>
            {secondaryAction && (
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.text}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}