export class Dictionary {
  constructor() {
    this.words = new Set(['CAT', 'DOG', 'HOUSE']);
  }

  async load(u) {
    try {
      console.log('Loading dictionary from', u);
      const r = await fetch(u);
      if (!r.ok) throw 0;
      const t = await r.text();
      for (const l of t.split(/\r?\n/)) {
        if (l.trim().length >= 3) this.words.add(l.trim().toUpperCase());
      }
      console.log('Dictionary loaded with', this.words.size, 'words');
      return true;
    } catch (e) {
      console.error('Failed to load dictionary', e);
      return false;
    }
  }

  has(w) {
    return this.words.has(w.toUpperCase());
  }
}

