export const get =  (key) => JSON.parse(localStorage.getItem(key))

export const set = (key, objs) => localStorage.setItem(key, JSON.stringify(objs))