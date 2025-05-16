import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";

interface Genre {
  id: number;
  name: string;
}

interface QuizState {
  genres: number[];
  yearRange: string | null;
  duration: string | null;
}

const Quiz = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initial quiz state
  const [quizState, setQuizState] = useState<QuizState>({
    genres: [],
    yearRange: null,
    duration: null
  });
  
  // Step tracking for multi-step quiz
  const [currentStep, setCurrentStep] = useState(0);
  
  // Fetch all genres
  const { data: genres, isLoading: isGenresLoading } = useQuery({
    queryKey: ["/api/genres"],
  });
  
  // Fetch existing preferences
  const { data: existingPreferences, isLoading: isPreferencesLoading } = useQuery({
    queryKey: ["/api/preferences"],
  });
  
  // Initialize quiz state with existing preferences if available
  useState(() => {
    if (existingPreferences) {
      setQuizState({
        genres: existingPreferences.genres || [],
        yearRange: existingPreferences.yearRange || null,
        duration: existingPreferences.duration || null
      });
    }
  });
  
  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (preferences: QuizState) => {
      return apiRequest("POST", "/api/preferences", preferences);
    },
    onSuccess: () => {
      toast({
        title: "Preferences Saved",
        description: "Your movie preferences have been saved. We'll use these to recommend movies for you.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to save preferences:", error);
    }
  });
  
  // Toggle genre selection
  const toggleGenre = (genreId: number) => {
    setQuizState((prev) => {
      const genres = prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId];
      
      return { ...prev, genres };
    });
  };
  
  // Set year range preference
  const setYearRange = (yearRange: string) => {
    setQuizState((prev) => ({ ...prev, yearRange }));
  };
  
  // Set duration preference
  const setDuration = (duration: string) => {
    setQuizState((prev) => ({ ...prev, duration }));
  };
  
  // Handle quiz submission
  const handleSubmit = () => {
    if (quizState.genres.length === 0) {
      toast({
        title: "Select Genres",
        description: "Please select at least one genre to continue.",
        variant: "destructive",
      });
      return;
    }
    
    savePreferences.mutate(quizState);
  };
  
  // Next step button handler
  const nextStep = () => {
    if (currentStep === 0 && quizState.genres.length === 0) {
      toast({
        title: "Select Genres",
        description: "Please select at least one genre to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep((prev) => prev + 1);
  };
  
  // Previous step button handler
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  // Loading state
  if (isGenresLoading || isPreferencesLoading) {
    return (
      <div className="container mx-auto pt-24 pb-12 px-4">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-1/2 mb-6" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Quiz steps content
  const steps = [
    // Step 1: Genre Selection
    <div key="genres" className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Which genres do you enjoy watching?</h3>
      <p className="text-muted-foreground mb-6">Select at least one genre to help us recommend movies you'll love.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {genres.map((genre: Genre) => (
          <div 
            key={genre.id}
            className={`quiz-option border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/20 ${
              quizState.genres.includes(genre.id) ? 'selected' : ''
            }`}
            onClick={() => toggleGenre(genre.id)}
          >
            <div className="flex justify-between">
              <h4 className="font-medium mb-1">{genre.name}</h4>
              {quizState.genres.includes(genre.id) && (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>,
    
    // Step 2: Year Range Preference
    <div key="yearRange" className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Do you prefer recent releases or classics?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div 
          className={`quiz-option border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/20 ${
            quizState.yearRange === 'recent' ? 'selected' : ''
          }`}
          onClick={() => setYearRange('recent')}
        >
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium mb-1">Recent Releases</h4>
              <p className="text-sm text-muted-foreground">Movies from the last 5 years</p>
            </div>
            {quizState.yearRange === 'recent' && (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
          </div>
        </div>
        
        <div 
          className={`quiz-option border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/20 ${
            quizState.yearRange === 'classic' ? 'selected' : ''
          }`}
          onClick={() => setYearRange('classic')}
        >
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium mb-1">Classics</h4>
              <p className="text-sm text-muted-foreground">Timeless films from earlier decades</p>
            </div>
            {quizState.yearRange === 'classic' && (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
          </div>
        </div>
      </div>
    </div>,
    
    // Step 3: Duration Preference
    <div key="duration" className="mb-8">
      <h3 className="text-xl font-semibold mb-4">How much time do you have?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div 
          className={`quiz-option border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/20 ${
            quizState.duration === 'short' ? 'selected' : ''
          }`}
          onClick={() => setDuration('short')}
        >
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium mb-1">Under 90 minutes</h4>
              <p className="text-sm text-muted-foreground">Short films and quick watches</p>
            </div>
            {quizState.duration === 'short' && (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
          </div>
        </div>
        
        <div 
          className={`quiz-option border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/20 ${
            quizState.duration === 'medium' ? 'selected' : ''
          }`}
          onClick={() => setDuration('medium')}
        >
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium mb-1">90-120 minutes</h4>
              <p className="text-sm text-muted-foreground">Standard movie length</p>
            </div>
            {quizState.duration === 'medium' && (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
          </div>
        </div>
        
        <div 
          className={`quiz-option border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/20 ${
            quizState.duration === 'long' ? 'selected' : ''
          }`}
          onClick={() => setDuration('long')}
        >
          <div className="flex justify-between">
            <div>
              <h4 className="font-medium mb-1">Over 2 hours</h4>
              <p className="text-sm text-muted-foreground">Epic sagas and longer films</p>
            </div>
            {quizState.duration === 'long' && (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
          </div>
        </div>
      </div>
    </div>
  ];

  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Personalize Your Experience</h2>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          
          {/* Current Step Content */}
          {steps[currentStep]}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate("/")}>
                Cancel
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={savePreferences.isPending || quizState.genres.length === 0}
              >
                {savePreferences.isPending ? "Saving..." : "Save Preferences"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
