import React from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { Player } from './Player';
import { GameControls } from './GameControls';

export const Game: React.FC = () => {
  const { gameState, selectHand, tap, split, reset } = useGameLogic();
  const { player1, player2, currentTurn, selectedHand, winner } = gameState;
  
  const handlePlayer1HandClick = (hand: 'left' | 'right') => {
    if (currentTurn === 1 && !winner) {
      selectHand(hand);
    }
  };
  
  const handlePlayer2HandClick = (hand: 'left' | 'right') => {
    if (currentTurn === 1 && selectedHand && !winner) {
      tap(2, hand);
    } else if (currentTurn === 2 && !winner) {
      selectHand(hand);
    }
  };
  
  const handlePlayer1TapClick = (hand: 'left' | 'right') => {
    if (currentTurn === 2 && selectedHand && !winner) {
      tap(1, hand);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Chopsticks Game
        </h1>
        
        <div className="mb-6">
          <div className="text-center mb-2">
            <p className="text-lg text-gray-600">
              {!winner && (
                <>
                  {currentTurn === 1 ? "Player 1's" : "Player 2's"} turn
                  {selectedHand && ` - ${selectedHand} hand selected`}
                </>
              )}
            </p>
            {!winner && !selectedHand && (
              <p className="text-sm text-gray-500">
                Select one of your hands to attack with
              </p>
            )}
            {!winner && selectedHand && (
              <p className="text-sm text-gray-500">
                Tap an opponent's hand to attack, or use the split action
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <Player
            player={player2}
            isCurrentTurn={currentTurn === 2}
            selectedHand={currentTurn === 2 ? selectedHand : null}
            onHandClick={currentTurn === 2 ? handlePlayer2HandClick : handlePlayer1TapClick}
            isOpponent={currentTurn === 1}
          />
          
          <div className="flex items-center justify-center">
            <div className="text-4xl">⚔️</div>
          </div>
          
          <Player
            player={player1}
            isCurrentTurn={currentTurn === 1}
            selectedHand={currentTurn === 1 ? selectedHand : null}
            onHandClick={currentTurn === 1 ? handlePlayer1HandClick : handlePlayer2HandClick}
            isOpponent={currentTurn === 2}
          />
        </div>
        
        <GameControls
          currentPlayer={currentTurn === 1 ? player1 : player2}
          onSplit={split}
          onReset={reset}
          winner={winner}
        />
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold mb-2 text-gray-800">How to Play:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Each player starts with 1 finger on each hand</li>
            <li>• Select your hand, then tap opponent's hand to add your fingers to theirs</li>
            <li>• Exactly 5 fingers = hand is out (becomes 0)</li>
            <li>• More than 5 wraps around (6→1, 7→2, etc.)</li>
            <li>• You can split/redistribute your own fingers instead of attacking</li>
            <li>• Win by eliminating both opponent hands!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};