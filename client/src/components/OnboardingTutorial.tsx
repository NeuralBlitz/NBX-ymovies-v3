import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

type OnboardingStep = {
  id: number;
  title: string;
  description: string;
  image?: string;
  element?: string; // CSS selector for the element to highlight
  position?: "top" | "right" | "bottom" | "left";
  action?: () => void;
};

export function OnboardingTutorial() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);

  // Define the onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to StreamFlix!",
      description: "Let us show you how to get personalized movie recommendations and make the most of your streaming experience.",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Discover New Movies",
      description: "Browse our extensive collection of movies by categories, trending, or top-rated lists. Hover over any movie to see more details.",
      element: ".movie-card",
      position: "bottom",
    },
    {
      id: 3,
      title: "Take the Preference Quiz",
      description: "Tell us what you like, and we'll recommend movies tailored just for you.",
      element: "[href='/quiz']",
      position: "bottom",
      action: () => navigate("/quiz"),
    },
    {
      id: 4,
      title: "Create Your Watchlist",
      description: "Save movies to watch later by adding them to your personal watchlist.",
      element: ".watchlist-button",
      position: "right",
    },
    {
      id: 5,
      title: "Get Personalized Recommendations",
      description: "Based on your preferences and viewing history, we'll suggest movies you're likely to enjoy.",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      title: "Ready to Start?",
      description: "You're all set to explore and enjoy StreamFlix. Happy streaming!",
      action: () => setIsOpen(false),
    },
  ];

  // Check if user has seen the tutorial
  useEffect(() => {
    const tutorialSeen = localStorage.getItem("tutorial_seen");
    
    if (!tutorialSeen && isAuthenticated) {
      // Delay the tutorial to ensure the UI has loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setHasSeenTutorial(true);
    }
  }, [isAuthenticated]);

  // Handle highlighting elements
  useEffect(() => {
    if (!isOpen) return;
    
    const currentStepData = steps[currentStep];
    
    // Clear previous highlight
    if (overlay) {
      document.body.removeChild(overlay);
      setOverlay(null);
    }
    
    if (highlightedElement) {
      highlightedElement.classList.remove("tutorial-highlight");
      setHighlightedElement(null);
    }
    
    // If there's an element to highlight
    if (currentStepData?.element) {
      const element = document.querySelector(currentStepData.element) as HTMLElement;
      
      if (element) {
        // Create overlay
        const newOverlay = document.createElement("div");
        newOverlay.className = "fixed inset-0 bg-black/50 z-40 pointer-events-none";
        document.body.appendChild(newOverlay);
        setOverlay(newOverlay);
        
        // Highlight element
        element.classList.add("tutorial-highlight");
        setHighlightedElement(element);
        
        // Scroll to element if not in view
        const rect = element.getBoundingClientRect();
        if (
          rect.bottom < 0 ||
          rect.top > window.innerHeight ||
          rect.right < 0 ||
          rect.left > window.innerWidth
        ) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
    
    return () => {
      // Cleanup
      if (overlay) {
        document.body.removeChild(overlay);
      }
      if (highlightedElement) {
        highlightedElement.classList.remove("tutorial-highlight");
      }
    };
  }, [currentStep, isOpen]);

  // Complete the tutorial
  const completeTutorial = () => {
    localStorage.setItem("tutorial_seen", "true");
    setHasSeenTutorial(true);
    setIsOpen(false);
    
    // Execute step action if exists
    if (steps[currentStep]?.action) {
      steps[currentStep].action!();
    }
  };

  // Handle next/prev navigation
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Restart tutorial handler
  const restartTutorial = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  // Skip tutorial handler
  const skipTutorial = () => {
    completeTutorial();
  };

  if (hasSeenTutorial && !isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md animate-in fade-in-50 zoom-in-95 slide-in-from-bottom-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{steps[currentStep]?.title}</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4" 
              onClick={skipTutorial}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          
          {steps[currentStep]?.image && (
            <div className="relative aspect-video overflow-hidden rounded-md mb-4">
              <img
                src={steps[currentStep].image}
                alt={steps[currentStep].title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <DialogDescription className="text-base">
            {steps[currentStep]?.description}
          </DialogDescription>
          
          <div className="flex items-center justify-center mt-2 space-x-1">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
          
          <DialogFooter className="flex justify-between mt-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={goToPrevStep}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              
              <Button
                variant="outline"
                onClick={skipTutorial}
                className="flex items-center"
              >
                Skip Tour
              </Button>
            </div>
            
            <Button onClick={goToNextStep} className="flex items-center">
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Get Started
                  <Check className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add a small button to restart the tutorial */}
      {hasSeenTutorial && (
        <Button
          variant="outline"
          size="sm"
          onClick={restartTutorial}
          className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
        >
          Show Tutorial
        </Button>
      )}
    </>
  );
}

// Add tutorial styles
const style = document.createElement('style');
style.textContent = `
  .tutorial-highlight {
    position: relative;
    z-index: 50;
    animation: pulse 2s infinite;
    box-shadow: 0 0 0 5px rgba(239, 68, 68, 0.5);
    border-radius: 0.25rem;
  }
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 5px rgba(239, 68, 68, 0.5);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(239, 68, 68, 0.3);
    }
  }
`;
document.head.appendChild(style);