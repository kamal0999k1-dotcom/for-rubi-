import React from 'react';
import { speak } from '../services/voiceService';

interface WelcomeScreenProps {
  playerName: string;
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ playerName, onStart }) => {
  const handleStart = () => {
    // This click triggers audio context unlock on mobile
    speak(`Hello ${playerName}! Welcome to Alphabet Adventure! Let's play!`);
    onStart();
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 text-center transition-all duration-500 transform hover:scale-105">
      <div className="mb-6">
        <span className="text-6xl md:text-8xl animate-bounce inline-block">👋</span>
      </div>
      <h1 className="text-5xl md:text-8xl font-black text-indigo-700 mb-2 tracking-tight">
        Hey <span className="text-pink-500">{playerName}</span>!
      </h1>
      <h2 className="text-2xl md:text-4xl font-bold text-indigo-500 mb-10">
        Let's Learn and Play!
      </h2>
      <p className="text-lg md:text-2xl text-indigo-600 mb-10 font-medium">
        Ready for some fun learning?
      </p>
      
      <button
        onClick={handleStart}
        className="group relative inline-flex items-center justify-center px-10 py-6 md:px-16 md:py-8 text-3xl md:text-5xl font-black text-white bg-gradient-to-r from-pink-500 to-orange-400 rounded-full shadow-[0_10px_0_0_#be185d] hover:shadow-[0_5px_0_0_#be185d] hover:translate-y-[5px] active:shadow-none active:translate-y-[10px] transition-all duration-150 ease-in-out"
      >
        <span className="mr-4">START</span>
        <span className="group-hover:translate-x-2 transition-transform duration-200">🚀</span>
      </button>
      
      <div className="mt-12 text-indigo-400 text-sm md:text-base font-medium">
        <p>Best played in <span className="font-bold">Safari</span> or <span className="font-bold">Chrome</span></p>
        <p className="mt-1 opacity-70">If you're in Messenger, tap the three dots and "Open in Browser"</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
