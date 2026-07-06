import { type FC } from "react";
import {
    CATEGORIES,
    DIFFICULTIES,
    DIFFICULTY_CONFIG,
    formatTime,
    isCategoryCompatible,
    type Category,
    type Difficulty,
} from "./memory-logic";
import { useMemoryGame } from "./use-memory-game";

// --- Category labels ---

const CATEGORY_LABELS: Record<Category, string> = {
    tutti:    "🌍 Tutti",
    frutta:   "🍎 Frutta",
    verdura:  "🥕 Verdura",
    animali:  "🐶 Animali",
    fattoria: "🐮 Fattoria",
    natura:   "⭐ Natura",
};

// --- Component ---

const DEFAULT_DIFFICULTY: Difficulty = "10x10";
const DEFAULT_CATEGORY: Category = "tutti";

const Memory10x10: FC = () => {
    const {
        difficulty,
        category,
        cards,
        matchedCount,
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
    } = useMemoryGame(DEFAULT_DIFFICULTY, DEFAULT_CATEGORY);

    const { cols, maxWidthClass } = DIFFICULTY_CONFIG[difficulty];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 px-4 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">🧠 Memory Game</h1>

            {/* Controls */}
            <div className="flex flex-wrap gap-6 mb-5 justify-center">
                {/* Difficulty */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Difficoltà</span>
                    <div className="flex gap-1">
                        {DIFFICULTIES.map((d: Difficulty) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setDifficulty(d)}
                                aria-pressed={difficulty === d}
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
                        {CATEGORIES.map((c: Category) => {
                            const disabled = !isCategoryCompatible(c, difficulty);
                            return (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCategory(c)}
                                    disabled={disabled}
                                    aria-pressed={category === c}
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
            <div
                className={`grid gap-1 sm:gap-2 p-2 sm:p-4 bg-white rounded-2xl shadow-md w-full mx-auto ${maxWidthClass}`}
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
                {cards.map((card) => (
                    <div key={card.id} className="card-container aspect-square">
                        <button
                            type="button"
                            onClick={() => flipCard(card.id)}
                            disabled={card.flipped || card.matched}
                            aria-label={card.flipped || card.matched ? card.value : "Carta coperta"}
                            className={`card-inner w-full h-full text-lg sm:text-xl md:text-2xl ${card.flipped || card.matched ? "flipped" : ""}`}
                        >
                            <span className="card-face card-back">❔</span>
                            <span className={`card-face card-front ${card.matched ? "bg-green-200" : "bg-indigo-200"}`}>
                                {card.value}
                            </span>
                        </button>
                    </div>
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
                onClick={restart}
                className="mt-4 sm:mt-6 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm sm:text-base"
            >
                🔁 Ricomincia
            </button>
        </div>
    );
};

export default Memory10x10;
