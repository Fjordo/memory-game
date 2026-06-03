import { type FC, useState, useEffect } from "react";

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

const createInitialCards = (): Card[] =>
    shuffleArray([...symbols, ...symbols]).map((val, idx) => ({
        id: idx,
        value: val,
        flipped: false,
        matched: false,
    }));

const Memory10x10: FC = () => {
    const [cards, setCards] = useState<Card[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matchedCount, setMatchedCount] = useState(0);
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        setCards(createInitialCards());
    }, []);

    const handleFlip = (id: number) => {
        if (locked) return;

        const card = cards.find((c) => c.id === id);
        if (!card || card.flipped || card.matched) return;

        const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
        setCards(newCards);

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setLocked(true);
            const [firstId, secondId] = newFlipped;
            const first = newCards.find((c) => c.id === firstId)!;
            const second = newCards.find((c) => c.id === secondId)!;

            if (first.value === second.value) {
                setCards(newCards.map((c) =>
                    c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
                ));
                setMatchedCount((count) => count + 1);
                setFlipped([]);
                setLocked(false);
            } else {
                setTimeout(() => {
                    setCards((prev) => prev.map((c) =>
                        c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
                    ));
                    setFlipped([]);
                    setLocked(false);
                }, 800);
            }
        }
    };

    const resetGame = () => {
        setCards(createInitialCards());
        setMatchedCount(0);
        setFlipped([]);
        setLocked(false);
    };

    const totalPairs = cards.length / 2;
    const hasWon = cards.length > 0 && matchedCount === totalPairs;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">🧠 Memory Game 10x10</h1>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 sm:gap-2 p-2 sm:p-4 bg-white rounded-2xl shadow-md w-full max-w-6xl mx-auto">
                {cards.map((card) => (
                    <button
                        key={card.id}
                        type="button"
                        onClick={() => handleFlip(card.id)}
                        disabled={card.flipped || card.matched}
                        aria-label={card.flipped || card.matched ? card.value : "Carta coperta"}
                        className={`w-full aspect-square flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold rounded-lg
              ${card.matched ? "bg-green-200" : card.flipped ? "bg-indigo-200" : "bg-slate-300 hover:bg-slate-400"}`}
                    >
                        {card.flipped || card.matched ? card.value : "❔"}
                    </button>
                ))}
            </div>

            <div className="mt-4 sm:mt-6 text-gray-700 text-center text-sm sm:text-base">
                Coppie trovate: {matchedCount} / {totalPairs}
            </div>

            {hasWon && (
                <div className="mt-3 sm:mt-4 text-xl sm:text-2xl font-semibold text-green-600 text-center">
                    🎉 Hai vinto! 🎉
                </div>
            )}

            <button
                type="button"
                onClick={resetGame}
                className="mt-4 sm:mt-6 px-3 sm:px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm sm:text-base"
            >
                🔁 Ricomincia
            </button>
        </div>
    );
};

export default Memory10x10;
