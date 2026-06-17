import { describe, expect, it } from 'vitest';
import { allowTourOverlayClicks } from './Modal';

const clickOn = (el: HTMLElement) => ({ target: el } as unknown as MouseEvent);

describe('allowTourOverlayClicks', () => {
  it('allows clicks inside an element marked data-tour-overlay', () => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-tour-overlay', '');
    const button = document.createElement('button');
    overlay.appendChild(button);
    document.body.appendChild(overlay);

    expect(allowTourOverlayClicks(clickOn(button))).toBe(true);
    expect(allowTourOverlayClicks(clickOn(overlay))).toBe(true);

    document.body.removeChild(overlay);
  });

  it('blocks clicks outside the tour overlay (normal modal behavior)', () => {
    const stray = document.createElement('div');
    document.body.appendChild(stray);

    expect(allowTourOverlayClicks(clickOn(stray))).toBe(false);

    document.body.removeChild(stray);
  });

  it('returns false when target is null', () => {
    expect(allowTourOverlayClicks({ target: null } as unknown as MouseEvent)).toBe(false);
  });
});
