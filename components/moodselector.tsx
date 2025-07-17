'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMovie } from '@/context/moviecontext';
import { MoodType } from '@/types';
import { ChevronDown } from 'lucide-react';

export default function MoodSelector() {
  const { state, dispatch } = useMovie();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const moods: MoodType[] = [
    'Need a Good Cry',
    'Brain Food',
    'Mindless Fun',
    'Edge of Seat',
    'Feel Good Vibes',
    'Deep Thoughts',
  ];

  const handleSelect = (mood: MoodType) => {
    dispatch({ type: 'SET_SELECTED_MOOD', payload: mood });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full">
      <label className="block text-lg font-medium text-gray-700 mb-2">
        How are you feeling?
      </label>
      
      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-left text-gray-700 font-medium text-base shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 flex items-center justify-between min-h-[52px]"
          type="button"
        >
          <span className={state.selectedMood ? 'text-gray-700' : 'text-gray-400'}>
            {state.selectedMood || 'Select your mood'}
          </span>
          
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
            <ul className="py-2">
              {moods.map((mood) => (
                <li key={mood}>
                  <button
                    onClick={() => handleSelect(mood)}
                    className={`w-full text-left px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-150 ${
                      state.selectedMood === mood 
                        ? 'bg-blue-50 text-blue-700 font-semibold' 
                        : ''
                    }`}
                  >
                    {mood}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
