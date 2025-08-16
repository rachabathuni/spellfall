import { Config } from './config.js';
import { Renderer } from './render.js';
import { nextLetter } from './spawn.js';
import { scoreWord } from './scoring.js';
import { VOWELS } from './letters.js';

export class Game {
  constructor(c) {
    this.canvas = c;
    this.renderer = new Renderer(c);
    this.reset();
  }

  reset() {
    this.state = 'Start';
    this.letters = [];
    this.score = 0;
    this.timeLeft = Config.STARTING_TIME_SEC;
    this.assembly = '';
    this.columnWidth = Config.CANVAS_WIDTH / Config.COLUMNS;
    this.spawnAcc = 0;
  }

  start(d) {
    this.dictionary = d;
    this.state = 'Playing';
    if (this.onStateChange) this.onStateChange(this.state);
    this.timeLeft = Config.STARTING_TIME_SEC;
    this.last = performance.now();
    requestAnimationFrame(this.tick.bind(this));
  }

  onLetter(ch) {
    if (this.state !== 'Playing') return;
    this.assembly += ch;
  }

  onBackspace() {
    this.assembly = this.assembly.slice(0, -1);
  }

  onSubmit() {
    if (this.assembly.length < 3 || !this.dictionary.has(this.assembly)) {
      this.assembly = '';
      return;
    }
    if (!this.canBuild(this.assembly)) {
      this.assembly = '';
      return;
    }
    this.consume(this.assembly);
    this.score += scoreWord(this.assembly);
    this.timeLeft = Config.TURN_TIME_SEC;
    this.assembly = '';
  }

  canBuild(w) {
    const counts = {};
    for (const L of this.letters) {
      counts[L.ch] = (counts[L.ch] || 0) + 1;
    }
    for (const ch of w) {
      if (VOWELS.has(ch)) continue;
      if ((counts[ch] || 0) <= 0) return false;
      counts[ch]--;
    }
    return true;
  }

  consume(w) {
    const need = {};
    for (const ch of w) {
      if (VOWELS.has(ch)) continue;
      need[ch] = (need[ch] || 0) + 1;
    }
    this.letters = this.letters.filter(L => {
      if (need[L.ch] > 0) {
        need[L.ch]--;
        return false;
      }
      return true;
    });
  }

  tick(now) {
    const dt = (now - this.last) / 1000;
    this.last = now;
    if (this.state === 'Playing') {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.state = 'GameOver';
        if (this.onStateChange) this.onStateChange(this.state);
        return;
      }
      this.spawnAcc += dt * Config.SPAWN_RATE_PER_SEC;
      while (this.spawnAcc >= 1) {
        this.spawnLetter();
        this.spawnAcc -= 1;
      }
      const speed = Config.CANVAS_HEIGHT / (Config.LETTER_TRAVEL_TIME_MS / 1000);
      for (const L of this.letters) {
        L.y += speed * dt;
      }
      this.letters = this.letters.filter(L => L.y < Config.CANVAS_HEIGHT + 30);
      this.render();
      if (this.onRenderHUD) {
        this.onRenderHUD({
          score: this.score,
          timeLeft: this.timeLeft,
          assemblyText: this.assembly,
          assemblyFlash: null
        });
      }
    }
    requestAnimationFrame(this.tick.bind(this));
  }

  render() {
    this.renderer.clear();
    this.renderer.drawLetters(this.letters, this.columnWidth);
  }

  spawnLetter() {
    const col = Math.floor(Math.random() * Config.COLUMNS);
    const ch = nextLetter();
    this.letters.push({ ch, column: col, y: -20 });
  }
}

