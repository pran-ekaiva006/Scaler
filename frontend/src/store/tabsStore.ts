import { create } from "zustand";
import { KeyValueRow, RequestBody, Auth, ProxyResponse } from "../lib/types";

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
  response?: ProxyResponse;
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Tab) => void;
  closeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>, isEdit?: boolean) => void;
  setActiveTab: (id: string) => void;
  createBlankTab: () => void;
  saveModalConfig: { isOpen: boolean; mode: "save" | "saveAs"; tabId: string } | null;
  openSaveModal: (mode: "save" | "saveAs", tabId: string) => void;
  closeSaveModal: () => void;
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
        tabs: [...state.tabs, { ...tab, isDirty: false }],
        activeTabId: tab.id,
      };
    }),

  closeTab: (id) =>
    set((state) => {
      const closingIndex = state.tabs.findIndex((t) => t.id === id);
      const newTabs = state.tabs.filter((t) => t.id !== id);
      let nextActive = state.activeTabId;
      if (state.activeTabId === id) {
        if (newTabs.length > 0) {
          // Fallback to the left neighbor, or the first item if we closed the first tab
          const newIndex = Math.max(0, closingIndex - 1);
          nextActive = newTabs[newIndex].id;
        } else {
          nextActive = null;
        }
      }
      return { tabs: newTabs, activeTabId: nextActive };
    }),

  updateTab: (id, updates, isEdit = false) =>
    set((state) => ({
      tabs: state.tabs.map((t) => {
        if (t.id === id) {
          if (isEdit) {
            return { ...t, ...updates, isDirty: true };
          }
          return { ...t, ...updates };
        }
        return t;
      }),
    })),

  setActiveTab: (id) => set({ activeTabId: id }),

  createBlankTab: () =>
    set((state) => {
      const id = Date.now().toString();
      const newTab: Tab = {
        id,
        name: "Untitled Request",
        method: "GET",
        url: "",
        params: [],
        headers: [],
        body_type: "none",
        body: null,
        auth_type: "none",
        auth: null,
        isDirty: false,
      };
      return {
        tabs: [...state.tabs, newTab],
        activeTabId: id,
      };
    }),

  saveModalConfig: null,
  openSaveModal: (mode, tabId) => set({ saveModalConfig: { isOpen: true, mode, tabId } }),
  closeSaveModal: () => set({ saveModalConfig: null }),
}));
