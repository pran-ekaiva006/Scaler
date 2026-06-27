import { create } from "zustand";
import { Environment } from "../lib/types";
import { getEnvironments } from "../lib/api";

interface EnvironmentsState {
  environments: Environment[];
  activeEnvironmentId: number | null;
  isLoading: boolean;
  error: string | null;
  fetchEnvironments: () => Promise<void>;
  setActiveEnvironmentId: (id: number | null) => void;
}

export const useEnvironmentsStore = create<EnvironmentsState>((set) => ({
  environments: [],
  activeEnvironmentId: null,
  isLoading: false,
  error: null,

  fetchEnvironments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getEnvironments();
      const activeEnv = data.find((e) => e.is_active);
      set({
        environments: data,
        activeEnvironmentId: activeEnv ? activeEnv.id : null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setActiveEnvironmentId: (id) => set({ activeEnvironmentId: id }),
}));
