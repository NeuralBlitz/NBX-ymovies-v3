import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Play, ArrowRight, ArrowUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTrendingMovies, getTrendingTVShows } from "@/lib/tmdb";

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

const Landing = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { data: trendingMovies } = useQuery<MediaItem[]>({
    queryKey: ["landing-trending-movies"],
    queryFn: () => getTrendingMovies("week"),
    staleTime: 1000 * 60 * 30,
  });

  const { data: trendingTV } = useQuery<MediaItem[]>({
    queryKey: ["landing-trending-tv"],
    queryFn: () => getTrendingTVShows("week"),
    staleTime: 1000 * 60 * 30,
  });

  const showcase = useMemo(() => {
    if (!trendingMovies?.length) return [];
    return trendingMovies
      .filter((m) => m.backdrop_path && m.overview)
      .slice(0, 5);
  }, [trendingMovies]);

  const posterWall = useMemo(() => {
    const movies = (trendingMovies || []).filter((m) => m.poster_path);
    const tv = (trendingTV || []).filter((m) => m.poster_path);
    const combined = [...movies, ...tv];
    const unique = combined.filter(
      (item, i, arr) => arr.findIndex((a) => a.id === item.id) === i,
    );
    return unique.slice(0, 18);
  }, [trendingMovies, trendingTV]);

  const current = showcase[activeIndex];

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showcase.length < 2) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % showcase.length);
    }, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showcase.length]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToContent = () => {
    const target = document.getElementById("discover");
    target?.scrollIntoView({ behavior: "smooth" });
  };

  const getTitle = (item: MediaItem) => item.title || item.name || "";
  const getYear = (item: MediaItem) => {
    const d = item.release_date || item.first_air_date;
    return d ? new Date(d).getFullYear() : "";
  };

  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* ===== HERO — FULL BLEED CINEMATIC ===== */}
      <section ref={heroRef} className="relative h-screen w-full">
        {/* Backdrop layers */}
        {showcase.map((item, i) => (
          <div
            key={item.id}
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          >
            <img
              src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
              alt=""
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-20 sm:pb-28 px-6 sm:px-12 lg:px-20">
          <div
            className={`max-w-3xl transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            {/* Brand */}
            <div className="mb-8">
              <h1 className="font-logo text-5xl sm:text-7xl lg:text-8xl text-white tracking-wider leading-none">
                YMOVIES
              </h1>
              <div className="h-1 w-16 bg-red-600 mt-3" />
            </div>

            {/* Active movie info */}
            {current && (
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="text-red-500 font-semibold uppercase tracking-widest text-xs">
                    Trending Now
                  </span>
                  <span className="w-px h-4 bg-gray-700" />
                  <span>{getYear(current)}</span>
                  {current.vote_average > 0 && (
                    <>
                      <span className="w-px h-4 bg-gray-700" />
                      <span className="text-yellow-500">
                        {current.vote_average.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {getTitle(current)}
                </h2>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl line-clamp-3">
                  {current.overview}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <Link href="/home">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white gap-2 px-8 rounded-sm text-base"
                >
                  <Play className="w-4 h-4 fill-white" /> Start Exploring
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 gap-2 px-8 rounded-sm text-base"
                >
                  Create Account <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Timeline dots */}
          {showcase.length > 1 && (
            <div className="absolute bottom-8 right-6 sm:right-12 lg:right-20 flex flex-col gap-2">
              {showcase.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveIndex(i);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                  }}
                  className={`w-2 rounded-full transition-all duration-500 ${
                    i === activeIndex
                      ? "h-8 bg-red-600"
                      : "h-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scroll cue */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/80 transition-colors animate-bounce"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* ===== DISCOVER SECTION — POSTER MOSAIC ===== */}
      <section id="discover" className="relative py-24 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — text */}
            <div>
              <p className="text-red-500 text-xs font-semibold uppercase tracking-[0.25em] mb-4">
                What is YMovies
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Your taste.{" "}
                <span className="text-red-600">Your algorithm.</span>
                <br />
                Your next obsession.
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-lg">
                YMovies is a personal entertainment companion that learns how
                you watch. Our hybrid recommendation engine combines
                collaborative filtering with content analysis to surface the
                films and shows that actually match your taste, not just
                what is popular.
              </p>

              <div className="space-y-5 mb-10">
                {[
                  {
                    num: "01",
                    label: "Discover",
                    desc: "Browse 800K+ titles with smart filters, genres, and mood-based browsing.",
                  },
                  {
                    num: "02",
                    label: "Track",
                    desc: "Continue watching across devices. Episode tracking, progress bars, watch history.",
                  },
                  {
                    num: "03",
                    label: "Connect",
                    desc: "See where to stream. We show you every platform a title is available on.",
                  },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4 items-start">
                    <span className="text-red-600 font-logo text-2xl leading-none mt-0.5">
                      {step.num}
                    </span>
                    <div>
                      <p className="font-semibold text-white mb-0.5">
                        {step.label}
                      </p>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/home">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 rounded-sm gap-2 px-8 text-base"
                >
                  Explore the Catalog <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Right — poster mosaic */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-3 gap-3">
                {posterWall.slice(0, 9).map((item, i) => {
                  const isLarge = i === 1 || i === 4;
                  return (
                    <Link
                      key={item.id}
                      href={
                        item.title
                          ? `/movie/${item.id}`
                          : `/tv/${item.id}`
                      }
                    >
                      <div
                        className={`relative overflow-hidden rounded-lg group ${isLarge ? "row-span-2" : ""}`}
                        style={{ aspectRatio: isLarge ? "2/3" : "2/2.4" }}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={getTitle(item)}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-xs font-medium truncate">
                            {getTitle(item)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Decorative glow */}
              <div className="absolute -inset-8 bg-red-600/5 rounded-3xl -z-10 blur-3xl" />
            </div>

            {/* Mobile poster strip */}
            <div className="lg:hidden -mx-6 px-6 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 pb-2" style={{ width: "max-content" }}>
                {posterWall.slice(0, 8).map((item) => (
                  <Link
                    key={item.id}
                    href={
                      item.title ? `/movie/${item.id}` : `/tv/${item.id}`
                    }
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                      alt={getTitle(item)}
                      className="w-28 rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES — MINIMAL CARDS ===== */}
      <section className="py-24 px-6 sm:px-12 lg:px-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-red-500 text-xs font-semibold uppercase tracking-[0.25em] mb-4">
              Built Different
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Not another movie database
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              {
                title: "AI Recommendations",
                desc: "13+ personalized categories that evolve with your viewing patterns. No generic top-10 lists.",
                accent: "from-red-600/20 to-transparent",
              },
              {
                title: "Where to Watch",
                desc: "Instantly see which streaming platforms carry each title. Stop switching between apps.",
                accent: "from-blue-600/20 to-transparent",
              },
              {
                title: "Episode Tracking",
                desc: "Mark episodes watched, track progress across seasons, and always know what is next.",
                accent: "from-green-600/20 to-transparent",
              },
              {
                title: "Continue Watching",
                desc: "Pick up exactly where you left off. Progress bars, time remaining, and smart resume.",
                accent: "from-purple-600/20 to-transparent",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`relative p-8 sm:p-10 bg-[#0a0a0a] group hover:bg-[#111] transition-colors duration-300`}
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${feature.accent}`}
                />
                <p className="text-red-600 font-logo text-3xl mb-6">
                  0{i + 1}
                </p>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRENDING RIBBON ===== */}
      {trendingMovies && trendingMovies.length > 0 && (
        <section className="py-24 px-6 sm:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-red-500 text-xs font-semibold uppercase tracking-[0.25em] mb-2">
                  Right Now
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Trending This Week
                </h2>
              </div>
              <Link href="/home">
                <span className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:inline-flex items-center gap-1">
                  See all <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trendingMovies
                .filter((m) => m.poster_path)
                .slice(0, 6)
                .map((movie, i) => (
                  <Link key={movie.id} href={`/movie/${movie.id}`}>
                    <div className="group relative">
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={getTitle(movie)}
                          className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-2 left-2">
                          <span className="font-logo text-3xl text-white/20 group-hover:text-white/60 transition-colors">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium mt-2 truncate group-hover:text-red-500 transition-colors">
                        {getTitle(movie)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{getYear(movie)}</span>
                        {movie.genre_ids?.[0] && GENRE_MAP[movie.genre_ids[0]] && (
                          <>
                            <span className="w-1 h-1 bg-gray-600 rounded-full" />
                            <span>{GENRE_MAP[movie.genre_ids[0]]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FINAL CTA — CINEMATIC ===== */}
      <section className="relative py-32 px-6 sm:px-12 lg:px-20 overflow-hidden">
        {/* Ambient backdrop */}
        {showcase[2] && (
          <>
            <img
              src={`https://image.tmdb.org/t/p/original${showcase[2].backdrop_path}`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-15"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
          </>
        )}

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Stop scrolling.
            <br />
            <span className="text-red-600">Start watching.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join YMovies and let your next favorite movie find you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/home">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 text-base rounded-sm gap-2"
              >
                <Play className="w-4 h-4 fill-white" /> Start Now
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-10 py-5 text-base rounded-sm"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-16 px-6 sm:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2">
              <h3 className="font-logo text-2xl text-red-600 tracking-wider mb-3">
                YMOVIES
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                A personal entertainment companion. Discover, track, and
                experience movies and TV shows tailored to your taste.
              </p>
            </div>

            {/* Browse */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("browse")}
                className="flex items-center gap-2 mb-4 md:pointer-events-none"
              >
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Browse
                </h4>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 md:hidden transition-transform ${openSections["browse"] ? "rotate-180" : ""}`}
                />
              </button>
              <ul
                className={`space-y-2.5 ${openSections["browse"] ? "block" : "hidden"} md:block`}
              >
                <li>
                  <Link
                    href="/home"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/movies"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Movies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tv"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    TV Shows
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Search
                  </Link>
                </li>
              </ul>
            </div>

            {/* Genres */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("genres")}
                className="flex items-center gap-2 mb-4 md:pointer-events-none"
              >
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Genres
                </h4>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 md:hidden transition-transform ${openSections["genres"] ? "rotate-180" : ""}`}
                />
              </button>
              <ul
                className={`space-y-2.5 ${openSections["genres"] ? "block" : "hidden"} md:block`}
              >
                <li>
                  <Link
                    href="/genre/movie/action"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Action
                  </Link>
                </li>
                <li>
                  <Link
                    href="/genre/movie/drama"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Drama
                  </Link>
                </li>
                <li>
                  <Link
                    href="/genre/movie/comedy"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Comedy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/genre/movie/thriller"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Thriller
                  </Link>
                </li>
                <li>
                  <Link
                    href="/genre/movie/horror"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Horror
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("account")}
                className="flex items-center gap-2 mb-4 md:pointer-events-none"
              >
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Account
                </h4>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 md:hidden transition-transform ${openSections["account"] ? "rotate-180" : ""}`}
                />
              </button>
              <ul
                className={`space-y-2.5 ${openSections["account"] ? "block" : "hidden"} md:block`}
              >
                <li>
                  <Link
                    href="/signin"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-list"
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                  >
                    My List
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-600">
                <Link
                  href="/privacy"
                  className="hover:text-gray-400 transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-gray-400 transition-colors"
                >
                  Terms
                </Link>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>&copy; {new Date().getFullYear()} YMovies</span>
                <span className="w-px h-3 bg-gray-800" />
                <a
                  href="/humans.txt"
                  className="relative group hover:text-gray-400 transition-colors"
                >
                  Crafted by yours truly
                </a>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/yassnemo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/yassnemo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/in/yassnemo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-all duration-500 ${
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Landing;
