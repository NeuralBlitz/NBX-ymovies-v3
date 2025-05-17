import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import MovieDetail from "@/pages/MovieDetail";
import TVShowDetail from "@/pages/TVShowDetail";
import TVShows from "@/pages/TVShows";
import Quiz from "@/pages/Quiz";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import ApiTest from "@/pages/ApiTest";
import Navbar from "@/components/Navbar";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy, useEffect, useState } from "react";
import OnboardingQuiz from "@/components/OnboardingQuiz";

// Lazily load pages for better performance
const LazyMovieDetail = lazy(() => import("@/pages/MovieDetail"));
const LazyTVShowDetail = lazy(() => import("@/pages/TVShowDetail"));
const LazyTVShows = lazy(() => import("@/pages/TVShows"));
const LazySearch = lazy(() => import("@/pages/Search"));

function Router() {
  const { isAuthenticated, isLoading, isError } = useAuth();
  const [, navigate] = useLocation();
  
  // Show home page with non-personalized content for users who aren't authenticated
  // This allows the app to be usable without requiring login
  
  // Loading state while checking authentication (only shown briefly on first load)
  if (isLoading && !isError) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Navbar />
      <OnboardingTutorial />
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/search" component={LazySearch} />
          <Route path="/movie/:id" component={LazyMovieDetail} />
          <Route path="/tv" component={LazyTVShows} />
          <Route path="/tv/:id" component={LazyTVShowDetail} />
          <Route path="/api-test" component={ApiTest} />
          <Route path="/quiz">
            {isAuthenticated ? <Quiz /> : 
              <AuthRequired message="Please log in to take the recommendation quiz" />
            }
          </Route>
          <Route path="/profile">
            {isAuthenticated ? <Profile /> : 
              <AuthRequired message="Please log in to view your profile" />
            }
          </Route>
          <Route path="/settings">
            {isAuthenticated ? <Settings /> : 
              <AuthRequired message="Please log in to access settings" />
            }
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

// Loading fallback with skeleton UI
function LoadingFallback() {
  return (
    <div className="container mx-auto pt-20 px-4 space-y-8">
      <LoadingSkeleton variant="banner" />
      <div className="space-y-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 ml-2 w-48 h-8 bg-gray-800 rounded animate-pulse"></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 ml-2 w-56 h-8 bg-gray-800 rounded animate-pulse"></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Auth required message component
function AuthRequired({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <p className="text-lg">{message}</p>
      <a 
        href="/api/login" 
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Sign In
      </a>
    </div>
  );
}

function App() {
  return (
    <div className="app-wrapper overflow-x-hidden w-full max-w-[100vw]">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
