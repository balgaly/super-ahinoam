import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.image('hero_idle', 'assets/sprites/hero_idle.png');
    this.load.spritesheet('hero_walk', 'assets/sprites/hero_walk.png', { frameWidth: 24, frameHeight: 32 });
    this.load.image('hero_big', 'assets/sprites/hero_big.png');
    this.load.image('qblock', 'assets/sprites/qblock.png');
    this.load.image('brick', 'assets/sprites/brick.png');
    this.load.image('coin', 'assets/sprites/coin.png');
    this.load.image('ground', 'assets/sprites/ground.png');
    this.load.image('used_block', 'assets/sprites/used_block.png');
    this.load.image('cloud', 'assets/sprites/cloud.png');
    this.load.image('hill', 'assets/sprites/hill.png');
    this.load.image('flagpole', 'assets/sprites/flagpole.png');
    this.load.image('flag', 'assets/sprites/flag.png');
    this.load.image('princess_idle', 'assets/sprites/princess_idle.png');
    this.load.spritesheet('princess_bob', 'assets/sprites/princess_bob.png', { frameWidth: 24, frameHeight: 32 });
    this.load.spritesheet('slime', 'assets/sprites/slime.png', { frameWidth: 16, frameHeight: 16 });

    const g = this.add.graphics();

    g.fillStyle(0x10a050, 1);
    g.fillRect(0, 0, 32, 16);
    g.fillStyle(0x70d090, 1);
    g.fillRect(2, 2, 28, 4);
    g.lineStyle(1, 0x000000, 1);
    g.strokeRect(0, 0, 32, 16);
    g.generateTexture('pipe_top', 32, 16);
    g.clear();

    g.fillStyle(0x10a050, 1);
    g.fillRect(2, 0, 28, 16);
    g.fillStyle(0x70d090, 1);
    g.fillRect(4, 0, 4, 16);
    g.lineStyle(1, 0x000000, 1);
    g.strokeRect(2, 0, 28, 16);
    g.generateTexture('pipe_body', 32, 16);
    g.clear();

    g.destroy();
  }

  create(): void {
    this.scene.start('Title');
  }
}
