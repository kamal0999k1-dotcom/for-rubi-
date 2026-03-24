import React, { useState } from 'react';
import { speak, unlockAudio } from '../services/voiceService';

interface WelcomeScreenProps {
  playerName: string;
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ playerName, onStart }) => {
  const [showKeyHelp, setShowKeyHelp] = useState(false);

  const handleStart = () => {
    // This click triggers audio context unlock on mobile
    unlockAudio();
    speak(`Hello ${playerName}! Let's play!`);
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
        <button 
          onClick={() => setShowKeyHelp(!showKeyHelp)}
          className="mt-4 text-pink-500 underline font-bold"
        >
          Need to add an API Key?
        </button>
        
        {showKeyHelp && (
          <div className="mt-4 p-4 bg-pink-50 rounded-xl border border-pink-200 text-left text-indigo-800">
            <p className="font-bold mb-2">How to add your Gemini API Key:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs md:text-sm">
              <li>Tap the <span className="font-bold">Settings (gear icon)</span> at the top right of the screen.</li>
              <li>Find the <span className="font-bold">GEMINI_API_KEY</span> field.</li>
              <li>Paste your key and tap <span className="font-bold">Save</span>.</li>
              <li>Refresh the page to start playing!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
