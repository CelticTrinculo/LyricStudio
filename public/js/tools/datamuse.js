const DATAMUSE_URL = 'https://api.datamuse.com/words';
const REQUEST_TIMEOUT_MS = 6000;
const CACHE_LIMIT = 100;
const cache = new Map();

async function queryDatamuse(params, max = 30) {
  const query = new URLSearchParams({ ...params, max: String(max) });
  const key = query.toString();

  if (cache.has(key)) {
    return cache.get(key);
  }

  const controller = new window.AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${DATAMUSE_URL}?${key}`, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Datamuse request failed (${response.status})`);
    }

    const words = (await response.json()).map((entry) => entry.word);

    if (cache.size >= CACHE_LIMIT) {
      cache.delete(cache.keys().next().value);
    }

    cache.set(key, words);
    return words;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchRhymes(word) {
  const [perfect, approximate] = await Promise.all([
    queryDatamuse({ rel_rhy: word }),
    queryDatamuse({ rel_nry: word }),
  ]);

  const perfectSet = new Set(perfect);

  return {
    perfect,
    near: approximate.filter((candidate) => !perfectSet.has(candidate)),
  };
}

export async function fetchWordAlternatives(phrase, word) {
  const [synonyms, antonyms, meansLike] = await Promise.all([
    queryDatamuse({ rel_syn: word }),
    queryDatamuse({ rel_ant: word }),
    phrase && phrase !== word ? queryDatamuse({ ml: phrase }, 20) : Promise.resolve([]),
  ]);

  return { synonyms, antonyms, meansLike };
}
