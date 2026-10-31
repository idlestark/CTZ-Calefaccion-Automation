import type { SessionUser } from "./types";

export type CtzApi = {
  call: (name: string, args?: unknown, token?: string | null) => Promise<{ ok: boolean; data?: unknown; error?: string; code?: number }>;
  local: {
    info: () => Promise<import("./types").LocalInfo>;
    saveConfig: (cfg: { mode: "host" | "client"; hostUrl: string; port: number }) => Promise<void>;
    testConnection: (url: string) => Promise<{ ok: boolean }>;
    savePdf: (html: string, filename: string) => Promise<string>;
    openPath: (p: string) => Promise<string>;
    showInFolder: (p: string) => Promise<void>;
    importBackup: () => Promise<{ ok: boolean; canceled?: boolean; error?: string }>;
  };
};

declare global {
  interface Window {
    ctzAPI: CtzApi;
  }
}

export class ApiError extends Error {
  code: number;
  constructor(message: string, code = 500) {
    super(message);
    this.code = code;
  }
}

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setToken = (t: string | null) => {
  token = t;
};
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

/** Llama a una operación del backend (PC principal). Lanza ApiError si falla. */
export async function call<T = unknown>(name: string, args?: unknown): Promise<T> {
  const res = await window.ctzAPI.call(name, args ?? {}, token);
  if (!res.ok) {
    if (res.code === 401 && name !== "auth:login" && onUnauthorized) onUnauthorized();
    throw new ApiError(res.error || "Error inesperado.", res.code);
  }
  return res.data as T;
}

export const local = () => window.ctzAPI.local;
export type { SessionUser };
