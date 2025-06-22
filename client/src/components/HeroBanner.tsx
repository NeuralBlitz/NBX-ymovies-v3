import React, { useMemo, useState, useEffect } from "react";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tvshow";
import { useLocation } from "wouter";
import { PlayCircle, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  content: Movie | TVShow;
  onNext?: () => void;
  onPrevious?: () => void;
  onIndicatorClick?: (index: number) => void;
  currentIndex?: number;
  totalItems?: number;
}

const HeroBanner = ({ content, onNext, onPrevious, onIndicatorClick, currentIndex = 0, totalItems = 1 }: HeroBannerProps) => {
  const [, navigate] = useLocation();
  const [isLoaded, setIsLoaded] = useState(true); // Start as loaded for initial render
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [displayedContent, setDisplayedContent] = useState(content); // Content currently being displayed
  
  // Handle content changes with smooth transitions
  useEffect(() => {
    // Don't transition if it's the same content
    if (displayedContent?.id === content?.id) {
      return;
    }
    
    // Start transition - fade out current content
    setIsTransitioning(true);
    setIsLoaded(false);
    
    // Preload the new image before updating content
    const img = new Image();
    const newBackdropUrl = content?.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=600&q=80';
    
    img.src = newBackdropUrl;
    
    img.onload = () => {
      // Image is loaded, now update the displayed content and show it
      setTimeout(() => {
        setDisplayedContent(content); // Update the content being displayed
        setImageKey(prev => prev + 1); // Force background image update
        setIsLoaded(true);
        setIsTransitioning(false);
      }, 300); // Small delay for smooth transition
    };
    
    img.onerror = () => {
      // Even if image fails, update content after delay
      setTimeout(() => {
        setDisplayedContent(content);
        setImageKey(prev => prev + 1);
        setIsLoaded(true);
        setIsTransitioning(false);
      }, 300);
    };
    
    // Fallback timer in case image takes too long
    const fallbackTimer = setTimeout(() => {
      setDisplayedContent(content);
      setImageKey(prev => prev + 1);
      setIsLoaded(true);
      setIsTransitioning(false);
    }, 2000);
    
    return () => clearTimeout(fallbackTimer);
  }, [content, displayedContent]);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Check if content is a TV show
  const isTVShow = (content: Movie | TVShow): content is TVShow => {
    return 'name' in content && 'first_air_date' in content;
  };

  // Get backdrop URL
  const backdropUrl = useMemo(() => {
    if (displayedContent?.backdrop_path) {
      return `https://image.tmdb.org/t/p/original${displayedContent.backdrop_path}`;
    }
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=600&q=80';
  }, [displayedContent]);
  
  // Get title (movie or TV show)
  const title = useMemo(() => {
    if (isTVShow(displayedContent)) {
      return displayedContent.name;
    }
    return displayedContent?.title;
  }, [displayedContent]);

  // Get release year
  const releaseYear = useMemo(() => {
    if (isTVShow(displayedContent) && displayedContent?.first_air_date) {
      return new Date(displayedContent.first_air_date).getFullYear();
    } else if (!isTVShow(displayedContent) && displayedContent?.release_date) {
      return new Date(displayedContent.release_date).getFullYear();
    }
    return '';
  }, [displayedContent]);
  
  // Truncate overview for better display
  const truncatedOverview = useMemo(() => {
    if (displayedContent?.overview && displayedContent.overview.length > 200) {
      return displayedContent.overview.substring(0, 200) + '...';
    }
    return displayedContent?.overview || '';
  }, [displayedContent]);

  return (
    <section 
      className="relative w-full max-w-[100vw] overflow-hidden"
      style={{ 
        height: isMobile ? 'calc(100vh - 70px)' : '100vh'
      }}
    >
      {/* Background image WITHOUT cursor interactions */}
      <div 
        key={imageKey}
        className={`absolute inset-0 bg-cover bg-center pointer-events-none ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          backgroundImage: `url('${backdropUrl}')`,
          transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Static overlay without hover effects */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>
      
      {/* Loading fade-in animation with transition support */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-600 ${isLoaded && !isTransitioning ? 'opacity-0' : 'opacity-100'}`}
      ></div>
      
      {/* Gradient overlay with animated subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/50">
        <div className={`absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent opacity-100`}></div>
      </div>
      
      {/* Animated particles effect (subtle) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-0 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 15}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Content with smooth staggered animations and interactive hover */}
      <div 
        className={`relative container mx-auto h-full flex flex-col justify-end px-4 pb-16 md:pb-24 pt-20 ${isLoaded && !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{
          transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="max-w-xl mt-10">
          {/* Badge row with smooth slide-in animation */}
          <div 
            className={`flex items-center space-x-2 mb-2 delay-100 ${isLoaded && !isTransitioning ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`} 
            style={{ 
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {isLoaded && !isTransitioning && (
              <>
                <div className="flex items-center bg-black/40 rounded-md px-2 py-1 backdrop-blur-sm">
                  <Star className="text-yellow-500 h-4 w-4 mr-1" />
                  <span className="text-primary font-bold">{Math.round(displayedContent?.vote_average * 10)}% Match</span>
                </div>
                
                {/* Content type badge (Movie or TV Show) */}
                <span className="bg-primary/70 backdrop-blur-sm border border-primary px-2 py-0.5 text-xs rounded">
                  {isTVShow(displayedContent) ? 'TV SHOW' : 'MOVIE'}
                </span>
                
                {(!isTVShow(displayedContent) && displayedContent?.adult) ? (
                  <span className="bg-red-800/70 backdrop-blur-sm border border-red-700 px-2 py-0.5 text-xs rounded">R</span>
                ) : (
                  <span className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 px-2 py-0.5 text-xs rounded">PG-13</span>
                )}
                
                <span className="bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded text-sm">{releaseYear}</span>
                
                <span className="bg-black/30 backdrop-blur-sm border border-gray-700 px-2 py-0.5 text-xs rounded">HD</span>
              </>
            )}
          </div>
          
          {/* Title with smooth fade-out/fade-in animation */}
          <h1 
            className={`text-4xl md:text-6xl font-bold mb-4 delay-200 ${isLoaded && !isTransitioning ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.7)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {isLoaded && !isTransitioning ? title : ''}
          </h1>
          
          {/* Description with smooth fade-in animation */}
          <p 
            className={`text-lg mb-8 delay-300 ${isLoaded && !isTransitioning ? 'translate-y-0 opacity-90' : 'translate-y-4 opacity-0'}`}
            style={{
              maxWidth: '700px',
              lineHeight: '1.6',
              textShadow: '0 1px 4px rgba(0,0,0,0.9)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {isLoaded && !isTransitioning ? truncatedOverview : ''}
          </p>
          
          {/* Buttons with smooth scale & glow animations */}
          <div 
            className={`flex space-x-4 delay-400 ${isLoaded && !isTransitioning ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{
              transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Button 
              className={`bg-white text-black hover:bg-red-600 hover:text-white hero-button transform ${isHovered ? 'scale-105' : 'scale-100'}`}
              onClick={() => navigate(isTVShow(displayedContent) ? `/tv/${displayedContent.id}` : `/movie/${displayedContent.id}`)}
            >
              <PlayCircle className={`mr-2 h-5 w-5 ${isHovered ? 'animate-pulse' : ''}`} />
              Play
            </Button>
            
            <Button 
              variant="secondary" 
              className={`bg-gray-500/40 hover:bg-gray-700 backdrop-blur-sm border border-gray-500 hero-button transform ${isHovered ? 'scale-105' : 'scale-100'}`}
              onClick={() => navigate(isTVShow(displayedContent) ? `/tv/${displayedContent.id}` : `/movie/${displayedContent.id}`)}
            >
              <Info className="mr-2 h-5 w-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>
      
      {/* Navigation arrows */}
      {onNext && onPrevious && totalItems > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/60 backdrop-blur-sm border border-white/20 rounded-full p-3 group"
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
          >
            <ChevronLeft className="h-6 w-6 text-white group-hover:text-primary transition-colors duration-200" />
          </button>

          {/* Next button */}
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/60 backdrop-blur-sm border border-white/20 rounded-full p-3 group"
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
          >
            <ChevronRight className="h-6 w-6 text-white group-hover:text-primary transition-colors duration-200" />
          </button>

          {/* Minimal connected progress indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-1">
            {Array.from({ length: totalItems }).map((_, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => onIndicatorClick?.(index)}
                  className="progress-dot-container relative group cursor-pointer w-2 h-2 flex items-center justify-center"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {/* Main dot - much smaller and more subtle */}
                  <div 
                    className={`relative w-1.5 h-1.5 rounded-full transition-all duration-300 ease-out ${
                      index === currentIndex
                        ? 'bg-primary scale-110 shadow-sm shadow-primary/30'
                        : 'bg-white/30 hover:bg-white/50 hover:scale-105'
                    }`}
                  ></div>
                  
                  {/* Subtle glow for active dot only */}
                  {index === currentIndex && (
                    <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-primary/20 scale-125 blur-sm"></div>
                  )}
                </button>
                
                {/* Connection line between dots (except for the last dot) */}
                {index < totalItems - 1 && (
                  <div 
                    className={`w-4 h-px transition-all duration-300 ${
                      index < currentIndex 
                        ? 'bg-primary/60' 
                        : index === currentIndex
                        ? 'bg-gradient-to-r from-primary/60 to-white/20'
                        : 'bg-white/20'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom reflection/glow effect */}
      <div 
        className={`absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-red-600/0 via-red-600/30 to-red-600/0 transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      ></div>
    </section>
  );
};

// Add custom animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
      opacity: 0;
    }
    10%, 90% {
      opacity: 0.2;
    }
    50% {
      transform: translateY(-30vh);
      opacity: 0.3;
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes gentlePulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.4);
      opacity: 0.1;
    }
  }
  
  .animate-float {
    animation: float linear infinite;
  }
  
  .animate-slide-in {
    animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .text-shadow-lg {
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  }
  
  .hero-gradient {
    background: linear-gradient(to top, var(--background), transparent);
  }
  
  .hero-transition {
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Improved button hover effects */
  .hero-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hero-button:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  }
  
  /* Enhanced progress indicator animations - simplified */
  .progress-dot-container {
    position: relative;
  }
  
  .progress-dot-container:hover {
    transform: scale(1.1);
  }
  
  /* Subtle hover effect for connection lines */
  .progress-dot-container:hover + div {
    opacity: 0.8;
  }
`;
document.head.appendChild(style);

export default HeroBanner;

