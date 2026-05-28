import Phaser from 'phaser';
import { MilestoneModal } from '../ui/MilestoneModal';
import { EndCard } from '../ui/EndCard';
import { ALL_MILESTONES } from '../milestones';

const TILE = 16;
const LEVEL_TILES_W = 200;
const LEVEL_TILES_H = 15;
const LEVEL_W = LEVEL_TILES_W * TILE;
const LEVEL_H = LEVEL_TILES_H * TILE;

const WALK_MAX = 150;
const RUN_MAX = 260;
const WALK_ACCEL = 600;
const AIR_ACCEL = 450;
const GROUND_DRAG = 700;
const JUMP_VEL = -340;
const JUMP_HOLD_BOOST = -800;
const JUMP_HOLD_FRAMES = 12;
const COYOTE_FRAMES = 6;
const JUMP_BUFFER_FRAMES = 6;

interface MilestonePlacement {
  tile: number;
  id: keyof typeof ALL_MILESTONES;
}

const PLACEMENTS: MilestonePlacement[] = [
  { tile: 18, id: 'flying_carpet' },
  { tile: 20, id: 'imaginarium' },
  { tile: 22, id: 'iplan' },
  { tile: 24, id: 'dermador' },

  { tile: 40, id: 'shaldag' },
  { tile: 42, id: 'levi_trucks' },

  { tile: 65, id: 'se_ops_clients' },
  { tile: 67, id: 'se_ops_reports' },

  { tile: 110, id: 'se_pm_tickets' },
  { tile: 130, id: 'se_pm_volume' },
  { tile: 150, id: 'se_pm_module' },
  { tile: 170, id: 'se_pm_savings' }
];

const TIER_BG: Record<string, number> = {
  'drive-by': 0x5c94fc,
  'mid': 0x4a90a8,
  'climax': 0x2a1a3a
};

const TIER_TINT: Record<string, number> = {
  'drive-by': 0xffffff,
  'mid': 0xffffaa,
  'climax': 0xff8888
};

interface Keys {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  run: Phaser.Input.Keyboard.Key;
}

export class World1Scene extends Phaser.Scene {
  private hero!: Phaser.Physics.Arcade.Sprite;
  private keys!: Keys;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private milestoneBlocks!: Phaser.Physics.Arcade.StaticGroup;
  private milestonesHit = 0;
  private jumpHoldCounter = 0;
  private coyoteCounter = 0;
  private jumpBufferCounter = 0;
  private metricsEl: HTMLElement | null = null;
  private modal!: MilestoneModal;
  private endCard!: EndCard;
  private flagpole!: Phaser.GameObjects.Image;
  private endTriggered = false;
  private zoneLabel!: Phaser.GameObjects.Text;
  private currentTier = '';
  private modalWasOpen = false;
  private clouds: Phaser.GameObjects.Image[] = [];
  private hills: Phaser.GameObjects.Image[] = [];

  constructor() {
    super('World1');
  }

  create(): void {
    this.metricsEl = document.getElementById('metrics');
    this.modal = new MilestoneModal(this);
    this.endCard = new EndCard(this);
    this.endTriggered = false;
    this.milestonesHit = 0;
    this.currentTier = '';
    this.modalWasOpen = false;
    this.clouds = [];
    this.hills = [];

    this.cameras.main.setBounds(0, 0, LEVEL_W, LEVEL_H);
    this.physics.world.setBounds(0, 0, LEVEL_W, LEVEL_H);
    this.cameras.main.setBackgroundColor(TIER_BG['drive-by']);

    this.buildParallax();

    this.ground = this.physics.add.staticGroup();
    this.milestoneBlocks = this.physics.add.staticGroup();

    const groundY = LEVEL_H - TILE * 2;

    const gaps = new Set<number>([85, 86, 100, 101]);
    for (let x = 0; x < LEVEL_TILES_W; x++) {
      if (gaps.has(x)) continue;
      this.ground.create(x * TILE + TILE / 2, groundY + TILE / 2, 'ground').refreshBody();
      this.ground.create(x * TILE + TILE / 2, groundY + TILE * 1.5, 'ground').refreshBody();
    }

    const blockY = groundY - TILE * 4;
    PLACEMENTS.forEach(p => {
      const m = ALL_MILESTONES[p.id];
      const block = this.milestoneBlocks.create(p.tile * TILE + TILE / 2, blockY + TILE / 2, 'qblock') as Phaser.Physics.Arcade.Sprite;
      block.refreshBody();
      block.setData('isMilestone', true);
      block.setData('milestoneId', p.id);
      block.setTint(TIER_TINT[m.tier]);
    });

    this.flagpole = this.add.image(LEVEL_W - 8 * TILE, groundY - 144, 'flagpole').setOrigin(0, 0);

    if (!this.anims.exists('hero-walk')) {
      this.anims.create({
        key: 'hero-walk',
        frames: this.anims.generateFrameNumbers('hero_walk', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: 'hero-idle',
        frames: [{ key: 'hero_idle' }],
        frameRate: 1
      });
    }

    this.hero = this.physics.add.sprite(2 * TILE, groundY - 24, 'hero_idle');
    this.hero.setCollideWorldBounds(true);
    this.hero.setMaxVelocity(RUN_MAX, 1000);
    this.hero.setDragX(GROUND_DRAG);
    this.hero.body!.setSize(12, 22).setOffset(2, 2);

    this.physics.add.collider(this.hero, this.ground);
    this.physics.add.collider(this.hero, this.milestoneBlocks, (_h, b) => this.hitMilestone(b as Phaser.Physics.Arcade.Sprite));

    this.cameras.main.startFollow(this.hero, true, 0.15, 0.1);
    this.cameras.main.setDeadzone(60, 80);

    const kb = this.input.keyboard!;
    this.keys = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      jump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      run: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    };

    this.zoneLabel = this.add.text(this.cameras.main.width / 2, 10, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
      resolution: 2
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(500);
  }

  update(): void {
    const modalOpen = this.modal.isOpen();
    const justClosed = this.modalWasOpen && !modalOpen;
    this.modalWasOpen = modalOpen;
    if (modalOpen) return;
    if (justClosed) {
      this.jumpBufferCounter = 0;
      this.keys.jump.reset();
      return;
    }

    const body = this.hero.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    const running = this.keys.run.isDown;
    const maxSpeed = running ? RUN_MAX : WALK_MAX;
    this.hero.setMaxVelocity(maxSpeed, 1000);

    const accel = onGround ? WALK_ACCEL : AIR_ACCEL;

    if (this.keys.left.isDown) {
      this.hero.setAccelerationX(-accel);
      this.hero.setFlipX(true);
    } else if (this.keys.right.isDown) {
      this.hero.setAccelerationX(accel);
      this.hero.setFlipX(false);
    } else {
      this.hero.setAccelerationX(0);
    }

    const moving = Math.abs(body.velocity.x) > 5;
    if (onGround) {
      if (moving) {
        if (this.hero.anims.currentAnim?.key !== 'hero-walk') this.hero.anims.play('hero-walk', true);
        const speedRatio = Math.min(1, Math.abs(body.velocity.x) / RUN_MAX);
        this.hero.anims.timeScale = 0.6 + speedRatio * 1.2;
      } else {
        this.hero.anims.stop();
        this.hero.setTexture('hero_idle');
      }
    } else {
      this.hero.anims.stop();
      this.hero.setTexture('hero_idle');
    }

    this.hero.setDragX(onGround ? GROUND_DRAG : 0);

    if (onGround) this.coyoteCounter = COYOTE_FRAMES;
    else if (this.coyoteCounter > 0) this.coyoteCounter--;

    if (Phaser.Input.Keyboard.JustDown(this.keys.jump)) this.jumpBufferCounter = JUMP_BUFFER_FRAMES;
    else if (this.jumpBufferCounter > 0) this.jumpBufferCounter--;

    if (this.jumpBufferCounter > 0 && this.coyoteCounter > 0) {
      const speedFactor = Math.min(1, Math.abs(body.velocity.x) / RUN_MAX);
      this.hero.setVelocityY(JUMP_VEL - 60 * speedFactor);
      this.jumpHoldCounter = JUMP_HOLD_FRAMES;
      this.jumpBufferCounter = 0;
      this.coyoteCounter = 0;
    }

    if (this.keys.jump.isDown && this.jumpHoldCounter > 0 && body.velocity.y < 0) {
      this.hero.setAccelerationY(JUMP_HOLD_BOOST);
      this.jumpHoldCounter--;
    } else {
      this.hero.setAccelerationY(0);
      this.jumpHoldCounter = 0;
    }

    if (!onGround && body.velocity.y < 0 && !this.keys.jump.isDown) {
      this.hero.setVelocityY(body.velocity.y * 0.6);
    }

    this.updateTier();

    if (this.metricsEl) {
      this.metricsEl.textContent = `milestones ${this.milestonesHit}/12 | tier ${this.currentTier}`;
    }

    if (this.hero.y > LEVEL_H + 64) {
      this.hero.setPosition(2 * TILE, (LEVEL_H - TILE * 2) - 24);
      this.hero.setVelocity(0, 0);
    }

    if (!this.endTriggered && this.flagpole && Math.abs(this.hero.x - (this.flagpole.x + 8)) < 16) {
      this.endTriggered = true;
      this.hero.setVelocity(0, 0);
      this.hero.setAcceleration(0, 0);
      this.time.delayedCall(400, () => this.endCard.show(this.milestonesHit, 12));
    }
  }

  private buildParallax(): void {
    const cam = this.cameras.main;
    const skyTop = 0;

    for (let i = 0; i < 18; i++) {
      const x = (i * 220 + 80) % (LEVEL_W + 100);
      const y = skyTop + 16 + (i * 37) % 48;
      const c = this.add.image(x, y, 'cloud').setOrigin(0, 0).setScrollFactor(0.2).setDepth(-90);
      c.setScale(1 + ((i % 3) * 0.25));
      this.clouds.push(c);
    }

    const groundTop = LEVEL_H - TILE * 2;
    for (let i = 0; i < 14; i++) {
      const x = (i * 280 + 40) % (LEVEL_W + 200);
      const big = i % 2 === 0;
      const scale = big ? 2.2 : 1.4;
      const y = groundTop - (16 * scale);
      const h = this.add.image(x, y, 'hill').setOrigin(0, 0).setScrollFactor(0.45).setDepth(-80);
      h.setScale(scale);
      this.hills.push(h);
    }

    cam.setBackgroundColor(TIER_BG['drive-by']);
  }

  private updateTier(): void {
    const tx = Math.floor(this.hero.x / TILE);
    let tier: 'drive-by' | 'mid' | 'climax' = 'drive-by';
    let label = 'EARLY CAREER';
    if (tx >= 100) {
      tier = 'climax';
      label = 'STREAMELEMENTS — PRODUCT';
    } else if (tx >= 55) {
      tier = 'mid';
      label = 'STREAMELEMENTS — OPS';
    }

    if (tier === this.currentTier) return;
    this.currentTier = tier;
    this.cameras.main.setBackgroundColor(TIER_BG[tier]);
    this.zoneLabel.setText(label).setAlpha(1);
    this.tweens.add({ targets: this.zoneLabel, alpha: 0.4, duration: 1500, delay: 1500 });
  }

  private hitMilestone(block: Phaser.Physics.Arcade.Sprite): void {
    const body = this.hero.body as Phaser.Physics.Arcade.Body;
    if (!block.getData('isMilestone') || !body.touching.up) return;
    const id = block.getData('milestoneId') as keyof typeof ALL_MILESTONES;
    block.setTexture('used_block');
    block.setData('isMilestone', false);
    block.clearTint();
    this.milestonesHit++;

    this.tweens.add({ targets: block, y: block.y - 4, duration: 80, yoyo: true });

    const milestone = ALL_MILESTONES[id];
    this.time.delayedCall(180, () => {
      this.modal.show(milestone, () => {});
    });
  }
}
