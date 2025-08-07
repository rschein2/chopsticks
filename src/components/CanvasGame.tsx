import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';

interface HandRect {
  x: number;
  y: number;
  width: number;
  height: number;
  player: 1 | 2;
  handIndex: number;
  fingers: number;
}

interface TapAnimation {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
}

interface Firework {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export const CanvasGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, selectHand, tap, split, reset, setupGame } = useGameLogic();
  const [hands, setHands] = useState<HandRect[]>([]);
  const [hoveredHand, setHoveredHand] = useState<HandRect | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [handStyle, setHandStyle] = useState<'default' | 'claw'>('default');
  const [tapAnimation, setTapAnimation] = useState<TapAnimation | null>(null);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const animationRef = useRef<number>(0);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const firstMoveRef = useRef(false);
  
  const HAND_WIDTH = 120;
  const HAND_HEIGHT = 60;
  const HAND_GAP = 15;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;

  // Preload images
  useEffect(() => {
    const styles = ['default', 'claw'];
    const numbers = [0, 1, 2, 3, 4];
    
    styles.forEach(style => {
      numbers.forEach(num => {
        const img = new Image();
        img.src = `/hands/${style}/${num}.png`;
        img.onerror = () => {
          imagesRef.current.delete(`${style}-${num}`);
        };
        img.onload = () => {
          imagesRef.current.set(`${style}-${num}`, img);
        };
      });
    });
  }, []);

  // Initialize game
  useEffect(() => {
    if (!gameStarted) {
      setupGame({
        player1Hands: 2,
        player2Hands: 2,
        skinTheme: 'default'
      });
    }
  }, [gameStarted, setupGame]);

  // Track first move
  useEffect(() => {
    if (gameState.selectedHandIndex !== null && !firstMoveRef.current) {
      firstMoveRef.current = true;
      setGameStarted(true);
    }
  }, [gameState.selectedHandIndex]);

  // Create fireworks on win
  useEffect(() => {
    if (gameState.winner && fireworks.length === 0) {
      const newFireworks: Firework[] = [];
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      for (let i = 0; i < 30; i++) {
        newFireworks.push({
          x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 100,
          y: CANVAS_HEIGHT / 2,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * -8 - 2,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      setFireworks(newFireworks);
    }
  }, [gameState.winner, fireworks.length]);

  // Calculate hand positions
  useEffect(() => {
    const newHands: HandRect[] = [];
    
    // Player 1 (left side)
    const p1StartY = (CANVAS_HEIGHT - (gameState.player1.numberOfHands * (HAND_HEIGHT + HAND_GAP))) / 2;
    for (let i = 0; i < gameState.player1.numberOfHands; i++) {
      newHands.push({
        x: 80,
        y: p1StartY + i * (HAND_HEIGHT + HAND_GAP),
        width: HAND_WIDTH,
        height: HAND_HEIGHT,
        player: 1,
        handIndex: i,
        fingers: gameState.player1.hands[i]
      });
    }
    
    // Player 2 (right side)
    const p2StartY = (CANVAS_HEIGHT - (gameState.player2.numberOfHands * (HAND_HEIGHT + HAND_GAP))) / 2;
    for (let i = 0; i < gameState.player2.numberOfHands; i++) {
      newHands.push({
        x: CANVAS_WIDTH - 80 - HAND_WIDTH,
        y: p2StartY + i * (HAND_HEIGHT + HAND_GAP),
        width: HAND_WIDTH,
        height: HAND_HEIGHT,
        player: 2,
        handIndex: i,
        fingers: gameState.player2.hands[i]
      });
    }
    
    setHands(newHands);
  }, [gameState]);

  // Adjust hands count
  const adjustHands = (player: 1 | 2, delta: number) => {
    if (gameStarted) return;
    
    const currentHands = player === 1 ? gameState.player1.numberOfHands : gameState.player2.numberOfHands;
    const newCount = Math.max(1, Math.min(5, currentHands + delta));
    
    setupGame({
      player1Hands: player === 1 ? newCount : gameState.player1.numberOfHands,
      player2Hands: player === 2 ? newCount : gameState.player2.numberOfHands,
      skinTheme: handStyle === 'claw' ? 'claw' : 'default'
    });
  };

  // Smart split function
  const smartSplit = () => {
    const player = gameState.currentTurn === 1 ? gameState.player1 : gameState.player2;
    const total = player.hands.reduce((sum, h) => sum + h, 0);
    
    if (total <= 1) return;
    
    const newDist = [...player.hands];
    
    // Find hands with 0 fingers and hands with multiple fingers
    for (let i = 0; i < newDist.length; i++) {
      if (newDist[i] === 0) {
        // Find a hand with more than 1 finger to split from
        for (let j = 0; j < newDist.length; j++) {
          if (newDist[j] > 1) {
            const transfer = Math.floor(newDist[j] / 2);
            newDist[i] = transfer;
            newDist[j] = newDist[j] - transfer;
            split(newDist);
            return;
          }
        }
      }
    }
    
    // If no zeros, just redistribute evenly
    const avg = Math.floor(total / player.numberOfHands);
    const remainder = total % player.numberOfHands;
    for (let i = 0; i < newDist.length; i++) {
      newDist[i] = avg + (i < remainder ? 1 : 0);
    }
    
    // Only split if it's different from current
    if (!newDist.every((h, i) => h === player.hands[i])) {
      split(newDist);
    }
  };

  // Draw function
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#dbeafe');
    gradient.addColorStop(1, '#fce7f3');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw title
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText('Chopsticks', CANVAS_WIDTH / 2, 40);
    
    // Draw turn indicator or winner
    ctx.font = '20px Arial';
    if (gameState.winner) {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(`Player ${gameState.winner} Wins! 🎉`, CANVAS_WIDTH / 2, 75);
    } else {
      ctx.fillStyle = gameState.currentTurn === 1 ? '#3b82f6' : '#ef4444';
      ctx.fillText(`Player ${gameState.currentTurn}'s Turn`, CANVAS_WIDTH / 2, 70);
    }
    
    // Draw VS in the middle
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('VS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    // Draw fireworks
    fireworks.forEach(fw => {
      ctx.fillStyle = fw.color;
      ctx.globalAlpha = fw.life;
      ctx.beginPath();
      ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    
    // Draw tap animation (fireball)
    if (tapAnimation) {
      const x = tapAnimation.fromX + (tapAnimation.toX - tapAnimation.fromX) * tapAnimation.progress;
      const y = tapAnimation.fromY + (tapAnimation.toY - tapAnimation.fromY) * tapAnimation.progress;
      
      // Draw fireball
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
      gradient.addColorStop(0, '#ffff00');
      gradient.addColorStop(0.5, '#ff8800');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw hands
    hands.forEach(hand => {
      const isSelected = 
        hand.player === gameState.currentTurn && 
        hand.handIndex === gameState.selectedHandIndex;
      const isHovered = hoveredHand?.player === hand.player && 
                       hoveredHand?.handIndex === hand.handIndex;
      const isDisabled = hand.fingers === 0;
      
      // Draw selection/hover effect
      if (isSelected) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.strokeRect(hand.x - 3, hand.y - 3, hand.width + 6, hand.height + 6);
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 15;
        ctx.strokeRect(hand.x - 1, hand.y - 1, hand.width + 2, hand.height + 2);
        ctx.shadowBlur = 0;
      } else if (isHovered && !isDisabled) {
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.strokeRect(hand.x - 1, hand.y - 1, hand.width + 2, hand.height + 2);
      }
      
      // Try to draw image
      const imageKey = `${handStyle}-${hand.fingers}`;
      const img = imagesRef.current.get(imageKey);
      
      ctx.save();
      
      // Flip images for player 2 (right side)
      if (hand.player === 2) {
        ctx.translate(hand.x + hand.width, hand.y);
        ctx.scale(-1, 1);
        ctx.translate(-hand.x, -hand.y);
      }
      
      if (img) {
        // Draw image maintaining aspect ratio
        if (isDisabled) {
          ctx.globalAlpha = 0.5;
        }
        
        // Calculate aspect ratio
        const imgAspect = img.width / img.height;
        const boxAspect = hand.width / hand.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > boxAspect) {
          // Image is wider, fit to width
          drawWidth = hand.width;
          drawHeight = hand.width / imgAspect;
          drawX = hand.x;
          drawY = hand.y + (hand.height - drawHeight) / 2;
        } else {
          // Image is taller, fit to height
          drawHeight = hand.height;
          drawWidth = hand.height * imgAspect;
          drawX = hand.x + (hand.width - drawWidth) / 2;
          drawY = hand.y;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.globalAlpha = 1;
      } else if (hand.fingers === 0) {
        // Draw X for knocked out hand
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(hand.x + 15, hand.y + 10);
        ctx.lineTo(hand.x + hand.width - 15, hand.y + hand.height - 10);
        ctx.moveTo(hand.x + hand.width - 15, hand.y + 10);
        ctx.lineTo(hand.x + 15, hand.y + hand.height - 10);
        ctx.stroke();
      } else {
        // Fallback to number
        ctx.fillStyle = isDisabled ? '#d1d5db' : '#ffffff';
        ctx.fillRect(hand.x, hand.y, hand.width, hand.height);
        ctx.strokeStyle = isDisabled ? '#9ca3af' : '#6b7280';
        ctx.lineWidth = 2;
        ctx.strokeRect(hand.x, hand.y, hand.width, hand.height);
        
        ctx.font = 'bold 42px Arial';
        ctx.fillStyle = isDisabled ? '#9ca3af' : '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          hand.fingers.toString(),
          hand.x + hand.width / 2,
          hand.y + hand.height / 2
        );
      }
      
      ctx.restore();
    });
    
    // Draw player labels and controls
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    
    // Player 1
    ctx.fillText('Player 1', 80 + HAND_WIDTH / 2, 100);
    if (!gameStarted) {
      // Draw +/- buttons for Player 1
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(50, 110, 25, 25);
      ctx.fillRect(85 + HAND_WIDTH, 110, 25, 25);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('-', 62, 127);
      ctx.fillText('+', 97 + HAND_WIDTH, 127);
    }
    
    // Player 2
    ctx.fillText('Player 2', CANVAS_WIDTH - 80 - HAND_WIDTH / 2, 100);
    if (!gameStarted) {
      // Draw +/- buttons for Player 2
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(CANVAS_WIDTH - 110 - HAND_WIDTH, 110, 25, 25);
      ctx.fillRect(CANVAS_WIDTH - 75, 110, 25, 25);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('-', CANVAS_WIDTH - 98 - HAND_WIDTH, 127);
      ctx.fillText('+', CANVAS_WIDTH - 63, 127);
    }
    
    // Draw hand style selector if game hasn't started
    if (!gameStarted) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '14px Arial';
      ctx.fillText('Style:', CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT - 25);
      
      // Draw style buttons
      const styles = ['default', 'claw'];
      styles.forEach((style, index) => {
        const x = CANVAS_WIDTH / 2 - 10 + index * 65;
        const y = CANVAS_HEIGHT - 40;
        
        if (style === handStyle) {
          ctx.fillStyle = '#3b82f6';
        } else {
          ctx.fillStyle = '#e5e7eb';
        }
        ctx.fillRect(x, y, 60, 25);
        
        ctx.fillStyle = style === handStyle ? '#ffffff' : '#1e293b';
        ctx.font = '12px Arial';
        ctx.fillText(style.charAt(0).toUpperCase() + style.slice(1), x + 30, y + 16);
      });
    }
  }, [gameState, hands, hoveredHand, tapAnimation, fireworks, gameStarted, handStyle]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      draw(ctx);
      
      // Update tap animation
      if (tapAnimation) {
        setTapAnimation(prev => {
          if (!prev) return null;
          const newProgress = prev.progress + 0.1;
          if (newProgress >= 1) {
            return null;
          }
          return { ...prev, progress: newProgress };
        });
      }
      
      // Update fireworks
      setFireworks(prev => prev.map(fw => ({
        ...fw,
        x: fw.x + fw.vx,
        y: fw.y + fw.vy,
        vy: fw.vy + 0.2,
        life: fw.life - 0.02
      })).filter(fw => fw.life > 0));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw, tapAnimation]);

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const hand = hands.find(h => 
      x >= h.x && x <= h.x + h.width &&
      y >= h.y && y <= h.y + h.height
    );
    
    setHoveredHand(hand || null);
    canvas.style.cursor = hand && hand.fingers > 0 ? 'pointer' : 'default';
  };

  // Handle click
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState.winner) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on setup controls
    if (!gameStarted) {
      // Player 1 controls
      if (y >= 110 && y <= 135) {
        if (x >= 50 && x <= 75) {
          adjustHands(1, -1);
          return;
        }
        if (x >= 85 + HAND_WIDTH && x <= 110 + HAND_WIDTH) {
          adjustHands(1, 1);
          return;
        }
      }
      
      // Player 2 controls
      if (y >= 110 && y <= 135) {
        if (x >= CANVAS_WIDTH - 110 - HAND_WIDTH && x <= CANVAS_WIDTH - 85 - HAND_WIDTH) {
          adjustHands(2, -1);
          return;
        }
        if (x >= CANVAS_WIDTH - 75 && x <= CANVAS_WIDTH - 50) {
          adjustHands(2, 1);
          return;
        }
      }
      
      // Style selector
      if (y >= CANVAS_HEIGHT - 40 && y <= CANVAS_HEIGHT - 15) {
        if (x >= CANVAS_WIDTH / 2 - 10 && x <= CANVAS_WIDTH / 2 + 50) {
          setHandStyle('default');
          setupGame({
            player1Hands: gameState.player1.numberOfHands,
            player2Hands: gameState.player2.numberOfHands,
            skinTheme: 'default'
          });
          return;
        }
        if (x >= CANVAS_WIDTH / 2 + 55 && x <= CANVAS_WIDTH / 2 + 115) {
          setHandStyle('claw');
          setupGame({
            player1Hands: gameState.player1.numberOfHands,
            player2Hands: gameState.player2.numberOfHands,
            skinTheme: 'claw'
          });
          return;
        }
      }
    }
    
    // Handle game clicks
    const clickedHand = hands.find(h => 
      x >= h.x && x <= h.x + h.width &&
      y >= h.y && y <= h.y + h.height &&
      h.fingers > 0
    );
    
    if (!clickedHand) return;
    
    if (clickedHand.player === gameState.currentTurn) {
      selectHand(clickedHand.handIndex);
    } else if (gameState.selectedHandIndex !== null) {
      // Start tap animation
      const fromHand = hands.find(h => 
        h.player === gameState.currentTurn && 
        h.handIndex === gameState.selectedHandIndex
      );
      if (fromHand) {
        setTapAnimation({
          fromX: fromHand.x + fromHand.width / 2,
          fromY: fromHand.y + fromHand.height / 2,
          toX: clickedHand.x + clickedHand.width / 2,
          toY: clickedHand.y + clickedHand.height / 2,
          progress: 0
        });
      }
      tap(clickedHand.player, clickedHand.handIndex);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-gray-300 rounded-lg shadow-xl bg-white"
        style={{ maxWidth: '100%', height: 'auto' }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      
      <div className="mt-3 flex gap-4">
        <button
          onClick={() => {
            reset();
            setGameStarted(false);
            firstMoveRef.current = false;
            setFireworks([]);
          }}
          className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          New Game
        </button>
        
        {gameState.currentTurn && !gameState.winner && gameStarted && (
          <button
            onClick={smartSplit}
            className="px-5 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
          >
            Smart Split
          </button>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-600 text-center max-w-md">
        {!gameStarted ? 
          "Adjust hands with +/- and choose style. Game starts on first move!" :
          "Click your hand, then opponent's hand to attack. Smart Split redistributes wisely."
        }
      </div>
    </div>
  );
};