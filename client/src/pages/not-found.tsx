import React from "react";
import { Button } from "@/components/ui/button";
import { Home, Film } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      {/* Subtle background accent matching site theme */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(1200px_600px_at_50%_-200px,rgba(220,38,38,0.08),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div className="rounded-2xl bg-black/60 backdrop-blur px-6 py-10 md:px-10 md:py-14">
          {/* Error code */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white text-center">
            4<span className="text-red-600">0</span>4
          </h1>

          {/* Message */}
          <div className="mt-4 md:mt-6 text-center">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200">Scene Not Found</h2>
            <p className="mt-3 text-sm md:text-base text-gray-400">
              Text this guy if you really need this page:
              {" "}
              <a
                href="https://yerradouani.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-500 font-medium underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-red-600/30 rounded"
              >
                Yassine Erradouani
              </a>
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 md:px-8 py-3 rounded-lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 md:px-8 py-3 rounded-lg"
            >
              <Link href="/movies">
                <Film className="mr-2 h-5 w-5" />
                Browse Movies
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
