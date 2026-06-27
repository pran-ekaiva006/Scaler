import { create } from "zustand";
import { HistoryEntry } from "../lib/types";
import { getHistory } from "../lib/api";

interface HistoryState {
  history: HistoryEntry[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchHistory: (limit?: number, offset?: number) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  history: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchHistory: async (limit = 50, offset = 0) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getHistory(limit, offset);
      set({ history: data.items, total: data.total, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
