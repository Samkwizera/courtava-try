const REMEMBER_ME_KEY = "courtava-remember-me";

function preferredStorage(): Storage {
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) === "false" ? sessionStorage : localStorage;
  } catch {
    return localStorage;
  }
}

/** Call before sign in/up so the session that's about to be written lands in the right storage. */
export function setRememberMe(remember: boolean) {
  try {
    localStorage.setItem(REMEMBER_ME_KEY, String(remember));
  } catch {
    /* ignore */
  }
}

/** Supabase storage adapter that resolves to localStorage or sessionStorage per the remember-me choice. */
export const authStorage = {
  getItem: (key: string) => preferredStorage().getItem(key),
  setItem: (key: string, value: string) => preferredStorage().setItem(key, value),
  removeItem: (key: string) => preferredStorage().removeItem(key),
};
