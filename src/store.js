// Progress lives only in this browser. Storage can be blocked (private mode), so every access is guarded.
const KEY = 'a1-flipkards:v1';

// Coerce whatever is stored (older versions, hand edits) into a valid state.
function clean(raw) {
  const status = {};
  if (raw?.status && typeof raw.status === 'object') {
    for (const [id, s] of Object.entries(raw.status)) {
      if (s === 'known' || s === 'unknown') status[id] = s;
    }
  }
  return {
    status,
    deck: raw?.deck === 'review' ? 'review' : 'learn',
    order: raw?.order === 'az' ? 'az' : 'shuffle',
  };
}

export function load() {
  try {
    return clean(JSON.parse(localStorage.getItem(KEY)));
  } catch {
    return clean(null);
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Progress just won't persist.
  }
}
