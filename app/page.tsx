// app/page.tsx
'use client';

import SearchBar from '@/components/searchbar';
import SocialContextSelector from '@/components/socialselector';
import MoodSelector from '@/components/moodselector'; // New: Import MoodSelector
import MovieList from '@/components/movielist';

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-10">
        CinemaScope
      </h1>

      <SearchBar />
      <SocialContextSelector />
      <MoodSelector /> 
      <MovieList />
    </main>
  );
}
