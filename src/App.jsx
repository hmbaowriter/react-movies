import { useEffect } from 'react';
import { useState } from 'react';
import { useDebounce } from 'react-use';

import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce the search term to prevent API call on every keystroke
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  // * COMPLETED: Implement getTrendingMovies function (base on search count)
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Call API to get movies
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMsg(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      // console.log(data);
      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        // Update search count
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMsg('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Get trending movies
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className='pattern' />

      <div className='wrapper'>
        <header>
          <h1>
            Find <span className='text-gradient'>Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2 className='mt-[40px]'>All movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMsg ? (
            <p className='text-red-500'>{errorMsg}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
