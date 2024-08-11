export function saveCountsToLocalStorage(counts) {
  localStorage.setItem('objectCounts', JSON.stringify(counts));
}

export function getCountsFromLocalStorage() {
  const storedCounts = localStorage.getItem('objectCounts');
  return storedCounts ? JSON.parse(storedCounts) : {
    glass: 0,
    can: 0,
    pet1: 0,
    hdpe2: 0,
    carton: 0
  };
}
