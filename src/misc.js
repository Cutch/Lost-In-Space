export const distanceToTarget = (source, target) => Math.sqrt(Math.pow(source.x - target.x, 2) + Math.pow(source.y - target.y, 2));
export const pointInRect = ({ x, y }, { x: x1, y: y1, width, height }) =>
  x > x1 - width / 2 && x < x1 + width / 2 && y > y1 - height / 2 && y < y1 + height / 2;

export const magnitude = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
export const angleToTarget = (source, target) => (Math.atan2(target.y - source.y, target.x - source.x) + Math.PI / 2) % (Math.PI * 2);

// export const normalize = vec => {
//   const mag = magnitude(vec.x, vec.y);
//   vec.x /= mag;
//   vec.y /= mag;
//   return vec;
// };
// export const dotProduct = (a, b) => a.x * b.x + a.y * b.y;
export const text = {
  fireRateUpdated: 'Fire Rate Upgrade',
  secondaryFireRateUpdated: 'Secondary Fire Rate Upgrade',
  maxSpeed: 'Speed Upgrade',
  repair: 'Hull Repaired',
  warpDrive: 'Warp Drive Fixed, Warping in 3, 2, 1...',
  secondaryWeapons: 'Secondary Weapons Online',
  acceleration: 'Acceleration Increased',
  rotationSpeed: 'Rotor Speed Increased'
};
export const seedRand = function(s) {
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};
// Test [...Array(to).keys()] compatibility
// eslint-disable-next-line prefer-spread
export const range = to => Array.apply(null, Array(to)).map((x, i) => i);
export const randomPointOutsideView = ({ width, height }) => {
  /**
   * Generate a spawn location outside of the canvas
   * Initially only the y is guaranteed outside the canvas, [0-1.5, 1-1.5]
   * X,Y are randomly flipped
   */
  const spawn = [Math.random() * 1.5, Math.random() - 0.5];
  spawn[1] = Math.sign(spawn[1]) + spawn[1];
  if (Math.random() > 0.5) spawn.reverse();
  spawn[0] = Math.floor(spawn[0] * width);
  spawn[1] = Math.floor(spawn[1] * height);
  return spawn;
};
const numToHex = function(rgb) {
  const hex = Number(rgb).toString(16);
  return hex.length < 2 ? '0' + hex : hex;
};
export const rgbToHex = function(r, g, b) {
  return '#' + numToHex(r) + numToHex(g) + numToHex(b);
};
