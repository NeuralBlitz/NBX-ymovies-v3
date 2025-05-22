import { HTMLAttributes } from "react";
import React from 'react';
import { cn } from "@/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "banner" | "text" | "avatar" | "button";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  variant = "card",
  count = 1,
  className,
  ...props
}: SkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className="space-y-6">
            {Array(count)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative w-40 md:w-48 aspect-[2/3] rounded-md overflow-hidden",
                    className
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  {...props}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 animate-pulse" />
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent">
                    <div className="absolute bottom-4 left-3 w-3/4 h-4 bg-gray-700 rounded animate-pulse" />
                    <div className="absolute bottom-2 left-3 w-1/2 h-2 bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
          </div>
        );

      case "banner":
        return (
          <div
            className={cn(
              "relative w-full aspect-[21/9] md:aspect-[21/7] rounded-lg overflow-hidden",
              className
            )}
            {...props}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-gray-700/20 to-transparent" />
            </div>
            <div className="absolute bottom-8 left-8 right-8 space-y-4">
              <div className="h-8 w-1/3 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-700/70 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-700/70 rounded animate-pulse" />
              <div className="h-10 w-32 mt-4 bg-gray-700 rounded-md animate-pulse" />
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-2">
            {Array(count)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={cn("h-4 bg-gray-700 rounded", className)}
                  style={{ 
                    width: `${Math.floor(Math.random() * 40) + 60}%`,
                    animationDelay: `${i * 0.1}s` 
                  }}
                  {...props}
                />
              ))}
          </div>
        );

      case "avatar":
        return (
          <div
            className={cn(
              "h-10 w-10 rounded-full bg-gray-700 animate-pulse",
              className
            )}
            {...props}
          />
        );

      case "button":
        return (
          <div
            className={cn(
              "h-10 w-24 rounded-md bg-gray-700 animate-pulse",
              className
            )}
            {...props}
          />
        );

      default:
        return null;
    }
  };

  return renderSkeleton();
}

// Add custom animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;
document.head.appendChild(style);