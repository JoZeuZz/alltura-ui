import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ElasticScrollArea } from './ElasticScrollArea';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
});

describe('ElasticScrollArea', () => {
  it('renders children inside a double-div structure (container > inner)', () => {
    const { container } = render(
      <ElasticScrollArea>
        <p>content</p>
      </ElasticScrollArea>
    );
    const outer = container.firstElementChild!;
    const inner = outer.firstElementChild!;
    expect(inner).toBeTruthy();
    expect(inner.textContent).toBe('content');
  });

  it('applies className to outer container', () => {
    const { container } = render(
      <ElasticScrollArea className="overflow-y-auto h-64">
        <p>content</p>
      </ElasticScrollArea>
    );
    expect(container.firstElementChild!.className).toBe('overflow-y-auto h-64');
  });

  it('inner div has no className', () => {
    const { container } = render(
      <ElasticScrollArea>
        <p>content</p>
      </ElasticScrollArea>
    );
    const inner = container.firstElementChild!.firstElementChild!;
    expect(inner.className).toBe('');
  });
});
