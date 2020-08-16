export const distanceToTarget = (source, target) => Math.sqrt(Math.pow(source.x - target.x, 2) + Math.pow(source.y - target.y, 2));
export const pointInRect = ({ x, y }, { x: x1, y: y1, width, height }) =>
  x > x1 - width / 2 && x < x1 + width / 2 && y > y1 - height / 2 && y < y1 + height / 2;

export const distance = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
export const angleToTarget = (source, target) => Math.atan2(target.y - source.y, target.x - source.x) + Math.PI / 2;
export const text = {
  fireRateUpdated: 'Fire Rate Upgrade',
  maxSpeed: 'Speed Upgrade',
  warpDrive: 'Warp Drive Fixed, Warping in 3, 2, 1...'
  // secondaryWeapon: 'Secondary Weapon Online'
};
export const seedRand = function(s) {
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};
