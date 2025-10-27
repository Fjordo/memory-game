import React, { useState, useEffect } from "react";
import "./App.css"; // <== aggiunto per usare le classi CSS personalizzate

interface Card {
    id: number;
    value: string;
    flipped: boolean;
    matched: boolean;
}

const symbols = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍓", "🍍", "🥝", "🍑", "🥥",
    "🍆", "🥕", "🌽", "🍅", "🥔", "🧄", "🥦", "🥬", "🌶️", "🍄",
    "🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁",
    "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦉",
    "⭐", "🌙", "🌈", "☀️", "⚡", "🔥", "💧", "🍁", "❄️", "🌹"];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const App: React.FC = () => {
    const [cards, setCards] = useState<Card[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matchedCount, setMatchedCount] = useState(0);
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        const doubled = [...symbols, ...symbols].slice(0, 100);
        const shuffled = shuffleArray(doubled).map((val, idx) => ({
            id: idx,
            value: val,
            flipped: false,
            matched: false,
        }));
        setCards(shuffled);
    }, []);

    const handleFlip = (id: number) => {
        if (locked) return;
        const newCards = [...cards];
        const card = newCards.find((c) => c.id === id);
        if (!card || card.flipped || card.matched) return;

        card.flipped = true;
        setCards(newCards);
        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setLocked(true);
            const [first, second] = newFlipped.map(
                (fid) => newCards.find((c) => c.id === fid)!
            );

            if (first.value === second.value) {
                first.matched = second.matched = true;
                setMatchedCount((c) => c + 1);
                setFlipped([]);
                setLocked(false);
            } else {
                setTimeout(() => {
                    first.flipped = false;
                    second.flipped = false;
                    setCards([...newCards]);
                    setFlipped([]);
                    setLocked(false);
                }, 800);
            }
        }
    };

    const resetGame = () => {
        const doubled = [...symbols, ...symbols].slice(0, 100);
        const shuffled = shuffleArray(doubled).map((val, idx) => ({
            id: idx,
            value: val,
            flipped: false,
            matched: false,
        }));
        setCards(shuffled);
        setMatchedCount(0);
        setFlipped([]);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">🧠 Memory Game 10x10</h1>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 sm:gap-2 p-2 sm:p-4 bg-white rounded-2xl shadow-md w-full max-w-6xl mx-auto">
                {cards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => handleFlip(card.id)}
                        disabled={card.flipped || card.matched}
                        className={`card w-full aspect-square flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold rounded-lg 
              ${card.matched ? "matched bg-green-200" : card.flipped ? "bg-indigo-200" : "bg-slate-300 hover:bg-slate-400"}`}
                    >
                        {card.flipped || card.matched ? card.value : "❔"}
                    </button>
                ))}
            </div>

            <div className="mt-4 sm:mt-6 text-gray-700 text-center text-sm sm:text-base">
                Coppie trovate: {matchedCount} / {cards.length / 2}
            </div>

            {matchedCount === cards.length / 2 && (
                <div className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold text-green-600 fade-in text-center">
                    🎉 Hai vinto! 🎉
                </div>
            )}

            <button
                onClick={resetGame}
                className="mt-4 sm:mt-6 px-3 sm:px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm sm:text-base"
            >
                🔁 Ricomincia
            </button>
        </div>
    );
};

export default App;
