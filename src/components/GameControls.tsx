import React, { useState } from 'react';
import type { Player } from '../types/game';

interface GameControlsProps {
  currentPlayer: Player;
  onSplit: (distribution: number[]) => void;
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
  const [splitDistribution, setSplitDistribution] = useState<number[]>([]);
  
  const totalFingers = currentPlayer.hands.reduce((sum, h) => sum + h, 0);
  const activeHands = currentPlayer.hands.filter(h => h > 0).length;
  const canSplit = totalFingers > 1 && activeHands >= 1;
  
  const handleSplit = () => {
    const newTotal = splitDistribution.reduce((sum, h) => sum + h, 0);
    const isSame = splitDistribution.every((h, i) => h === currentPlayer.hands[i]);
    
    if (newTotal === totalFingers && !isSame) {
      onSplit(splitDistribution);
      setShowSplitDialog(false);
    }
  };
  
  const openSplitDialog = () => {
    setSplitDistribution([...currentPlayer.hands]);
    setShowSplitDialog(true);
  };

  const updateHandValue = (index: number, value: number) => {
    const newDist = [...splitDistribution];
    newDist[index] = Math.max(0, Math.min(4, value));
    setSplitDistribution(newDist);
  };

  const currentTotal = splitDistribution.reduce((sum, h) => sum + h, 0);

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
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Split Your Fingers</h3>
            <p className="mb-4 text-gray-600">Total fingers: {totalFingers}</p>
            
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {splitDistribution.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 w-20">
                    Hand {index + 1}:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={value}
                    onChange={(e) => updateHandValue(index, Number(e.target.value))}
                    className="w-16 p-2 border rounded text-center"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateHandValue(index, value - 1)}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <button
                      onClick={() => updateHandValue(index, value + 1)}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <p className={`text-sm font-bold ${currentTotal === totalFingers ? 'text-green-600' : 'text-red-600'}`}>
                Current Total: {currentTotal} / {totalFingers}
              </p>
              {splitDistribution.every((h, i) => h === currentPlayer.hands[i]) && (
                <p className="text-sm text-orange-600 mt-1">
                  Distribution must be different from current
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSplit}
                disabled={
                  currentTotal !== totalFingers || 
                  splitDistribution.every((h, i) => h === currentPlayer.hands[i])
                }
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