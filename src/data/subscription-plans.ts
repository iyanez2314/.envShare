export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  maxProjects: number;
  maxTeamMembers: number;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for personal projects and getting started",
    price: 0,
    interval: "month",
    features: [
      "Up to 3 projects",
      "Basic environment variable management",
      "Individual user access",
      "Community support",
      "Basic encryption"
    ],
    buttonText: "Current Plan",
    maxProjects: 3,
    maxTeamMembers: 1,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Ideal for growing teams and professional use",
    price: 19,
    interval: "month",
    features: [
      "Unlimited projects",
      "Advanced environment variable management",
      "Up to 10 team members",
      "Priority email support",
      "Advanced encryption & security",
      "Project templates",
      "Audit logs"
    ],
    isPopular: true,
    buttonText: "Upgrade to Pro",
    maxProjects: -1, // unlimited
    maxTeamMembers: 10,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with advanced security needs",
    price: 49,
    interval: "month",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "SSO integration",
      "Advanced compliance features",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "On-premises deployment option"
    ],
    buttonText: "Contact Sales",
    maxProjects: -1, // unlimited
    maxTeamMembers: -1, // unlimited
  },
];