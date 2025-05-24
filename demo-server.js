import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 5001; // Changed to 5001 to avoid conflict

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Add a health check endpoint with more details
app.get('/api/health', (req, res) => {
  // Send detailed health information
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'YMovies Demo API',
    version: '1.0.0',
    endpoints: [
      '/api/trending/movie/week',
      '/api/movie/popular',
      '/api/movie/:id',
      '/api/movie/:id/similar',
      '/api/movie/:id/videos',
      '/api/movie/:id/reviews',
      '/api/tv/:id',
      '/api/tv/:id/similar',
      '/api/tv/:id/videos',
      '/api/tv/:id/reviews',
      '/api/recommendations',
      '/api/watchlist',
      '/api/preferences'
    ]
  });
});

// Add OPTIONS handler for CORS preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

// Simple API endpoints to simulate our movie app
app.get('/api/trending/movie/week', (req, res) => {
  // Log the request to help debug
  console.log('Received request for trending movies:', req.url);
  
  // Simulated trending movies data
  const trendingMovies = [
    {
      id: 1,
      title: "The Matrix",
      overview: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
      poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      backdrop_path: "/icmmSD4vTTDKOq2vvdulafONZBT.jpg",
      release_date: "1999-03-30",
      vote_average: 8.2,
      vote_count: 22465,
      adult: false,
      genre_ids: [28, 878]
    },
    {
      id: 2,
      title: "Inception",
      overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
      release_date: "2010-07-16",
      vote_average: 8.4,
      vote_count: 30545,
      adult: false,
      genre_ids: [28, 878, 53]
    },
    {
      id: 3,
      title: "Interstellar",
      overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
      release_date: "2014-11-05",
      vote_average: 8.4,
      vote_count: 26925,
      adult: false,
      genre_ids: [12, 18, 878]
    }
  ];
  
  // Send response with delay to simulate network latency
  setTimeout(() => {
    // Wrap in results object to match TMDB API format
    res.json({
      page: 1,
      results: trendingMovies,
      total_pages: 1,
      total_results: trendingMovies.length
    });
  }, 500);
});

app.get('/api/movie/popular', (req, res) => {
  // Simulated popular movies
  const popularMovies = [
    {
      id: 4,
      title: "Pulp Fiction",
      overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
      release_date: "1994-10-14",
      vote_average: 8.5,
      vote_count: 23234,
      adult: false,
      genre_ids: [53, 80]
    },
    {
      id: 5,
      title: "Fight Club",
      overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdrop_path: "/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      vote_count: 24659,
      adult: false,
      genre_ids: [18]
    },
    {
      id: 6,
      title: "The Shawshank Redemption",
      overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
      release_date: "1994-09-23",
      vote_average: 8.7,
      vote_count: 21325,
      adult: false,
      genre_ids: [18, 80]
    }
  ];
  
  // Send response in TMDB API format
  res.json({
    page: 1,
    results: popularMovies,
    total_pages: 1,
    total_results: popularMovies.length
  });
});

// Movie detail endpoint
app.get('/api/movie/:id', (req, res) => {
  const movieId = parseInt(req.params.id);
  console.log(`Received request for movie details: ${movieId}`);
  
  // Sample detailed movie data
  const movieDetails = {
    1: {
      id: 1,
      title: "The Matrix",
      overview: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
      poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      backdrop_path: "/icmmSD4vTTDKOq2vvdulafONZBT.jpg",
      release_date: "1999-03-30",
      vote_average: 8.2,
      vote_count: 22465,
      adult: false,
      genres: [
        { id: 28, name: "Action" },
        { id: 878, name: "Science Fiction" }
      ],
      runtime: 136,
      tagline: "Welcome to the Real World.",
      status: "Released",
      budget: 63000000,
      revenue: 463517383,
      homepage: "http://www.warnerbros.com/matrix",
      imdb_id: "tt0133093",
      original_language: "en",
      production_companies: [
        { id: 79, name: "Village Roadshow Pictures" },
        { id: 372, name: "Warner Bros. Pictures" }
      ],
      credits: {
        cast: [
          { id: 6384, name: "Keanu Reeves", character: "Neo", profile_path: "/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg" },
          { id: 2975, name: "Laurence Fishburne", character: "Morpheus", profile_path: "/8suOhUmPbfKqDQ17jQ1Gy0a5Lc3.jpg" },
          { id: 530, name: "Carrie-Anne Moss", character: "Trinity", profile_path: "/xD4jTA3KmVp5Rq3aHcymL9DUGjD.jpg" }
        ],
        crew: [
          { id: 9340, name: "Lana Wachowski", job: "Director", department: "Directing" },
          { id: 9341, name: "Lilly Wachowski", job: "Director", department: "Directing" }
        ]
      }
    },
    2: {
      id: 2,
      title: "Inception",
      overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
      release_date: "2010-07-16",
      vote_average: 8.4,
      vote_count: 30545,
      adult: false,
      genres: [
        { id: 28, name: "Action" },
        { id: 878, name: "Science Fiction" },
        { id: 53, name: "Thriller" }
      ],
      runtime: 148,
      tagline: "Your mind is the scene of the crime.",
      status: "Released",
      budget: 160000000,
      revenue: 825532764,
      homepage: "https://www.warnerbros.com/movies/inception",
      imdb_id: "tt1375666",
      original_language: "en",
      production_companies: [
        { id: 9996, name: "Legendary Pictures" },
        { id: 923, name: "Syncopy" },
        { id: 372, name: "Warner Bros. Pictures" }
      ],
      credits: {
        cast: [
          { id: 2524, name: "Leonardo DiCaprio", character: "Dom Cobb", profile_path: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg" },
          { id: 24045, name: "Joseph Gordon-Levitt", character: "Arthur", profile_path: "/1tIZXYuniHQP7Han15JZOAH0TfT.jpg" },
          { id: 27578, name: "Ellen Page", character: "Ariadne", profile_path: "/vJZhP8LyOthKIxAgLZnYTGzMuMF.jpg" }
        ],
        crew: [
          { id: 525, name: "Christopher Nolan", job: "Director", department: "Directing" },
          { id: 525, name: "Christopher Nolan", job: "Writer", department: "Writing" }
        ]
      }
    },
    3: {
      id: 3,
      title: "Interstellar",
      overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
      release_date: "2014-11-05",
      vote_average: 8.4,
      vote_count: 26925,
      adult: false,
      genres: [
        { id: 12, name: "Adventure" },
        { id: 18, name: "Drama" },
        { id: 878, name: "Science Fiction" }
      ],
      runtime: 169,
      tagline: "Mankind was born on Earth. It was never meant to die here.",
      status: "Released",
      budget: 165000000,
      revenue: 677463813,
      homepage: "https://www.warnerbros.com/movies/interstellar",
      imdb_id: "tt0816692",
      original_language: "en",
      production_companies: [
        { id: 9996, name: "Legendary Pictures" },
        { id: 923, name: "Syncopy" },
        { id: 372, name: "Warner Bros. Pictures" }
      ],
      credits: {
        cast: [
          { id: 2524, name: "Matthew McConaughey", character: "Cooper", profile_path: "/e9ZHRY5toCA1P4BV2uLYVlt5Z5.jpg" },
          { id: 4238, name: "Anne Hathaway", character: "Brand", profile_path: "/tLelKoPNiyJCSEtQTz1FGv4TLGp.jpg" },
          { id: 54693, name: "Jessica Chastain", character: "Murph", profile_path: "/lodMzLKSdrPcBry6TdoDsMN3Vge.jpg" }
        ],
        crew: [
          { id: 525, name: "Christopher Nolan", job: "Director", department: "Directing" },
          { id: 525, name: "Christopher Nolan", job: "Writer", department: "Writing" }
        ]
      }
    },
    4: {
      id: 4,
      title: "Pulp Fiction",
      overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
      release_date: "1994-10-14",
      vote_average: 8.5,
      vote_count: 23234,
      adult: false,
      genres: [
        { id: 53, name: "Thriller" },
        { id: 80, name: "Crime" }
      ],
      runtime: 154,
      tagline: "Just because you are a character doesn't mean you have character.",
      status: "Released",
      budget: 8000000,
      revenue: 213928762,
      homepage: "https://www.miramax.com/movie/pulp-fiction/",
      imdb_id: "tt0110912",
      original_language: "en",
      production_companies: [
        { id: 14, name: "Miramax" },
        { id: 59, name: "A Band Apart" }
      ],
      credits: {
        cast: [
          { id: 62, name: "John Travolta", character: "Vincent Vega", profile_path: "/gs4mNpJfEn4BDK6XO1JsJLVOYhY.jpg" },
          { id: 72, name: "Samuel L. Jackson", character: "Jules Winnfield", profile_path: "/nCJJ3FiR6c3f7t6wSR4SGI8wH61.jpg" },
          { id: 1037, name: "Uma Thurman", character: "Mia Wallace", profile_path: "/6GBt2Pu7TdJzPKC8ccSjYEa9M8K.jpg" }
        ],
        crew: [
          { id: 138, name: "Quentin Tarantino", job: "Director", department: "Directing" },
          { id: 138, name: "Quentin Tarantino", job: "Writer", department: "Writing" }
        ]
      }
    },
    5: {
      id: 5,
      title: "Fight Club",
      overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdrop_path: "/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      vote_count: 24659,
      adult: false,
      genres: [
        { id: 18, name: "Drama" }
      ],
      runtime: 139,
      tagline: "Mischief. Mayhem. Soap.",
      status: "Released",
      budget: 63000000,
      revenue: 100853753,
      homepage: "http://www.foxmovies.com/movies/fight-club",
      imdb_id: "tt0137523",
      original_language: "en",
      production_companies: [
        { id: 508, name: "Regency Enterprises" },
        { id: 711, name: "Fox 2000 Pictures" }
      ],
      credits: {
        cast: [
          { id: 287, name: "Brad Pitt", character: "Tyler Durden", profile_path: "/kU3B75TyRiCgE270EyZnHjfivoq.jpg" },
          { id: 819, name: "Edward Norton", character: "The Narrator", profile_path: "/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg" },
          { id: 1283, name: "Helena Bonham Carter", character: "Marla Singer", profile_path: "/DDeITcCpnBd0CkAIRPhggy9bVHQ.jpg" }
        ],
        crew: [
          { id: 7467, name: "David Fincher", job: "Director", department: "Directing" }
        ]
      }
    },
    6: {
      id: 6,
      title: "The Shawshank Redemption",
      overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
      release_date: "1994-09-23",
      vote_average: 8.7,
      vote_count: 21325,
      adult: false,
      genres: [
        { id: 18, name: "Drama" },
        { id: 80, name: "Crime" }
      ],
      runtime: 142,
      tagline: "Fear can hold you prisoner. Hope can set you free.",
      status: "Released",
      budget: 25000000,
      revenue: 28341469,
      homepage: "",
      imdb_id: "tt0111161",
      original_language: "en",
      production_companies: [
        { id: 97, name: "Castle Rock Entertainment" }
      ],
      credits: {
        cast: [
          { id: 504, name: "Tim Robbins", character: "Andy Dufresne", profile_path: "/A4fMRfnLnuqbr3MuRRf6oylBvmv.jpg" },
          { id: 192, name: "Morgan Freeman", character: "Ellis Boyd 'Red' Redding", profile_path: "/1H1yK9f1FehmBfwjqbsGv9dEeay.jpg" }
        ],
        crew: [
          { id: 4027, name: "Frank Darabont", job: "Director", department: "Directing" }
        ]
      }
    }
  };
  
  // Check if the movie exists in our mock data
  if (movieDetails[movieId]) {
    // Add a slight delay to simulate network latency
    setTimeout(() => {
      res.json(movieDetails[movieId]);
    }, 500);
  } else {
    // Return a generic movie if ID not found
    const genericMovie = {
      id: movieId,
      title: `Movie ${movieId}`,
      overview: "This is a placeholder for a movie that isn't in our demo database.",
      poster_path: "/placeholder.jpg",
      backdrop_path: "/placeholder_backdrop.jpg",
      release_date: "2023-01-01",
      vote_average: 7.5,
      vote_count: 1000,
      adult: false,
      genres: [{ id: 28, name: "Action" }],
      runtime: 120,
      tagline: "Every demo needs a tagline.",
      status: "Released",
      budget: 100000000,
      revenue: 300000000,
      homepage: "",
      imdb_id: `tt${Math.floor(1000000 + Math.random() * 9000000)}`,
      original_language: "en",
      production_companies: [{ id: 1, name: "Demo Studios" }],
      credits: {
        cast: [
          { id: 1, name: "Actor One", character: "Character One", profile_path: null },
          { id: 2, name: "Actor Two", character: "Character Two", profile_path: null }
        ],
        crew: [
          { id: 1, name: "Director Person", job: "Director", department: "Directing" }
        ]
      }
    };
    
    setTimeout(() => {
      res.json(genericMovie);
    }, 500);
  }
});

// Movie similar endpoint
app.get('/api/movie/:id/similar', (req, res) => {
  const movieId = parseInt(req.params.id);
  console.log(`Received request for similar movies to movie ID: ${movieId}`);
  
  // Sample similar movies
  const similarMovies = [
    {
      id: 601,
      title: "E.T. the Extra-Terrestrial",
      overview: "After a gentle alien becomes stranded on Earth, the being is discovered and befriended by a young boy named Elliott.",
      poster_path: "/an0nD6uq6byfxXCfk6lQBzdL2J2.jpg",
      backdrop_path: "/wUkK4QQ6t3bSMjS1t277M7p6uJi.jpg",
      release_date: "1982-06-11",
      vote_average: 7.9,
      vote_count: 10768,
      genre_ids: [878, 12, 10751]
    },
    {
      id: 11,
      title: "Star Wars",
      overview: "Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire.",
      poster_path: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      backdrop_path: "/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg",
      release_date: "1977-05-25",
      vote_average: 8.2,
      vote_count: 15075,
      genre_ids: [12, 28, 878]
    },
    {
      id: 121,
      title: "The Lord of the Rings: The Two Towers",
      overview: "Frodo and Sam are trekking to Mordor to destroy the One Ring while Gimli, Legolas and Aragorn search for the orc-captured Merry and Pippin.",
      poster_path: "/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg",
      backdrop_path: "/7tNTPZMb13W0AhkcuoL6myRrNRr.jpg",
      release_date: "2002-12-18",
      vote_average: 8.3,
      vote_count: 15765,
      genre_ids: [12, 14, 28]
    }
  ];
  
  setTimeout(() => {
    res.json({
      page: 1,
      results: similarMovies,
      total_pages: 1,
      total_results: similarMovies.length
    });
  }, 300);
});

// Movie videos endpoint
app.get('/api/movie/:id/videos', (req, res) => {
  const movieId = parseInt(req.params.id);
  console.log(`Received request for videos for movie ID: ${movieId}`);
  
  // Sample video data
  const videoData = [
    {
      id: "5c3b8c81c3a3683a6a079972",
      key: "aSHs224Dge0",
      name: "Official Trailer",
      site: "YouTube",
      size: 1080,
      type: "Trailer",
      iso_639_1: "en",
      iso_3166_1: "US",
      official: true,
      published_at: "2018-09-13T14:09:15.000Z"
    },
    {
      id: "5c3b8cc3c3a3683a69078ddf",
      key: "QwievZ1Tx-8",
      name: "Teaser Trailer",
      site: "YouTube",
      size: 1080,
      type: "Teaser",
      iso_639_1: "en",
      iso_3166_1: "US",
      official: true,
      published_at: "2018-06-09T15:00:04.000Z"
    }
  ];
  
  setTimeout(() => {
    res.json({
      id: movieId,
      results: videoData
    });
  }, 300);
});

// Movie reviews endpoint
app.get('/api/movie/:id/reviews', (req, res) => {
  const movieId = parseInt(req.params.id);
  console.log(`Received request for reviews for movie ID: ${movieId}`);
  
  // Sample review data
  const reviewData = [
    {
      id: "5c3b8cc3c3a3683a69078de0",
      author: "MovieFan123",
      content: "This movie was absolutely amazing! The visuals were stunning and the storyline kept me engaged throughout. The characters were well-developed and I found myself emotionally invested in their journey.",
      created_at: "2022-01-15T14:09:15.000Z",
      url: "",
      author_details: {
        username: "MovieFan123",
        rating: 9,
        avatar_path: null
      }
    },
    {
      id: "5c3b8cc3c3a3683a69078de1",
      author: "CriticGuy",
      content: "While the movie had impressive visuals, I found the plot to be somewhat predictable. Some scenes dragged on unnecessarily. Overall, it was decent but not exceptional.",
      created_at: "2022-01-20T10:30:00.000Z",
      url: "",
      author_details: {
        username: "CriticGuy",
        rating: 6,
        avatar_path: null
      }
    }
  ];
  
  setTimeout(() => {
    res.json({
      id: movieId,
      page: 1,
      results: reviewData,
      total_pages: 1,
      total_results: reviewData.length
    });
  }, 300);
});

// TV show detail endpoint
app.get('/api/tv/:id', (req, res) => {
  const tvId = parseInt(req.params.id);
  console.log(`Received request for TV show details: ${tvId}`);
  
  // Sample detailed TV show data
  const tvDetails = {
    1: {
      id: 1,
      name: "Breaking Bad",
      overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
      poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      first_air_date: "2008-01-20",
      vote_average: 8.7,
      vote_count: 8392,
      genres: [
        { id: 18, name: "Drama" },
        { id: 80, name: "Crime" }
      ],
      number_of_seasons: 5,
      number_of_episodes: 62,
      tagline: "Remember my name",
      status: "Ended",
      homepage: "https://www.amc.com/shows/breaking-bad",
      original_language: "en",
      production_companies: [
        { id: 2605, name: "High Bridge Productions" },
        { id: 33742, name: "Sony Pictures Television Studios" }
      ],
      credits: {
        cast: [
          { id: 17419, name: "Bryan Cranston", character: "Walter White", profile_path: "/7Jahy5LZX2Fo8fGJltMreAI49hd.jpg" },
          { id: 84497, name: "Aaron Paul", character: "Jesse Pinkman", profile_path: "/qJRB789cg0pvfni4BDO8phQDic8.jpg" },
          { id: 14969, name: "Anna Gunn", character: "Skyler White", profile_path: "/aVVmrJ7HkqvcBSPVRg6nGN0wUzV.jpg" }
        ],
        crew: [
          { id: 66633, name: "Vince Gilligan", job: "Creator", department: "Production" },
          { id: 66633, name: "Vince Gilligan", job: "Executive Producer", department: "Production" }
        ]
      }
    },
    2: {
      id: 2,
      name: "Stranger Things",
      overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
      poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      first_air_date: "2016-07-15",
      vote_average: 8.6,
      vote_count: 13873,
      genres: [
        { id: 18, name: "Drama" },
        { id: 10765, name: "Sci-Fi & Fantasy" },
        { id: 9648, name: "Mystery" }
      ],
      number_of_seasons: 4,
      number_of_episodes: 34,
      tagline: "The world is turning upside down",
      status: "Returning Series",
      homepage: "https://www.netflix.com/title/80057281",
      original_language: "en",
      production_companies: [
        { id: 2575, name: "21 Laps Entertainment" },
        { id: 170364, name: "Monkey Massacre" }
      ],
      credits: {
        cast: [
          { id: 1356210, name: "Millie Bobby Brown", character: "Eleven", profile_path: "/3Gmy0xF5FLzlwLeCCWlRdKZ6GZr.jpg" },
          { id: 1919049, name: "Finn Wolfhard", character: "Mike Wheeler", profile_path: "/z9Jmw9D0UI5FcyYBzuguXKsRuZ.jpg" },
          { id: 1919032, name: "Gaten Matarazzo", character: "Dustin Henderson", profile_path: "/fPxPQrPR9dQQJ23BZycOq16698C.jpg" }
        ],
        crew: [
          { id: 1179419, name: "Matt Duffer", job: "Creator", department: "Production" },
          { id: 1179422, name: "Ross Duffer", job: "Creator", department: "Production" }
        ]
      }
    }
  };
  
  // Check if the TV show exists in our mock data
  if (tvDetails[tvId]) {
    // Add a slight delay to simulate network latency
    setTimeout(() => {
      res.json(tvDetails[tvId]);
    }, 500);
  } else {
    // Return a generic TV show if ID not found
    const genericTVShow = {
      id: tvId,
      name: `TV Show ${tvId}`,
      overview: "This is a placeholder for a TV show that isn't in our demo database.",
      poster_path: "/placeholder.jpg",
      backdrop_path: "/placeholder_backdrop.jpg",
      first_air_date: "2020-01-01",
      vote_average: 7.5,
      vote_count: 1000,
      genres: [{ id: 18, name: "Drama" }],
      number_of_seasons: 3,
      number_of_episodes: 24,
      tagline: "Every demo needs a tagline.",
      status: "Returning Series",
      homepage: "",
      original_language: "en",
      production_companies: [{ id: 1, name: "Demo Studios" }],
      credits: {
        cast: [
          { id: 1, name: "Actor One", character: "Character One", profile_path: null },
          { id: 2, name: "Actor Two", character: "Character Two", profile_path: null }
        ],
        crew: [
          { id: 1, name: "Producer Person", job: "Executive Producer", department: "Production" }
        ]
      }
    };
    
    setTimeout(() => {
      res.json(genericTVShow);
    }, 500);
  }
});

// TV similar endpoint
app.get('/api/tv/:id/similar', (req, res) => {
  const tvId = parseInt(req.params.id);
  console.log(`Received request for similar shows to TV ID: ${tvId}`);
  
  // Sample similar TV shows
  const similarTVShows = [
    {
      id: 100,
      name: "The Wire",
      overview: "A chronicle of the Baltimore drug scene, seen through the eyes of drug dealers and law enforcement.",
      poster_path: "/4lbclFySvugI51fwsyxBTOm4DqK.jpg",
      backdrop_path: "/hV9T3fUXgmbUakLLDuJnRQoWJ2Y.jpg",
      first_air_date: "2002-06-02",
      vote_average: 8.6,
      vote_count: 2274,
      genre_ids: [18, 80]
    },
    {
      id: 101,
      name: "The Sopranos",
      overview: "New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life that affect his mental state.",
      poster_path: "/6nNZnnUkXcI3DvdrkclulanYXzg.jpg",
      backdrop_path: "/eCgBnGOSM0PommQtk9uyUABpKfy.jpg",
      first_air_date: "1999-01-10",
      vote_average: 8.6,
      vote_count: 2099,
      genre_ids: [18, 80]
    },
    {
      id: 102,
      name: "Better Call Saul",
      overview: "Six years before Saul Goodman meets Walter White, he is known as small-time lawyer Jimmy McGill.",
      poster_path: "/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg",
      backdrop_path: "/hPea3Qy5Gd6z4kJLUruBbwAH8Rm.jpg",
      first_air_date: "2015-02-08",
      vote_average: 8.5,
      vote_count: 3203,
      genre_ids: [18, 80]
    }
  ];
  
  setTimeout(() => {
    res.json({
      page: 1,
      results: similarTVShows,
      total_pages: 1,
      total_results: similarTVShows.length
    });
  }, 300);
});

// TV videos endpoint
app.get('/api/tv/:id/videos', (req, res) => {
  const tvId = parseInt(req.params.id);
  console.log(`Received request for videos for TV ID: ${tvId}`);
  
  // Sample video data
  const videoData = [
    {
      id: "5c3b8c81c3a3683a6a079973",
      key: "HhesaQXLuRY",
      name: "Official Trailer",
      site: "YouTube",
      size: 1080,
      type: "Trailer",
      iso_639_1: "en",
      iso_3166_1: "US",
      official: true,
      published_at: "2019-06-27T17:00:00.000Z"
    },
    {
      id: "5c3b8cc3c3a3683a69078de2",
      key: "b9EkMc79ZSU",
      name: "Season Teaser",
      site: "YouTube",
      size: 1080,
      type: "Teaser",
      iso_639_1: "en",
      iso_3166_1: "US",
      official: true,
      published_at: "2019-05-20T16:00:04.000Z"
    }
  ];
  
  setTimeout(() => {
    res.json({
      id: tvId,
      results: videoData
    });
  }, 300);
});

// TV reviews endpoint
app.get('/api/tv/:id/reviews', (req, res) => {
  const tvId = parseInt(req.params.id);
  console.log(`Received request for reviews for TV ID: ${tvId}`);
  
  // Sample review data
  const reviewData = [
    {
      id: "5c3b8cc3c3a3683a69078de3",
      author: "TVCritic",
      content: "This show has some of the best character development I've seen in television. Each episode builds on the last and creates a compelling narrative that keeps you wanting more.",
      created_at: "2022-02-15T14:09:15.000Z",
      url: "",
      author_details: {
        username: "TVCritic",
        rating: 9.5,
        avatar_path: null
      }
    },
    {
      id: "5c3b8cc3c3a3683a69078de4",
      author: "SeriesWatcher",
      content: "The first season started off slow but really picked up midway through. By the finale, I was completely hooked. Can't wait for the next season!",
      created_at: "2022-02-20T10:30:00.000Z",
      url: "",
      author_details: {
        username: "SeriesWatcher",
        rating: 8,
        avatar_path: null
      }
    }
  ];
  
  setTimeout(() => {
    res.json({
      id: tvId,
      page: 1,
      results: reviewData,
      total_pages: 1,
      total_results: reviewData.length
    });
  }, 300);
});

// User preferences endpoint
app.get('/api/preferences', (req, res) => {
  // Return empty preferences
  res.json({
    favorites: [],
    watchlist: [],
    ratings: {}
  });
});

// Movie detail endpoint
app.get('/api/movie/:id', (req, res) => {
  const movieId = parseInt(req.params.id);
  console.log(`Received request for movie details: ${movieId}`);
  
  // Sample detailed movie data
  const movieDetails = {
    1: {
      id: 1,
      title: "The Matrix",
      overview: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
      poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      backdrop_path: "/icmmSD4vTTDKOq2vvdulafONZBT.jpg",
      release_date: "1999-03-30",
      vote_average: 8.2,
      vote_count: 22465,
      adult: false,
      genres: [
        { id: 28, name: "Action" },
        { id: 878, name: "Science Fiction" }
      ],
      runtime: 136,
      tagline: "Welcome to the Real World.",
      status: "Released",
      budget: 63000000,
      revenue: 463517383,
      homepage: "http://www.warnerbros.com/matrix",
      imdb_id: "tt0133093",
      original_language: "en",
      production_companies: [
        { id: 79, name: "Village Roadshow Pictures" },
        { id: 372, name: "Warner Bros. Pictures" }
      ],
      credits: {
        cast: [
          { id: 6384, name: "Keanu Reeves", character: "Neo", profile_path: "/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg" },
          { id: 2975, name: "Laurence Fishburne", character: "Morpheus", profile_path: "/8suOhUmPbfKqDQ17jQ1Gy0a5Lc3.jpg" },
          { id: 530, name: "Carrie-Anne Moss", character: "Trinity", profile_path: "/xD4jTA3KmVp5Rq3aHcymL9DUGjD.jpg" }
        ],
        crew: [
          { id: 9340, name: "Lana Wachowski", job: "Director", department: "Directing" },
          { id: 9341, name: "Lilly Wachowski", job: "Director", department: "Directing" }
        ]
      }
    },
    2: {
      id: 2,
      title: "Inception",
      overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
      release_date: "2010-07-16",
      vote_average: 8.4,
      vote_count: 30545,
      adult: false,
      genres: [
        { id: 28, name: "Action" },
        { id: 878, name: "Science Fiction" },
        { id: 53, name: "Thriller" }
      ],
      runtime: 148,
      tagline: "Your mind is the scene of the crime.",
      status: "Released",
      budget: 160000000,
      revenue: 825532764,
      homepage: "https://www.warnerbros.com/movies/inception",
      imdb_id: "tt1375666",
      original_language: "en",
      production_companies: [
        { id: 9996, name: "Legendary Pictures" },
        { id: 923, name: "Syncopy" },
        { id: 372, name: "Warner Bros. Pictures" }
      ],
      credits: {
        cast: [
          { id: 2524, name: "Leonardo DiCaprio", character: "Dom Cobb", profile_path: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg" },
          { id: 24045, name: "Joseph Gordon-Levitt", character: "Arthur", profile_path: "/1tIZXYuniHQP7Han15JZOAH0TfT.jpg" },
          { id: 27578, name: "Ellen Page", character: "Ariadne", profile_path: "/vJZhP8LyOthKIxAgLZnYTGzMuMF.jpg" }
        ],
        crew: [
          { id: 525, name: "Christopher Nolan", job: "Director", department: "Directing" },
          { id: 525, name: "Christopher Nolan", job: "Writer", department: "Writing" }
        ]
      }
    },
    3: {
      id: 3,
      title: "Interstellar",
      overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
      release_date: "2014-11-05",
      vote_average: 8.4,
      vote_count: 26925,
      adult: false,
      genres: [
        { id: 12, name: "Adventure" },
        { id: 18, name: "Drama" },
        { id: 878, name: "Science Fiction" }
      ],
      runtime: 169,
      tagline: "Mankind was born on Earth. It was never meant to die here.",
      status: "Released",
      budget: 165000000,
      revenue: 677463813,
      homepage: "https://www.warnerbros.com/movies/interstellar",
      imdb_id: "tt0816692",
      original_language: "en",
      production_companies: [
        { id: 9996, name: "Legendary Pictures" },
        { id: 923, name: "Syncopy" },
        { id: 372, name: "Warner Bros. Pictures" }
      ],
      credits: {
        cast: [
          { id: 2524, name: "Matthew McConaughey", character: "Cooper", profile_path: "/e9ZHRY5toCA1P4BV2uLYVlt5Z5.jpg" },
          { id: 4238, name: "Anne Hathaway", character: "Brand", profile_path: "/tLelKoPNiyJCSEtQTz1FGv4TLGp.jpg" },
          { id: 54693, name: "Jessica Chastain", character: "Murph", profile_path: "/lodMzLKSdrPcBry6TdoDsMN3Vge.jpg" }
        ],
        crew: [
          { id: 525, name: "Christopher Nolan", job: "Director", department: "Directing" },
          { id: 525, name: "Christopher Nolan", job: "Writer", department: "Writing" }
        ]
      }
    },
    4: {
      id: 4,
      title: "Pulp Fiction",
      overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
      release_date: "1994-10-14",
      vote_average: 8.5,
      vote_count: 23234,
      adult: false,
      genres: [
        { id: 53, name: "Thriller" },
        { id: 80, name: "Crime" }
      ],
      runtime: 154,
      tagline: "Just because you are a character doesn't mean you have character.",
      status: "Released",
      budget: 8000000,
      revenue: 213928762,
      homepage: "https://www.miramax.com/movie/pulp-fiction/",
      imdb_id: "tt0110912",
      original_language: "en",
      production_companies: [
        { id: 14, name: "Miramax" },
        { id: 59, name: "A Band Apart" }
      ],
      credits: {
        cast: [
          { id: 62, name: "John Travolta", character: "Vincent Vega", profile_path: "/gs4mNpJfEn4BDK6XO1JsJLVOYhY.jpg" },
          { id: 72, name: "Samuel L. Jackson", character: "Jules Winnfield", profile_path: "/nCJJ3FiR6c3f7t6wSR4SGI8wH61.jpg" },
          { id: 1037, name: "Uma Thurman", character: "Mia Wallace", profile_path: "/6GBt2Pu7TdJzPKC8ccSjYEa9M8K.jpg" }
        ],
        crew: [
          { id: 138, name: "Quentin Tarantino", job: "Director", department: "Directing" },
          { id: 138, name: "Quentin Tarantino", job: "Writer", department: "Writing" }
        ]
      }
    },
    5: {
      id: 5,
      title: "Fight Club",
      overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdrop_path: "/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      vote_count: 24659,
      adult: false,
      genres: [
        { id: 18, name: "Drama" }
      ],
      runtime: 139,
      tagline: "Mischief. Mayhem. Soap.",
      status: "Released",
      budget: 63000000,
      revenue: 100853753,
      homepage: "http://www.foxmovies.com/movies/fight-club",
      imdb_id: "tt0137523",
      original_language: "en",
      production_companies: [
        { id: 508, name: "Regency Enterprises" },
        { id: 711, name: "Fox 2000 Pictures" }
      ],
      credits: {
        cast: [
          { id: 287, name: "Brad Pitt", character: "Tyler Durden", profile_path: "/kU3B75TyRiCgE270EyZnHjfivoq.jpg" },
          { id: 819, name: "Edward Norton", character: "The Narrator", profile_path: "/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg" },
          { id: 1283, name: "Helena Bonham Carter", character: "Marla Singer", profile_path: "/DDeITcCpnBd0CkAIRPhggy9bVHQ.jpg" }
        ],
        crew: [
          { id: 7467, name: "David Fincher", job: "Director", department: "Directing" }
        ]
      }
    },
    6: {
      id: 6,
      title: "The Shawshank Redemption",
      overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
      release_date: "1994-09-23",
      vote_average: 8.7,
      vote_count: 21325,
      adult: false,
      genres: [
        { id: 18, name: "Drama" },
        { id: 80, name: "Crime" }
      ],
      runtime: 142,
      tagline: "Fear can hold you prisoner. Hope can set you free.",
      status: "Released",
      budget: 25000000,
      revenue: 28341469,
      homepage: "",
      imdb_id: "tt0111161",
      original_language: "en",
      production_companies: [
        { id: 97, name: "Castle Rock Entertainment" }
      ],
      credits: {
        cast: [
          { id: 504, name: "Tim Robbins", character: "Andy Dufresne", profile_path: "/A4fMRfnLnuqbr3MuRRf6oylBvmv.jpg" },
          { id: 192, name: "Morgan Freeman", character: "Ellis Boyd 'Red' Redding", profile_path: "/1H1yK9f1FehmBfwjqbsGv9dEeay.jpg" }
        ],
        crew: [
          { id: 4027, name: "Frank Darabont", job: "Director", department: "Directing" }
        ]
      }
    }
  };
  
  // Check if the movie exists in our mock data
  if (movieDetails[movieId]) {
    // Add a slight delay to simulate network latency
    setTimeout(() => {
      res.json(movieDetails[movieId]);
    }, 500);
  } else {
    // Return a generic movie if ID not found
    const genericMovie = {
      id: movieId,
      title: `Movie ${movieId}`,
      overview: "This is a placeholder for a movie that isn't in our demo database.",
      poster_path: "/placeholder.jpg",
      backdrop_path: "/placeholder_backdrop.jpg",
      release_date: "2023-01-01",
      vote_average: 7.5,
      vote_count: 1000,
      adult: false,
      genres: [{ id: 28, name: "Action" }],
      runtime: 120,
      tagline: "Every demo needs a tagline.",
      status: "Released",
      budget: 100000000,
      revenue: 300000000,
      homepage: "",
      imdb_id: `tt${Math.floor(1000000 + Math.random() * 9000000)}`,
      original_language: "en",
      production_companies: [{ id: 1, name: "Demo Studios" }],
      credits: {
        cast: [
          { id: 1, name: "Actor One", character: "Character One", profile_path: null },
          { id: 2, name: "Actor Two", character: "Character Two", profile_path: null }
        ],
        crew: [
          { id: 1, name: "Director Person", job: "Director", department: "Directing" }
        ]
      }
    };
    
    setTimeout(() => {
      res.json(genericMovie);
    }, 500);
  }
});

// Movie similar endpoint
app.get('/api/movie/:id/similar', (req, res) => {
  const movieId = parseInt(req.params.id);
  console.log(`Received request for similar movies to movie ID: ${movieId}`);
  
  // Sample similar movies
  const similarMovies = [
    {
      id: 601,
      title: "E.T. the Extra-Terrestrial",
      overview: "After a gentle alien becomes stranded on Earth, the being is discovered and befriended by a young boy named Elliott.",
      poster_path: "/an0nD6uq6byfxXCfk6lQBzdL2J2.jpg",
      backdrop_path: "/wUkK4QQ6t3bSMjS1t277M7p6uJi.jpg",
      release_date: "1982-06-11",
      vote_average: 7.9,
      vote_count: 10768,
      genre_ids: [878, 12, 10751]
    },
    {
      id: 11,
      title: "Star Wars",
      overview: "Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire.",
      poster_path: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      backdrop_path: "/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg",
      release_date: "1977-05-25",
      vote_average: 8.2,
      vote_count: 15075,
      genre_ids: [12, 28, 878]
    },
    {
      id: 121,
      title: "The Lord of the Rings: The Two Towers",
      overview: "Frodo and Sam are trekking to Mordor to destroy the One Ring while Gimli, Legolas and Aragorn search for the orc-captured Merry and Pippin.",
      poster_path: "/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg",
      backdrop_path: "/7tNTPZMb13W0AhkcuoL6myRrNRr.jpg",
      release_date: "2002-12-18",
      vote_average: 8.3,
      vote_count: 15765,
      genre_ids: [12, 14, 28]
    }
  ];
  
  setTimeout(() => {
    res.json({
      page: 1,
      results: similarMovies,
      total_pages: 1,
      total_results: similarMovies.length
    });
  }, 300);
});

// Movie videos endpoint
app.get('/api/movie/:id/videos', (req, res) => {
  const movieId = parseInt(req.params.id);
  console.log(`Received request for videos for movie ID: ${movieId}`);
  
  // Sample video data
  const videoData = [
    {
      id: "5c3b8c81c3a3683a6a079972",
      key: "aSHs224Dge0",
      name: "Official Trailer",
      site: "YouTube",
      size: 1080,
      type: "Trailer",
      iso_639_1: "en",
      iso_3166_1: "US",
      official: true,
      published_at: "2018-09-13T14:09:15.000Z"
    },
    {
      id: "5c3b8cc3c3a3683a69078ddf",
      key: "QwievZ1Tx-8",
      name: "Teaser Trailer",
      site: "YouTube",
      size: 1080,
      type: "Teaser",
      iso_639_1: "en",
      iso_3166_1: "US",
      official: true,
      published_at: "2018-06-09T15:00:04.000Z"
    }
  ];
  
  setTimeout(() => {
    res.json({
      id: movieId,
      results: videoData
    });
  }, 300);
});

// Movie reviews endpoint
app.get('/api/movie/:id/reviews', (req, res) => {
  const movieId = parseInt(req.params.id);
  console.log(`Received request for reviews for movie ID: ${movieId}`);
  
  // Sample review data
  const reviewData = [
    {
      id: "5c3b8cc3c3a3683a69078de0",
      author: "MovieFan123",
      content: "This movie was absolutely amazing! The visuals were stunning and the storyline kept me engaged throughout. The characters were well-developed and I found myself emotionally invested in their journey.",
      created_at: "2022-01-15T14:09:15.000Z",
      url: "",
      author_details: {
        username: "MovieFan123",
        rating: 9,
        avatar_path: null
      }
    },
    {
      id: "5c3b8cc3c3a3683a69078de1",
      author: "CriticGuy",
      content: "While the movie had impressive visuals, I found the plot to be somewhat predictable. Some scenes dragged on unnecessarily. Overall, it was decent but not exceptional.",
      created_at: "2022-01-20T10:30:00.000Z",
      url: "",
      author_details: {
        username: "CriticGuy",
        rating: 6,
        avatar_path: null
      }
    }
  ];
  
  setTimeout(() => {
    res.json({
      id: movieId,
      page: 1,
      results: reviewData,
      total_pages: 1,
      total_results: reviewData.length
    });
  }, 300);
});

// TV show detail endpoint
app.get('/api/tv/:id', (req, res) => {
  const tvId = parseInt(req.params.id);
  console.log(`Received request for TV show details: ${tvId}`);
  
  // Sample detailed TV show data
  const tvDetails = {
    1: {
      id: 1,
      name: "Breaking Bad",
      overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
      poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      first_air_date: "2008-01-20",
      vote_average: 8.7,
      vote_count: 8392,
      genres: [
        { id: 18, name: "Drama" },
        { id: 80, name: "Crime" }
      ],
      number_of_seasons: 5,
      number_of_episodes: 62,
      tagline: "Remember my name",
      status: "Ended",
      homepage: "https://www.amc.com/shows/breaking-bad",
      original_language: "en",
      production_companies: [
        { id: 2605, name: "High Bridge Productions" },
        { id: 33742, name: "Sony Pictures Television Studios" }
      ],
      credits: {
        cast: [
          { id: 17419, name: "Bryan Cranston", character: "Walter White", profile_path: "/7Jahy5LZX2Fo8fGJltMreAI49hd.jpg" },
          { id: 84497, name: "Aaron Paul", character: "Jesse Pinkman", profile_path: "/qJRB789cg0pvfni4BDO8phQDic8.jpg" },
          { id: 14969, name: "Anna Gunn", character: "Skyler White", profile_path: "/aVVmrJ7HkqvcBSPVRg6nGN0wUzV.jpg" }
        ],
        crew: [
          { id: 66633, name: "Vince Gilligan", job: "Creator", department: "Production" },
          { id: 66633, name: "Vince Gilligan", job: "Executive Producer", department: "Production" }
        ]
      }
    },
    2: {
      id: 2,
      name: "Stranger Things",
      overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
      poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      first_air_date: "2016-07-15",
      vote_average: 8.6,
      vote_count: 13873,
      genres: [
        { id: 18, name: "Drama" },
        { id: 10765, name: "Sci-Fi & Fantasy" },
        { id: 9648, name: "Mystery" }
      ],
      number_of_seasons: 4,
      number_of_episodes: 34,
      tagline: "The world is turning upside down",
      status: "Returning Series",
      homepage: "https://www.netflix.com/title/80057281",
      original_language: "en",
      production_companies: [
        { id: 2575, name: "21 Laps Entertainment" },
        { id: 170364, name: "Monkey Massacre" }
      ],
      credits: {
        cast: [
          { id: 1356210, name: "Millie Bobby Brown", character: "Eleven", profile_path: "/3Gmy0xF5FLzlwLeCCWlRdKZ6GZr.jpg" },
          { id: 1919049, name: "Finn Wolfhard", character: "Mike Wheeler", profile_path: "/z9Jmw9D0UI5FcyYBzuguXKsRuZ.jpg" },
          { id: 1919032, name: "Gaten Matarazzo", character: "Dustin Henderson", profile_path: "/fPxPQrPR9dQQJ23BZycOq16698C.jpg" }
        ],
        crew: [
          { id: 1179419, name: "Matt Duffer", job: "Creator", department: "Production" },
          { id: 1179422, name: "Ross Duffer", job: "Creator", department: "Production" }
        ]
      }
    }
  };
  
  // Check if the TV show exists in our mock data
  if (tvDetails[tvId]) {
    // Add a slight delay to simulate network latency
    setTimeout(() => {
      res.json(tvDetails[tvId]);
    }, 500);
  } else {
    // Return a generic TV show if ID not found
    const genericTVShow = {
      id: tvId,
      name: `TV Show ${tvId}`,
      overview: "This is a placeholder for a TV show that isn't in our demo database.",
      poster_path: "/placeholder.jpg",
      backdrop_path: "/placeholder_backdrop.jpg",
      first_air_date: "2020-01-01",
      vote_average: 7.5,
      vote_count: 1000,
      genres: [{ id: 18, name: "Drama" }],
      number_of_seasons: 3,
      number_of_episodes: 24,
      tagline: "Every demo needs a tagline.",
      status: "Returning Series",
      homepage: "",
      original_language: "en",
      production_companies: [{ id: 1, name: "Demo Studios" }],
      credits: {
        cast: [
          { id: 1, name: "Actor One", character: "Character One", profile_path: null },
          { id: 2, name: "Actor Two", character: "Character Two", profile_path: null }
        ],
        crew: [
          { id: 1, name: "Producer Person", job: "Executive Producer", department: "Production" }
        ]
      }
    };
    
    setTimeout(() => {
      res.json(genericTVShow);
    }, 500);
  }
});

// TV similar endpoint
app.get('/api/tv/:id/similar', (req, res) => {
  const tvId = parseInt(req.params.id);
  console.log(`Received request for similar shows to TV ID: ${tvId}`);
  
  // Sample similar TV shows
  const similarTVShows = [
    {
      id: 100,
      name: "The Wire",
      overview: "A chronicle of the Baltimore drug scene, seen through the eyes of drug dealers and law enforcement.",
      poster_path: "/4lbclFySvugI51fwsyxBTOm4DqK.jpg",
      backdrop_path: "/hV9T3fUXgmbUakLLDuJnRQoWJ2Y.jpg",
      first_air_date: "2002-06-02",
      vote_average: 8.6,
      vote_count: 2274,
      genre_ids: [18, 80]
    },
    {
      id: 101,
      name: "The Sopranos",
      overview: "New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life that affect his mental state.",
      poster_path: "/6nNZnnUkXcI3DvdrkclulanYXzg.jpg",
      backdrop_path: "/eCgBnGOSM0PommQtk9uyUABpKfy.jpg",
      first_air_date: "1999-01-10",
      vote_average: 8.6,
      vote_count: 2099,
      genre_ids: [18, 80]
    },
    {
      id: 102,
      name: "Better Call Saul",
      overview: "Six years before Saul Goodman meets Walter White, he is known as small-time lawyer Jimmy McGill.",
      poster_path: "/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg",
      backdrop_path: "/hPea3Qy5Gd6z4kJLUruBbwAH8Rm.jpg",
      first_air_date: "2015-02-08",
      vote_average: 8.5,
      vote_count: 3203,
      genre_ids: [18, 80]
    }
  ];
  
  setTimeout(() => {
    res.json({
      page: 1,
      results: similarTVShows,
      total_pages: 1,
      total_results: similarTVShows.length
    });
  }, 300);
});

// TV videos endpoint
app.get('/api/tv/:id/videos', (req, res) => {
  const tvId = parseInt(req.params.id);
  console.log(`Received request for videos for TV ID: ${tvId}`);
  
  // Sample video data
  const videoData = [
    {
      id: "5c3b8c81c3a3683a6a079973",
      key: "HhesaQXLuRY",
      name: "Official Trailer",
      site: "YouTube",
      size: 1080,
      type: "Trailer",
      iso_639_1: "en",
      iso_3166_1: "US",
      official: true,
      published_at: "2019-06-27T17:00:00.000Z"
    },
    {
      id: "5c3b8cc3c3a3683a69078de2",
      key: "b9EkMc79ZSU",
      name: "Season Teaser",
      site: "YouTube",
      size: 1080,
      type: "Teaser",
      iso_639_1: "en",
      iso_3166_1: "US",
      official: true,
      published_at: "2019-05-20T16:00:04.000Z"
    }
  ];
  
  setTimeout(() => {
    res.json({
      id: tvId,
      results: videoData
    });
  }, 300);
});

// TV reviews endpoint
app.get('/api/tv/:id/reviews', (req, res) => {
  const tvId = parseInt(req.params.id);
  console.log(`Received request for reviews for TV ID: ${tvId}`);
  
  // Sample review data
  const reviewData = [
    {
      id: "5c3b8cc3c3a3683a69078de3",
      author: "TVCritic",
      content: "This show has some of the best character development I've seen in television. Each episode builds on the last and creates a compelling narrative that keeps you wanting more.",
      created_at: "2022-02-15T14:09:15.000Z",
      url: "",
      author_details: {
        username: "TVCritic",
        rating: 9.5,
        avatar_path: null
      }
    },
    {
      id: "5c3b8cc3c3a3683a69078de4",
      author: "SeriesWatcher",
      content: "The first season started off slow but really picked up midway through. By the finale, I was completely hooked. Can't wait for the next season!",
      created_at: "2022-02-20T10:30:00.000Z",
      url: "",
      author_details: {
        username: "SeriesWatcher",
        rating: 8,
        avatar_path: null
      }
    }
  ];
  
  setTimeout(() => {
    res.json({
      id: tvId,
      page: 1,
      results: reviewData,
      total_pages: 1,
      total_results: reviewData.length
    });
  }, 300);
});

// User preferences endpoint
app.get('/api/preferences', (req, res) => {
  // Return empty preferences
  res.json({
    favorites: [],
    watchlist: [],
    ratings: {}
  });
});

// Create public directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Create index.html file with our demo app
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YMovies | Find Your Next Movie</title>
  <style>
    :root {
      --primary: #e50914;
      --background: #141414;
      --foreground: #ffffff;
      --card: #1f1f1f;
      --card-hover: #333333;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--background);
      color: var(--foreground);
    }
    
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 60px;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
      z-index: 100;
      transition: background-color 0.3s;
    }
    
    .navbar.scrolled {
      background-color: var(--background);
    }
    
    .navbar .logo {
      color: var(--primary);
      font-size: 2rem;
      font-weight: bold;
      text-decoration: none;
      position: relative;
    }
    
    .navbar .logo::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 0;
      height: 2px;
      background-color: var(--primary);
      transition: width 0.3s;
    }
    
    .navbar .logo:hover::after {
      width: 100%;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 80px 20px 40px;
    }
    
    .hero-banner {
      position: relative;
      height: 80vh;
      background-size: cover;
      background-position: center;
      margin-bottom: 30px;
      border-radius: 10px;
      overflow: hidden;
      transition: transform 10s;
    }
    
    .hero-banner:hover {
      transform: scale(1.03);
    }
    
    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 60px;
    }
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: bold;
      margin-bottom: 16px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      transition: transform 0.5s, opacity 0.5s;
      opacity: 0;
      transform: translateY(20px);
    }
    
    .hero-banner:hover .hero-title {
      opacity: 1;
      transform: translateY(0);
    }
    
    .hero-description {
      font-size: 1.2rem;
      max-width: 600px;
      margin-bottom: 30px;
      line-height: 1.5;
      transition: transform 0.5s 0.2s, opacity 0.5s 0.2s;
      opacity: 0;
      transform: translateY(20px);
    }
    
    .hero-banner:hover .hero-description {
      opacity: 1;
      transform: translateY(0);
    }
    
    .hero-buttons {
      display: flex;
      gap: 15px;
      transition: transform 0.5s 0.4s, opacity 0.5s 0.4s;
      opacity: 0;
      transform: translateY(20px);
    }
    
    .hero-banner:hover .hero-buttons {
      opacity: 1;
      transform: translateY(0);
    }
    
    .btn {
      padding: 10px 25px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s;
    }
    
    .btn-primary {
      background-color: var(--primary);
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #f40612;
      transform: scale(1.05);
    }
    
    .btn-secondary {
      background-color: rgba(109, 109, 110, 0.7);
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: rgba(109, 109, 110, 0.9);
      transform: scale(1.05);
    }
    
    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 16px;
      margin-left: 8px;
      transition: color 0.3s;
    }
    
    .movie-slider {
      margin-bottom: 40px;
      position: relative;
    }
    
    .movie-slider:hover .section-title {
      color: var(--primary);
    }
    
    .movie-slider:hover .section-title::after {
      content: '';
      display: block;
      width: 40px;
      height: 2px;
      background-color: var(--primary);
      margin-top: 4px;
      transition: width 0.3s;
    }
    
    .movie-container {
      display: flex;
      gap: 15px;
      overflow-x: auto;
      padding: 20px 0;
      scroll-behavior: smooth;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    .movie-container::-webkit-scrollbar {
      display: none;
    }
    
    .movie-card {
      flex: 0 0 auto;
      width: 200px;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
      transition: all 0.3s ease;
      transform-origin: center center;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    
    .movie-card:hover {
      transform: scale(1.1);
      z-index: 10;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    }
    
    .movie-poster {
      width: 100%;
      height: 300px;
      object-fit: cover;
      transition: filter 0.3s;
    }
    
    .movie-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 15px;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
      transform: translateY(100%);
      transition: transform 0.3s;
    }
    
    .movie-card:hover .movie-info {
      transform: translateY(0);
    }
    
    .movie-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .movie-meta {
      display: flex;
      font-size: 0.8rem;
      color: #aaa;
      gap: 10px;
    }
    
    .movie-rating {
      color: #46d369;
    }
    
    .movie-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .icon-btn:hover {
      transform: scale(1.1);
      background-color: rgba(255, 255, 255, 0.3);
    }
    
    .icon-btn svg {
      width: 18px;
      height: 18px;
    }
    
    .slider-controls {
      position: absolute;
      top: 50%;
      width: 100%;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
    }
    
    .slider-btn {
      width: 50px;
      height: 100px;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: auto;
    }
    
    .movie-slider:hover .slider-btn {
      opacity: 1;
    }
    
    .slider-btn-left {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      transform: translateX(-20px);
    }
    
    .slider-btn-right {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      transform: translateX(20px);
    }
    
    .movie-slider:hover .slider-btn-left {
      transform: translateX(0);
    }
    
    .movie-slider:hover .slider-btn-right {
      transform: translateX(0);
    }
    
    .slider-btn svg {
      width: 30px;
      height: 30px;
      color: white;
    }
    
    .slider-btn:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    /* Loading Skeletons */
    @keyframes pulse {
      0% {
        opacity: 0.6;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.6;
      }
    }
    
    .skeleton {
      animation: pulse 2s infinite ease-in-out;
      background-color: #333;
      border-radius: 4px;
    }
    
    .skeleton-banner {
      height: 80vh;
      margin-bottom: 30px;
    }
    
    .skeleton-title {
      height: 30px;
      width: 200px;
      margin-bottom: 16px;
    }
    
    .skeleton-card {
      width: 200px;
      height: 300px;
    }
    
    /* Onboarding Tutorial */
    .tutorial-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }
    
    .tutorial-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }
    
    .tutorial-content {
      background-color: #222;
      border-radius: 8px;
      width: 500px;
      max-width: 90%;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      position: relative;
      transform: translateY(20px);
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
    }
    
    .tutorial-overlay.active .tutorial-content {
      transform: translateY(0);
      opacity: 1;
    }
    
    .tutorial-close {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: #aaa;
      cursor: pointer;
      transition: color 0.2s;
    }
    
    .tutorial-close:hover {
      color: white;
    }
    
    .tutorial-title {
      font-size: 1.5rem;
      margin-bottom: 15px;
    }
    
    .tutorial-desc {
      line-height: 1.6;
      margin-bottom: 25px;
      color: #ddd;
    }
    
    .tutorial-steps {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    .tutorial-step {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #555;
      margin: 0 5px;
    }
    
    .tutorial-step.active {
      background-color: var(--primary);
      width: 30px;
      border-radius: 10px;
    }
    
    .tutorial-footer {
      display: flex;
      justify-content: space-between;
    }
    
    .tutorial-footer .btn {
      padding: 8px 16px;
    }
    
    .highlight {
      position: relative;
      z-index: 1001;
      box-shadow: 0 0 0 4px var(--primary), 0 0 0 8px rgba(229, 9, 20, 0.3);
      border-radius: 4px;
      animation: highlight-pulse 2s infinite;
    }
    
    @keyframes highlight-pulse {
      0%, 100% {
        box-shadow: 0 0 0 4px var(--primary), 0 0 0 8px rgba(229, 9, 20, 0.3);
      }
      50% {
        box-shadow: 0 0 0 4px var(--primary), 0 0 0 12px rgba(229, 9, 20, 0.2);
      }
    }
    
    /* Loading indicator */
    .loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--background);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      transition: opacity 0.5s;
    }
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(229, 9, 20, 0.3);
      border-radius: 50%;
      border-top-color: var(--primary);
      animation: spin 1s infinite linear;
      margin-bottom: 20px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .loading-text {
      font-size: 1.2rem;
      color: #ddd;
      animation: pulse 1.5s infinite;
    }
  </style>
</head>
<body>
  <!-- Loading screen -->
  <div class="loading-screen" id="loadingScreen">
    <div class="loading-spinner"></div>
    <div class="loading-text">Loading YMovies...</div>
  </div>
  
  <!-- Navigation -->
  <nav class="navbar" id="navbar">
    <a href="#" class="logo">YMovies</a>
  </nav>
  
  <div class="container">
    <!-- Hero Banner with loading skeleton -->
    <div class="hero-banner skeleton skeleton-banner" id="heroBanner">
      <div class="hero-overlay">
        <h1 class="hero-title" id="heroTitle"></h1>
        <p class="hero-description" id="heroDesc"></p>
        <div class="hero-buttons">
          <button class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Play
          </button>
          <button class="btn btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            More Info
          </button>
        </div>
      </div>
    </div>
    
    <!-- Trending Movies Section -->
    <div class="movie-slider" id="trendingSection">
      <h2 class="section-title skeleton skeleton-title" id="trendingTitle">Trending Now</h2>
      <div class="movie-container" id="trendingMovies">
        <!-- Skeleton loaders -->
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
      <div class="slider-controls">
        <div class="slider-btn slider-btn-left">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
        <div class="slider-btn slider-btn-right">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    </div>
    
    <!-- Popular Movies Section -->
    <div class="movie-slider" id="popularSection">
      <h2 class="section-title skeleton skeleton-title" id="popularTitle">Popular on YMovies</h2>
      <div class="movie-container" id="popularMovies">
        <!-- Skeleton loaders -->
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
      <div class="slider-controls">
        <div class="slider-btn slider-btn-left">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
        <div class="slider-btn slider-btn-right">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Onboarding Tutorial -->
  <div class="tutorial-overlay" id="tutorialOverlay">
    <div class="tutorial-content">
      <button class="tutorial-close" id="tutorialClose">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <h2 class="tutorial-title" id="tutorialTitle">Welcome to YMovies!</h2>
      <p class="tutorial-desc" id="tutorialDesc">Discover your next favorite movie with our personalized recommendations.</p>
      <div class="tutorial-steps" id="tutorialSteps">
        <span class="tutorial-step active"></span>
        <span class="tutorial-step"></span>
        <span class="tutorial-step"></span>
        <span class="tutorial-step"></span>
      </div>
      <div class="tutorial-footer">
        <button class="btn btn-secondary" id="tutorialSkip">Skip Tour</button>
        <button class="btn btn-primary" id="tutorialNext">Next</button>
      </div>
    </div>
  </div>
  
  <script>
    // Tutorial content for steps
    const tutorialSteps = [
      {
        title: "Welcome to YMovies!",
        desc: "Discover your next favorite movie with our personalized recommendations.",
        highlight: null
      },
      {
        title: "Movie Collections",
        desc: "Browse through trending and popular movies. Hover over any movie poster to see more details.",
        highlight: ".movie-card"
      },
      {
        title: "Watch Trailers",
        desc: "Click the play button to watch trailers and learn more about any movie.",
        highlight: ".btn-primary"
      },
      {
        title: "Ready to Start?",
        desc: "You're all set! Start exploring and enjoy the YMovies experience.",
        highlight: null,
        finalStep: true
      }
    ];
    
    // DOM elements
    const loadingScreen = document.getElementById('loadingScreen');
    const navbar = document.getElementById('navbar');
    const heroBanner = document.getElementById('heroBanner');
    const heroTitle = document.getElementById('heroTitle');
    const heroDesc = document.getElementById('heroDesc');
    const trendingTitle = document.getElementById('trendingTitle');
    const trendingMovies = document.getElementById('trendingMovies');
    const popularTitle = document.getElementById('popularTitle');
    const popularMovies = document.getElementById('popularMovies');
    
    // Tutorial elements
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const tutorialTitle = document.getElementById('tutorialTitle');
    const tutorialDesc = document.getElementById('tutorialDesc');
    const tutorialStepsEl = document.getElementById('tutorialSteps');
    const tutorialNext = document.getElementById('tutorialNext');
    const tutorialSkip = document.getElementById('tutorialSkip');
    const tutorialClose = document.getElementById('tutorialClose');
    
    // Current tutorial step
    let currentStep = 0;
    let highlightedElement = null;
    
    // Load data and remove loading screen
    window.addEventListener('DOMContentLoaded', () => {
      // Simulate loading delay
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          
          // Show tutorial after a slight delay
          setTimeout(() => {
            if (!localStorage.getItem('tutorialShown')) {
              showTutorial();
            }
          }, 1500);
        }, 500);
      }, 2000);
      
      // Load hero banner (featured movie)
      heroBanner.style.backgroundImage = "url('https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg')";
      heroBanner.classList.remove('skeleton');
      heroTitle.textContent = "Pulp Fiction";
      heroDesc.textContent = "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.";
      
      // Remove skeleton classes
      trendingTitle.classList.remove('skeleton', 'skeleton-title');
      popularTitle.classList.remove('skeleton', 'skeleton-title');
      
      // Fetch trending movies
      fetchTrendingMovies();
      
      // Fetch popular movies
      fetchPopularMovies();
    });
    
    // Navbar background change on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
    
    // Fetch trending movies and update UI
    async function fetchTrendingMovies() {
      try {
        const response = await fetch('/api/movies/trending');
        const movies = await response.json();
        
        // Clear skeleton loaders
        trendingMovies.innerHTML = '';
        
        // Add movie cards
        movies.forEach(movie => {
          trendingMovies.appendChild(createMovieCard(movie));
        });
      } catch (error) {
        console.error('Error fetching trending movies:', error);
      }
    }
    
    // Fetch popular movies and update UI
    async function fetchPopularMovies() {
      try {
        const response = await fetch('/api/movies/popular');
        const movies = await response.json();
        
        // Clear skeleton loaders
        popularMovies.innerHTML = '';
        
        // Add movie cards
        movies.forEach(movie => {
          popularMovies.appendChild(createMovieCard(movie));
        });
      } catch (error) {
        console.error('Error fetching popular movies:', error);
      }
    }
    
    // Create movie card element
    function createMovieCard(movie) {
      const card = document.createElement('div');
      card.className = 'movie-card';
      
      // Format date to year only
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
      
      // Calculate vote percentage
      const votePercentage = Math.round(movie.vote_average * 10);
      
      card.innerHTML = \`
        <img src="https://image.tmdb.org/t/p/w500\${movie.poster_path}" alt="\${movie.title}" class="movie-poster">
        <div class="movie-info">
          <h3 class="movie-title">\${movie.title}</h3>
          <div class="movie-meta">
            <span class="movie-rating">\${votePercentage}% Match</span>
            <span>\${year}</span>
          </div>
          <div class="movie-actions">
            <button class="icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>
            <button class="icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            </button>
            <button class="icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
          </div>
        </div>
      \`;
      
      return card;
    }
    
    // Tutorial functionality
    function showTutorial() {
      tutorialOverlay.classList.add('active');
      updateTutorialStep(0);
    }
    
    function hideTutorial() {
      tutorialOverlay.classList.remove('active');
      removeHighlight();
      localStorage.setItem('tutorialShown', 'true');
    }
    
    function updateTutorialStep(step) {
      // Remove previous highlight
      removeHighlight();
      
      // Update content
      const stepData = tutorialSteps[step];
      tutorialTitle.textContent = stepData.title;
      tutorialDesc.textContent = stepData.desc;
      
      // Update step indicators
      const steps = tutorialStepsEl.querySelectorAll('.tutorial-step');
      steps.forEach((el, i) => {
        el.classList.toggle('active', i === step);
      });
      
      // Add highlight if needed
      if (stepData.highlight) {
        const element = document.querySelector(stepData.highlight);
        if (element) {
          element.classList.add('highlight');
          highlightedElement = element;
        }
      }
      
      // Update button text for final step
      if (stepData.finalStep) {
        tutorialNext.textContent = 'Get Started';
      } else {
        tutorialNext.textContent = 'Next';
      }
    }
    
    function removeHighlight() {
      if (highlightedElement) {
        highlightedElement.classList.remove('highlight');
        highlightedElement = null;
      }
    }
    
    // Tutorial event listeners
    tutorialNext.addEventListener('click', () => {
      currentStep++;
      if (currentStep >= tutorialSteps.length) {
        hideTutorial();
      } else {
        updateTutorialStep(currentStep);
      }
    });
    
    tutorialSkip.addEventListener('click', hideTutorial);
    tutorialClose.addEventListener('click', hideTutorial);
    
    // Slider controls
    document.querySelectorAll('.slider-btn-right').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const container = e.target.closest('.movie-slider').querySelector('.movie-container');
        container.scrollBy({ left: container.clientWidth - 100, behavior: 'smooth' });
      });
    });
    
    document.querySelectorAll('.slider-btn-left').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const container = e.target.closest('.movie-slider').querySelector('.movie-container');
        container.scrollBy({ left: -(container.clientWidth - 100), behavior: 'smooth' });
      });
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('public/index.html', htmlContent);

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Demo server running at http://localhost:${port}`);
});