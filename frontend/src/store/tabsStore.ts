import { create } from "zustand";
import { KeyValueRow, RequestBody, Auth } from "../lib/types";

export interface Tab {
  id: string; // Unique ID for the tab (could be temporary UUID or savedRequest.id)
  savedRequestId?: number;
  name: string;
  method: string;
  url: string;
  params: KeyValueRow[];
  headers: KeyValueRow[];
  body_type: string;
  body: RequestBody | null;
  auth_type: string;
  auth: Auth | null;
  isDirty: boolean;
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Tab) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  setActiveTab: (id: string) => void;
}

export const useTabsStore = create<TabsState>((set) => ({
  tabs: [],
  activeTabId: null,

  openTab: (tab) =>
    set((state) => {
      const existing = state.tabs.find((t) => t.id === tab.id);
      if (existing) {
        return { activeTabId: tab.id };
      }
      return {
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
      };
    }),

  closeTab: (id) =>
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      let nextActive = state.activeTabId;
      if (state.activeTabId === id) {
        nextActive = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
      }
      return { tabs: newTabs, activeTabId: nextActive };
    }),

  updateTab: (id, updates) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, ...updates, isDirty: true } : t
      ),
    })),

  setActiveTab: (id) => set({ activeTabId: id }),
}));
