import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x000000);

    const overlay = document.getElementById('title-overlay');
    if (!overlay) {
      this.scene.start('World1');
      return;
    }
    overlay.classList.remove('hidden');

    const start = (): void => {
      overlay.classList.add('hidden');
      window.removeEventListener('keydown', onKey);
      overlay.removeEventListener('click', start);
      this.scene.start('World1');
    };

    const onKey = (e: KeyboardEvent): void => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        start();
      }
    };

    window.addEventListener('keydown', onKey);
    overlay.addEventListener('click', start);
  }
}
