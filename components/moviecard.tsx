'use client';

import React, { useEffect, useRef } from 'react';
import type { AppMovie } from '@/types';
import { useMovie } from '@/context/moviecontext';

interface MovieCardProps {
  movie: AppMovie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { fetchMovieDetailsForMovie, fetchDynamicPrice } = useMovie();
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch details if not already present
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateX = (mouseY / (rect.height / 2)) * -10;
    const rotateY = (mouseX / (rect.width / 2)) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  const posterSrc = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/300x450/cccccc/333333?text=No+Poster';

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full transition-transform duration-200 ease-out"
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-64 overflow-hidden">
        <img
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
     
        <div className="mt-4 pt-4 border-t border-gray-200">
          {typeof movie.moodMatchPercentage === 'number' && (
            <p className="text-sm text-blue-700 font-semibold">
              Mood Match: {movie.moodMatchPercentage}%
            </p>
          )}
          {typeof movie.score === 'number' && (
            <p className="text-sm text-purple-700 font-semibold">
              Overall Score: {movie.score.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}