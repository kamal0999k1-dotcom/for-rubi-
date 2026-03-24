import React from 'react';

interface OptionButtonProps {
  option: {
    name: string;
    emoji?: string;
  };
  category: string;
  onClick: () => void;
  isCorrect: boolean;
  isIncorrect: boolean;
  isDisabled: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({ option, category, onClick, isCorrect, isIncorrect, isDisabled }) => {
  const baseClasses = 'w-full h-32 md:h-56 flex items-center justify-center text-3xl md:text-5xl font-extrabold rounded-2xl shadow-lg transform transition-all duration-300 ease-in-out p-2';
  const interactionClasses = isDisabled ? 'cursor-not-allowed' : 'hover:scale-105 hover:-translate-y-2';
  
  const isColorCategory = category === 'Colors';

  let colorClasses = 'bg-white text-purple-600';
  let inlineStyle: React.CSSProperties = {};
  let contentTextColorClass = '';

  if (isCorrect) {
    colorClasses = 'bg-green-400 text-white animate-bounce';
  } else if (isIncorrect) {
    colorClasses = 'bg-red-400 text-white';
    inlineStyle.animation = 'shake 0.5s ease-in-out';
  } else if (isColorCategory) {
    const colorName = option.name.toLowerCase();
    inlineStyle.backgroundColor = colorName;
    const darkColors = ['black', 'blue', 'purple', 'green', 'red'];
    contentTextColorClass = darkColors.includes(colorName) ? 'text-white' : 'text-black';
    colorClasses = ''; // Unset default bg so inline style takes over
  }

  const keyframes = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
      20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`${baseClasses} ${interactionClasses} ${colorClasses} ${contentTextColorClass}`}
        style={inlineStyle}
      >
        {option.emoji ? (
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-4xl md:text-7xl" role="img" aria-label={option.name}>{option.emoji}</span>
            <span className="text-lg md:text-3xl font-bold">{option.name}</span>
          </div>
        ) : (
          <span>{option.name}</span>
        )}
      </button>
    </>
  );
};

export default OptionButton;