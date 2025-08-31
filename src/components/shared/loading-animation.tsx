import { GitBranch, Zap, Code, Database } from "lucide-react";

export function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="text-center space-y-6">
        {/* Animated Icons */}
        <div className="relative">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-bounce [animation-delay:-0.3s]">
              <GitBranch className="h-8 w-8 text-blue-500" />
            </div>
            <div className="animate-bounce [animation-delay:-0.15s]">
              <Code className="h-8 w-8 text-green-500" />
            </div>
            <div className="animate-bounce">
              <Database className="h-8 w-8 text-purple-500" />
            </div>
            <div className="animate-bounce [animation-delay:-0.45s]">
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          {/* Pulsing ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full border-2 border-primary/20 animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Loading your environment secrets...
          </h3>
          <p className="text-sm text-muted-foreground animate-pulse">
            Preparing your secure workspace
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex items-center justify-center space-x-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
