import { useEffect, useRef } from 'react';
import { useTour } from './useTour';

export function useTourActions(map: Record<string, () => void>): void {
  const { currentDemoAction } = useTour();
  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    if (!currentDemoAction) return;
    const handler = mapRef.current[currentDemoAction];
    if (handler) handler();
  }, [currentDemoAction]);
}
