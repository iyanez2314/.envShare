import { useState } from "react";
import { SubscriptionCard } from "./subscription-card";
import { subscriptionPlans } from "@/data/subscription-plans";
import { CreditCard } from "lucide-react";

interface SubscriptionSectionProps {
  currentPlanId?: string;
}

export function SubscriptionSection({ currentPlanId = "free" }: SubscriptionSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlanId) return;

    setIsLoading(true);
    
    // TODO: Implement subscription change logic
    if (planId === "enterprise") {
      // For enterprise, might redirect to contact form
      console.log("Redirecting to contact sales...");
    } else {
      // For other plans, handle subscription upgrade/downgrade
      console.log(`Upgrading to plan: ${planId}`);
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-primary" />
          Subscription Plans
        </h2>
        <p className="text-muted-foreground">
          Choose the plan that best fits your needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlanId}
            onSelect={handlePlanSelect}
          />
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include our core security features and reliable infrastructure.</p>
        <p>Need help choosing? <span className="text-primary cursor-pointer hover:underline">Contact our team</span></p>
      </div>
    </div>
  );
}