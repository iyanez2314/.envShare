import { Button } from "@/components/ui/button";

interface CTASectionProps {
  title: string;
  description: string;
  primaryAction: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  variant?: "primary" | "default";
}

export function CTASection({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "primary",
}: CTASectionProps) {
  const bgClass = variant === "primary" ? "bg-primary text-primary-foreground" : "bg-background";

  return (
    <section className={`py-20 ${bgClass}`}>
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-mono font-bold mb-6">
          {title}
        </h2>
        <p className={`text-xl mb-8 leading-relaxed ${variant === "primary" ? "opacity-90" : "text-muted-foreground"}`}>
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            variant={variant === "primary" ? "secondary" : "default"}
            className="text-lg px-8 py-6"
            onClick={primaryAction.onClick}
          >
            {primaryAction.text}
          </Button>
          {secondaryAction && (
            <Button
              size="lg"
              variant="outline"
              className={`text-lg px-8 py-6 ${
                variant === "primary"
                  ? "border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                  : ""
              }`}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.text}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}