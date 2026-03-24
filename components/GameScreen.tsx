import React, { useState, useEffect, useCallback, useRef } from 'react';
import OptionButton from './OptionButton';
import { speak } from '../services/voiceService';
import { playCorrectSound, playWrongSound } from '../services/soundService';

interface GameScreenProps {
  playerName: string;
  category: string;
  difficulty: string;
  onBack: () => void;
}

interface GameOption {
  name: string;
  emoji?: string;
}

const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = Array.from({ length: 20 }, (_, i) => (i + 1).toString());
const ANIMALS = ['Lion', 'Tiger', 'Dog', 'Cat', 'Monkey', 'Bear', 'Elephant', 'Giraffe', 'Zebra', 'Horse', 'Panda', 'Hippo', 'Fox', 'Kangaroo'];
const FRUITS = ['Apple', 'Banana', 'Orange', 'Grape', 'Strawberry', 'Watermelon', 'Pineapple', 'Mango', 'Cherry', 'Peach'];
const BODY_PARTS = ['Eye', 'Nose', 'Ear', 'Mouth', 'Hand', 'Foot', 'Arm', 'Leg', 'Hair', 'Finger', 'Tummy', 'Knee', 'Elbow', 'Toe', 'Tongue'];
const VEGETABLES = ['Carrot', 'Broccoli', 'Tomato', 'Potato', 'Onion', 'Corn', 'Pepper', 'Mushroom', 'Cucumber', 'Lettuce', 'Spinach', 'Pumpkin'];
const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Black', 'White', 'Pink', 'Brown', 'Gray'];

const gameData: { [key: string]: string[] } = {
  'Alphabets': ALPHABETS,
  'Numbers': NUMBERS,
  'Animals': ANIMALS,
  'Fruits': FRUITS,
  'Body Parts': BODY_PARTS,
  'Vegetables': VEGETABLES,
  'Colors': COLORS,
};

const EMOJI_MAP: { [key: string]: { [key: string]: string } } = {
  'Animals': { 'Lion': '🦁', 'Tiger': '🐯', 'Dog': '🐶', 'Cat': '🐱', 'Monkey': '🐵', 'Bear': '🐻', 'Elephant': '🐘', 'Giraffe': '🦒', 'Zebra': '🦓', 'Horse': '🐴', 'Panda': '🐼', 'Hippo': '🦛', 'Fox': '🦊', 'Kangaroo': '🦘' },
  'Fruits': { 'Apple': '🍎', 'Banana': '🍌', 'Orange': '🍊', 'Grape': '🍇', 'Strawberry': '🍓', 'Watermelon': '🍉', 'Pineapple': '🍍', 'Mango': '🥭', 'Cherry': '🍒', 'Peach': '🍑' },
  'Body Parts': { 'Eye': '👁️', 'Nose': '👃', 'Ear': '👂', 'Mouth': '👄', 'Hand': '✋', 'Foot': '🦶', 'Arm': '💪', 'Leg': '🦵', 'Hair': '👱', 'Finger': '👉', 'Tummy': '👶', 'Knee': '🦵', 'Elbow': '💪', 'Toe': '🦶', 'Tongue': '👅' },
  'Vegetables': { 'Carrot': '🥕', 'Broccoli': '🥦', 'Tomato': '🍅', 'Potato': '🥔', 'Onion': '🧅', 'Corn': '🌽', 'Pepper': '🌶️', 'Mushroom': '🍄', 'Cucumber': '🥒', 'Lettuce': '🥬', 'Spinach': '🥬', 'Pumpkin': '🎃' },
  'Colors': { 'Red': '🔴', 'Blue': '🔵', 'Green': '🟢', 'Yellow': '🟡', 'Orange': '🟠', 'Purple': '🟣', 'Black': '⚫', 'White': '⚪', 'Pink': '🩷', 'Brown': '🟫', 'Gray': '🩶' },
};


const GameScreen: React.FC<GameScreenProps> = ({ playerName, category, difficulty, onBack }) => {
  const [options, setOptions] = useState<GameOption[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [round, setRound] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const instructionIntervalRef = useRef<number | null>(null);

  const stopShouting = useCallback(() => {
    if (instructionIntervalRef.current) {
      clearInterval(instructionIntervalRef.current);
      instructionIntervalRef.current = null;
    }
    window.speechSynthesis.cancel();
  }, []);

  const shoutInstruction = useCallback(() => {
    if (correctAnswer) {
      let prompt = `Find the ${correctAnswer}`;
      if (category === 'Alphabets') {
        prompt = `Find the letter ${correctAnswer}`;
      } else if (category === 'Numbers') {
        prompt = `Find the number ${correctAnswer}`;
      }
      speak(prompt);
    }
  }, [correctAnswer, category]);

  const setupNewRound = useCallback(() => {
    stopShouting();
    setSelected(null);
    setIsWrong(false);

    const optionsCountMap: { [key: string]: number } = {
      'Easy': 2,
      'Medium': 4,
      'Hard': 6,
    };
    const numOptions = optionsCountMap[difficulty] || 4;

    const currentData = gameData[category] || ALPHABETS;
    const shuffled = [...currentData].sort(() => 0.5 - Math.random());
    const newOptionNames = shuffled.slice(0, numOptions);
    
    const possibleAnswers = newOptionNames.filter(name => !history.includes(name));
    const newCorrectAnswer = possibleAnswers.length > 0
      ? possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)]
      : newOptionNames[Math.floor(Math.random() * newOptionNames.length)];

    const emojiCategories = ['Animals', 'Fruits', 'Body Parts', 'Vegetables', 'Colors'];
    const newOptions = newOptionNames.map(name => {
      let emoji: string | undefined = undefined;
      if (emojiCategories.includes(category)) {
        emoji = EMOJI_MAP[category]?.[name];
      }
      return { name, emoji };
    });

    setOptions(newOptions);
    setCorrectAnswer(newCorrectAnswer);

    setTimeout(() => {
        let prompt = `Click on the ${newCorrectAnswer}`;
        if (category === 'Alphabets') {
          prompt = `Click on the letter ${newCorrectAnswer}`;
        } else if (category === 'Numbers') {
          prompt = `Click on the number ${newCorrectAnswer}`;
        }
        speak(prompt);
    }, 500);
  }, [stopShouting, category, history, difficulty]);

  useEffect(() => {
    setupNewRound();
  }, [round, setupNewRound]);
  
  useEffect(() => {
    return () => {
      stopShouting();
    }
  }, [stopShouting]);

  const handleSelect = (item: GameOption) => {
    if (selected) return;

    setSelected(item.name);

    if (item.name === correctAnswer) {
      setScore(s => s + 1);
      setHistory(prev => [correctAnswer, ...prev].slice(0, 5));
      stopShouting();
      playCorrectSound();
      speak('Great job!', () => {
        setRound(r => r + 1);
      });
    } else {
      setIsWrong(true);
      stopShouting();
      playWrongSound();

      let prompt = `Try again. Find the ${correctAnswer}.`;
      if (category === 'Alphabets') {
        prompt = `Try again. Find the letter ${correctAnswer}.`;
      } else if (category === 'Numbers') {
        prompt = `Try again. Find the number ${correctAnswer}.`;
      }
      speak(prompt);
      instructionIntervalRef.current = window.setInterval(shoutInstruction, 4000);

      setTimeout(() => {
        setSelected(null);
        setIsWrong(false);
      }, 1500);
    }
  };
  
  const gridClasses = difficulty === 'Hard' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2';

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-4 md:p-10 text-center">
      <div className="flex justify-between items-center mb-4 md:mb-6 flex-wrap gap-2 md:gap-4">
        <h2 className="text-xl md:text-3xl font-bold text-indigo-800">Hi, {playerName}!</h2>
        <div className="text-lg md:text-2xl font-bold text-indigo-800">
          Difficulty: <span className="text-purple-600">{difficulty}</span>
        </div>
        <div className="text-xl md:text-3xl font-bold text-white bg-green-500 px-4 md:px-6 py-1 md:py-2 rounded-full shadow-md">
          Score: {score}
        </div>
      </div>
      <div className="mb-4 md:mb-8 p-3 md:p-4 bg-indigo-100 rounded-2xl">
         <h1 className="text-2xl md:text-5xl font-extrabold text-indigo-700 animate-pulse">Find the {category.slice(0, -1)}!</h1>
      </div>
     
      <div className={`grid ${gridClasses} gap-3 md:gap-8`}>
        {options.map((item) => (
          <OptionButton
            key={item.name}
            option={item}
            category={category}
            onClick={() => handleSelect(item)}
            isCorrect={selected === item.name && item.name === correctAnswer}
            isIncorrect={selected === item.name && isWrong}
            isDisabled={!!selected}
          />
        ))}
      </div>
      <button 
        onClick={onBack}
        className="mt-6 md:mt-8 px-6 py-3 text-lg font-bold text-white bg-indigo-500 rounded-full shadow-lg hover:bg-indigo-600 transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
      >
        Change Category
      </button>
    </div>
  );
};

export default GameScreen;