'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from './moviecard';
import { useMovie } from '@/context/moviecontext';

export default function MovieList() {
  const { state } = useMovie();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };



  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20
      }
    },
    exit: { opacity: 0, y: -10 }
  };

  // Loading state
  if (state.loading && state.filteredMovies.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
        variants={messageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-xl text-gray-600 font-medium">Loading movies...</p>
      </motion.div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
        variants={messageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl text-red-500 font-medium text-center">
          Oops! Something went wrong
        </p>
        <p className="text-gray-500 text-center max-w-md">
          {state.error}
        </p>
      </motion.div>
    );
  }

  // No results for search
  if (state.searchQuery && state.filteredMovies.length === 0 && !state.loading) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
        variants={messageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-xl text-gray-600 font-medium">No movies found</p>
        <p className="text-gray-500 text-center">
          No results for &quot;<span className="font-semibold text-gray-700">{state.searchQuery}</span>&quot;
        </p>
        <p className="text-sm text-gray-400">Try searching with different keywords</p>
      </motion.div>
    );
  }

  // Initial empty state
  if (state.filteredMovies.length === 0 && !state.searchQuery && !state.loading) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[400px] space-y-6"
        variants={messageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0H4m16 0h-2" />
          </svg>
        </motion.div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-gray-800">Discover Amazing Movies</p>
          <p className="text-gray-500 max-w-md">
            Start your cinematic journey by searching for your favorite movies, actors, or genres
          </p>
        </div>
        <motion.div 
          className="bg-blue-50 px-4 py-2 rounded-full"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-blue-600 text-sm font-medium">🎬 Search above to get started</p>
        </motion.div>
      </motion.div>
    );
  }

  // Movie grid
  return (
    <div className="p-6">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {state.filteredMovies.map((movie, index) => (
          <motion.div
            key={movie.imdbID}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: Math.min(index * 0.05, 0.5),
              type: "spring", 
              stiffness: 100, 
              damping: 12 
            }}
            whileHover={{ 
              y: -8,
              transition: { type: "spring", stiffness: 300 }
            }}
          >
            <MovieCard movie={movie} />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Results count */}
      {state.filteredMovies.length > 0 && (
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-500 text-sm">
            Showing {state.filteredMovies.length} movie{state.filteredMovies.length !== 1 ? 's' : ''}
            {state.searchQuery && (
              <span> for &quot;<span className="font-semibold text-gray-700">{state.searchQuery}</span>&quot;</span>
            )}
          </p>
        </motion.div>
      )}
    </div>
  );
}