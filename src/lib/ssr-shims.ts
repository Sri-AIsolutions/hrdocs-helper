// SSR shim: supabase-js client references `localStorage` at module load.
// This file MUST be imported before any module that transitively imports the
// supabase client. ES imports are hoisted, so import order at the top of
// `src/server.ts` determines execution order.
if (typeof globalThis !== "undefined" && typeof (globalThis as any).localStorage === "undefined") {
  const mem = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => (mem.has(k) ? (mem.get(k) as string) : null),
    setItem: (k: string, v: string) => { mem.set(k, String(v)); },
    removeItem: (k: string) => { mem.delete(k); },
    clear: () => { mem.clear(); },
    key: (i: number) => Array.from(mem.keys())[i] ?? null,
    get length() { return mem.size; },
  };
}

export {};
