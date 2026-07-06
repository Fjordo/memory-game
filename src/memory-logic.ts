export interface Card {
    id: number;
    value: string;
    flipped: boolean;
    matched: boolean;
}

export interface BestScore {
    moves: number;
    time: number;
}

export type Difficulty = "4x4" | "6x6" | "8x8" | "10x10";
export type Category = "tutti" | "frutta" | "verdura" | "animali" | "fattoria" | "natura";

export const CATEGORY_SYMBOLS: Record<Exclude<Category, "tutti">, string[]> = {
    frutta:   ["🍎","🍌","🍒","🍇","🍉","🍓","🍍","🥝","🍑","🥥"],
    verdura:  ["🍆","🥕","🌽","🍅","🥔","🧄","🥦","🥬","🌶️","🍄"],
    animali:  ["🐶","🐱","🐭","🐰","🦊","🐻","🐼","🐨","🐯","🦁"],
    fattoria: ["🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🦆","🦉"],
    natura:   ["⭐","🌙","🌈","☀️","⚡","🔥","💧","🍁","❄️","🌹"],
};

const ALL_SYMBOLS = Object.values(CATEGORY_SYMBOLS).flat();

export const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number; cols: number; colsClass: string; maxWidthClass: string }> = {
    "4x4":   { pairs: 8,  cols: 4,  colsClass: "grid-cols-4",  maxWidthClass: "max-w-[340px]" },
    "6x6":   { pairs: 18, cols: 6,  colsClass: "grid-cols-6",  maxWidthClass: "max-w-[500px]" },
    "8x8":   { pairs: 32, cols: 8,  colsClass: "grid-cols-8",  maxWidthClass: "max-w-[660px]" },
    "10x10": { pairs: 50, cols: 10, colsClass: "grid-cols-10", maxWidthClass: "max-w-[860px]" },
};

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

const bestKey = (d: Difficulty, c: Category) => `memory-best:${d}:${c}`;

export const loadBestScore = (d: Difficulty, c: Category): BestScore | null => {
    try {
        const raw = localStorage.getItem(bestKey(d, c));
        return raw ? (JSON.parse(raw) as BestScore) : null;
    } catch {
        return null;
    }
};

export const saveBestScore = (d: Difficulty, c: Category, score: BestScore): void => {
    try {
        localStorage.setItem(bestKey(d, c), JSON.stringify(score));
    } catch { /* localStorage non disponibile */ }
};
