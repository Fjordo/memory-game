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

export const DIFFICULTIES = ["4x4", "6x6", "8x8", "10x10"] as const;
export type Difficulty = typeof DIFFICULTIES[number];

export const CATEGORIES = ["tutti", "frutta", "verdura", "animali", "fattoria", "natura"] as const;
export type Category = typeof CATEGORIES[number];

export const CATEGORY_SYMBOLS: Record<Exclude<Category, "tutti">, string[]> = {
    frutta:   ["🍎","🍌","🍒","🍇","🍉","🍓","🍍","🥝","🍑","🥥"],
    verdura:  ["🍆","🥕","🌽","🍅","🥔","🧄","🥦","🥬","🌶️","🍄"],
    animali:  ["🐶","🐱","🐭","🐰","🦊","🐻","🐼","🐨","🐯","🦁"],
    fattoria: ["🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🦆","🦉"],
    natura:   ["⭐","🌙","🌈","☀️","⚡","🔥","💧","🍁","❄️","🌹"],
};

export const ALL_SYMBOLS = Object.values(CATEGORY_SYMBOLS).flat();

interface DifficultyConfig {
    pairs: number;
    cols: number;
    maxWidthClass: string;
}

export const DIFFICULTY_CONFIG = {
    "4x4":   { pairs: 8,  cols: 4,  maxWidthClass: "max-w-[340px]" },
    "6x6":   { pairs: 18, cols: 6,  maxWidthClass: "max-w-[500px]" },
    "8x8":   { pairs: 32, cols: 8,  maxWidthClass: "max-w-[660px]" },
    "10x10": { pairs: 50, cols: 10, maxWidthClass: "max-w-[860px]" },
} satisfies Record<Difficulty, DifficultyConfig>;

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

const isNonNegativeInteger = (value: unknown): value is number =>
    Number.isInteger(value) && Number(value) >= 0;

export const isBestScore = (value: unknown): value is BestScore => {
    if (!value || typeof value !== "object") return false;
    const score = value as Partial<BestScore>;
    return isNonNegativeInteger(score.moves) && isNonNegativeInteger(score.time);
};

const bestKey = (d: Difficulty, c: Category) => `memory-best:${d}:${c}`;

export const loadBestScore = (d: Difficulty, c: Category): BestScore | null => {
    try {
        const raw = localStorage.getItem(bestKey(d, c));
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isBestScore(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

export const saveBestScore = (d: Difficulty, c: Category, score: BestScore): void => {
    try {
        localStorage.setItem(bestKey(d, c), JSON.stringify(score));
    } catch { /* localStorage non disponibile */ }
};
