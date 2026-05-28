import Phaser from 'phaser';

export class EndCard {
  private scene: Phaser.Scene;
  private el: HTMLDivElement | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(milestonesHit: number, total: number): void {
    if (this.el) return;
    this.scene.physics.world.pause();

    const el = document.createElement('div');
    el.id = 'end-card';

    const backdrop = document.createElement('div');
    backdrop.className = 'e-backdrop';

    const card = document.createElement('div');
    card.className = 'e-card';

    const headline = document.createElement('div');
    headline.className = 'e-headline';
    headline.textContent = 'YOU WIN!';

    const sub = document.createElement('div');
    sub.className = 'e-sub';
    sub.textContent = 'AHINOAM BALGALY · PRODUCT MANAGER';

    const stats = document.createElement('div');
    stats.className = 'e-stats';
    stats.textContent = `${milestonesHit}/${total} MILESTONES UNLOCKED`;

    const arc = document.createElement('div');
    arc.className = 'e-arc';
    arc.textContent = 'EARLY CAREER → SE OPS → SE PRODUCT';

    const detail = document.createElement('div');
    detail.className = 'e-detail';
    detail.textContent = 'Fraud and risk PM at StreamElements. Reduced ticket volume ~50%, processed 2.5k weekly cases, shipped fake-accounts module, freed ~10hr/wk and trained 7+ teammates.';

    const links = document.createElement('div');
    links.className = 'e-links';
    const linkedin = document.createElement('a');
    linkedin.href = 'https://www.linkedin.com/in/ahinoam-balgaly/';
    linkedin.target = '_blank';
    linkedin.rel = 'noopener';
    linkedin.textContent = 'LINKEDIN';
    const mail = document.createElement('a');
    mail.href = 'mailto:ahinoam.balgaly@gmail.com';
    mail.textContent = 'EMAIL';
    const cv = document.createElement('a');
    cv.href = 'cv.pdf';
    cv.target = '_blank';
    cv.rel = 'noopener';
    cv.textContent = 'CV';
    links.append(linkedin, mail, cv);

    const restart = document.createElement('button');
    restart.className = 'e-restart';
    restart.textContent = '[ SPACE ] PLAY AGAIN';
    restart.addEventListener('click', () => this.restart());

    const credits = document.createElement('div');
    credits.className = 'e-credits';
    const creditsLine = document.createElement('span');
    creditsLine.textContent = 'INSPIRED BY ';
    const creditsLink = document.createElement('a');
    creditsLink.href = 'https://github.com/golansoffer/interactive-resume';
    creditsLink.target = '_blank';
    creditsLink.rel = 'noopener';
    creditsLink.textContent = 'GOLAN SOFFER';
    const creditsTail = document.createElement('span');
    creditsTail.textContent = " — GIANT WHOSE SHOULDERS WE STOOD ON";
    credits.append(creditsLine, creditsLink, creditsTail);

    card.append(headline, sub, stats, arc, detail, links, restart, credits);
    el.append(backdrop, card);
    document.body.appendChild(el);
    this.el = el;

    this.keyHandler = (e: KeyboardEvent): void => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.restart();
      }
    };
    window.addEventListener('keydown', this.keyHandler, true);
  }

  private restart(): void {
    if (!this.el) return;
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler, true);
      this.keyHandler = null;
    }
    this.el.remove();
    this.el = null;
    this.scene.scene.restart();
  }

  isOpen(): boolean {
    return this.el !== null;
  }
}
