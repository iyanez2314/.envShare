import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import type { SubscriptionPlan } from "@/data/subscription-plans";

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelect: (planId: string) => void;
}

export function SubscriptionCard({ plan, isCurrentPlan = false, onSelect }: SubscriptionCardProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `$${price}`;
  };

  const formatLimits = (limit: number) => {
    if (limit === -1) return "Unlimited";
    return limit.toString();
  };

  return (
    <Card className={`relative ${plan.isPopular ? "border-primary ring-2 ring-primary/20" : ""} ${isCurrentPlan ? "border-green-500" : ""}`}>
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            <Crown className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Current Plan
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="text-sm">{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
          {plan.price > 0 && <span className="text-muted-foreground">/{plan.interval}</span>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Projects:</span>
            <span className="font-medium">{formatLimits(plan.maxProjects)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Team Members:</span>
            <span className="font-medium">{formatLimits(plan.maxTeamMembers)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Features:</h4>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          className="w-full mt-6"
          variant={isCurrentPlan ? "secondary" : plan.isPopular ? "default" : "outline"}
          onClick={() => onSelect(plan.id)}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? "Current Plan" : plan.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}