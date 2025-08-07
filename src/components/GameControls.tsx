import React, { useState } from 'react';
import { Player } from '../types/game';

interface GameControlsProps {
  currentPlayer: Player;
  onSplit: (leftAmount: number, rightAmount: number) => void;
  onReset: () => void;
  winner: 1 | 2 | null;
}

export const GameControls: React.FC<GameControlsProps> = ({
  currentPlayer,
  onSplit,
  onReset,
  winner,
}) => {
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [leftSplit, setLeftSplit] = useState(0);
  const [rightSplit, setRightSplit] = useState(0);
  
  const total = currentPlayer.leftHand + currentPlayer.rightHand;
  const canSplit = total > 1 && (currentPlayer.leftHand > 0 || currentPlayer.rightHand > 0);
  
  const handleSplit = () => {
    if (leftSplit + rightSplit === total && 
        (leftSplit !== currentPlayer.leftHand || rightSplit !== currentPlayer.rightHand)) {
      onSplit(leftSplit, rightSplit);
      setShowSplitDialog(false);
      setLeftSplit(0);
      setRightSplit(0);
    }
  };
  
  const openSplitDialog = () => {
    setLeftSplit(currentPlayer.leftHand);
    setRightSplit(currentPlayer.rightHand);
    setShowSplitDialog(true);
  };

  return (
    <div className="text-center mt-6">
      {winner && (
        <div className="mb-4 p-4 bg-green-100 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800">
            Player {winner} Wins! 🎉
          </h2>
        </div>
      )}
      
      <div className="flex gap-4 justify-center">
        {!winner && canSplit && (
          <button
            onClick={openSplitDialog}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Split Fingers
          </button>
        )}
        
        <button
          onClick={onReset}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Reset Game
        </button>
      </div>
      
      {showSplitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Split Your Fingers</h3>
            <p className="mb-4 text-gray-600">Total fingers: {total}</p>
            
            <div className="flex gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Left Hand</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={leftSplit}
                  onChange={(e) => setLeftSplit(Number(e.target.value))}
                  className="w-20 p-2 border rounded text-center"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Right Hand</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={rightSplit}
                  onChange={(e) => setRightSplit(Number(e.target.value))}
                  className="w-20 p-2 border rounded text-center"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <p className={`text-sm ${leftSplit + rightSplit === total ? 'text-green-600' : 'text-red-600'}`}>
                Sum: {leftSplit + rightSplit} / {total}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSplit}
                disabled={leftSplit + rightSplit !== total || 
                         (leftSplit === currentPlayer.leftHand && rightSplit === currentPlayer.rightHand)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Apply Split
              </button>
              <button
                onClick={() => setShowSplitDialog(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};