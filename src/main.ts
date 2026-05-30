import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { World1Scene } from './scenes/World1Scene';

function isMobileLike(): boolean {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 1000;
  const noKb = !window.matchMedia('(hover: hover)').matches;
  return (coarse && narrow) || (coarse && noKb);
}

if (isMobileLike()) {
  const gate = document.getElementById('mobile-gate');
  const title = document.getElementById('title-overlay');
  const tracker = document.getElementById('tracker');
  const hud = document.getElementById('hud');
  if (gate) gate.classList.add('show');
  if (title) title.style.display = 'none';
  if (tracker) tracker.style.display = 'none';
  if (hud) hud.style.display = 'none';
} else {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#5c94fc',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 384,
      height: 240
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 875 },
        debug: false
      }
    },
    scene: [BootScene, TitleScene, World1Scene]
  };

  const game = new Phaser.Game(config);
  if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;
}
