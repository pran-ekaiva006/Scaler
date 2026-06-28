import {
  Collection,
  Environment,
  Folder,
  HistoryEntry,
  ProxyResponse,
  ProxySendPayload,
  SavedRequest,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// --- Collections ---

export const getCollections = () => fetchAPI<Collection[]>("/api/collections");

export const createCollection = (data: { name: string; description?: string }) =>
  fetchAPI<Collection>("/api/collections", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateCollection = (id: number, data: { name?: string; description?: string }) =>
  fetchAPI<Collection>(`/api/collections/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteCollection = (id: number) =>
  fetchAPI<void>(`/api/collections/${id}`, { method: "DELETE" });

// --- Folders ---

export const createFolder = (collectionId: number, data: { name: string }) =>
  fetchAPI<Folder>(`/api/collections/${collectionId}/folders`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateFolder = (id: number, data: { name: string }) =>
  fetchAPI<Folder>(`/api/folders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteFolder = (id: number) =>
  fetchAPI<void>(`/api/folders/${id}`, { method: "DELETE" });

// --- Requests (Saved) ---

export const createSavedRequest = (collectionId: number, data: Partial<SavedRequest>) =>
  fetchAPI<SavedRequest>(`/api/collections/${collectionId}/requests`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateSavedRequest = (id: number, data: Partial<SavedRequest>) =>
  fetchAPI<SavedRequest>(`/api/requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteSavedRequest = (id: number) =>
  fetchAPI<void>(`/api/requests/${id}`, { method: "DELETE" });

export const getSavedRequest = (id: number) => fetchAPI<SavedRequest>(`/api/requests/${id}`);

// --- Environments ---

export const getEnvironments = () => fetchAPI<Environment[]>("/api/environments");

export const createEnvironment = (data: { name: string }) =>
  fetchAPI<Environment>("/api/environments", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateEnvironment = (id: number, data: { name?: string; is_active?: boolean }) =>
  fetchAPI<Environment>(`/api/environments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteEnvironment = (id: number) =>
  fetchAPI<void>(`/api/environments/${id}`, { method: "DELETE" });

export const createEnvironmentVariable = (envId: number, data: { key: string; value: string; enabled?: boolean }) =>
  fetchAPI<any>(`/api/environments/${envId}/variables`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateEnvironmentVariable = (varId: number, data: { key?: string; value?: string; enabled?: boolean }) =>
  fetchAPI<any>(`/api/environments/variables/${varId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteEnvironmentVariable = (varId: number) =>
  fetchAPI<void>(`/api/environments/variables/${varId}`, { method: "DELETE" });

// --- History ---

export const getHistory = (limit = 50, offset = 0) =>
  fetchAPI<{ total: number; items: HistoryEntry[] }>(`/api/history?limit=${limit}&offset=${offset}`);

export const getHistoryEntry = (id: number) => fetchAPI<HistoryEntry>(`/api/history/${id}`);

export const deleteHistoryEntry = (id: number) => fetchAPI<void>(`/api/history/${id}`, { method: "DELETE" });

export const clearHistory = () => fetchAPI<void>("/api/history", { method: "DELETE" });

// --- Proxy Runner ---

export const sendProxyRequest = (data: ProxySendPayload) =>
  fetchAPI<ProxyResponse>("/api/proxy/send", {
    method: "POST",
    body: JSON.stringify(data),
  });
