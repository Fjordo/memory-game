import { type FC, useState, useEffect, useRef } from "react";

interface Card {
    id: number;
    value: string;
    flipped: boolean;
    matched: boolean;
}

interface BestScore {
    moves: number;
    time: number;
}

const symbols = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍓", "🍍", "🥝", "🍑", "🥥",
    "🍆", "🥕", "🌽", "🍅", "🥔", "🧄", "🥦", "🥬", "🌶️", "🍄",
    "🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁",
    "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦉",
    "⭐", "🌙", "🌈", "☀️", "⚡", "🔥", "💧", "🍁", "❄️", "🌹"];

export const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const createInitialCards = (): Card[] =>
    shuffleArray([...symbols, ...symbols]).map((val, idx) => ({
        id: idx,
        value: val,
        flipped: false,
        matched: false,
    }));

const BEST_KEY = "memory-best";

export const loadBestScore = (): BestScore | null => {
    try {
        const raw = localStorage.getItem(BEST_KEY);
        return raw ? (JSON.parse(raw) as BestScore) : null;
    } catch {
        return null;
    }
};

const saveBestScore = (score: BestScore): void => {
    try {
        localStorage.setItem(BEST_KEY, JSON.stringify(score));
    } catch { /* localStorage non disponibile */ }
};

export const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const Memory10x10: FC = () => {
    const [cards, setCards] = useState<Card[]>(createInitialCards);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matchedCount, setMatchedCount] = useState(0);
    const [locked, setLocked] = useState(false);
    const [moves, setMoves] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [bestScore, setBestScore] = useState<BestScore | null>(loadBestScore);
    const [newBest, setNewBest] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalPairs = cards.length / 2;
    const hasWon = cards.length > 0 && matchedCount === totalPairs;

    useEffect(() => {
        if (!gameStarted || hasWon) return;
        timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameStarted, hasWon]);

    const handleFlip = (id: number) => {
        if (locked) return;
        const card = cards.find((c) => c.id === id);
        if (!card || card.flipped || card.matched) return;

        if (!gameStarted) setGameStarted(true);

        const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
        setCards(newCards);

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setLocked(true);
            const newMoves = moves + 1;
            setMoves(newMoves);

            const [firstId, secondId] = newFlipped;
            const first = newCards.find((c) => c.id === firstId)!;
            const second = newCards.find((c) => c.id === secondId)!;

            if (first.value === second.value) {
                setCards(newCards.map((c) =>
                    c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
                ));
                const newMatchedCount = matchedCount + 1;
                setMatchedCount(newMatchedCount);
                setFlipped([]);
                setLocked(false);

                if (newMatchedCount === totalPairs) {
                    const score = { moves: newMoves, time: elapsed };
                    const best = loadBestScore();
                    const isBetter = !best || newMoves < best.moves ||
                        (newMoves === best.moves && elapsed < best.time);
                    if (isBetter) {
                        saveBestScore(score);
                        setBestScore(score);
                        setNewBest(true);
                    }
                }
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
        if (timerRef.current) clearInterval(timerRef.current);
        setCards(createInitialCards());
        setFlipped([]);
        setMatchedCount(0);
        setLocked(false);
        setMoves(0);
        setElapsed(0);
        setGameStarted(false);
        setNewBest(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 px-4 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">🧠 Memory Game 10×10</h1>

            <div className="flex gap-4 mb-4 text-sm text-gray-700 flex-wrap justify-center">
                <span>⏱ {formatTime(elapsed)}</span>
                <span>🔄 {moves} mosse</span>
                <span>✅ {matchedCount}/{totalPairs} coppie</span>
                {bestScore && (
                    <span className="text-indigo-600">
                        🏆 Record: {bestScore.moves} mosse / {formatTime(bestScore.time)}
                    </span>
                )}
            </div>

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

            {hasWon && (
                <div className="mt-4 text-center">
                    <div className="text-xl sm:text-2xl font-semibold text-green-600">
                        🎉 Hai vinto in {moves} mosse e {formatTime(elapsed)}!
                    </div>
                    {newBest && (
                        <div className="text-sm text-indigo-600 font-medium mt-1">🏆 Nuovo record!</div>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={resetGame}
                className="mt-4 sm:mt-6 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm sm:text-base"
            >
                🔁 Ricomincia
            </button>
        </div>
    );
};

export default Memory10x10;
