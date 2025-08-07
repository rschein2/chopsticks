import React, { useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { Player } from './Player';
import { GameControls } from './GameControls';
import { GameSetup } from './GameSetup';
import type { GameConfig } from '../types/game';

export const Game: React.FC = () => {
  const { gameState, selectHand, tap, split, reset, setupGame } = useGameLogic();
  const { player1, player2, currentTurn, selectedHandIndex, winner } = gameState;
  const [showSetup, setShowSetup] = useState(true);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  
  const handleStartGame = (config: GameConfig) => {
    setupGame(config);
    setGameConfig(config);
    setShowSetup(false);
  };

  const handleReset = () => {
    setShowSetup(true);
    reset();
  };
  
  const handlePlayer1HandClick = (handIndex: number) => {
    if (currentTurn === 1 && !winner) {
      selectHand(handIndex);
    } else if (currentTurn === 2 && selectedHandIndex !== null && !winner) {
      tap(1, handIndex);
    }
  };
  
  const handlePlayer2HandClick = (handIndex: number) => {
    if (currentTurn === 2 && !winner) {
      selectHand(handIndex);
    } else if (currentTurn === 1 && selectedHandIndex !== null && !winner) {
      tap(2, handIndex);
    }
  };

  if (showSetup) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Chopsticks Game
        </h1>
        
        <div className="mb-6">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-700">
              {!winner && (
                <>
                  <span className={`px-3 py-1 rounded-full ${currentTurn === 1 ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'}`}>
                    Player {currentTurn}'s Turn
                  </span>
                  {selectedHandIndex !== null && (
                    <span className="ml-3 text-base text-gray-600">
                      Hand {selectedHandIndex + 1} selected
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex gap-8 items-start justify-center">
          <Player
            player={player1}
            isCurrentTurn={currentTurn === 1}
            selectedHandIndex={currentTurn === 1 ? selectedHandIndex : null}
            onHandClick={handlePlayer1HandClick}
            isOpponent={currentTurn === 2}
            skinTheme={gameConfig?.skinTheme}
          />
          
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-6xl mb-4">⚔️</div>
            <div className="text-2xl font-bold text-gray-600">VS</div>
          </div>
          
          <Player
            player={player2}
            isCurrentTurn={currentTurn === 2}
            selectedHandIndex={currentTurn === 2 ? selectedHandIndex : null}
            onHandClick={handlePlayer2HandClick}
            isOpponent={currentTurn === 1}
            skinTheme={gameConfig?.skinTheme}
          />
        </div>
        
        <GameControls
          currentPlayer={currentTurn === 1 ? player1 : player2}
          onSplit={split}
          onReset={handleReset}
          winner={winner}
        />
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow max-w-2xl mx-auto">
          <h3 className="font-bold mb-2 text-gray-800">Game Info:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Player 1:</strong> {player1.numberOfHands} hands, {player1.hands.filter(h => h > 0).length} active
            </div>
            <div>
              <strong>Player 2:</strong> {player2.numberOfHands} hands, {player2.hands.filter(h => h > 0).length} active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};