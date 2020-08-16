const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();
export const fireSound = () => {
  const o = ctx.createOscillator();
  o.type = 'square';
  const g = ctx.createGain();
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
  o.frequency.value = 100;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  setTimeout(() => o.stop(), 100);
};
let engineSounds;
let gainMaster;
let timer;
export const engineSoundOn = level => {
  clearTimeout(timer);
  if (!engineSounds) {
    const filter = ctx.createBiquadFilter();
    filter.type = 0;
    filter.Q.value = 20;
    engineSounds = [ctx.createOscillator(), ctx.createOscillator()];
    const [a, b] = engineSounds;
    a.frequency.value = 10 * level;
    b.frequency.value = 25;

    engineSounds.forEach((x, i) => {
      x.type = 'triangle';
      x.connect(filter);
      x.start(0);
    });
    gainMaster = ctx.createGain();
    gainMaster.gain.value = 0.05;
    filter.connect(gainMaster);
    gainMaster.connect(ctx.destination);
  } else {
    gainMaster.gain.cancelScheduledValues(ctx.currentTime);
    gainMaster.gain.setValueAtTime(0.05, ctx.currentTime);
  }
};
export const engineSoundOff = () => {
  gainMaster.gain.setValueAtTime(gainMaster.gain.value, ctx.currentTime);
  gainMaster.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.02);
  timer = setTimeout(() => {
    if (engineSounds) engineSounds.forEach(x => x.stop());
    engineSounds = null;
  }, 20);
};

document.addEventListener('keydown', () => {
  ctx.resume();
});
