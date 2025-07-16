'use client';

import React from 'react';
import { useMovie } from '@/context/moviecontext';
import { SocialContext } from '@/types';

export default function SocialContextSelector() {
  const { state, dispatch } = useMovie();

  const contexts: SocialContext[] = [
    'Solo Night',
    'Date Night',
    'Family Time',
    'Friend Group',
    'Background Noise',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_SOCIAL_CONTEXT', payload: e.target.value as SocialContext });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <label htmlFor="social-context" className="block text-lg font-medium text-gray-700 mb-2">
        Viewing Context:
      </label>
      <select
        id="social-context"
        value={state.selectedSocialContext}
        onChange={handleChange}
        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 shadow-sm bg-white"
      >
        {contexts.map((context) => (
          <option key={context} value={context}>
            {context}
          </option>
        ))}
      </select>
    </div>
  );
}
