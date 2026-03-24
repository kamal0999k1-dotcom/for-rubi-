import React from 'react';
import { speak } from '../services/voiceService';

interface CategorySelectionScreenProps {
  onSelectCategory: (category: string) => void;
  playerName: string;
}

const CATEGORIES = ['Alphabets', 'Numbers', 'Animals', 'Fruits', 'Body Parts', 'Vegetables', 'Colors', 'Nursery Rhymes', 'Words'];
const COLORS = [
  'bg-red-500 hover:bg-red-600', 
  'bg-blue-500 hover:bg-blue-600', 
  'bg-yellow-500 hover:bg-yellow-600', 
  'bg-green-500 hover:bg-green-600',
  'bg-purple-500 hover:bg-purple-600',
  'bg-orange-500 hover:bg-orange-600',
  'bg-pink-500 hover:bg-pink-600',
  'bg-teal-500 hover:bg-teal-600',
  'bg-cyan-500 hover:bg-cyan-600',
];

const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({ onSelectCategory, playerName }) => {
  
  const handleSelect = (category: string) => {
    speak(`You chose ${category}. Let's start!`);
    onSelectCategory(category);
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-8 text-center transition-transform transform hover:scale-105">
      <h1 className="text-3xl md:text-5xl font-bold text-indigo-700 mb-1">Hello, {playerName}!</h1>
      <p className="text-indigo-600 mb-4 md:mb-8 text-xl md:text-2xl">Choose a category to play!</p>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {CATEGORIES.map((category, index) => (
          <button
            key={category}
            onClick={() => handleSelect(category)}
            className={`w-full px-4 py-6 md:px-8 md:py-10 text-xl md:text-3xl font-bold text-white rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 ease-in-out ${COLORS[index % COLORS.length]}`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelectionScreen;