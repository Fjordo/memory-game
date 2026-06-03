import { type FC, useState, useEffect, useRef } from "react";

// --- Types ---

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

export type Difficulty = "4x4" | "6x6" | "8x8" | "10x10";
export type Category = "tutti" | "frutta" | "verdura" | "animali" | "fattoria" | "natura";

// --- Symbols ---

export const CATEGORY_SYMBOLS: Record<Exclude<Category, "tutti">, string[]> = {
    frutta:   ["🍎","🍌","🍒","🍇","🍉","🍓","🍍","🥝","🍑","🥥"],
    verdura:  ["🍆","🥕","🌽","🍅","🥔","🧄","🥦","🥬","🌶️","🍄"],
    animali:  ["🐶","🐱","🐭","🐰","🦊","🐻","🐼","🐨","🐯","🦁"],
    fattoria: ["🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🦆","🦉"],
    natura:   ["⭐","🌙","🌈","☀️","⚡","🔥","💧","🍁","❄️","🌹"],
};

const ALL_SYMBOLS = Object.values(CATEGORY_SYMBOLS).flat();

// --- Difficulty config ---

export const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number; cols: number; colsClass: string; maxWidthClass: string }> = {
    "4x4":   { pairs: 8,  cols: 4,  colsClass: "grid-cols-4",  maxWidthClass: "max-w-[340px]" },
    "6x6":   { pairs: 18, cols: 6,  colsClass: "grid-cols-6",  maxWidthClass: "max-w-[500px]" },
    "8x8":   { pairs: 32, cols: 8,  colsClass: "grid-cols-8",  maxWidthClass: "max-w-[660px]" },
    "10x10": { pairs: 50, cols: 10, colsClass: "grid-cols-10", maxWidthClass: "max-w-[860px]" },
};

// --- Category labels ---

const CATEGORY_LABELS: Record<Category, string> = {
    tutti:    "🌍 Tutti",
    frutta:   "🍎 Frutta",
    verdura:  "🥕 Verdura",
    animali:  "🐶 Animali",
    fattoria: "🐮 Fattoria",
    natura:   "⭐ Natura",
};

// --- Pure helpers ---

export const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const getSymbols = (category: Category): string[] =>
    category === "tutti" ? ALL_SYMBOLS : CATEGORY_SYMBOLS[category];

export const isCategoryCompatible = (category: Category, difficulty: Difficulty): boolean =>
    getSymbols(category).length >= DIFFICULTY_CONFIG[difficulty].pairs;

export const createCards = (difficulty: Difficulty, category: Category): Card[] => {
    const { pairs } = DIFFICULTY_CONFIG[difficulty];
    const pool = shuffleArray(getSymbols(category)).slice(0, pairs);
    return shuffleArray([...pool, ...pool]).map((val, idx) => ({
        id: idx,
        value: val,
        flipped: false,
        matched: false,
    }));
};

export const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// --- localStorage ---

const bestKey = (d: Difficulty, c: Category) => `memory-best:${d}:${c}`;

export const loadBestScore = (d: Difficulty, c: Category): BestScore | null => {
    try {
        const raw = localStorage.getItem(bestKey(d, c));
        return raw ? (JSON.parse(raw) as BestScore) : null;
    } catch {
        return null;
    }
};

const saveBestScore = (d: Difficulty, c: Category, score: BestScore): void => {
    try {
        localStorage.setItem(bestKey(d, c), JSON.stringify(score));
    } catch { /* localStorage non disponibile */ }
};

// --- Component ---

const DEFAULT_DIFFICULTY: Difficulty = "10x10";
const DEFAULT_CATEGORY: Category = "tutti";

const Memory10x10: FC = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
    const [category, setCategory]     = useState<Category>(DEFAULT_CATEGORY);
    const [cards, setCards]           = useState<Card[]>(() => createCards(DEFAULT_DIFFICULTY, DEFAULT_CATEGORY));
    const [flipped, setFlipped]       = useState<number[]>([]);
    const [matchedCount, setMatchedCount] = useState(0);
    const [locked, setLocked]         = useState(false);
    const [moves, setMoves]           = useState(0);
    const [elapsed, setElapsed]       = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [bestScore, setBestScore]   = useState<BestScore | null>(() => loadBestScore(DEFAULT_DIFFICULTY, DEFAULT_CATEGORY));
    const [newBest, setNewBest]       = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalPairs = cards.length / 2;
    const hasWon = cards.length > 0 && matchedCount === totalPairs;

    useEffect(() => {
        if (!gameStarted || hasWon) return;
        timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameStarted, hasWon]);

    const startNewGame = (d: Difficulty, c: Category) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setCards(createCards(d, c));
        setFlipped([]);
        setMatchedCount(0);
        setLocked(false);
        setMoves(0);
        setElapsed(0);
        setGameStarted(false);
        setNewBest(false);
        setBestScore(loadBestScore(d, c));
    };

    const handleDifficulty = (d: Difficulty) => {
        const newCat = isCategoryCompatible(category, d) ? category : "tutti";
        setDifficulty(d);
        setCategory(newCat);
        startNewGame(d, newCat);
    };

    const handleCategory = (c: Category) => {
        setCategory(c);
        startNewGame(difficulty, c);
    };

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
                    const best = loadBestScore(difficulty, category);
                    const isBetter = !best || newMoves < best.moves ||
                        (newMoves === best.moves && elapsed < best.time);
                    if (isBetter) {
                        saveBestScore(difficulty, category, score);
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

    const { colsClass, maxWidthClass } = DIFFICULTY_CONFIG[difficulty];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 px-4 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">🧠 Memory Game</h1>

            {/* Controls */}
            <div className="flex flex-wrap gap-6 mb-5 justify-center">
                {/* Difficulty */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Difficoltà</span>
                    <div className="flex gap-1">
                        {(["4x4", "6x6", "8x8", "10x10"] as Difficulty[]).map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => handleDifficulty(d)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition
                                    ${difficulty === d
                                        ? "bg-indigo-500 text-white"
                                        : "bg-white text-gray-700 border border-gray-200 hover:bg-indigo-100"}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</span>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => {
                            const disabled = !isCategoryCompatible(c, difficulty);
                            return (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => !disabled && handleCategory(c)}
                                    disabled={disabled}
                                    title={disabled ? "Simboli insufficienti per questa difficoltà" : undefined}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition
                                        ${category === c
                                            ? "bg-indigo-500 text-white"
                                            : disabled
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                                : "bg-white text-gray-700 border border-gray-200 hover:bg-indigo-100"}`}
                                >
                                    {CATEGORY_LABELS[c]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Stats */}
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

            {/* Grid */}
            <div className={`grid gap-1 sm:gap-2 p-2 sm:p-4 bg-white rounded-2xl shadow-md w-full mx-auto ${colsClass} ${maxWidthClass}`}>
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

            {/* Win */}
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
                onClick={() => startNewGame(difficulty, category)}
                className="mt-4 sm:mt-6 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm sm:text-base"
            >
                🔁 Ricomincia
            </button>
        </div>
    );
};

export default Memory10x10;
