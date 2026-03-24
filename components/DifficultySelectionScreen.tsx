import React from 'react';
import { speak } from '../services/voiceService';

interface DifficultySelectionScreenProps {
  onSelectDifficulty: (difficulty: string) => void;
  category: string;
  onBack: () => void;
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const COLORS = [
  'bg-green-500 hover:bg-green-600', 
  'bg-yellow-500 hover:bg-yellow-600', 
  'bg-red-500 hover:bg-red-600', 
];

const DifficultySelectionScreen: React.FC<DifficultySelectionScreenProps> = ({ onSelectDifficulty, category, onBack }) => {
  
  const handleSelect = (difficulty: string) => {
    speak(`${difficulty} mode. Let's begin!`);
    onSelectDifficulty(difficulty);
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-8 text-center transition-transform transform hover:scale-105">
      <h1 className="text-3xl md:text-5xl font-bold text-indigo-700 mb-1">You chose {category}!</h1>
      <p className="text-indigo-600 mb-4 md:mb-8 text-xl md:text-2xl">Now, pick a difficulty.</p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
        {DIFFICULTIES.map((difficulty, index) => (
          <button
            key={difficulty}
            onClick={() => handleSelect(difficulty)}
            className={`w-full md:w-auto px-4 py-6 md:px-8 md:py-10 text-2xl md:text-3xl font-bold text-white rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 ease-in-out flex-1 ${COLORS[index % COLORS.length]}`}
          >
            {difficulty}
          </button>
        ))}
      </div>
       <button 
        onClick={onBack}
        className="mt-6 md:mt-8 px-6 py-3 text-lg font-bold text-white bg-indigo-500 rounded-full shadow-lg hover:bg-indigo-600 transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
      >
        Back to Categories
      </button>
    </div>
  );
};

export default DifficultySelectionScreen;
