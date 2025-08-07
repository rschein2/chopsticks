import { useReducer } from 'react';
import { GameState, Action, Player } from '../types/game';

const initialState: GameState = {
  player1: { id: 1, leftHand: 1, rightHand: 1 },
  player2: { id: 2, leftHand: 1, rightHand: 1 },
  currentTurn: 1,
  selectedHand: null,
  winner: null,
};

function checkWinner(state: GameState): 1 | 2 | null {
  if (state.player1.leftHand === 0 && state.player1.rightHand === 0) {
    return 2;
  }
  if (state.player2.leftHand === 0 && state.player2.rightHand === 0) {
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
      return { ...state, selectedHand: action.hand };
    }

    case 'TAP': {
      if (state.winner || !state.selectedHand) return state;
      
      const currentPlayer = state.currentTurn === 1 ? state.player1 : state.player2;
      const targetPlayer = action.targetPlayer === 1 ? state.player1 : state.player2;
      
      if (action.targetPlayer === state.currentTurn) return state;
      
      const attackingFingers = state.selectedHand === 'left' 
        ? currentPlayer.leftHand 
        : currentPlayer.rightHand;
      
      if (attackingFingers === 0) return state;
      
      const targetFingers = action.targetHand === 'left'
        ? targetPlayer.leftHand
        : targetPlayer.rightHand;
        
      if (targetFingers === 0) return state;
      
      const newFingers = applyFingers(targetFingers, attackingFingers);
      
      const updatedTargetPlayer: Player = {
        ...targetPlayer,
        [action.targetHand === 'left' ? 'leftHand' : 'rightHand']: newFingers,
      };
      
      const newState = {
        ...state,
        [action.targetPlayer === 1 ? 'player1' : 'player2']: updatedTargetPlayer,
        currentTurn: state.currentTurn === 1 ? 2 : 1,
        selectedHand: null,
      } as GameState;
      
      newState.winner = checkWinner(newState);
      return newState;
    }

    case 'SPLIT': {
      if (state.winner) return state;
      
      const currentPlayer = state.currentTurn === 1 ? state.player1 : state.player2;
      const total = currentPlayer.leftHand + currentPlayer.rightHand;
      
      if (action.leftAmount + action.rightAmount !== total) return state;
      if (action.leftAmount < 0 || action.rightAmount < 0) return state;
      if (action.leftAmount > 4 || action.rightAmount > 4) return state;
      
      if (action.leftAmount === currentPlayer.leftHand && 
          action.rightAmount === currentPlayer.rightHand) {
        return state;
      }
      
      const updatedPlayer: Player = {
        ...currentPlayer,
        leftHand: action.leftAmount,
        rightHand: action.rightAmount,
      };
      
      return {
        ...state,
        [state.currentTurn === 1 ? 'player1' : 'player2']: updatedPlayer,
        currentTurn: state.currentTurn === 1 ? 2 : 1,
        selectedHand: null,
      } as GameState;
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useGameLogic() {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  const selectHand = (hand: 'left' | 'right') => {
    dispatch({ type: 'SELECT_HAND', hand });
  };

  const tap = (targetPlayer: 1 | 2, targetHand: 'left' | 'right') => {
    dispatch({ type: 'TAP', targetPlayer, targetHand });
  };

  const split = (leftAmount: number, rightAmount: number) => {
    dispatch({ type: 'SPLIT', leftAmount, rightAmount });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  return {
    gameState,
    selectHand,
    tap,
    split,
    reset,
  };
}