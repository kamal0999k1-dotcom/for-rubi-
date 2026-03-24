import React, { useState, useEffect, useCallback } from 'react';
import { speak, stopSpeaking } from '../services/voiceService';
import { startListening, stopListening } from '../services/speechRecognitionService';
import { playCorrectSound, playWrongSound, playLevelCompleteSound, playNavigationBackSound } from '../services/soundService';

interface RhymeScreenProps {
  playerName: string;
  onBack: () => void;
}

const RHYMES = [
  {
    title: 'Twinkle, Twinkle, Little Star',
    lines: [
      'Twinkle, twinkle, little star,',
      'How I wonder what you are.',
      'Up above the world so high,',
      'Like a diamond in the sky.',
    ],
  },
  {
    title: 'Baa, Baa, Black Sheep',
    lines: [
      'Baa, baa, black sheep,',
      'Have you any wool?',
      'Yes sir, yes sir,',
      'Three bags full.',
    ],
  },
  {
    title: 'Row, Row, Row Your Boat',
    lines: [
      'Row, row, row your boat,',
      'Gently down the stream.',
      'Merrily, merrily, merrily, merrily,',
      'Life is but a dream.',
    ],
  },
];

type GameStatus = 'INTRO' | 'BOT_SPEAKING' | 'USER_PROMPT' | 'LISTENING' | 'EVALUATING' | 'CORRECT_FEEDBACK' | 'INCORRECT_FEEDBACK' | 'RHYME_COMPLETE';

const RhymeScreen: React.FC<RhymeScreenProps> = ({ playerName, onBack }) => {
  const [rhymeIndex, setRhymeIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [status, setStatus] = useState<GameStatus>('INTRO');

  const currentRhyme = RHYMES[rhymeIndex];
  const currentLine = currentRhyme.lines[lineIndex];

  const isSimilar = (original: string, spoken: string): boolean => {
    const normalize = (str: string) => str.toLowerCase().replace(/[.,!?'"]/g, '').split(/\s+/).filter(Boolean);
    const originalWords = new Set(normalize(original));
    const spokenWords = normalize(spoken);
    if (originalWords.size === 0 || spokenWords.length === 0) return false;
    let matchCount = 0;
    for (const word of spokenWords) {
      if (originalWords.has(word)) {
        matchCount++;
      }
    }
    const similarity = matchCount / originalWords.size;
    return similarity >= 0.6; // 60% of words must match
  };

  const handleSpeechResult = (transcript: string) => {
    if (isSimilar(currentLine, transcript)) {
      setStatus('CORRECT_FEEDBACK');
    } else {
      setStatus('INCORRECT_FEEDBACK');
    }
  };

  const handleSpeechError = (error: string) => {
    console.error('Speech recognition error:', error);
    speak("I didn't hear you, let's try again.", () => {
      setStatus('BOT_SPEAKING');
    });
  };

  useEffect(() => {
    const processGameLogic = async () => {
      switch (status) {
        case 'INTRO':
          speak(`Let's learn the rhyme: ${currentRhyme.title}`, () => setStatus('BOT_SPEAKING'));
          break;
        case 'BOT_SPEAKING':
          speak(currentLine, () => setStatus('USER_PROMPT'));
          break;
        case 'USER_PROMPT':
          setTimeout(() => setStatus('LISTENING'), 500);
          break;
        case 'LISTENING':
          startListening(handleSpeechResult, handleSpeechError);
          break;
        case 'CORRECT_FEEDBACK':
          stopListening();
          playCorrectSound();
          speak('Great job!', () => {
            if (lineIndex < currentRhyme.lines.length - 1) {
              setLineIndex(prev => prev + 1);
              setStatus('BOT_SPEAKING');
            } else {
              setStatus('RHYME_COMPLETE');
            }
          });
          break;
        case 'INCORRECT_FEEDBACK':
          stopListening();
          playWrongSound();
          speak("Oops, let's try that line again.", () => {
            setStatus('BOT_SPEAKING');
          });
          break;
        case 'RHYME_COMPLETE':
          playLevelCompleteSound();
          speak('You learned the whole rhyme! Want to learn another?', () => {
            setLineIndex(0);
            setRhymeIndex(prev => (prev + 1) % RHYMES.length);
            setStatus('INTRO');
          });
          break;
      }
    };
    processGameLogic();
  }, [status, rhymeIndex, lineIndex]);
  
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
        return { text: 'Listen carefully...', icon: 'volume-up', color: 'bg-blue-100' };
      case 'USER_PROMPT':
      case 'LISTENING':
        return { text: 'Your turn! Speak now...', icon: 'microphone animate-pulse', color: 'bg-yellow-100' };
      case 'CORRECT_FEEDBACK':
        return { text: 'Awesome!', icon: 'check', color: 'bg-green-100' };
      case 'INCORRECT_FEEDBACK':
        return { text: 'Let\'s try again!', icon: 'refresh', color: 'bg-red-100' };
      default:
        return { text: `Let's learn a rhyme!`, icon: 'music', color: 'bg-indigo-100' };
    }
  };

  const { text, icon, color } = getStatusUI();

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-4 md:p-10 text-center">
      <h1 className="text-2xl md:text-4xl font-extrabold text-indigo-700 mb-2 md:mb-4">{currentRhyme.title}</h1>
      
      <div className={`p-3 md:p-4 rounded-2xl mb-4 md:mb-6 ${color}`}>
        <p className="text-xl md:text-3xl font-bold text-indigo-800">{text}</p>
      </div>

      <div className="text-left p-4 md:p-6 bg-white rounded-xl shadow-inner min-h-[120px] md:min-h-[150px]">
        {currentRhyme.lines.map((line, index) => (
          <p key={index} className={`text-xl md:text-3xl transition-all duration-300 ${index === lineIndex ? 'font-bold text-purple-700' : 'text-gray-500'}`}>
            {line}
          </p>
        ))}
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

export default RhymeScreen;