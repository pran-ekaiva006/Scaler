import { create } from "zustand";
import { Environment, KeyValueRow } from "../lib/types";
import { 
  getEnvironments, 
  createEnvironment, 
  updateEnvironment, 
  deleteEnvironment,
  createEnvironmentVariable,
  updateEnvironmentVariable,
  deleteEnvironmentVariable
} from "../lib/api";

interface EnvironmentsState {
  environments: Environment[];
  activeEnvironmentId: number | null;
  isLoading: boolean;
  error: string | null;
  
  fetchEnvironments: () => Promise<void>;
  addEnvironment: (name: string) => Promise<void>;
  renameEnvironment: (id: number, name: string) => Promise<void>;
  removeEnvironment: (id: number) => Promise<void>;
  activateEnvironment: (id: number | null) => Promise<void>;
  syncVariables: (envId: number, variables: KeyValueRow[]) => Promise<void>;
  
  getActiveVariables: () => Record<string, string>;
}

export const useEnvironmentsStore = create<EnvironmentsState>((set, get) => ({
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

  addEnvironment: async (name: string) => {
    try {
      const newEnv = await createEnvironment({ name });
      set((state) => ({ environments: [...state.environments, newEnv] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  renameEnvironment: async (id: number, name: string) => {
    try {
      const updatedEnv = await updateEnvironment(id, { name });
      set((state) => ({
        environments: state.environments.map((env) => (env.id === id ? updatedEnv : env)),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  removeEnvironment: async (id: number) => {
    try {
      await deleteEnvironment(id);
      set((state) => {
        const newEnvs = state.environments.filter((env) => env.id !== id);
        return {
          environments: newEnvs,
          activeEnvironmentId: state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
        };
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  activateEnvironment: async (id: number | null) => {
    try {
      const state = get();
      if (state.activeEnvironmentId) {
        // Deactivate current
        await updateEnvironment(state.activeEnvironmentId, { is_active: false });
      }
      if (id) {
        // Activate new
        await updateEnvironment(id, { is_active: true });
      }
      
      // Reload environments to ensure complete sync
      await get().fetchEnvironments();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  syncVariables: async (envId: number, variables: KeyValueRow[]) => {
    try {
      const state = get();
      const env = state.environments.find((e) => e.id === envId);
      if (!env) return;

      // We don't have IDs on the KeyValueRow, they just come from KeyValueTable.
      // Wait, KeyValueTable rows might have an `id`? No, KeyValueRow doesn't have an id property in our type.
      // EnvironmentVariable DOES have an `id`.
      // To sync properly without IDs, we might need to delete all existing and re-create, OR 
      // do a name-based diff. A full replace is simpler but let's just use the fact that our backend 
      // might need to delete and recreate, or we can diff by key if we assume keys are unique.
      
      // Let's do a naive diff by key
      const existingVars = env.variables || [];
      const newVars = variables.filter(v => v.key.trim() !== "");

      // For simplicity in UI logic:
      // We will delete all existing variables and recreate them to ensure perfect sync
      // (Normally we'd diff them, but doing delete+create is safe here)
      for (const v of existingVars) {
        await deleteEnvironmentVariable(v.id);
      }
      
      for (const v of newVars) {
        await createEnvironmentVariable(envId, {
          key: v.key,
          value: v.value,
          enabled: v.enabled !== false
        });
      }

      await get().fetchEnvironments();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  getActiveVariables: () => {
    const { environments, activeEnvironmentId } = get();
    const activeEnv = environments.find((e) => e.id === activeEnvironmentId);
    if (!activeEnv || !activeEnv.variables) return {};

    const vars: Record<string, string> = {};
    activeEnv.variables.forEach((v) => {
      if (v.enabled !== false) {
        vars[v.key] = v.value;
      }
    });
    return vars;
  },
}));
