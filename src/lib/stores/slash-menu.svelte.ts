import { SLASH_COMMANDS, type SlashCommand } from '$lib/tiptap/commands';

class SlashMenuStore {
  visible = $state(false);
  query = $state('');
  x = $state(0);
  y = $state(0);
  selectedIndex = $state(0);
  // Internal: the suggestion's command callback
  private _command: ((item: SlashCommand) => void) | null = null;

  get items(): SlashCommand[] {
    if (!this.query) return SLASH_COMMANDS;
    const q = this.query.toLowerCase();
    return SLASH_COMMANDS.filter(
      (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }

  open(props: { query: string; command: (item: SlashCommand) => void; clientRect: (() => DOMRect | null) | null }) {
    this.visible = true;
    this.query = props.query;
    this._command = props.command;
    this.selectedIndex = 0;
    this._updatePos(props.clientRect);
  }

  update(props: { query: string; command: (item: SlashCommand) => void; clientRect: (() => DOMRect | null) | null }) {
    this.query = props.query;
    this._command = props.command;
    this.selectedIndex = 0;
    this._updatePos(props.clientRect);
  }

  private _updatePos(clientRect: (() => DOMRect | null) | null) {
    if (!clientRect) return;
    const rect = clientRect();
    if (!rect) return;
    // Position below the caret, clamp to viewport
    const margin = 8;
    const menuH = 300;
    const viewH = window.innerHeight;
    const top = rect.bottom + margin + menuH > viewH ? rect.top - menuH - margin : rect.bottom + margin;
    this.x = Math.max(margin, Math.min(rect.left, window.innerWidth - 240 - margin));
    this.y = top;
  }

  select(item: SlashCommand) {
    this._command?.(item);
    this.close();
  }

  handleKey(event: KeyboardEvent): boolean {
    if (!this.visible) return false;
    const items = this.items;
    if (event.key === 'ArrowDown') {
      this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
      return true;
    }
    if (event.key === 'ArrowUp') {
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      return true;
    }
    if (event.key === 'Enter') {
      const item = items[this.selectedIndex];
      if (item) this.select(item);
      return true;
    }
    return false;
  }

  close() {
    this.visible = false;
    this.query = '';
    this.selectedIndex = 0;
    this._command = null;
  }
}

export const slashMenuStore = new SlashMenuStore();
