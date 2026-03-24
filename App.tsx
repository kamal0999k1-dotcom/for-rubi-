import React, { useState, useEffect } from 'react';
import GameScreen from './components/GameScreen';
import CategorySelectionScreen from './components/CategorySelectionScreen';
import RhymeScreen from './components/RhymeScreen';
import DifficultySelectionScreen from './components/DifficultySelectionScreen';
import WordsScreen from './components/WordsScreen';
import { initializeVoices, speak } from './services/voiceService';

import WelcomeScreen from './components/WelcomeScreen';

const App: React.FC = () => {
  const playerName = "Rubi";
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [gameCategory, setGameCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  useEffect(() => {
    // Pre-load voices
    initializeVoices();
  }, []);

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleCategorySelect = (category: string) => {
    setGameCategory(category);
  };
  
  const handleDifficultySelect = (selectedDifficulty: string) => {
    setDifficulty(selectedDifficulty);
  };

  const handleBackToCategories = () => {
    setGameCategory(null);
    setDifficulty(null);
  };

  const renderContent = () => {
    if (!isStarted) {
      return <WelcomeScreen playerName={playerName} onStart={handleStart} />;
    }

    if (!gameCategory) {
      return <CategorySelectionScreen onSelectCategory={handleCategorySelect} playerName={playerName} />;
    }
    
    if (gameCategory === 'Nursery Rhymes') {
        return <RhymeScreen playerName={playerName} onBack={handleBackToCategories} />;
    }

    if (!difficulty) {
        return <DifficultySelectionScreen onSelectDifficulty={handleDifficultySelect} category={gameCategory} onBack={handleBackToCategories} />;
    }

    if (gameCategory === 'Words') {
        return <WordsScreen playerName={playerName} difficulty={difficulty} onBack={handleBackToCategories} />;
    }
    
    return <GameScreen playerName={playerName} category={gameCategory} difficulty={difficulty} onBack={handleBackToCategories} />;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sky-200 to-indigo-300 p-2 md:p-4 overflow-hidden">
      <div className="w-full h-full flex items-center justify-center overflow-y-auto max-h-screen">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;