import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Film, Clock, CalendarDays, ThumbsUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

type Genre = {
  id: number;
  name: string;
};

type QuizState = {
  genres: number[];
  yearRange: string | null;
  duration: string | null;
};

interface OnboardingQuizProps {
  onComplete?: () => void;
}

const OnboardingQuiz = ({ onComplete }: OnboardingQuizProps) => {
  const [step, setStep] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>({
    genres: [],
    yearRange: null,
    duration: null,
  });
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch genres for the first step
  const { data: genres = [], isLoading: isLoadingGenres } = useQuery({
    queryKey: ['/api/genres'],
  });

  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (preferences: QuizState) => {
      return apiRequest('/api/preferences', 'POST', preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      toast({
        title: 'Preferences saved!',
        description: 'Your movie recommendations are ready.',
        duration: 3000,
      });
      if (onComplete) {
        onComplete();
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      toast({
        title: 'Error saving preferences',
        description: 'Please try again later.',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  const handleGenreToggle = (genreId: number) => {
    setQuizState((prev) => {
      const genres = prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId];
      return { ...prev, genres };
    });
  };

  const handleYearRangeSelect = (yearRange: string) => {
    setQuizState((prev) => ({ ...prev, yearRange }));
    goToNextStep();
  };

  const handleDurationSelect = (duration: string) => {
    setQuizState((prev) => ({ ...prev, duration }));
    goToNextStep();
  };

  const goToNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const goToPrevStep = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = () => {
    savePreferences.mutate(quizState);
  };

  // Animation variants
  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  // Quiz steps content
  const renderStepContent = () => {
    switch (step) {
      case 0: // Genre selection
        return (
          <motion.div
            key="genres"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-3xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">What genres do you enjoy watching?</h2>
            <p className="text-muted-foreground mb-8 text-center">Select all that apply</p>
            
            {isLoadingGenres ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {genres.map((genre: Genre) => (
                  <motion.button
                    key={genre.id}
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      quizState.genres.includes(genre.id)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/40 hover:bg-primary/5'
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Film className={`mb-2 h-6 w-6 ${
                      quizState.genres.includes(genre.id) ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <span className="text-sm font-medium">{genre.name}</span>
                  </motion.button>
                ))}
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <motion.button
                onClick={goToNextStep}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={quizState.genres.length === 0}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        );
        
      case 1: // Year range preference
        return (
          <motion.div
            key="yearRange"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">What era of movies do you prefer?</h2>
            <p className="text-muted-foreground mb-8 text-center">Choose one option</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                onClick={() => handleYearRangeSelect('recent')}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <CalendarDays className="mb-3 h-10 w-10 text-primary" />
                <h3 className="text-lg font-semibold mb-1">Recent Releases</h3>
                <p className="text-sm text-muted-foreground text-center">Movies from the last 5 years</p>
              </motion.button>
              
              <motion.button
                onClick={() => handleYearRangeSelect('classic')}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Film className="mb-3 h-10 w-10 text-primary" />
                <h3 className="text-lg font-semibold mb-1">Classic Cinema</h3>
                <p className="text-sm text-muted-foreground text-center">Iconic films throughout the decades</p>
              </motion.button>
              
              <motion.button
                onClick={() => handleYearRangeSelect('all')}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all sm:col-span-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <ThumbsUp className="mb-3 h-10 w-10 text-primary" />
                <h3 className="text-lg font-semibold mb-1">I Enjoy Both</h3>
                <p className="text-sm text-muted-foreground text-center">No specific era preference</p>
              </motion.button>
            </div>
            
            <div className="mt-8 flex justify-between">
              <motion.button
                onClick={goToPrevStep}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md font-medium shadow-md hover:bg-secondary/90 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
            </div>
          </motion.div>
        );
        
      case 2: // Duration preference
        return (
          <motion.div
            key="duration"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">How long do you typically like your movies?</h2>
            <p className="text-muted-foreground mb-8 text-center">Choose one option</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                onClick={() => handleDurationSelect('short')}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Clock className="mb-3 h-10 w-10 text-primary" />
                <h3 className="text-lg font-semibold mb-1">Short</h3>
                <p className="text-sm text-muted-foreground text-center">Less than 100 minutes</p>
              </motion.button>
              
              <motion.button
                onClick={() => handleDurationSelect('medium')}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Clock className="mb-3 h-10 w-10 text-primary" />
                <h3 className="text-lg font-semibold mb-1">Medium</h3>
                <p className="text-sm text-muted-foreground text-center">Between 100-150 minutes</p>
              </motion.button>
              
              <motion.button
                onClick={() => handleDurationSelect('long')}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Clock className="mb-3 h-10 w-10 text-primary" />
                <h3 className="text-lg font-semibold mb-1">Long</h3>
                <p className="text-sm text-muted-foreground text-center">More than 150 minutes</p>
              </motion.button>
            </div>
            
            <div className="mt-8 flex justify-between">
              <motion.button
                onClick={goToPrevStep}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md font-medium shadow-md hover:bg-secondary/90 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
            </div>
          </motion.div>
        );
        
      case 3: // Summary and completion
        return (
          <motion.div
            key="summary"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Perfect! We're all set</h2>
            <p className="text-muted-foreground mb-8 text-center">
              Based on your preferences, we'll curate personalized movie recommendations just for you
            </p>
            
            <div className="bg-card p-6 rounded-xl border border-border mb-8">
              <h3 className="text-lg font-semibold mb-4">Your Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Favorite Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {quizState.genres.map(genreId => {
                      const genre = genres.find((g: Genre) => g.id === genreId);
                      return genre ? (
                        <span key={genreId} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                          {genre.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Era Preference</h4>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {quizState.yearRange === 'recent' && 'Recent Releases'}
                    {quizState.yearRange === 'classic' && 'Classic Cinema'}
                    {quizState.yearRange === 'all' && 'No Era Preference'}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Duration Preference</h4>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {quizState.duration === 'short' && 'Short Movies (< 100 min)'}
                    {quizState.duration === 'medium' && 'Medium Length (100-150 min)'}
                    {quizState.duration === 'long' && 'Long Movies (> 150 min)'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <motion.button
                onClick={goToPrevStep}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md font-medium shadow-md hover:bg-secondary/90 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              
              <motion.button
                onClick={handleSubmit}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={savePreferences.isPending}
              >
                {savePreferences.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Let\'s Go!'
                )}
              </motion.button>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  // Progress bar calculation
  const progress = ((step + 1) / 4) * 100;

  return (
    <div className="min-h-screen flex flex-col pt-10">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        {/* Quiz header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">Personalize Your Experience</h1>
          <p className="text-muted-foreground mt-2">Let's get to know your movie preferences</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full max-w-lg mx-auto mb-10">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className={step >= 0 ? 'text-primary font-medium' : ''}>Genres</span>
            <span className={step >= 1 ? 'text-primary font-medium' : ''}>Era</span>
            <span className={step >= 2 ? 'text-primary font-medium' : ''}>Duration</span>
            <span className={step >= 3 ? 'text-primary font-medium' : ''}>Complete</span>
          </div>
        </div>
        
        {/* Quiz steps */}
        <div className="flex-1 flex items-start justify-center">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuiz;