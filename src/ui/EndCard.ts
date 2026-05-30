import Phaser from 'phaser';

export class EndCard {
  private scene: Phaser.Scene;
  private el: HTMLDivElement | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(milestonesHit: number, total: number, score: number): void {
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

    const scoreLine = document.createElement('div');
    scoreLine.className = 'e-score';
    scoreLine.textContent = `SCORE  ${score.toLocaleString()}`;

    const stats = document.createElement('div');
    stats.className = 'e-stats';
    stats.textContent = `${milestonesHit}/${total} MILESTONES UNLOCKED`;

    const arc = document.createElement('div');
    arc.className = 'e-arc';
    arc.textContent = 'EARLY CAREER → OPERATIONS → PRODUCT';

    const detail = document.createElement('div');
    detail.className = 'e-detail';
    detail.textContent = 'Product Manager focused on fraud, risk, and trust. Reduced support ticket volume ~50%, processed ~2.5k weekly investigations, shipped fake-accounts detection module, freed ~10 hr/week, trained 7+ teammates. Critical thinker, data-driven, ships fast.';

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
    cv.textContent = 'DOWNLOAD CV';
    links.append(linkedin, mail, cv);

    const restart = document.createElement('button');
    restart.className = 'e-restart';
    restart.textContent = '[ SPACE ] PLAY AGAIN';
    restart.addEventListener('click', () => this.restart());

    const credits = document.createElement('div');
    credits.className = 'e-credits';
    const creditsTitle = document.createElement('div');
    creditsTitle.className = 'e-credits-title';
    creditsTitle.textContent = '★ CREDITS ★';
    const creditsBody = document.createElement('div');
    creditsBody.className = 'e-credits-body';
    const inspiredBy = document.createElement('span');
    inspiredBy.textContent = 'Inspired by ';
    const repoLink = document.createElement('a');
    repoLink.href = 'https://github.com/golansoffer/interactive-resume';
    repoLink.target = '_blank';
    repoLink.rel = 'noopener';
    repoLink.textContent = 'interactive-resume';
    const byPart = document.createElement('span');
    byPart.textContent = ' by ';
    const authorLink = document.createElement('a');
    authorLink.href = 'https://github.com/golansoffer';
    authorLink.target = '_blank';
    authorLink.rel = 'noopener';
    authorLink.textContent = 'Golan Soffer';
    const tail = document.createElement('span');
    tail.textContent = ' — the original career-as-game pioneer whose vision lit the path.';
    creditsBody.append(inspiredBy, repoLink, byPart, authorLink, tail);
    credits.append(creditsTitle, creditsBody);

    card.append(headline, sub, scoreLine, stats, arc, detail, links, restart, credits);
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
