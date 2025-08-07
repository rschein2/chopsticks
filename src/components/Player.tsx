import React from 'react';
import type { Player as PlayerType } from '../types/game';
import { HandImage } from './HandImage';

interface PlayerProps {
  player: PlayerType;
  isCurrentTurn: boolean;
  selectedHandIndex: number | null;
  onHandClick: (handIndex: number) => void;
  isOpponent: boolean;
  skinTheme?: 'default' | 'claw' | 'cartoon';
}

export const Player: React.FC<PlayerProps> = ({
  player,
  isCurrentTurn,
  selectedHandIndex,
  onHandClick,
  isOpponent,
  skinTheme = 'default',
}) => {
  // Determine hand size based on number of hands
  const getHandSize = (): 'small' | 'medium' | 'large' => {
    if (player.numberOfHands >= 5) return 'small';
    if (player.numberOfHands >= 3) return 'medium';
    return 'large';
  };

  const handSize = getHandSize();
  
  return (
    <div className={`p-4 rounded-xl ${isCurrentTurn ? 'bg-yellow-100 ring-4 ring-yellow-300' : 'bg-gray-100'}`}>
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800 h-7">
        Player {player.id}
      </h2>
      
      <div className="flex flex-col gap-4 items-center min-h-[400px] justify-center">
        {player.hands.map((fingers, index) => (
          <HandImage
            key={index}
            fingers={fingers}
            isSelected={!isOpponent && isCurrentTurn && selectedHandIndex === index}
            isDisabled={fingers === 0}
            size={handSize}
            onClick={() => onHandClick(index)}
            skinTheme={skinTheme}
          />
        ))}
      </div>
      
      {/* Show total fingers */}
      <div className="mt-3 text-center text-sm text-gray-600">
        Total: {player.hands.reduce((sum, h) => sum + h, 0)} fingers
      </div>
    </div>
  );
};