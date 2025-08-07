import React from 'react';
import { Player as PlayerType } from '../types/game';

interface PlayerProps {
  player: PlayerType;
  isCurrentTurn: boolean;
  selectedHand: 'left' | 'right' | null;
  onHandClick: (hand: 'left' | 'right') => void;
  isOpponent: boolean;
}

export const Player: React.FC<PlayerProps> = ({
  player,
  isCurrentTurn,
  selectedHand,
  onHandClick,
  isOpponent,
}) => {
  const getHandClass = (fingers: number, hand: 'left' | 'right') => {
    const baseClass = "w-20 h-20 rounded-lg flex items-center justify-center text-3xl font-bold transition-all cursor-pointer";
    const isSelected = !isOpponent && isCurrentTurn && selectedHand === hand;
    const isDisabled = fingers === 0;
    
    if (isDisabled) {
      return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }
    
    if (isSelected) {
      return `${baseClass} bg-blue-500 text-white ring-4 ring-blue-300 scale-110`;
    }
    
    if (isCurrentTurn && !isOpponent) {
      return `${baseClass} bg-green-400 text-white hover:bg-green-500 hover:scale-105`;
    }
    
    if (isOpponent && isCurrentTurn) {
      return `${baseClass} bg-red-400 text-white hover:bg-red-500 hover:scale-105`;
    }
    
    return `${baseClass} bg-gray-400 text-white`;
  };

  return (
    <div className={`p-6 rounded-xl ${isCurrentTurn ? 'bg-yellow-100 ring-4 ring-yellow-300' : 'bg-gray-100'}`}>
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
        Player {player.id} {isCurrentTurn && '(Your Turn)'}
      </h2>
      <div className="flex gap-6 justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Left Hand</p>
          <button
            onClick={() => onHandClick('left')}
            disabled={player.leftHand === 0 && !isOpponent}
            className={getHandClass(player.leftHand, 'left')}
          >
            {player.leftHand}
          </button>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Right Hand</p>
          <button
            onClick={() => onHandClick('right')}
            disabled={player.rightHand === 0 && !isOpponent}
            className={getHandClass(player.rightHand, 'right')}
          >
            {player.rightHand}
          </button>
        </div>
      </div>
    </div>
  );
};