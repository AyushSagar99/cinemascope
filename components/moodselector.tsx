'use client';

import React from 'react';
import { useMovie } from '@/context/moviecontext';
import { MoodType } from '@/types';

export default function MoodSelector() {
  const { state, dispatch } = useMovie();

  const moods: MoodType[] = [
    'Need a Good Cry',
    'Brain Food',
    'Mindless Fun',
    'Edge of Seat',
    'Feel Good Vibes',
    'Deep Thoughts',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_SELECTED_MOOD', payload: e.target.value as MoodType });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <label htmlFor="mood-selector" className="block text-lg font-medium text-gray-700 mb-2">
        How are you feeling?
      </label>
      <select
        id="mood-selector"
        value={state.selectedMood}
        onChange={handleChange}
        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 shadow-sm bg-white"
      >
        {moods.map((mood) => (
          <option key={mood} value={mood}>
            {mood}
          </option>
        ))}
      </select>
    </div>
  );
}
