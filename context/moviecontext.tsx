
'use client';

import React, { createContext, useReducer, useContext, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Action, SocialContext, OMDBSearchResult, OMDbMovieDetails, AppMovie, IDynamicPriceResponse, UserViewingHistory, MoodType } from '@/types';
import { searchMovies, getMovieDetails } from '@/lib/omdb';
import { filterMoviesBySocialContext } from '@/utils/filter';
import { debounce } from '@/utils/debounce';
import { calculateFuzzyScore } from '@/utils/fuzzysearch';
import { calculateOverallRecommendationScore, calculateMoodMatchScore } from '@/utils/engine';

const initialState: AppState = {
  searchQuery: '',
  movies: [],
  movieDetails: {},
  filteredMovies: [],
  selectedSocialContext: 'Solo Night',
  selectedMood: 'Feel Good Vibes',
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
    case 'SET_SELECTED_MOOD':
      return { ...state, selectedMood: action.payload };
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
  

  const fetchingDetailsRef = useRef<Set<string>>(new Set());
  const fetchingPricesRef = useRef<Set<string>>(new Set());
  

  const [filteredAndScoredMovies, setFilteredAndScoredMovies] = useState<AppMovie[]>([]);


  const searchMoviesByQuery = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        dispatch({ type: 'SET_MOVIES', payload: [] });
        dispatch({ type: 'SET_FILTERED_MOVIES', payload: [] });
        dispatch({ type: 'SET_ERROR', payload: 'Please enter at least 3 characters to search.' });
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
        }
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: err.message || 'An unknown search error occurred.' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, 500),
    []
  );


  const fetchMovieDetailsForMovie = useCallback(async (imdbID: string) => {
    try {
      const details = await getMovieDetails(imdbID);
      if (details) {
        dispatch({ type: 'ADD_MOVIE_DETAILS', payload: details });
      } else {
        dispatch({ type: 'ADD_MOVIE_DETAILS', payload: { 
          imdbID, 
          Response: 'False', 
          Error: 'Details not found' 
        } as OMDbMovieDetails });
      }
    } catch (err: any) {
      console.error(`Failed to fetch details for ${imdbID}:`, err);
      dispatch({ type: 'ADD_MOVIE_DETAILS', payload: { 
        imdbID, 
        Response: 'False', 
        Error: err.message 
      } as OMDbMovieDetails });
    }
  }, []);

  const fetchDynamicPrice = useCallback(async (imdbID: string, movieDetails: OMDbMovieDetails) => {
    if (fetchingPricesRef.current.has(imdbID)) {
      return;
    }
    
    fetchingPricesRef.current.add(imdbID);
    
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
    } finally {
      fetchingPricesRef.current.delete(imdbID);
    }
  }, []);

  useEffect(() => {
    state.movies.forEach(movie => {
      const currentDetails = state.movieDetails[movie.imdbID];
      const isAlreadyFetching = fetchingDetailsRef.current.has(movie.imdbID);
      
      if (currentDetails === undefined && !isAlreadyFetching) {
        fetchingDetailsRef.current.add(movie.imdbID);
        fetchMovieDetailsForMovie(movie.imdbID).finally(() => {
          fetchingDetailsRef.current.delete(movie.imdbID);
        });
      }
    });
  }, [state.movies, fetchMovieDetailsForMovie]);

  useEffect(() => {
   
    const moviesWithAllData: AppMovie[] = state.movies.map(movie => ({
      ...movie,
      details: state.movieDetails[movie.imdbID],
      dynamicPrice: movie.dynamicPrice,
    }));

   
    const socialContextFiltered = filterMoviesBySocialContext(
      moviesWithAllData,
      state.movieDetails,
      state.selectedSocialContext
    );

    const scoredMovies = socialContextFiltered.map(movie => {
      const fuzzyScore = calculateFuzzyScore(state.searchQuery, movie.Title);
      const overallScore = calculateOverallRecommendationScore(
        movie,
        movie.details,
        {
          selectedMood: state.selectedMood,
          selectedSocialContext: state.selectedSocialContext,
          userViewingHistory: state.userViewingHistory,
          dynamicPriceInfo: movie.dynamicPrice,
          fuzzyMatchScore: fuzzyScore,
        }
      );

      const moodMatchPercentage = movie.details
        ? Math.round(calculateMoodMatchScore(movie.details, state.selectedMood) * 100)
        : 0;

      return {
        ...movie,
        score: overallScore,
        fuzzyMatchScore: fuzzyScore,
        moodMatchPercentage: moodMatchPercentage,
      };
    });


    const sortedAndScoredMovies = scoredMovies.sort((a, b) => (b.score || 0) - (a.score || 0));

    setFilteredAndScoredMovies(sortedAndScoredMovies);
    dispatch({ type: 'SET_FILTERED_MOVIES', payload: sortedAndScoredMovies });
  }, [
    state.movies, 
    state.movieDetails, 
    state.selectedSocialContext, 
    state.selectedMood, 
    state.searchQuery, 
    state.userViewingHistory
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filteredAndScoredMovies.forEach(movie => {
        if (movie.details && !movie.dynamicPrice && !fetchingPricesRef.current.has(movie.imdbID)) {
          fetchDynamicPrice(movie.imdbID, movie.details);
        }
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filteredAndScoredMovies, fetchDynamicPrice]);

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