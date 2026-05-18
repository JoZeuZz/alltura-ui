import React, { useRef } from 'react';
import { useElasticScroll, ElasticScrollOptions } from '../hooks/useElasticScroll';

export interface ElasticScrollAreaProps extends ElasticScrollOptions {
  children: React.ReactNode;
  className?: string;
}

export function ElasticScrollArea({
  children,
  className = '',
  maxDisplacement,
  disabled,
}: ElasticScrollAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useElasticScroll(containerRef, { maxDisplacement, disabled });

  return (
    <div ref={containerRef} className={className}>
      <div>{children}</div>
    </div>
  );
}
