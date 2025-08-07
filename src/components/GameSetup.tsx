import React, { useState } from 'react';
import type { GameConfig } from '../types/game';

interface GameSetupProps {
  onStartGame: (config: GameConfig) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [player1Hands, setPlayer1Hands] = useState(2);
  const [player2Hands, setPlayer2Hands] = useState(2);
  const [skinTheme, setSkinTheme] = useState<'default' | 'claw' | 'cartoon'>('default');
  const [showRules, setShowRules] = useState(false);

  const handleStart = () => {
    onStartGame({
      player1Hands,
      player2Hands,
      skinTheme,
    });
  };

  const adjustHands = (player: 1 | 2, delta: number) => {
    if (player === 1) {
      setPlayer1Hands(prev => Math.max(1, Math.min(5, prev + delta)));
    } else {
      setPlayer2Hands(prev => Math.max(1, Math.min(5, prev + delta)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-8">
      <div className="max-w-sm w-full px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Chopsticks Game
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-center text-gray-700">Game Setup</h2>
          
          {/* Player 1 Hands */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Player 1 Hands
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustHands(1, -1)}
                disabled={player1Hands <= 1}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 font-bold"
              >
                -
              </button>
              <div className="w-12 text-center font-bold text-lg">
                {player1Hands}
              </div>
              <button
                onClick={() => adjustHands(1, 1)}
                disabled={player1Hands >= 5}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 font-bold"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Player 2 Hands */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Player 2 Hands
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustHands(2, -1)}
                disabled={player2Hands <= 1}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 font-bold"
              >
                -
              </button>
              <div className="w-12 text-center font-bold text-lg">
                {player2Hands}
              </div>
              <button
                onClick={() => adjustHands(2, 1)}
                disabled={player2Hands >= 5}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 font-bold"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Theme Selection */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Hand Style
            </label>
            <select
              value={skinTheme}
              onChange={(e) => setSkinTheme(e.target.value as 'default' | 'claw' | 'cartoon')}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="default">Default</option>
              <option value="claw">Claw</option>
              <option value="cartoon">Numbers</option>
            </select>
          </div>
          
          {/* Visual Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-around items-start">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2 font-semibold">P1</p>
                <div className="flex flex-col gap-1">
                  {Array(player1Hands).fill(0).map((_, i) => (
                    <div key={i} className="w-10 h-10 bg-blue-200 rounded flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-3xl self-center">⚔️</div>
              
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2 font-semibold">P2</p>
                <div className="flex flex-col gap-1">
                  {Array(player2Hands).fill(0).map((_, i) => (
                    <div key={i} className="w-10 h-10 bg-red-200 rounded flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleStart}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors shadow-lg"
          >
            Start Game
          </button>
        </div>
        
        {/* Quick Rules */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowRules(!showRules)}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            {showRules ? 'Hide Rules' : 'How to Play?'}
          </button>
        </div>
        
        {showRules && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Tap opponent's hand to add fingers</li>
              <li>• 5 fingers = hand out</li>
              <li>• &gt;5 wraps around (6→1, 7→2)</li>
              <li>• Split to redistribute fingers</li>
              <li>• Win: eliminate all opponent hands</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};