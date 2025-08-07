import React from 'react';

interface HandImageProps {
  fingers: number;
  isSelected: boolean;
  isDisabled: boolean;
  size: 'small' | 'medium' | 'large';
  onClick: () => void;
  skinTheme?: 'default' | 'claw' | 'cartoon';
}

export const HandImage: React.FC<HandImageProps> = ({
  fingers,
  isSelected,
  isDisabled,
  size,
  onClick,
  skinTheme = 'default'
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24'
  };

  const baseClass = `${sizeClasses[size]} rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer border-2 overflow-hidden`;
  
  let colorClass = '';
  if (isDisabled) {
    colorClass = 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-50';
  } else if (isSelected) {
    colorClass = 'bg-blue-100 border-blue-600 ring-4 ring-blue-300 scale-110 shadow-lg';
  } else {
    colorClass = 'bg-white border-gray-300 hover:border-blue-400 hover:scale-105 hover:shadow-md';
  }

  // Try to use image if it exists
  const imagePath = `/hands/${skinTheme}/${fingers}.png`;
  
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClass} ${colorClass} relative`}
      aria-label={`Hand with ${fingers} fingers`}
    >
      {/* Try to load image, fall back to number if not found */}
      <img 
        src={imagePath} 
        alt={`${fingers} fingers`}
        className="w-full h-full object-contain"
        onError={(e) => {
          // If image fails to load, hide it and show the number
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Fallback number display */}
      <span className="absolute inset-0 flex items-center justify-center text-4xl">
        {fingers}
      </span>
    </button>
  );
};