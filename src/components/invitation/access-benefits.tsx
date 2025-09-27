import { CheckCircle } from "lucide-react";

const benefits = [
  "Organization environment variables",
  "Collaborative project management",
  "Team member coordination",
];

export function AccessBenefits() {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
        What you'll get access to:
      </h3>
      <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3" />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}