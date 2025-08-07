export interface Player {
  id: 1 | 2;
  leftHand: number;
  rightHand: number;
}

export interface GameState {
  player1: Player;
  player2: Player;
  currentTurn: 1 | 2;
  selectedHand: 'left' | 'right' | null;
  winner: 1 | 2 | null;
}

export type Action = 
  | { type: 'SELECT_HAND'; hand: 'left' | 'right' }
  | { type: 'TAP'; targetPlayer: 1 | 2; targetHand: 'left' | 'right' }
  | { type: 'SPLIT'; leftAmount: number; rightAmount: number }
  | { type: 'RESET' };