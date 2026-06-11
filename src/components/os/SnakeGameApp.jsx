import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export const SnakeGameApp = ({ theme }) => {
    const [gameState, setGameState] = useState({
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 10 },
        direction: { x: 1, y: 0 },
        score: 0,
        gameOver: false
    });
    
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    const directionRef = useRef(gameState.direction);
    directionRef.current = gameState.direction;

    // Initialize high score from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('os_snake_highscore');
        if (saved) setHighScore(parseInt(saved, 10));
    }, []);

    const generateFood = useCallback((currentSnake) => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            // Ensure food doesn't spawn on snake
            const collision = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
            if (!collision) break;
        }
        return newFood;
    }, []);

    const resetGame = () => {
        setGameState({
            snake: [{ x: 10, y: 10 }],
            direction: { x: 1, y: 0 },
            food: generateFood([{ x: 10, y: 10 }]),
            score: 0,
            gameOver: false
        });
        setIsPaused(false);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Prevent default scrolling for arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            const dir = directionRef.current;
            let newDir = null;
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (dir.y === 0) newDir = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (dir.y === 0) newDir = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (dir.x === 0) newDir = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (dir.x === 0) newDir = { x: 1, y: 0 };
                    break;
                case ' ':
                    if (gameState.gameOver) resetGame();
                    else setIsPaused(p => !p);
                    break;
                default:
                    break;
            }
            
            if (newDir) {
                setGameState(prev => ({ ...prev, direction: newDir }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    // Game Loop
    useEffect(() => {
        if (gameState.gameOver || isPaused) return;

        const moveSnake = () => {
            setGameState(prev => {
                const head = prev.snake[0];
                const newHead = {
                    x: head.x + prev.direction.x,
                    y: head.y + prev.direction.y
                };

                // Wall collision
                if (
                    newHead.x < 0 || 
                    newHead.x >= GRID_SIZE || 
                    newHead.y < 0 || 
                    newHead.y >= GRID_SIZE
                ) {
                    handleGameOver(prev.score);
                    return { ...prev, gameOver: true };
                }

                // Self collision
                if (prev.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                    handleGameOver(prev.score);
                    return { ...prev, gameOver: true };
                }

                const newSnake = [newHead, ...prev.snake];
                let newFood = prev.food;
                let newScore = prev.score;

                // Food collision
                if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
                    newScore += 10;
                    newFood = generateFood(newSnake);
                } else {
                    newSnake.pop(); // Remove tail
                }

                return {
                    ...prev,
                    snake: newSnake,
                    food: newFood,
                    score: newScore
                };
            });
        };

        const speed = Math.max(50, INITIAL_SPEED - Math.floor(gameState.score / 50) * 10);
        const gameInterval = setInterval(moveSnake, speed);
        return () => clearInterval(gameInterval);
    }, [gameState.gameOver, isPaused, generateFood, gameState.score]);

    const handleGameOver = (finalScore) => {
        if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('os_snake_highscore', finalScore.toString());
        }
    };

    // Canvas rendering has been removed in favor of CSS Grid for maximum reliability.

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-950 text-white font-mono p-4">
            
            <div className="flex items-center justify-between w-full max-w-[400px] mb-4 px-2">
                <div className="flex items-center space-x-2 text-emerald-400">
                    <Gamepad2 className="w-5 h-5" />
                    <span className="font-bold tracking-widest uppercase">Snake</span>
                </div>
                <div className="flex space-x-6 text-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-gray-500 text-xs uppercase">Score</span>
                        <span className="font-bold">{gameState.score}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-gray-500 text-xs uppercase">Best</span>
                        <span className="font-bold text-yellow-400">{highScore}</span>
                    </div>
                </div>
            </div>

            <div className="relative rounded-lg overflow-hidden border-2 border-gray-800 shadow-2xl bg-gray-900">
                <div 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                        backgroundColor: '#111827'
                    }}
                >
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isFood = gameState.food.x === x && gameState.food.y === y;
                        const snakeIndex = gameState.snake.findIndex(s => s.x === x && s.y === y);
                        const isHead = snakeIndex === 0;
                        const isBody = snakeIndex > 0;
                        
                        let bg = 'transparent';
                        if (isFood) bg = '#ef4444'; // red-500
                        else if (isHead) bg = theme === 'pink' ? '#ec4899' : '#10b981';
                        else if (isBody) bg = theme === 'pink' ? '#fbcfe8' : '#6ee7b7';

                        return (
                            <div 
                                key={i} 
                                style={{ 
                                    backgroundColor: bg,
                                    border: '1px solid #1f2937', // subtle grid
                                    boxSizing: 'border-box'
                                }}
                            />
                        );
                    })}
                </div>

                {gameState.gameOver && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                        <h2 className="text-3xl font-bold text-red-500 mb-2 tracking-widest">GAME OVER</h2>
                        <p className="text-gray-300 mb-6">Final Score: {gameState.score}</p>
                        <button 
                            onClick={resetGame}
                            className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-transform active:scale-95"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Play Again</span>
                        </button>
                    </div>
                )}

                {isPaused && !gameState.gameOver && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                        <h2 className="text-2xl font-bold tracking-widest">PAUSED</h2>
                    </div>
                )}
            </div>

            <div className="mt-6 text-gray-500 text-xs tracking-wide">
                Use <kbd className="bg-gray-800 px-1 py-0.5 rounded">W A S D</kbd> or <kbd className="bg-gray-800 px-1 py-0.5 rounded">Arrows</kbd> to move. <kbd className="bg-gray-800 px-1 py-0.5 rounded">Space</kbd> to pause.
            </div>

        </div>
    );
};
