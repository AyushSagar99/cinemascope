'use client';

import SearchBar from '@/components/searchbar';
import SocialContextSelector from '@/components/socialselector';
import MoodSelector from '@/components/moodselector';
import MovieList from '@/components/movielist';

export default function HomePage() {
  return (
    <div className='bg-[#FAFAF9] '>
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">

      <div className='bg-purple-600 w-[150px] h-[100px] md:w-[239px] md:h-[239px] blur-[800px] absolute left-0 top-0' />
      <div className='bg-purple-600 w-[209px] h-[209px] blur-[800px] absolute right-0 bottom-0' />
      <h1 className="md:text-8xl text-2xl font-bold text-center  mb-5 font-serif">
        CinemaScope
      </h1>
      <p className="text-sm text-[#78716C] mb-12 font-[Inter] text-center">
            Discover your next favorite movie with personalized recommendations
          </p>
      <SearchBar />
      
      
      <div className='flex flex-col  gap-6 max-w-2xl mx-auto mb-8'>
 
        <div className="flex flex-col md:flex-row gap-4">
          <SocialContextSelector />
          <MoodSelector /> 
        </div>
      </div>
      
      <MovieList />
    </main>
    </div>
  );
}