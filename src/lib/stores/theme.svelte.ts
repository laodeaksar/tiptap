class ThemeStore {
  dark = $state(false);

  init() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    this.dark =
      saved === 'dark' ||
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this._apply();
  }

  toggle() {
    this.dark = !this.dark;
    localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    this._apply();
  }

  private _apply() {
    if (this.dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export const themeStore = new ThemeStore();
