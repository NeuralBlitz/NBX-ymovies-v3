import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import MovieDetail from "@/pages/MovieDetail";
import Quiz from "@/pages/Quiz";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Navbar from "@/components/Navbar";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";

// Lazily load pages for better performance
const LazyMovieDetail = lazy(() => import("@/pages/MovieDetail"));
const LazySearch = lazy(() => import("@/pages/Search"));

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="w-40 h-40">
          <svg
            className="w-full h-full text-primary animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-center animate-pulse">
          Loading StreamFlix...
        </h2>
      </div>
    );
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
