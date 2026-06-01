import Phaser from 'phaser';
import { MilestoneModal } from '../ui/MilestoneModal';
import { EndCard } from '../ui/EndCard';
import { ALL_MILESTONES } from '../milestones';
import { glyphDataUri } from '../ui/glyphs';

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
  { tile: 21, id: 'imaginarium' },
  { tile: 24, id: 'iplan' },
  { tile: 27, id: 'dermador' },

  { tile: 40, id: 'shaldag' },
  { tile: 43, id: 'levi_trucks' },

  { tile: 64, id: 'se_ops_clients' },
  { tile: 67, id: 'se_ops_reports' },

  { tile: 105, id: 'se_pm_step_up' },
  { tile: 118, id: 'se_pm_data_model' },
  { tile: 132, id: 'se_pm_tickets' },
  { tile: 146, id: 'se_pm_volume' },
  { tile: 160, id: 'se_pm_module' },
  { tile: 174, id: 'se_pm_savings' }
];

const TIER_BG: Record<string, number> = {
  'drive-by': 0x5c94fc,
  'mid': 0xfc7c4c,
  'climax': 0x6438a0
};

const TIER_TINT: Record<string, number> = {
  'drive-by': 0xffffff,
  'mid': 0xffffaa,
  'climax': 0xff8888
};

const TIER_HERO_SCALE: Record<string, number> = {
  'drive-by': 1.0,
  'mid': 1.35,
  'climax': 1.7
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
  private flag!: Phaser.GameObjects.Image;
  private princess!: Phaser.GameObjects.Sprite;
  private signText!: Phaser.GameObjects.Container;
  private endTriggered = false;
  private zoneLabelEl!: HTMLDivElement;
  private currentTier = '';
  private modalWasOpen = false;
  private clouds: Phaser.GameObjects.Image[] = [];
  private hills: Phaser.GameObjects.Image[] = [];
  private slimes!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private airComboCount = 0;
  private growing = false;
  private groundY = 0;

  constructor() {
    super('World1');
  }

  create(): void {
    this.metricsEl = document.getElementById('metrics');
    this.modal = new MilestoneModal(this);
    this.endCard = new EndCard(this);
    this.endTriggered = false;
    this.milestonesHit = 0;
    this.score = 0;
    this.airComboCount = 0;
    this.growing = false;
    this.currentTier = '';
    this.modalWasOpen = false;
    this.clouds = [];
    this.hills = [];

    this.cameras.main.setBounds(0, 0, LEVEL_W, LEVEL_H);
    // World bounds extend well below the level so a hero who falls into a
    // pit keeps dropping (past the camera view) and triggers respawn,
    // instead of stopping on the world floor.
    this.physics.world.setBounds(0, 0, LEVEL_W, LEVEL_H + 400);
    this.cameras.main.setBackgroundColor(TIER_BG['drive-by']);

    this.buildParallax();

    this.ground = this.physics.add.staticGroup();
    this.milestoneBlocks = this.physics.add.staticGroup();

    const groundY = LEVEL_H - TILE * 3;
    this.groundY = groundY;
    const GROUND_ROWS = 3;

    // ---------------------------------------------------------------------
    // MASTER LAYOUT — every feature gets a reserved tile range, nothing
    // shares a column. Reading left to right the level tells the career arc:
    //
    //  tile  0..54  DRIVE-BY (early career)   tile 55..99 MID (operations)
    //  tile 100..199 CLIMAX (product)
    //
    //  Milestones (q-blocks): 18 21 24 27 | 40 43 | 64 67 |
    //                         105 118 132 146 160 174
    //  Pipes:   31  55  96  128  164
    //  Mesas:   47-50   108-111   150-153
    //  Pits:    34-35  72  88-90  113-114  137-138  168-169
    //  Bricks:  10-12  60-62  78-80  100-102  120-122  140-142  176-178
    //  Stairs:  186-189   Flag: ~192
    // ---------------------------------------------------------------------

    // Pit chasms — varied widths. Surface raised to row 12 so the hole opens
    // above the ENVELOP crop line and is actually visible.
    const pitRanges: Array<[number, number]> = [
      [34, 35],
      [72, 72],
      [88, 90],
      [113, 114],
      [137, 138],
      [168, 169]
    ];
    const gaps = new Set<number>();
    pitRanges.forEach(([a, b]) => { for (let x = a; x <= b; x++) gaps.add(x); });

    // Base ground: 3 rows deep so cropped bottom still leaves visible depth.
    for (let x = 0; x < LEVEL_TILES_W; x++) {
      if (gaps.has(x)) continue;
      for (let r = 0; r < GROUND_ROWS; r++) {
        this.ground.create(x * TILE + TILE / 2, groundY + TILE / 2 + r * TILE, 'ground').refreshBody();
      }
    }

    // Raised mesas — solid ground steps, in the gaps between milestone
    // clusters. [startTile, lengthTiles, heightTiles].
    const mesas: Array<[number, number, number]> = [
      [47, 4, 2],
      [108, 4, 3],
      [150, 4, 2]
    ];
    mesas.forEach(([tx, len, h]) => {
      for (let i = 0; i < len; i++) {
        for (let r = 0; r < h; r++) {
          this.ground.create((tx + i) * TILE + TILE / 2, groundY - TILE / 2 - r * TILE, 'ground').refreshBody();
        }
      }
    });

    // Warp pipes — jump-over obstacles, parked in open stretches. 2 tiles wide.
    const pipes: Array<[number, number]> = [
      [31, 2],
      [55, 3],
      [96, 2],
      [128, 3],
      [164, 3]
    ];
    pipes.forEach(([tx, h]) => this.buildPipe(tx, h, groundY));

    // Mario staircase ascending into the flag run.
    const stairBase = 186;
    for (let s = 0; s < 4; s++) {
      for (let r = 0; r <= s; r++) {
        this.ground.create((stairBase + s) * TILE + TILE / 2, groundY - TILE / 2 - r * TILE, 'ground').refreshBody();
      }
    }

    const tierAt = (tx: number): 'drive-by' | 'mid' | 'climax' => tx >= 100 ? 'climax' : tx >= 55 ? 'mid' : 'drive-by';
    const TIER_PLATFORM_LIFT: Record<string, number> = { 'drive-by': 0, 'mid': 16, 'climax': 32 };
    // Brick platforms — jump shelves in the gaps, never sharing a column with
    // a milestone q-block or a pipe. [startTile, heightTiles, lengthTiles].
    const platforms: Array<[number, number, number]> = [
      [10, 4, 3],
      [60, 4, 2],
      [78, 5, 2],
      [100, 5, 2],
      [120, 4, 2],
      [140, 6, 3],
      [176, 4, 2]
    ];
    platforms.forEach(([tx, height, len]) => {
      const lift = TIER_PLATFORM_LIFT[tierAt(tx)];
      const py = groundY - height * TILE - lift;
      for (let i = 0; i < len; i++) {
        this.ground.create((tx + i) * TILE + TILE / 2, py, 'brick').refreshBody();
      }
    });

    PLACEMENTS.forEach(p => {
      const m = ALL_MILESTONES[p.id];
      const lift = TIER_PLATFORM_LIFT[tierAt(p.tile)];
      const blockY = groundY - TILE * 4 - lift;
      const block = this.milestoneBlocks.create(p.tile * TILE + TILE / 2, blockY + TILE / 2, 'qblock') as Phaser.Physics.Arcade.Sprite;
      block.refreshBody();
      block.setData('isMilestone', true);
      block.setData('milestoneId', p.id);
      block.setTint(TIER_TINT[m.tier]);
    });

    this.flagpole = this.add.image(LEVEL_W - 8 * TILE, groundY - 144, 'flagpole').setOrigin(0, 0);
    this.flag = this.add.image(this.flagpole.x + 5, this.flagpole.y + 8, 'flag').setOrigin(0, 0).setDepth(5);

    if (!this.anims.exists('princess-bob')) {
      this.anims.create({
        key: 'princess-bob',
        frames: this.anims.generateFrameNumbers('princess_bob', { start: 0, end: 2 }),
        frameRate: 3,
        repeat: -1
      });
    }
    const princessX = this.flagpole.x + 4 * TILE;
    this.princess = this.add.sprite(princessX, groundY - 16, 'princess_idle').setOrigin(0.5, 0.5).setScale(1.7).setDepth(8);
    this.princess.play('princess-bob');

    const signX = princessX;
    const signY = groundY - 84;
    const signBg = this.add.rectangle(signX, signY, 168, 38, 0xfdf6e3).setStrokeStyle(3, 0x000000).setDepth(7);
    const signLine1 = this.add.text(signX, signY - 8, 'YOU SAVED', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#1a1a1a',
      resolution: 2
    }).setOrigin(0.5).setDepth(8);
    const signLine2 = this.add.text(signX, signY + 6, 'THE RECRUITER!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#c8842a',
      resolution: 2
    }).setOrigin(0.5).setDepth(8);
    this.signText = this.add.container(0, 0, [signBg, signLine1, signLine2]).setDepth(7).setAlpha(0);

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

    this.hero = this.physics.add.sprite(2 * TILE, groundY - 32, 'hero_idle');
    this.hero.setCollideWorldBounds(true);
    this.hero.setMaxVelocity(RUN_MAX, 1000);
    this.hero.setDragX(GROUND_DRAG);
    this.hero.body!.setSize(16, 28).setOffset(4, 3);

    this.physics.add.collider(this.hero, this.ground);
    this.physics.add.collider(this.hero, this.milestoneBlocks, (_h, b) => this.hitMilestone(b as Phaser.Physics.Arcade.Sprite));

    this.slimes = this.physics.add.group();
    if (!this.anims.exists('slime-walk')) {
      this.anims.create({
        key: 'slime-walk',
        frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 1 }),
        frameRate: 4,
        repeat: -1
      });
    }
    const SLIME_TILES = [25, 42, 78, 104, 122, 146, 158, 180];
    SLIME_TILES.forEach(tx => {
      const s = this.slimes.create(tx * TILE + TILE / 2, groundY - 8, 'slime') as Phaser.Physics.Arcade.Sprite;
      s.setCollideWorldBounds(true);
      s.setVelocityX(-30);
      s.setBounce(1, 0);
      s.body!.setSize(14, 12).setOffset(1, 4);
      s.play('slime-walk');
    });
    this.physics.add.collider(this.slimes, this.ground);
    this.physics.add.overlap(this.hero, this.slimes, (_h, s) => this.handleSlime(s as Phaser.Physics.Arcade.Sprite));

    this.cameras.main.startFollow(this.hero, true, 0.15, 0.1);
    this.cameras.main.setDeadzone(60, 80);

    const kb = this.input.keyboard!;
    this.keys = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      jump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      run: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    };

    let zoneEl = document.getElementById('zone-label') as HTMLDivElement | null;
    if (!zoneEl) {
      zoneEl = document.createElement('div');
      zoneEl.id = 'zone-label';
      document.body.appendChild(zoneEl);
    }
    this.zoneLabelEl = zoneEl;
    const cleanup = (): void => {
      zoneEl?.remove();
      document.getElementById('fanfare')?.remove();
    };
    this.events.once('shutdown', cleanup);
    this.events.once('destroy', cleanup);
    this.buildRail();
  }

  update(): void {
    const modalOpen = this.modal.isOpen();
    const justClosed = this.modalWasOpen && !modalOpen;
    this.modalWasOpen = modalOpen;
    if (modalOpen) return;
    if (this.growing) return;
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

    if (onGround) {
      this.coyoteCounter = COYOTE_FRAMES;
      this.airComboCount = 0;
    }
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
      this.metricsEl.textContent = `score ${this.score.toLocaleString()} | tier ${this.currentTier}`;
    }

    if (this.hero.y > LEVEL_H + 64) {
      this.hero.setPosition(2 * TILE, this.groundY - 32);
      this.hero.setVelocity(0, 0);
    }

    if (!this.endTriggered && this.flagpole && Math.abs(this.hero.x - (this.flagpole.x + 8)) < 16) {
      this.endTriggered = true;
      this.hero.setVelocity(0, 0);
      this.hero.setAcceleration(0, 0);
      this.zoneLabelEl.textContent = 'YOU MADE IT!';
      this.zoneLabelEl.classList.remove('z-flash');
      void this.zoneLabelEl.offsetWidth;
      this.zoneLabelEl.classList.add('z-flash');
      this.cameras.main.flash(400, 255, 215, 0);
      this.tweens.add({
        targets: this.flag,
        y: this.flagpole.y + 128,
        duration: 900,
        ease: 'Cubic.In'
      });
      this.tweens.add({
        targets: this.signText,
        alpha: 1,
        duration: 600,
        delay: 800,
        ease: 'Cubic.Out'
      });
      this.fireworks();
      this.time.delayedCall(4800, () => this.endCard.show(this.milestonesHit, 14, this.score));
    }
  }

  private buildRail(): void {
    const el = document.getElementById('tracker-rail');
    if (!el) return;
    el.textContent = '';
    PLACEMENTS.forEach(p => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.mid = p.id;
      el.appendChild(slot);
    });
  }

  private collectMilestone(id: string): void {
    const el = document.getElementById('tracker-rail');
    if (!el) return;
    const slot = el.querySelector<HTMLDivElement>(`.slot[data-mid="${id}"]`);
    if (!slot || slot.classList.contains('filled')) return;
    const img = document.createElement('img');
    img.src = glyphDataUri(id);
    img.alt = ALL_MILESTONES[id]?.company ?? '';
    slot.appendChild(img);
    slot.classList.add('filled');
    slot.classList.remove('pop');
    void slot.offsetWidth;
    slot.classList.add('pop');
  }

  private showFanfare(text: string): void {
    const existing = document.getElementById('fanfare');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 'fanfare';
    const t = document.createElement('div');
    t.className = 'fan-text';
    t.textContent = text;
    el.appendChild(t);
    document.body.appendChild(el);
    this.time.delayedCall(1800, () => el.remove());
  }

  private fireworks(): void {
    const cam = this.cameras.main;
    const colors = ['#ffd700', '#ff8888', '#88ddff', '#ff77ff', '#88ff88'];
    for (let i = 0; i < 24; i++) {
      this.time.delayedCall(i * 50, () => {
        const fx = cam.scrollX + Phaser.Math.Between(40, cam.width - 40);
        const fy = cam.scrollY + Phaser.Math.Between(40, cam.height / 2);
        const c = colors[i % colors.length];
        for (let j = 0; j < 8; j++) {
          const angle = (j / 8) * Math.PI * 2;
          const t = this.add.text(fx, fy, '*', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: c,
            stroke: '#000000',
            strokeThickness: 2
          }).setOrigin(0.5).setDepth(900);
          this.tweens.add({
            targets: t,
            x: fx + Math.cos(angle) * 40,
            y: fy + Math.sin(angle) * 40,
            alpha: 0,
            duration: 700,
            ease: 'Cubic.Out',
            onComplete: () => t.destroy()
          });
        }
      });
    }
  }

  private buildPipe(tx: number, heightTiles: number, groundY: number): void {
    // Pipe textures are 32px (2 tiles) wide. Body stacks up from the surface,
    // capped by the wider top. Static body spans the whole pipe.
    const cx = tx * TILE + TILE;
    for (let r = 0; r < heightTiles; r++) {
      const seg = this.ground.create(cx, groundY - TILE / 2 - r * TILE, 'pipe_body') as Phaser.Physics.Arcade.Image;
      seg.refreshBody();
    }
    const top = this.ground.create(cx, groundY - TILE / 2 - heightTiles * TILE, 'pipe_top') as Phaser.Physics.Arcade.Image;
    top.refreshBody();
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

    // Hills sit on the horizon in open-sky gaps between foreground clusters.
    // Kept short (tops stay below the lowest brick platform) so they never
    // rise into the q-block / platform band and read as blocking it. Anchored
    // at world-tile x; parallax 0.45 still gives depth without large drift.
    const groundTop = LEVEL_H - TILE * 3;
    const hillSpots: Array<[number, number]> = [
      // [tileX, scale] — placed in clear stretches, away from pipes/mesas
      [5, 1.6], [15, 1.1], [38, 1.5], [52, 1.0],
      [68, 1.6], [82, 1.1], [104, 1.5], [116, 1.0],
      [134, 1.6], [148, 1.1], [172, 1.5], [182, 1.1]
    ];
    hillSpots.forEach(([tileX, scale]) => {
      const x = tileX * TILE;
      const y = groundTop - (16 * scale);
      const h = this.add.image(x, y, 'hill').setOrigin(0, 0).setScrollFactor(0.45).setDepth(-80);
      h.setScale(scale);
      this.hills.push(h);
    });

    cam.setBackgroundColor(TIER_BG['drive-by']);
  }

  private updateTier(): void {
    const tx = Math.floor(this.hero.x / TILE);
    let tier: 'drive-by' | 'mid' | 'climax' = 'drive-by';
    let label = 'EARLY CAREER';
    if (tx >= 100) {
      tier = 'climax';
      label = 'PRODUCT WORLD';
    } else if (tx >= 55) {
      tier = 'mid';
      label = 'OPERATIONS WORLD';
    }

    if (tier === this.currentTier) return;
    const grew = this.currentTier !== '' && TIER_HERO_SCALE[tier] > TIER_HERO_SCALE[this.currentTier];
    const isFirst = this.currentTier === '';
    this.currentTier = tier;
    this.cameras.main.setBackgroundColor(TIER_BG[tier]);
    this.zoneLabelEl.textContent = label;
    this.zoneLabelEl.classList.remove('z-flash');
    void this.zoneLabelEl.offsetWidth;
    this.zoneLabelEl.classList.add('z-flash');
    if (!isFirst) this.showFanfare(`WORLD: ${label}`);

    const targetScale = TIER_HERO_SCALE[tier];
    if (grew) {
      this.growing = true;
      const footY = (this.hero.body as Phaser.Physics.Arcade.Body).bottom;
      this.hero.setVelocity(0, 0);
      this.hero.setAcceleration(0, 0);
      this.physics.world.pause();
      this.slimes.getChildren().forEach(s => (s as Phaser.Physics.Arcade.Sprite).anims?.pause());
      this.tweens.add({
        targets: this.hero,
        scale: targetScale * 1.15,
        duration: 200,
        yoyo: true,
        ease: 'Cubic.Out',
        onComplete: () => {
          this.hero.setScale(targetScale);
          const body = this.hero.body as Phaser.Physics.Arcade.Body;
          body.setSize(16, 28).setOffset(4, 3);
          // Sync the body to the new scale/position BEFORE measuring — Arcade
          // caches scale and setSize() uses the stale value until this runs.
          body.updateFromGameObject();
          // Re-anchor so the taller body keeps its feet on the same ground
          // line — otherwise center-origin growth buries the hero.
          this.hero.y += footY - body.bottom;
          body.updateFromGameObject();
          this.physics.world.resume();
          this.slimes.getChildren().forEach(s => (s as Phaser.Physics.Arcade.Sprite).anims?.resume());
          this.growing = false;
        }
      });
      this.popText('LEVEL UP!', this.hero.x, this.hero.y - 30, '#ffd700');
      this.cameras.main.flash(250, 255, 215, 0);
    } else {
      this.hero.setScale(targetScale);
      this.hero.body!.setSize(16, 28).setOffset(4, 3);
    }
  }

  private handleSlime(slime: Phaser.Physics.Arcade.Sprite): void {
    if (!slime.active) return;
    const heroBody = this.hero.body as Phaser.Physics.Arcade.Body;
    const slimeBody = slime.body as Phaser.Physics.Arcade.Body;
    const stomp = heroBody.velocity.y > 60 && this.hero.y < slime.y - 4;
    if (stomp) {
      slime.disableBody(true, true);
      this.hero.setVelocityY(-260);
      this.airComboCount++;
      const bonus = this.airComboCount === 1 ? 100 : this.airComboCount === 2 ? 200 : this.airComboCount === 3 ? 400 : 800;
      this.score += bonus;
      const label = this.airComboCount === 1 ? `+${bonus}` : this.airComboCount === 2 ? `DOUBLE +${bonus}` : this.airComboCount === 3 ? `TRIPLE +${bonus}` : `MEGA +${bonus}`;
      const color = this.airComboCount >= 3 ? '#ff77ff' : this.airComboCount === 2 ? '#88ddff' : '#ffd700';
      this.popText(label, slime.x, slime.y - 10, color);
      this.cameras.main.shake(60 + this.airComboCount * 30, 0.003 + this.airComboCount * 0.001);
    } else {
      this.hero.setPosition(2 * TILE, this.groundY - 32);
      this.hero.setVelocity(0, 0);
      this.airComboCount = 0;
      this.popText('OUCH', this.hero.x, this.hero.y - 12, '#ff5555');
      this.cameras.main.flash(200, 255, 60, 60);
      slimeBody.velocity.x = -30;
    }
  }

  private popText(text: string, x: number, y: number, color: string): void {
    const t = this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color,
      stroke: '#000000',
      strokeThickness: 2,
      resolution: 2
    }).setOrigin(0.5).setDepth(800);
    this.tweens.add({
      targets: t,
      y: y - 28,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.Out',
      onComplete: () => t.destroy()
    });
  }

  private hitMilestone(block: Phaser.Physics.Arcade.Sprite): void {
    const body = this.hero.body as Phaser.Physics.Arcade.Body;
    if (!block.getData('isMilestone') || !body.touching.up) return;
    const id = block.getData('milestoneId') as keyof typeof ALL_MILESTONES;
    block.setTexture('used_block');
    block.setData('isMilestone', false);
    block.clearTint();
    this.milestonesHit++;
    this.score += 200;

    this.tweens.add({ targets: block, y: block.y - 4, duration: 80, yoyo: true });

    const heroH = this.hero.displayHeight;
    const arcLift = 40 + heroH * 0.9;
    for (let i = 0; i < 6; i++) {
      const coin = this.add.image(block.x, block.y - 4, 'coin').setDepth(700);
      const angle = -Math.PI / 2 + (i - 2.5) * 0.35;
      const dx = Math.cos(angle) * 60;
      this.tweens.add({
        targets: coin,
        x: block.x + dx,
        y: block.y - arcLift + Math.abs(dx) * 0.3,
        alpha: 0,
        scale: 0.5,
        duration: 600,
        delay: i * 30,
        ease: 'Cubic.Out',
        onComplete: () => coin.destroy()
      });
    }
    this.popText('+200', block.x, block.y - 8, '#ffd700');
    this.cameras.main.shake(80, 0.003);

    const milestone = ALL_MILESTONES[id];
    this.time.delayedCall(280, () => {
      this.modal.show(milestone, () => this.collectMilestone(id));
    });
  }
}
