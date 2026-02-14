import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  element?: string;
}

const TUTORIAL_SEEN_KEY = "tutorial_seen";

const STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to YMovies",
    description:
      "Discover movies and TV shows tailored to your taste. We'll walk you through the key features.",
  },
  {
    id: 2,
    title: "Browse & Discover",
    description:
      "Explore trending, popular, and top-rated titles. Use the search bar for anything specific, or browse by genre.",
    element: ".movie-card",
  },
  {
    id: 3,
    title: "Build Your Watchlist",
    description:
      "Tap the bookmark icon on any title to save it for later. You'll find your full list under My List.",
    element: ".watchlist-button",
  },
  {
    id: 4,
    title: "Personalized Recommendations",
    description:
      "The more you watch and rate, the smarter your recommendations get. Rate movies to fine-tune your feed.",
  },
  {
    id: 5,
    title: "You're All Set",
    description:
      "Start exploring — your personalized home page is ready. You can always revisit this guide from Settings.",
  },
];

export function OnboardingTutorial() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_SEEN_KEY);
    if (!seen && isAuthenticated) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const complete = useCallback(() => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, "true");
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  const next = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      complete();
    }
  }, [currentStep, complete]);

  const prev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) complete(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{step.title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={complete}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <DialogDescription className="text-base">
          {step.description}
        </DialogDescription>

        <div className="flex items-center justify-center mt-2 space-x-1">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex justify-between mt-4">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={prev} disabled={currentStep === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={complete}>
              Skip
            </Button>
          </div>

          <Button onClick={next}>
            {isLast ? (
              <>
                Get Started
                <Check className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}