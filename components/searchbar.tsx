'use client';

import React, { useState, useEffect } from 'react';
import { useMovie } from '@/context/moviecontext';

export default function SearchBar() {
  const { state, dispatch, searchMoviesByQuery } = useMovie();
  const [inputValue, setInputValue] = useState(state.searchQuery);

  useEffect(() => {
    setInputValue(state.searchQuery);
  }, [state.searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query }); 
    searchMoviesByQuery(query); 
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <input
        type="text"
        placeholder="Search for movies..."
        value={inputValue}
        onChange={handleChange}
        className="w-full p-3 rounded-full border border-gray-300 focus:outline-none  focus:ring-blue-500 text-black shadow-sm"
      />
      {state.loading && <p className="text-center text-blue-500 mt-2">Searching...</p>}
      {state.error && <p className="text-center text-red-500 mt-2">{state.error}</p>}
    </div>
  );
}
