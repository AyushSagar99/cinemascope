'use client'; 

import React, { createContext, useReducer, useContext, ReactNode, useCallback, useEffect } from 'react';
import { AppState, Action, SocialContext, OMDBSearchResult, OMDbMovieDetails, AppMovie, IDynamicPriceResponse, UserViewingHistory } from '@/types';
import { searchMovies, getMovieDetails } from '@/lib/omdb';
import { filterMoviesBySocialContext } from '@/utils/filter';
import { debounce } from '@/utils/debounce';

const initialState: AppState = {
  searchQuery: '',
  movies: [],
  movieDetails: {}, 
  filteredMovies: [],
  selectedSocialContext: 'Solo Night',
  userViewingHistory: {
    watchedGenresLast30Days: ['Action', 'Comedy'],
    watchedMovieIds: ['tt0133093', 'tt0111161'],
  },
  loading: false,
  error: null,
};

const movieReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_MOVIES':

      const newMovieDetails = { ...state.movieDetails };
      action.payload.forEach(movie => {

        if (!newMovieDetails[movie.imdbID]) {
          newMovieDetails[movie.imdbID] = undefined as any;
        }
      });
      return { ...state, movies: action.payload, movieDetails: newMovieDetails, error: null };
    case 'ADD_MOVIE_DETAILS':
      return {
        ...state,
        movieDetails: {
          ...state.movieDetails,
          [action.payload.imdbID]: action.payload,
        },
      };
    case 'SET_FILTERED_MOVIES':
      return { ...state, filteredMovies: action.payload };
    case 'SET_SOCIAL_CONTEXT':
      return { ...state, selectedSocialContext: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_DYNAMIC_PRICE':
     
      const updatedMovies = state.movies.map(movie =>
        movie.imdbID === action.payload.imdbID
          ? { ...movie, dynamicPrice: action.payload.price }
          : movie
      );
      // After updating `movies`, the filtering useEffect will run and update `filteredMovies`
      return { ...state, movies: updatedMovies };
    default:
      return state;
  }
};

export const MovieContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  searchMoviesByQuery: (query: string) => void;
  fetchMovieDetailsForMovie: (imdbID: string) => Promise<void>;
  fetchDynamicPrice: (imdbID: string, movieDetails: OMDbMovieDetails) => Promise<void>;
} | undefined>(undefined);

export const MovieProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  const searchMoviesByQuery = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        dispatch({ type: 'SET_MOVIES', payload: [] });
        dispatch({ type: 'SET_FILTERED_MOVIES', payload: [] });
        return;
      }
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      try {
        const results = await searchMovies(query);
        if (results) {
          dispatch({ type: 'SET_MOVIES', payload: results });
        } else {
          dispatch({ type: 'SET_MOVIES', payload: [] });
          dispatch({ type: 'SET_ERROR', payload: 'No movies found or an error occurred.' });
        }
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: `Search failed: ${err.message}` });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, 500), 
    []
  );

  const fetchMovieDetailsForMovie = useCallback(async (imdbID: string) => {

    if (state.movieDetails[imdbID] !== undefined && state.movieDetails[imdbID] !== null) {
      return;
    }
    try {
      const details = await getMovieDetails(imdbID);
      if (details) {
        dispatch({ type: 'ADD_MOVIE_DETAILS', payload: details });
      } else {

        dispatch({ type: 'ADD_MOVIE_DETAILS', payload: { imdbID, Response: 'False', Error: 'Details not found' } as OMDbMovieDetails });
      }
    } catch (err: any) {
      console.error(`Failed to fetch details for ${imdbID}:`, err);

      dispatch({ type: 'ADD_MOVIE_DETAILS', payload: { imdbID, Response: 'False', Error: err.message } as OMDbMovieDetails });
    }
  }, [state.movieDetails]); 

  const fetchDynamicPrice = useCallback(async (imdbID: string, movieDetails: OMDbMovieDetails) => {
    try {
      const now = new Date();
      const timeOfDay = now.getHours();
      const dayOfWeek = now.toLocaleString('en-US', { weekday: 'short' });
 
      const moviePopularity = parseFloat(movieDetails.imdbRating || '0');

      const response = await fetch(`/api/dynamic-price?imdbID=${imdbID}&timeOfDay=${timeOfDay}&dayOfWeek=${dayOfWeek}&moviePopularity=${moviePopularity}`);
      const data: IDynamicPriceResponse = await response.json();

      dispatch({ type: 'SET_DYNAMIC_PRICE', payload: { imdbID, price: data } });
    } catch (err: any) {
      console.error(`Failed to fetch dynamic price for ${imdbID}:`, err);
    }
  }, []); 


  useEffect(() => {
    state.movies.forEach(movie => {

      if (state.movieDetails[movie.imdbID] === undefined) {
        fetchMovieDetailsForMovie(movie.imdbID);
      }
    });
  }, [state.movies, state.movieDetails, fetchMovieDetailsForMovie]);

  useEffect(() => {
    
    const moviesForFiltering: AppMovie[] = state.movies.map(movie => ({
      ...movie,
      details: state.movieDetails[movie.imdbID],

      dynamicPrice: state.movies.find(m => m.imdbID === movie.imdbID)?.dynamicPrice,
    }));

    const filtered = filterMoviesBySocialContext(
      moviesForFiltering,
      state.movieDetails,
      state.selectedSocialContext
    );

    dispatch({ type: 'SET_FILTERED_MOVIES', payload: filtered });

    filtered.forEach(movie => {

      if (movie.details && !movie.dynamicPrice) {
        fetchDynamicPrice(movie.imdbID, movie.details);
      }
    });

  }, [state.movies, state.movieDetails, state.selectedSocialContext, fetchDynamicPrice]);


  const value = {
    state,
    dispatch,
    searchMoviesByQuery,
    fetchMovieDetailsForMovie,
    fetchDynamicPrice,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

export const useMovie = () => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovie must be used within a MovieProvider');
  }
  return context;
};
