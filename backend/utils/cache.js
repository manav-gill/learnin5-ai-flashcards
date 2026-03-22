const cacheStore = new Map();

export const getCache = (key) => {
  const cachedEntry = cacheStore.get(key);

  if (!cachedEntry) {
    return null;
  }

  const isExpired = Date.now() > cachedEntry.expiresAt;

  if (isExpired) {
    cacheStore.delete(key);
    return null;
  }

  return cachedEntry.value;
};

export const setCache = (key, value, ttl) => {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
};
