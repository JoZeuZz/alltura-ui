import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useTour } from '../hooks/useTour';
import { TourProvider } from './TourContext';
import type { TourStep } from '../utils/tourSteps';

const contextual: Record<string, TourStep[]> = {
  admin: [
    { id: 'a-dash', role: 'admin', route: '/dashboard', selector: '[data-x]', title: 'T', body: 'B' },
    { id: 'a-prof', role: 'admin', route: '/profile', selector: '[data-y]', title: 'T2', body: 'B2' },
  ],
};

const Probe: React.FC = () => {
  const { startContextualForRoute, isActive, steps, mode } = useTour();
  return (
    <div>
      <button onClick={() => { (window as any).__r = startContextualForRoute('admin', '/dashboard'); }}>dash</button>
      <button onClick={() => { (window as any).__r = startContextualForRoute('admin', '/unknown'); }}>unknown</button>
      <span data-testid="active">{String(isActive)}</span>
      <span data-testid="count">{steps.length}</span>
      <span data-testid="mode">{mode}</span>
    </div>
  );
};

describe('startContextualForRoute', () => {
  it('activates only steps matching the route', () => {
    render(
      <MemoryRouter>
        <TourProvider steps={{}} contextualSteps={contextual} version="test">
          <Probe />
        </TourProvider>
      </MemoryRouter>
    );
    act(() => { screen.getByText('dash').click(); });
    expect((window as any).__r).toBe(true);
    expect(screen.getByTestId('active').textContent).toBe('true');
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('mode').textContent).toBe('contextual');
  });

  it('returns false and stays inactive when no step matches', () => {
    render(
      <MemoryRouter>
        <TourProvider steps={{}} contextualSteps={contextual} version="test">
          <Probe />
        </TourProvider>
      </MemoryRouter>
    );
    act(() => { screen.getByText('unknown').click(); });
    expect((window as any).__r).toBe(false);
    expect(screen.getByTestId('active').textContent).toBe('false');
  });
});
