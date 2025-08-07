import { useReducer, useCallback } from 'react';
import type { GameState, Action, Player, GameConfig } from '../types/game';

function createInitialPlayer(id: 1 | 2, numberOfHands: number): Player {
  return {
    id,
    hands: Array(numberOfHands).fill(1),  // Start with 1 finger on each hand
    numberOfHands
  };
}

const initialState: GameState = {
  player1: createInitialPlayer(1, 2),
  player2: createInitialPlayer(2, 2),
  currentTurn: 1,
  selectedHandIndex: null,
  winner: null,
};

function checkWinner(state: GameState): 1 | 2 | null {
  // Player loses if all their hands are at 0
  if (state.player1.hands.every(h => h === 0)) {
    return 2;
  }
  if (state.player2.hands.every(h => h === 0)) {
    return 1;
  }
  return null;
}

function applyFingers(current: number, added: number): number {
  const total = current + added;
  if (total === 5) return 0;
  if (total > 5) return total % 5;
  return total;
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_HAND': {
      if (state.winner) return state;
      const currentPlayer = state.currentTurn === 1 ? state.player1 : state.player2;
      
      // Can't select a dead hand (0 fingers)
      if (currentPlayer.hands[action.handIndex] === 0) return state;
      
      return { ...state, selectedHandIndex: action.handIndex };
    }

    case 'TAP': {
      if (state.winner || state.selectedHandIndex === null) return state;
      
      const currentPlayer = state.currentTurn === 1 ? state.player1 : state.player2;
      const targetPlayer = action.targetPlayer === 1 ? state.player1 : state.player2;
      
      // Can't tap your own hands
      if (action.targetPlayer === state.currentTurn) return state;
      
      const attackingFingers = currentPlayer.hands[state.selectedHandIndex];
      if (attackingFingers === 0) return state;
      
      const targetFingers = targetPlayer.hands[action.targetHandIndex];
      if (targetFingers === 0) return state;
      
      const newFingers = applyFingers(targetFingers, attackingFingers);
      
      const updatedHands = [...targetPlayer.hands];
      updatedHands[action.targetHandIndex] = newFingers;
      
      const updatedTargetPlayer: Player = {
        ...targetPlayer,
        hands: updatedHands,
      };
      
      const newState = {
        ...state,
        [action.targetPlayer === 1 ? 'player1' : 'player2']: updatedTargetPlayer,
        currentTurn: state.currentTurn === 1 ? 2 : 1,
        selectedHandIndex: null,
      } as GameState;
      
      newState.winner = checkWinner(newState);
      return newState;
    }

    case 'SPLIT': {
      if (state.winner) return state;
      
      const currentPlayer = state.currentTurn === 1 ? state.player1 : state.player2;
      const totalFingers = currentPlayer.hands.reduce((sum, h) => sum + h, 0);
      
      // Validate the new distribution
      const newTotal = action.distribution.reduce((sum, h) => sum + h, 0);
      if (newTotal !== totalFingers) return state;
      if (action.distribution.length !== currentPlayer.numberOfHands) return state;
      if (action.distribution.some(h => h < 0 || h > 4)) return state;
      
      // Can't split to the same configuration
      const isSame = action.distribution.every((h, i) => h === currentPlayer.hands[i]);
      if (isSame) return state;
      
      const updatedPlayer: Player = {
        ...currentPlayer,
        hands: action.distribution,
      };
      
      return {
        ...state,
        [state.currentTurn === 1 ? 'player1' : 'player2']: updatedPlayer,
        currentTurn: state.currentTurn === 1 ? 2 : 1,
        selectedHandIndex: null,
      } as GameState;
    }

    case 'RESET':
      return initialState;

    case 'SETUP_GAME': {
      return {
        player1: createInitialPlayer(1, action.config.player1Hands),
        player2: createInitialPlayer(2, action.config.player2Hands),
        currentTurn: 1,
        selectedHandIndex: null,
        winner: null,
      };
    }

    default:
      return state;
  }
}

export function useGameLogic() {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  const selectHand = useCallback((handIndex: number) => {
    dispatch({ type: 'SELECT_HAND', handIndex });
  }, []);

  const tap = useCallback((targetPlayer: 1 | 2, targetHandIndex: number) => {
    dispatch({ type: 'TAP', targetPlayer, targetHandIndex });
  }, []);

  const split = useCallback((distribution: number[]) => {
    dispatch({ type: 'SPLIT', distribution });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setupGame = useCallback((config: GameConfig) => {
    dispatch({ type: 'SETUP_GAME', config });
  }, []);

  return {
    gameState,
    selectHand,
    tap,
    split,
    reset,
    setupGame,
  };
}