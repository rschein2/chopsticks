export interface Player {
  id: 1 | 2;
  hands: number[];  // Array of finger counts (0-4 for each hand)
  numberOfHands: number;
}

export interface GameState {
  player1: Player;
  player2: Player;
  currentTurn: 1 | 2;
  selectedHandIndex: number | null;  // Index of selected hand (0 to numberOfHands-1)
  winner: 1 | 2 | null;
}

export interface GameConfig {
  player1Hands: number;  // 1-5 hands for player 1
  player2Hands: number;  // 1-5 hands for player 2
  skinTheme: 'default' | 'claw' | 'cartoon';
}

export type Action = 
  | { type: 'SELECT_HAND'; handIndex: number }
  | { type: 'TAP'; targetPlayer: 1 | 2; targetHandIndex: number }
  | { type: 'SPLIT'; distribution: number[] }  // New distribution of fingers
  | { type: 'RESET' }
  | { type: 'SETUP_GAME'; config: GameConfig };