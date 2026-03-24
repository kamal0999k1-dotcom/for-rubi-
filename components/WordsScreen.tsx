import React, { useState, useEffect, useCallback } from 'react';
import { speak, stopSpeaking } from '../services/voiceService';
import { startListening, stopListening } from '../services/speechRecognitionService';
import { playWordLearnedSound, playWrongSound, playLevelCompleteSound, playNavigationBackSound } from '../services/soundService';
import { EASY_WORDS, MEDIUM_WORDS, HARD_WORDS } from '../data/words';

interface WordsScreenProps {
  playerName: string;
  difficulty: string;
  onBack: () => void;
}

type GameStatus = 'INTRO' | 'BOT_SPEAKING' | 'USER_PROMPT' | 'LISTENING' | 'EVALUATING' | 'CORRECT_FEEDBACK' | 'INCORRECT_FEEDBACK' | 'LEVEL_COMPLETE';

const WordsScreen: React.FC<WordsScreenProps> = ({ playerName, difficulty, onBack }) => {
  const [wordList, setWordList] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [status, setStatus] = useState<GameStatus>('INTRO');

  useEffect(() => {
    const getWords = () => {
      switch (difficulty) {
        case 'Easy':
          return [...EASY_WORDS].sort(() => 0.5 - Math.random());
        case 'Medium':
          return [...MEDIUM_WORDS].sort(() => 0.5 - Math.random());
        case 'Hard':
          return [...HARD_WORDS].sort(() => 0.5 - Math.random());
        default:
          return [...EASY_WORDS].sort(() => 0.5 - Math.random());
      }
    };
    setWordList(getWords());
    setWordIndex(0);
    setStatus('INTRO');
  }, [difficulty]);
  
  const currentWord = wordList[wordIndex];

  const isSimilar = (original: string, spoken: string): boolean => {
      if (!original || !spoken) return false;
      return spoken.toLowerCase().includes(original.toLowerCase());
  };

  const handleSpeechResult = (transcript: string) => {
    setStatus('EVALUATING');
    if (isSimilar(currentWord, transcript)) {
      setStatus('CORRECT_FEEDBACK');
    } else {
      setStatus('INCORRECT_FEEDBACK');
    }
  };

  const handleSpeechError = (error: string) => {
    console.error('Speech recognition error:', error);
    if(status === 'LISTENING') {
      speak("I didn't quite catch that, let's try again.", () => {
        setStatus('BOT_SPEAKING');
      });
    }
  };
  
  const advanceWord = useCallback(() => {
    if (wordIndex < wordList.length - 1) {
      setWordIndex(prev => prev + 1);
      setStatus('BOT_SPEAKING');
    } else {
      setStatus('LEVEL_COMPLETE');
    }
  }, [wordIndex, wordList.length]);

  useEffect(() => {
    if(!currentWord) return;

    const processGameLogic = () => {
      switch (status) {
        case 'INTRO':
          speak(`Let's learn some words! Say the word after me.`, () => setStatus('BOT_SPEAKING'));
          break;
        case 'BOT_SPEAKING':
          speak(currentWord, () => setStatus('USER_PROMPT'));
          break;
        case 'USER_PROMPT':
          setTimeout(() => setStatus('LISTENING'), 500);
          break;
        case 'LISTENING':
          startListening(handleSpeechResult, handleSpeechError);
          break;
        case 'CORRECT_FEEDBACK':
          stopListening();
          playWordLearnedSound();
          speak('That was great!', advanceWord);
          break;
        case 'INCORRECT_FEEDBACK':
          stopListening();
          playWrongSound();
          speak("Not quite. Let's try that word again.", () => {
            setStatus('BOT_SPEAKING');
          });
          break;
        case 'LEVEL_COMPLETE':
          playLevelCompleteSound();
          speak(`Wow! You learned all the words for this level!`, () => {
            onBack();
          });
          break;
        case 'EVALUATING':
          // a waiting state, no action
          break;
      }
    };
    processGameLogic();
  }, [status, currentWord, advanceWord]);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopListening();
      stopSpeaking();
    }
  }, []);

  const getStatusUI = () => {
    switch (status) {
      case 'BOT_SPEAKING':
        return { text: 'Listen to the word...', icon: 'volume-up', color: 'bg-blue-100' };
      case 'USER_PROMPT':
      case 'LISTENING':
        return { text: 'Your turn! Speak now...', icon: 'microphone animate-pulse', color: 'bg-yellow-100' };
      case 'CORRECT_FEEDBACK':
        return { text: 'Awesome!', icon: 'check', color: 'bg-green-100' };
      case 'INCORRECT_FEEDBACK':
        return { text: 'Let\'s try again!', icon: 'refresh', color: 'bg-red-100' };
      default:
        return { text: `Let's learn some words!`, icon: 'music', color: 'bg-indigo-100' };
    }
  };

  const { text } = getStatusUI();

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-4 md:p-10 text-center">
      <h1 className="text-2xl md:text-4xl font-extrabold text-indigo-700 mb-2 md:mb-4">Say the Word!</h1>
      
      <div className={`p-3 md:p-4 rounded-2xl mb-4 md:mb-6 bg-indigo-100`}>
        <p className="text-xl md:text-3xl font-bold text-indigo-800">{text}</p>
      </div>

      <div className="flex items-center justify-center p-4 md:p-6 bg-white rounded-xl shadow-inner min-h-[120px] md:min-h-[150px]">
        <p className="text-5xl md:text-8xl font-bold text-purple-700 tracking-wider">
            {currentWord}
        </p>
      </div>

      <button 
        onClick={() => {
          stopListening();
          stopSpeaking();
          playNavigationBackSound();
          onBack();
        }}
        className="mt-6 md:mt-8 px-6 py-3 text-lg font-bold text-white bg-indigo-500 rounded-full shadow-lg hover:bg-indigo-600 transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
      >
        Change Category
      </button>
    </div>
  );
};

export default WordsScreen;