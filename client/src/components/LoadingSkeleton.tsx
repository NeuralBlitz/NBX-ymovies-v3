import { HTMLAttributes } from "react";
import React from 'react';
import { cn } from "@/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "banner" | "text" | "avatar" | "button" | "movie-card" | "tv-card" | "hero-banner" | "slider-title";
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
      case "movie-card":
        return (
          <div className="space-y-4">
            {Array(count)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative w-full aspect-[2/3.2] rounded-lg overflow-hidden group cursor-pointer",
                    className
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  {...props}
                >
                  {/* Main poster skeleton with realistic movie poster gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900">
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
                  </div>
                  
                  {/* Realistic movie poster elements */}
                  <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-between">
                    {/* Top section - rating badge area */}
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-4 bg-slate-600 rounded animate-pulse" />
                      <div className="w-6 h-6 bg-slate-600 rounded-full animate-pulse" />
                    </div>
                    
                    {/* Bottom section - title area */}
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 bg-slate-600 rounded animate-pulse" />
                      <div className="h-2 w-1/2 bg-slate-600/70 rounded animate-pulse" />
                      <div className="flex space-x-1 mt-2">
                        <div className="w-5 h-5 bg-slate-600 rounded-full animate-pulse" />
                        <div className="w-5 h-5 bg-slate-600 rounded-full animate-pulse" />
                        <div className="w-5 h-5 bg-slate-600 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover overlay effect */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
          </div>
        );

      case "tv-card":
        return (
          <div className="space-y-4">
            {Array(count)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative w-full aspect-[16/9] rounded-lg overflow-hidden group cursor-pointer",
                    className
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  {...props}
                >
                  {/* Main backdrop skeleton with TV show styling */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-slate-600/25 to-transparent" />
                  </div>
                  
                  {/* TV show specific elements */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    {/* Top badges */}
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-2">
                        <div className="w-12 h-5 bg-slate-600 rounded animate-pulse" />
                        <div className="w-8 h-5 bg-slate-600 rounded animate-pulse" />
                      </div>
                      <div className="w-8 h-8 bg-slate-600 rounded-full animate-pulse" />
                    </div>
                    
                    {/* Center play button */}
                    <div className="self-center">
                      <div className="w-16 h-16 bg-slate-600 rounded-full animate-pulse opacity-50" />
                    </div>
                    
                    {/* Bottom info */}
                    <div className="space-y-3">
                      <div className="h-6 w-2/3 bg-slate-600 rounded animate-pulse" />
                      <div className="h-4 w-full bg-slate-600/70 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-slate-600/70 rounded animate-pulse" />
                      <div className="flex space-x-2 mt-3">
                        <div className="w-16 h-8 bg-slate-600 rounded animate-pulse" />
                        <div className="w-20 h-8 bg-slate-600 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        );

      case "hero-banner":
        return (
          <div
            className={cn(
              "relative w-full overflow-hidden",
              className
            )}
            style={{ 
              height: window.innerWidth <= 768 ? 'calc(100vh - 70px)' : '100vh'
            }}
            {...props}
          >
            {/* Main hero background */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-slate-700/20 to-transparent" />
            </div>
            
            {/* Hero content area */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 space-y-6">
              {/* Badges row */}
              <div className="flex space-x-3">
                <div className="w-12 h-6 bg-slate-600 rounded animate-pulse" />
                <div className="w-16 h-6 bg-slate-600 rounded animate-pulse" />
                <div className="w-8 h-6 bg-slate-600 rounded animate-pulse" />
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <div className="h-12 md:h-16 w-3/4 md:w-1/2 bg-slate-600 rounded animate-pulse" />
                <div className="h-8 md:h-12 w-1/2 md:w-1/3 bg-slate-600/80 rounded animate-pulse" />
              </div>
              
              {/* Description */}
              <div className="max-w-2xl space-y-2">
                <div className="h-4 w-full bg-slate-600/70 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-600/70 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-slate-600/70 rounded animate-pulse" />
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-4 mt-8">
                <div className="w-32 h-12 bg-slate-600 rounded-md animate-pulse" />
                <div className="w-36 h-12 bg-slate-600 rounded-md animate-pulse" />
              </div>
            </div>
            
            {/* Hero gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
        );

      case "slider-title":
        return (
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-8 w-48 bg-slate-700 rounded animate-pulse" />
            <div className="flex-1 h-px bg-slate-800 animate-pulse" />
          </div>
        );

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