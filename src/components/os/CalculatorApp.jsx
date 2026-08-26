import React, { useState, useEffect } from 'react';
import { getAccent } from '../../utils/themeTokens.js';

export const CalculatorApp = ({ theme }) => {
    const accentTokens = getAccent(theme);
    const [currentValue, setCurrentValue] = useState('0');
    const [previousValue, setPreviousValue] = useState(null);
    const [operator, setOperator] = useState(null);
    const [isNewInput, setIsNewInput] = useState(true);

    const handleNum = (numStr) => {
        if (isNewInput) {
            setCurrentValue(numStr);
            setIsNewInput(false);
        } else {
            setCurrentValue(currentValue === '0' && numStr !== '.' ? numStr : currentValue + numStr);
        }
    };

    const handleOp = (op) => {
        if (operator && !isNewInput) {
            calculate();
        } else {
            setPreviousValue(currentValue);
        }
        setOperator(op);
        setIsNewInput(true);
    };

    const calculate = () => {
        if (!operator || !previousValue) return;
        
        const prev = parseFloat(previousValue);
        const curr = parseFloat(currentValue);
        let result = 0;
        
        switch (operator) {
            case '+': result = prev + curr; break;
            case '-': result = prev - curr; break;
            case '*': result = prev * curr; break;
            case '/': result = curr === 0 ? 'Error' : prev / curr; break;
            default: return;
        }
        
        setCurrentValue(String(result));
        setPreviousValue(null);
        setOperator(null);
        setIsNewInput(true);
    };

    const handleClear = () => {
        setCurrentValue('0');
        setPreviousValue(null);
        setOperator(null);
        setIsNewInput(true);
    };

    const handleToggleSign = () => {
        setCurrentValue(String(parseFloat(currentValue) * -1));
    };

    const handlePercent = () => {
        setCurrentValue(String(parseFloat(currentValue) / 100));
    };

    const handleKeyPress = (e) => {
        const key = e.key;
        if (/\d/.test(key)) handleNum(key);
        if (key === '.') handleNum('.');
        if (key === '+' || key === '-' || key === '*' || key === '/') handleOp(key);
        if (key === 'Enter' || key === '=') calculate();
        if (key === 'Backspace') {
            setCurrentValue(currentValue.length > 1 ? currentValue.slice(0, -1) : '0');
        }
        if (key === 'Escape') handleClear();
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    });

    const Button = ({ children, onClick, className = "", color = "default" }) => {
        const baseClass = "flex items-center justify-center text-xl font-medium rounded-full active:scale-95 transition-transform select-none cursor-pointer";
        const colorClass = {
            default: "bg-gray-700 hover:bg-gray-600 text-white",
            primary: accentTokens.btnPrimary,
            secondary: "bg-gray-300 hover:bg-gray-200 text-gray-900"
        }[color];
        
        return (
            <div onClick={onClick} className={`${baseClass} ${colorClass} ${className}`}>
                {children}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-900 p-4">
            {/* Display Area */}
            <div className="flex-1 flex items-end justify-end pb-4 pr-2">
                <span className="text-white text-6xl font-light tracking-tight truncate max-w-full">
                    {currentValue}
                </span>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-3 grid-rows-5 h-2/3 max-h-[400px]">
                <Button onClick={handleClear} color="secondary">{currentValue === '0' ? 'AC' : 'C'}</Button>
                <Button onClick={handleToggleSign} color="secondary">+/-</Button>
                <Button onClick={handlePercent} color="secondary">%</Button>
                <Button onClick={() => handleOp('/')} color="primary">÷</Button>

                <Button onClick={() => handleNum('7')}>7</Button>
                <Button onClick={() => handleNum('8')}>8</Button>
                <Button onClick={() => handleNum('9')}>9</Button>
                <Button onClick={() => handleOp('*')} color="primary">×</Button>

                <Button onClick={() => handleNum('4')}>4</Button>
                <Button onClick={() => handleNum('5')}>5</Button>
                <Button onClick={() => handleNum('6')}>6</Button>
                <Button onClick={() => handleOp('-')} color="primary">-</Button>

                <Button onClick={() => handleNum('1')}>1</Button>
                <Button onClick={() => handleNum('2')}>2</Button>
                <Button onClick={() => handleNum('3')}>3</Button>
                <Button onClick={() => handleOp('+')} color="primary">+</Button>

                <Button onClick={() => handleNum('0')} className="col-span-2 justify-start pl-8">0</Button>
                <Button onClick={() => handleNum('.')}>.</Button>
                <Button onClick={calculate} color="primary">=</Button>
            </div>
        </div>
    );
};
