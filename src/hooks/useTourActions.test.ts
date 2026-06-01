import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTourActions } from './useTourActions';
import * as useTourModule from './useTour';

const mockUseTour = (currentDemoAction: string | null) => {
  vi.spyOn(useTourModule, 'useTour').mockReturnValue({
    isActive: currentDemoAction !== null,
    role: 'admin',
    steps: [],
    stepIndex: 0,
    mode: 'contextual',
    currentDemoAction,
    startOnboarding: vi.fn(),
    startContextual: vi.fn(),
    stop: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
    goTo: vi.fn(),
    restart: vi.fn(),
  });
};

describe('useTourActions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls matching handler when currentDemoAction matches', () => {
    const handler = vi.fn();
    mockUseTour('switch-tab:inventario');
    renderHook(() => useTourActions({ 'switch-tab:inventario': handler }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not call handler when currentDemoAction is null', () => {
    const handler = vi.fn();
    mockUseTour(null);
    renderHook(() => useTourActions({ 'switch-tab:inventario': handler }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not call handler when action is not in map', () => {
    const handler = vi.fn();
    mockUseTour('some-other-action');
    renderHook(() => useTourActions({ 'switch-tab:inventario': handler }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls updated handler after rerender with new map', () => {
    const firstHandler = vi.fn();
    const secondHandler = vi.fn();
    mockUseTour('my-action');
    const { rerender } = renderHook(
      ({ handler }) => useTourActions({ 'my-action': handler }),
      { initialProps: { handler: firstHandler } }
    );
    expect(firstHandler).toHaveBeenCalledOnce();

    // simulate new action on rerender
    mockUseTour('my-action-2');
    const secondMap = { 'my-action-2': secondHandler };
    rerender({ handler: secondHandler });
    // secondHandler called because currentDemoAction changed
    expect(secondHandler).toHaveBeenCalledOnce();
  });
});
