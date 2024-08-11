import { openDB } from 'idb/with-async-ittr';

const dbPromise = openDB('RecyclingDB', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('counts')) {
      db.createObjectStore('counts');
    }
  },
});

export async function saveCountsToIndexedDB(counts) {
  const db = await dbPromise;
  await db.put('counts', counts, 'objectCounts');
}

export async function getCountsFromIndexedDB() {
  const db = await dbPromise;
  const storedCounts = await db.get('counts', 'objectCounts');
  return storedCounts || {
    glass: 0,
    can: 0,
    pet1: 0,
    hdpe2: 0,
    carton: 0
  };
}
