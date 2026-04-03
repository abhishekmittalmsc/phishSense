import type { BadgeState } from '../shared/types';

const BADGE_ID = 'ps-badge';

const STATUS_CONFIG = {
  loading: { label: 'Scanning...', color: '#6b7280', bg: '#374151' },
  safe: { label: 'Safe', color: '#22c55e', bg: '#14532d' },
  suspicious: { label: 'Suspicious', color: '#eab308', bg: '#422006' },
  phishing: { label: 'Phishing', color: '#ef4444', bg: '#450a0a' },
} as const;

export class BadgeInjector {
  private badge: HTMLElement | null = null;

  inject(target: HTMLElement, state: BadgeState): void {
    this.remove();

    this.badge = document.createElement('span');
    this.badge.id = BADGE_ID;
    this.applyBaseStyles(this.badge);
    this.applyState(state);

    this.badge.addEventListener('click', (e) => {
      e.stopPropagation();
      window.postMessage({ type: 'TOGGLE_SIDEPANEL' }, '*');
    });

    target.parentElement?.appendChild(this.badge);
  }

  update(state: BadgeState): void {
    if (!this.badge) return;
    this.applyState(state);
  }

  isInDOM(): boolean {
    return this.badge?.isConnected ?? false;
  }

  remove(): void {
    if (this.badge) {
      this.badge.remove();
      this.badge = null;
    }
  }

  private applyState(state: BadgeState): void {
    if (!this.badge) return;

    const config = STATUS_CONFIG[state.status];
    this.badge.style.backgroundColor = config.bg;
    this.badge.style.color = config.color;
    this.badge.style.borderColor = config.color;

    if (state.status === 'loading') {
      this.badge.textContent = config.label;
    } else {
      this.badge.textContent = `${config.label} (${state.score})`;
    }
  }

  private applyBaseStyles(el: HTMLElement): void {
    Object.assign(el.style, {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 16px',
      marginLeft: '12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '700',
      fontFamily: 'system-ui, sans-serif',
      border: '2px solid',
      cursor: 'pointer',
      verticalAlign: 'middle',
      lineHeight: '1.4',
      userSelect: 'none',
      letterSpacing: '0.3px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
    });
  }
}
