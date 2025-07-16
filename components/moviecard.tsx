'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { AppMovie } from '@/types';
import { useMovie } from '@/context/moviecontext';

interface MovieCardProps {
  movie: AppMovie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { fetchMovieDetailsForMovie, fetchDynamicPrice } = useMovie();

  useEffect(() => {
    if (!movie.details) {
      fetchMovieDetailsForMovie(movie.imdbID);
    }
  }, [movie.imdbID, movie.details, fetchMovieDetailsForMovie]);

  useEffect(() => {
    if (movie.details && !movie.dynamicPrice) {
      fetchDynamicPrice(movie.imdbID, movie.details);
    }
  }, [movie.imdbID, movie.details, movie.dynamicPrice, fetchDynamicPrice]);

  const posterSrc = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/300x450/cccccc/333333?text=No+Poster';

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full transform transition-transform duration-200 hover:scale-105">
      <div className="relative w-full h-64 overflow-hidden">
        <Image
        priority
          src={posterSrc}
          alt={movie.Title}
          fill 
          style={{ objectFit: 'cover' }} 
          className="rounded-t-lg"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/300x450/cccccc/333333?text=No+Poster';
          }}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Added sizes prop for responsiveness
        />
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{movie.Title} ({movie.Year})</h3>
          {movie.details ? (
            <>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Genre:</span> {movie.details.Genre}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Runtime:</span> {movie.details.Runtime}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">IMDb Rating:</span> {movie.details.imdbRating}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">Loading details...</p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          {movie.dynamicPrice ? (
            <>
              <p className="text-lg font-bold text-green-600">
                Rent: ${movie.dynamicPrice.rentalPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {movie.dynamicPrice.bestTimeToRentSuggestion}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">Calculating price...</p>
          )}
        </div>
      </div>
    </div>
  );
}
