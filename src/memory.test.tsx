import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    shuffleArray,
    createCards,
    formatTime,
    getSymbols,
    isCategoryCompatible,
    loadBestScore,
    CATEGORY_SYMBOLS,
    DIFFICULTY_CONFIG,
} from "./memory";
import type { Difficulty, Category } from "./memory";
import Memory10x10 from "./memory";

// ─── Pure function unit tests ─────────────────────────────────────────────────

describe("shuffleArray", () => {
    it("returns an array with the same elements", () => {
        const input = [1, 2, 3, 4, 5];
        const result = shuffleArray(input);
        expect(result).toHaveLength(input.length);
        expect(result.sort()).toEqual([...input].sort());
    });

    it("does not mutate the original array", () => {
        const input = [1, 2, 3];
        const copy = [...input];
        shuffleArray(input);
        expect(input).toEqual(copy);
    });

    it("handles empty arrays", () => {
        expect(shuffleArray([])).toEqual([]);
    });

    it("handles single-element arrays", () => {
        expect(shuffleArray([42])).toEqual([42]);
    });
});

describe("formatTime", () => {
    it("shows seconds only when under 1 minute", () => {
        expect(formatTime(0)).toBe("0s");
        expect(formatTime(59)).toBe("59s");
    });

    it("shows minutes and seconds from 60s onwards", () => {
        expect(formatTime(60)).toBe("1m 0s");
        expect(formatTime(90)).toBe("1m 30s");
        expect(formatTime(125)).toBe("2m 5s");
    });
});

describe("getSymbols", () => {
    it("returns all symbols for 'tutti'", () => {
        const all = getSymbols("tutti");
        const expected = Object.values(CATEGORY_SYMBOLS).flat();
        expect(all).toEqual(expected);
        expect(all).toHaveLength(50);
    });

    it("returns the correct symbols for each named category", () => {
        (Object.keys(CATEGORY_SYMBOLS) as Exclude<Category, "tutti">[]).forEach((cat) => {
            expect(getSymbols(cat)).toEqual(CATEGORY_SYMBOLS[cat]);
            expect(getSymbols(cat)).toHaveLength(10);
        });
    });
});

describe("isCategoryCompatible", () => {
    it("'tutti' is always compatible", () => {
        (["4x4", "6x6", "8x8", "10x10"] as Difficulty[]).forEach((d) => {
            expect(isCategoryCompatible("tutti", d)).toBe(true);
        });
    });

    it("single categories (10 symbols) are compatible only with 4x4 (8 pairs)", () => {
        expect(isCategoryCompatible("frutta", "4x4")).toBe(true);
        expect(isCategoryCompatible("frutta", "6x6")).toBe(false);
        expect(isCategoryCompatible("frutta", "8x8")).toBe(false);
        expect(isCategoryCompatible("frutta", "10x10")).toBe(false);
    });
});

describe("createCards", () => {
    it("creates the correct number of cards for each difficulty", () => {
        (["4x4", "6x6", "8x8", "10x10"] as Difficulty[]).forEach((d) => {
            const { pairs } = DIFFICULTY_CONFIG[d];
            const cards = createCards(d, "tutti");
            expect(cards).toHaveLength(pairs * 2);
        });
    });

    it("all cards start unflipped and unmatched", () => {
        const cards = createCards("4x4", "tutti");
        cards.forEach((c) => {
            expect(c.flipped).toBe(false);
            expect(c.matched).toBe(false);
        });
    });

    it("each symbol appears exactly twice", () => {
        const cards = createCards("4x4", "tutti");
        const counts: Record<string, number> = {};
        cards.forEach((c) => { counts[c.value] = (counts[c.value] ?? 0) + 1; });
        Object.values(counts).forEach((count) => expect(count).toBe(2));
    });

    it("respects the selected category symbols", () => {
        const cards = createCards("4x4", "frutta");
        const fruttaSet = new Set(CATEGORY_SYMBOLS.frutta);
        cards.forEach((c) => expect(fruttaSet.has(c.value)).toBe(true));
    });

    it("assigns unique sequential ids", () => {
        const cards = createCards("4x4", "tutti");
        const ids = cards.map((c) => c.id);
        expect(ids).toEqual([...Array(cards.length).keys()]);
    });
});

describe("loadBestScore", () => {
    beforeEach(() => localStorage.clear());

    it("returns null when no score is saved", () => {
        expect(loadBestScore("10x10", "tutti")).toBeNull();
    });

    it("returns the saved score", () => {
        localStorage.setItem("memory-best:10x10:tutti", JSON.stringify({ moves: 55, time: 120 }));
        expect(loadBestScore("10x10", "tutti")).toEqual({ moves: 55, time: 120 });
    });

    it("returns null on corrupted data without throwing", () => {
        localStorage.setItem("memory-best:4x4:frutta", "not-json");
        expect(() => loadBestScore("4x4", "frutta")).not.toThrow();
    });
});

// ─── Component integration tests ─────────────────────────────────────────────

describe("Memory10x10 component", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders 100 cards by default (10x10)", () => {
        render(<Memory10x10 />);
        const cards = screen.getAllByRole("button", { name: "Carta coperta" });
        expect(cards).toHaveLength(100);
    });

    it("renders the correct number of cards when difficulty changes", async () => {
        render(<Memory10x10 />);
        fireEvent.click(screen.getByRole("button", { name: "4x4" }));
        const cards = screen.getAllByRole("button", { name: "Carta coperta" });
        expect(cards).toHaveLength(16);
    });

    it("reveals the card value on click", () => {
        render(<Memory10x10 />);
        const [firstCard] = screen.getAllByRole("button", { name: "Carta coperta" });
        fireEvent.click(firstCard);
        expect(firstCard).toBeDisabled();
    });

    it("increments the move counter after flipping two cards", () => {
        render(<Memory10x10 />);
        const [c1, c2] = screen.getAllByRole("button", { name: "Carta coperta" });
        expect(screen.getByText("🔄 0 mosse")).toBeInTheDocument();
        fireEvent.click(c1);
        fireEvent.click(c2);
        expect(screen.getByText("🔄 1 mosse")).toBeInTheDocument();
    });

    it("starts the timer on the first card click", () => {
        render(<Memory10x10 />);
        expect(screen.getByText("⏱ 0s")).toBeInTheDocument();
        const [card] = screen.getAllByRole("button", { name: "Carta coperta" });
        fireEvent.click(card);
        act(() => { vi.advanceTimersByTime(3000); });
        expect(screen.getByText("⏱ 3s")).toBeInTheDocument();
    });

    it("resets the game when 'Ricomincia' is clicked", () => {
        render(<Memory10x10 />);
        const [card] = screen.getAllByRole("button", { name: "Carta coperta" });
        fireEvent.click(card);
        act(() => { vi.advanceTimersByTime(2000); });

        fireEvent.click(screen.getByRole("button", { name: /Ricomincia/ }));

        expect(screen.getByText("⏱ 0s")).toBeInTheDocument();
        expect(screen.getByText("🔄 0 mosse")).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: "Carta coperta" })).toHaveLength(100);
    });

    it("does not show the win message at start", () => {
        render(<Memory10x10 />);
        expect(screen.queryByText(/Hai vinto/)).toBeNull();
    });

    it("disables single category buttons when incompatible with current difficulty", () => {
        render(<Memory10x10 />);
        const fruttaBtn = screen.getByRole("button", { name: /Frutta/ });
        expect(fruttaBtn).toBeDisabled();
    });

    it("enables category buttons after switching to 4x4", () => {
        render(<Memory10x10 />);
        fireEvent.click(screen.getByRole("button", { name: "4x4" }));
        const fruttaBtn = screen.getByRole("button", { name: /Frutta/ });
        expect(fruttaBtn).not.toBeDisabled();
    });

    it("auto-switches category to 'tutti' when switching to incompatible difficulty", () => {
        render(<Memory10x10 />);
        fireEvent.click(screen.getByRole("button", { name: "4x4" }));
        fireEvent.click(screen.getByRole("button", { name: /Frutta/ }));
        fireEvent.click(screen.getByRole("button", { name: "10x10" }));
        const tuttiBtn = screen.getByRole("button", { name: /Tutti/ });
        expect(tuttiBtn).toHaveClass("bg-indigo-500");
    });

    it("shows the best score from localStorage on mount", () => {
        localStorage.setItem("memory-best:10x10:tutti", JSON.stringify({ moves: 42, time: 90 }));
        render(<Memory10x10 />);
        expect(screen.getByText(/Record: 42 mosse \/ 1m 30s/)).toBeInTheDocument();
    });
});
