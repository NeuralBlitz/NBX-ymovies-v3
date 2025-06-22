import React from "react";
import { Button } from "@/components/ui/button";
import { Home, Film, Popcorn, Play } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">🎬</div>
        <div className="absolute top-32 right-20 text-4xl">🍿</div>
        <div className="absolute bottom-20 left-20 text-5xl">🎭</div>
        <div className="absolute bottom-32 right-10 text-3xl">🎪</div>
        <div className="absolute top-1/2 left-1/4 text-2xl">🎵</div>
        <div className="absolute top-1/3 right-1/3 text-7xl">📽️</div>
      </div>

      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute animate-bounce delay-100 top-1/4 left-1/5">
          <Film className="h-8 w-8 text-red-500/30" />
        </div>
        <div className="absolute animate-bounce delay-300 bottom-1/3 right-1/4">
          <Play className="h-6 w-6 text-white/20" />
        </div>
        <div className="absolute animate-bounce delay-500 top-1/2 right-1/5">
          <Popcorn className="h-10 w-10 text-yellow-500/30" />
        </div>
      </div>

      <div className="text-center z-10 max-w-2xl mx-4 px-6 py-8 bg-black/40 backdrop-blur-sm rounded-2xl border border-red-500/20">
        {/* Main character - Sad movie reel */}
        <div className="mb-8 relative">
          <div className="text-8xl mb-4 animate-pulse">🎬</div>
          <div className="absolute -top-2 -right-2 text-2xl animate-bounce">😢</div>
        </div>

        {/* Error message */}
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-white mb-2 tracking-wider">
            4<span className="text-red-500">0</span>4
          </h1>
          <h2 className="text-2xl font-semibold text-red-400 mb-4">
            Scene Not Found
          </h2>
          <p className="text-gray-300 text-lg">
            This page got cut from the final edit! 🎞️
          </p>
        </div>

        {/* Fun messages */}
        <div className="mb-8 space-y-3">
          <p className="text-yellow-300 text-sm italic">
            "Even great movies have deleted scenes..." 🎭
          </p>
          <p className="text-gray-400 text-xs">
            Text this guy if you really need this page: <a 
              href="https://yerradouani.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-500 font-medium transition-all duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              Yassine Erradouani
            </a>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-700 px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105">
            <Link href="/movies">
              <Film className="mr-2 h-5 w-5" />
              Browse Movies
            </Link>
          </Button>
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
}
