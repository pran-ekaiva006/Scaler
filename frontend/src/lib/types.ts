export interface KeyValueRow {
  key: string;
  value: string;
  enabled?: boolean;
  type?: string; // e.g. "text" | "file"
}

export interface RequestBody {
  raw_content?: string;
  raw_content_type?: string; // "json" | "text"
  form_data?: KeyValueRow[];
}

export interface Auth {
  token?: string;
  username?: string;
  password?: string;
}

export interface SavedRequest {
  id: number;
  collection_id?: number;
  folder_id?: number;
  name: string;
  method: string;
  url: string;
  params?: KeyValueRow[];
  headers?: KeyValueRow[];
  body_type?: string;
  body?: RequestBody;
  auth_type?: string;
  auth?: Auth;
  order_index?: number;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: number;
  collection_id: number;
  name: string;
  order_index?: number;
  created_at: string;
  requests: SavedRequest[];
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  folders: Folder[];
  requests: SavedRequest[]; // Root requests
}

export interface EnvironmentVariable {
  id: number;
  environment_id: number;
  key: string;
  value: string;
  enabled?: boolean;
  order_index?: number;
}

export interface Environment {
  id: number;
  name: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  variables: EnvironmentVariable[];
}

export interface HistoryEntry {
  id: number;
  request_id?: number;
  name: string;
  method: string;
  url: string;
  params?: KeyValueRow[];
  headers?: KeyValueRow[];
  body_type?: string;
  body?: RequestBody;
  auth_type?: string;
  auth?: Auth;
  response_status?: number;
  response_headers?: KeyValueRow[];
  response_body?: string;
  response_time_ms?: number;
  response_size_bytes?: number;
  error?: string;
  created_at: string;
}

export interface ProxySendPayload {
  method: string;
  url: string;
  params?: KeyValueRow[];
  headers?: KeyValueRow[];
  body_type?: string;
  body?: RequestBody;
  auth_type?: string;
  auth?: Auth;
  environment_id?: number;
  request_id?: number;
}

export interface ProxyResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: string;
  time_ms: number;
  size_bytes?: number;
  is_json?: boolean;
  error?: string;
  message?: string;
  history_id?: number;
}
