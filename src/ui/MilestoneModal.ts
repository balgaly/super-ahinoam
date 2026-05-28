import Phaser from 'phaser';
import type { Milestone } from '../milestones';

export class MilestoneModal {
  private scene: Phaser.Scene;
  private el: HTMLDivElement | null = null;
  private dismissCallback: (() => void) | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(milestone: Milestone, onDismiss: () => void): void {
    if (this.el) return;
    this.dismissCallback = onDismiss;
    this.scene.physics.world.pause();

    const tierColor = milestone.tier === 'climax' ? '#ff8888' : milestone.tier === 'mid' ? '#ffd56b' : '#ffffff';
    const tierLabel = milestone.tier === 'climax' ? 'CLIMAX' : milestone.tier === 'mid' ? 'MID' : 'EARLY';

    const el = document.createElement('div');
    el.id = 'milestone-modal';

    const backdrop = document.createElement('div');
    backdrop.className = 'm-backdrop';

    const card = document.createElement('div');
    card.className = 'm-card';

    const tier = document.createElement('div');
    tier.className = 'm-tier';
    tier.style.color = tierColor;
    tier.textContent = tierLabel;

    const company = document.createElement('div');
    company.className = 'm-company';
    company.textContent = milestone.company;

    const role = document.createElement('div');
    role.className = 'm-role';
    role.textContent = milestone.role;

    const dates = document.createElement('div');
    dates.className = 'm-dates';
    dates.textContent = milestone.dates;

    const divider = document.createElement('div');
    divider.className = 'm-divider';

    const metric = document.createElement('div');
    metric.className = 'm-metric';
    metric.textContent = milestone.metric;

    const detail = document.createElement('div');
    detail.className = 'm-detail';
    detail.textContent = milestone.detail;

    const hint = document.createElement('div');
    hint.className = 'm-hint';
    hint.textContent = '[ SPACE ] CONTINUE';

    card.append(tier, company, role, dates, divider, metric, detail, hint);
    el.append(backdrop, card);
    document.body.appendChild(el);
    this.el = el;

    this.keyHandler = (e: KeyboardEvent): void => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.dismiss();
      }
    };
    window.addEventListener('keydown', this.keyHandler, true);
    el.addEventListener('click', () => this.dismiss());
  }

  private dismiss(): void {
    if (!this.el) return;
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler, true);
      this.keyHandler = null;
    }
    this.el.remove();
    this.el = null;
    this.scene.physics.world.resume();
    const cb = this.dismissCallback;
    this.dismissCallback = null;
    if (cb) cb();
  }

  isOpen(): boolean {
    return this.el !== null;
  }
}
