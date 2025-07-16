
export interface OMDBSearchResult {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  }
  
  export interface OMDBSearchResponse {
    Search?: OMDBSearchResult[];
    totalResults?: string;
    Response: 'True' | 'False';
    Error?: string;
  }
  
  export interface OMDbMovieDetails {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string; // e.g., "148 min"
    Genre: string; // e.g., "Action, Adventure, Sci-Fi"
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: Array<{ Source: string; Value: string }>;
    Metascore: string;
    imdbRating: string; // e.g., "8.7"
    imdbVotes: string;
    imdbID: string;
    Type: string;
    DVD: string;
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: 'True' | 'False';
    Error?: string;
  }
  
  export interface AppMovie extends OMDBSearchResult {
    details?: OMDbMovieDetails;
    dynamicPrice?: IDynamicPriceResponse; 
    score?: number; 
  }
  
  export type SocialContext = 'Solo Night' | 'Date Night' | 'Family Time' | 'Friend Group' | 'Background Noise';
  
  export interface UserViewingHistory {
    watchedGenresLast30Days: string[];
    watchedMovieIds: string[];
  }
  
  export interface AppState {
    searchQuery: string;
    movies: AppMovie[]; 
    movieDetails: { [imdbID: string]: OMDbMovieDetails }; 
    filteredMovies: AppMovie[];
    selectedSocialContext: SocialContext;
    userViewingHistory: UserViewingHistory;
    loading: boolean;
    error: string | null;
  }
  
  export type Action =
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_MOVIES'; payload: OMDBSearchResult[] }
    | { type: 'ADD_MOVIE_DETAILS'; payload: OMDbMovieDetails }
    | { type: 'SET_FILTERED_MOVIES'; payload: AppMovie[] }
    | { type: 'SET_SOCIAL_CONTEXT'; payload: SocialContext }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_DYNAMIC_PRICE'; payload: { imdbID: string; price: IDynamicPriceResponse } };
  
  export interface IDynamicPriceResponse {
    rentalPrice: number;
    bestTimeToRentSuggestion: string;
  }
  