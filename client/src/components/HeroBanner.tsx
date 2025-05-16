import { useMemo, useState, useEffect } from "react";
import { Movie } from "@/types/movie";
import { useLocation } from "wouter";
import { PlayCircle, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  movie: Movie;
}

const HeroBanner = ({ movie }: HeroBannerProps) => {
  const [, navigate] = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get backdrop URL
  const backdropUrl = useMemo(() => {
    if (movie?.backdrop_path) {
      return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    }
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=600&q=80';
  }, [movie]);
  
  // Get release year
  const releaseYear = useMemo(() => {
    if (movie?.release_date) {
      return new Date(movie.release_date).getFullYear();
    }
    return '';
  }, [movie]);
  
  // Truncate overview for better display
  const truncatedOverview = useMemo(() => {
    if (movie?.overview && movie.overview.length > 200) {
      return movie.overview.substring(0, 200) + '...';
    }
    return movie?.overview || '';
  }, [movie]);

  // Simulate image loading
  useEffect(() => {
    const img = new Image();
    img.src = backdropUrl;
    img.onload = () => {
      setIsLoaded(true);
    };
    
    // Fallback timer in case image takes too long
    const timer = setTimeout(() => {
      if (!isLoaded) setIsLoaded(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [backdropUrl, isLoaded]);

  return (
    <section 
      className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image with subtle zoom animation */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out ${isHovered ? 'scale-105' : 'scale-100'}`}
        style={{ 
          backgroundImage: `url('${backdropUrl}')`,
          transform: `${isHovered ? 'scale(1.05)' : 'scale(1)'}`,
          transition: 'transform 10s ease-out'
        }}
      >
        {/* Overlay that dims slightly on hover */}
        <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ${isHovered ? 'opacity-30' : 'opacity-40'}`}></div>
      </div>
      
      {/* Loading fade-in animation */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
      ></div>
      
      {/* Gradient overlay with animated subtle glow */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 hero-gradient">
        <div className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent opacity-100`}></div>
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
      
      {/* Content with staggered fade-in animations */}
      <div className={`relative container mx-auto h-full flex items-end pb-16 px-4 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-xl">
          {/* Badge row with slide-in animation */}
          <div className={`flex items-center space-x-2 mb-2 transition-all duration-700 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="flex items-center bg-black/30 rounded-md px-2 py-1 backdrop-blur-sm">
              <Star className="text-yellow-500 h-4 w-4 mr-1" />
              <span className="text-primary font-bold">{Math.round(movie?.vote_average * 10)}% Match</span>
            </div>
            
            {movie?.adult ? (
              <span className="bg-red-800/70 backdrop-blur-sm border border-red-700 px-2 py-0.5 text-xs rounded">R</span>
            ) : (
              <span className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 px-2 py-0.5 text-xs rounded">PG-13</span>
            )}
            
            <span className="bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded text-sm">{releaseYear}</span>
            
            <span className="bg-black/30 backdrop-blur-sm border border-gray-700 px-2 py-0.5 text-xs rounded">HD</span>
          </div>
          
          {/* Title with masked reveal animation */}
          <h1 
            className={`text-4xl md:text-6xl font-bold mb-4 transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100 text-shadow-lg' : 'translate-y-4 opacity-0'}`}
            style={{
              textShadow: isHovered ? '0 0 30px rgba(255,0,0,0.3), 0 0 10px rgba(255,255,255,0.3)' : 'none',
              transition: 'text-shadow 1.5s ease-in-out, transform 1s ease-out, opacity 1s ease-out'
            }}
          >
            {movie?.title}
          </h1>
          
          {/* Description with fade-in animation */}
          <p 
            className={`text-lg mb-8 transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-90' : 'translate-y-4 opacity-0'}`}
            style={{
              maxWidth: '700px',
              lineHeight: '1.6'
            }}
          >
            {truncatedOverview}
          </p>
          
          {/* Buttons with scale & glow animations */}
          <div className={`flex space-x-4 transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Button 
              className={`bg-white text-black hover:bg-red-600 hover:text-white transition-all duration-300 transform ${isHovered ? 'scale-105' : 'scale-100'}`}
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              <PlayCircle className={`mr-2 h-5 w-5 transition-all ${isHovered ? 'animate-pulse' : ''}`} />
              Play
            </Button>
            
            <Button 
              variant="secondary" 
              className={`bg-gray-500/40 hover:bg-gray-700 backdrop-blur-sm border border-gray-500 transition-all duration-300 transform ${isHovered ? 'scale-105' : 'scale-100'}`}
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              <Info className="mr-2 h-5 w-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>
      
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
  
  .animate-float {
    animation: float linear infinite;
  }
  
  .text-shadow-lg {
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  }
  
  .hero-gradient {
    background: linear-gradient(to top, var(--background), transparent);
  }
`;
document.head.appendChild(style);

export default HeroBanner;
