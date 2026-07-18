export function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
}
export function log(...args) {
  console.log("[Game]", ...args);
}
