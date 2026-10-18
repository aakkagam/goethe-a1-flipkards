// Progress lives only in this browser. Storage can be blocked (private mode), so every access is guarded.
const KEY = 'a1-flipkards:v1';

export function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Progress just won't persist.
  }
}
