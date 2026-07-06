import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import {
    createCards,
    isCategoryCompatible,
    loadBestScore,
    saveBestScore,
    type BestScore,
    type Card,
    type Category,
    type Difficulty,
} from "./memory-logic";

interface MemoryGameState {
    difficulty: Difficulty;
    category: Category;
    cards: Card[];
    matchedCount: number;
    locked: boolean;
    moves: number;
    elapsed: number;
    bestScore: BestScore | null;
    newBest: boolean;
    totalPairs: number;
    hasWon: boolean;
    setDifficulty: (difficulty: Difficulty) => void;
    setCategory: (category: Category) => void;
    restart: () => void;
    flipCard: (id: number) => void;
}

const clearTimer = (timerRef: MutableRefObject<ReturnType<typeof setInterval> | null>) => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
};

const clearMismatchTimeout = (timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
};

export const useMemoryGame = (
    initialDifficulty: Difficulty,
    initialCategory: Category,
): MemoryGameState => {
    const [difficulty, setDifficultyState] = useState<Difficulty>(initialDifficulty);
    const [category, setCategoryState] = useState<Category>(initialCategory);
    const [cards, setCards] = useState<Card[]>(() => createCards(initialDifficulty, initialCategory));
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matchedCount, setMatchedCount] = useState(0);
    const [locked, setLocked] = useState(false);
    const [moves, setMoves] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [bestScore, setBestScore] = useState<BestScore | null>(() =>
        loadBestScore(initialDifficulty, initialCategory)
    );
    const [newBest, setNewBest] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mismatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const totalPairs = cards.length / 2;
    const hasWon = cards.length > 0 && matchedCount === totalPairs;

    const resetGame = useCallback((nextDifficulty: Difficulty, nextCategory: Category) => {
        clearTimer(timerRef);
        clearMismatchTimeout(mismatchTimeoutRef);
        setCards(createCards(nextDifficulty, nextCategory));
        setFlipped([]);
        setMatchedCount(0);
        setLocked(false);
        setMoves(0);
        setElapsed(0);
        setGameStarted(false);
        setNewBest(false);
        setBestScore(loadBestScore(nextDifficulty, nextCategory));
    }, []);

    useEffect(() => {
        if (!gameStarted || hasWon) {
            clearTimer(timerRef);
            return;
        }

        timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearTimer(timerRef);
    }, [gameStarted, hasWon]);

    useEffect(() => () => {
        clearTimer(timerRef);
        clearMismatchTimeout(mismatchTimeoutRef);
    }, []);

    const setDifficulty = useCallback((nextDifficulty: Difficulty) => {
        const nextCategory = isCategoryCompatible(category, nextDifficulty) ? category : "tutti";
        setDifficultyState(nextDifficulty);
        setCategoryState(nextCategory);
        resetGame(nextDifficulty, nextCategory);
    }, [category, resetGame]);

    const setCategory = useCallback((nextCategory: Category) => {
        if (!isCategoryCompatible(nextCategory, difficulty)) return;
        setCategoryState(nextCategory);
        resetGame(difficulty, nextCategory);
    }, [difficulty, resetGame]);

    const restart = useCallback(() => {
        resetGame(difficulty, category);
    }, [category, difficulty, resetGame]);

    const flipCard = useCallback((id: number) => {
        if (locked) return;
        const card = cards.find((c) => c.id === id);
        if (!card || card.flipped || card.matched) return;

        if (!gameStarted) setGameStarted(true);

        const nextCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
        setCards(nextCards);

        const nextFlipped = [...flipped, id];
        setFlipped(nextFlipped);

        if (nextFlipped.length !== 2) return;

        setLocked(true);
        const nextMoves = moves + 1;
        setMoves(nextMoves);

        const [firstId, secondId] = nextFlipped;
        const first = nextCards.find((c) => c.id === firstId);
        const second = nextCards.find((c) => c.id === secondId);
        if (!first || !second) return;

        if (first.value === second.value) {
            setCards(nextCards.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
            ));
            const nextMatchedCount = matchedCount + 1;
            setMatchedCount(nextMatchedCount);
            setFlipped([]);
            setLocked(false);

            if (nextMatchedCount === totalPairs) {
                const score = { moves: nextMoves, time: elapsed };
                const best = loadBestScore(difficulty, category);
                const isBetter = !best || nextMoves < best.moves ||
                    (nextMoves === best.moves && elapsed < best.time);
                if (isBetter) {
                    saveBestScore(difficulty, category, score);
                    setBestScore(score);
                    setNewBest(true);
                }
            }
            return;
        }

        mismatchTimeoutRef.current = setTimeout(() => {
            setCards((prev) => prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
            ));
            setFlipped([]);
            setLocked(false);
            mismatchTimeoutRef.current = null;
        }, 800);
    }, [
        cards,
        category,
        difficulty,
        elapsed,
        flipped,
        gameStarted,
        locked,
        matchedCount,
        moves,
        totalPairs,
    ]);

    return {
        difficulty,
        category,
        cards,
        matchedCount,
        locked,
        moves,
        elapsed,
        bestScore,
        newBest,
        totalPairs,
        hasWon,
        setDifficulty,
        setCategory,
        restart,
        flipCard,
    };
};
