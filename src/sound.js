const AudioContext = window.AudioContext || window.webkitAudioContext;
export let fireSound = () => {};
export let crashSound = () => {};
export let engineSoundOn = () => {};
export let engineSoundOff = () => {};
if (AudioContext) {
  const ctx = new AudioContext();
  fireSound = () => {
    const o = ctx.createOscillator();
    o.type = 'square';
    const g = ctx.createGain();
    g.gain.value = 0.5;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    o.frequency.value = 100;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => o.stop(), 100);
  };
  crashSound = () => {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const g = ctx.createGain();
    g.gain.value = 0.5;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    o.frequency.value = 50;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => o.stop(), 150);
  };
  let engineSounds;
  let gain;
  let timer;
  engineSoundOn = level => {
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
      const gainMaster = ctx.createGain();
      gain = gainMaster.gain;
      gain.value = 0.1;
      filter.connect(gainMaster);
      gainMaster.connect(ctx.destination);
    } else {
      gain.cancelScheduledValues(ctx.currentTime);
      gain.setValueAtTime(0.1, ctx.currentTime);
    }
  };
  engineSoundOff = () => {
    if (gain) {
      gain.setValueAtTime(gain.value, ctx.currentTime);
      gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.02);
    }
    timer = setTimeout(() => {
      if (engineSounds) engineSounds.forEach(x => x.stop());
      engineSounds = null;
    }, 20);
  };

  window.addEventListener('keydown', () => {
    ctx.resume();
    // crashSound();
  });
}
