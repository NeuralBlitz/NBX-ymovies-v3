import React, { useState, useEffect } from "react";

interface AuthBackgroundProps {
  children: React.ReactNode;
}

const AuthBackground = ({ children }: AuthBackgroundProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [placeholderLoaded, setPlaceholderLoaded] = useState(false);

  useEffect(() => {
    // Preload the placeholder image first
    const placeholderImg = new Image();
    placeholderImg.onload = () => {
      setPlaceholderLoaded(true);
      
      // Then preload the full resolution image
      const fullImg = new Image();
      fullImg.onload = () => {
        setImageLoaded(true);
      };
      fullImg.src = "/images/sign-background-large.jpg";
    };
    placeholderImg.src = "/images/sign-background-large-placeholder.jpg";
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Placeholder background - loads first */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          placeholderLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: "url('/images/sign-background-large-placeholder.jpg')",
          filter: "blur(2px) brightness(0.4)",
        }}
      />
      
      {/* Full resolution background - fades in when loaded */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: "url('/images/sign-background-large.jpg')",
          filter: "brightness(0.3)",
        }}
      />
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      
      {/* Noise pattern overlay for texture */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{ 
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Loading indicator when images are loading */}
      {!placeholderLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-sm">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthBackground;
