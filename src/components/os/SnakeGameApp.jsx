import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export const SnakeGameApp = ({ theme }) => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 10 });
    const [direction, setDirection] = useState({ x: 1, y: 0 });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    const canvasRef = useRef(null);
    const directionRef = useRef(direction);
    directionRef.current = direction;

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
        setSnake([{ x: 10, y: 10 }]);
        setDirection({ x: 1, y: 0 });
        setFood(generateFood([{ x: 10, y: 10 }]));
        setScore(0);
        setGameOver(false);
        setIsPaused(false);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Prevent default scrolling for arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            const dir = directionRef.current;
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (dir.y === 0) setDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (dir.y === 0) setDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (dir.x === 0) setDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (dir.x === 0) setDirection({ x: 1, y: 0 });
                    break;
                case ' ':
                    if (gameOver) resetGame();
                    else setIsPaused(p => !p);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver]);

    // Game Loop
    useEffect(() => {
        if (gameOver || isPaused) return;

        const moveSnake = () => {
            setSnake(prevSnake => {
                const head = prevSnake[0];
                const newHead = {
                    x: head.x + directionRef.current.x,
                    y: head.y + directionRef.current.y
                };

                // Wall collision
                if (
                    newHead.x < 0 || 
                    newHead.x >= GRID_SIZE || 
                    newHead.y < 0 || 
                    newHead.y >= GRID_SIZE
                ) {
                    handleGameOver();
                    return prevSnake;
                }

                // Self collision
                if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                    handleGameOver();
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                // Food collision
                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore(s => s + 10);
                    setFood(generateFood(newSnake));
                } else {
                    newSnake.pop(); // Remove tail
                }

                return newSnake;
            });
        };

        const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
        const gameInterval = setInterval(moveSnake, speed);
        return () => clearInterval(gameInterval);
    }, [direction, food, gameOver, isPaused, score, generateFood]);

    const handleGameOver = () => {
        setGameOver(true);
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('os_snake_highscore', score.toString());
        }
    };

    // Rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#111827'; // gray-900
        ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

        // Draw grid (optional, subtle)
        ctx.strokeStyle = '#1f2937'; // gray-800
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
            ctx.stroke();
        }

        // Draw food
        ctx.fillStyle = '#ef4444'; // red-500
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ef4444';
        ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        ctx.shadowBlur = 0;

        // Draw snake
        snake.forEach((segment, index) => {
            if (index === 0) {
                ctx.fillStyle = theme === 'pink' ? '#ec4899' : '#10b981'; // emerald-500
            } else {
                ctx.fillStyle = theme === 'pink' ? '#fbcfe8' : '#6ee7b7'; // emerald-300
            }
            ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        });

    }, [snake, food, theme]);

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
                        <span className="font-bold">{score}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-gray-500 text-xs uppercase">Best</span>
                        <span className="font-bold text-yellow-400">{highScore}</span>
                    </div>
                </div>
            </div>

            <div className="relative rounded-lg overflow-hidden border-2 border-gray-800 shadow-2xl bg-gray-900">
                <canvas 
                    ref={canvasRef}
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    className="block"
                />

                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                        <h2 className="text-3xl font-bold text-red-500 mb-2 tracking-widest">GAME OVER</h2>
                        <p className="text-gray-300 mb-6">Final Score: {score}</p>
                        <button 
                            onClick={resetGame}
                            className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-transform active:scale-95"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Play Again</span>
                        </button>
                    </div>
                )}

                {isPaused && !gameOver && (
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
