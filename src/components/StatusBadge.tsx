import React from 'react';

export type StatusVariant =
  | 'active'      // verde — asignado y vigente
  | 'inactive'    // gris — dado de baja / sin asignar
  | 'pending'     // azul — en proceso
  | 'expiring'    // ámbar — próximo a vencer
  | 'expired'     // rojo — vencido
  | 'in-stock';   // info — disponible en bodega

export interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const config: Record<StatusVariant, { dot: string; badge: string; defaultLabel: string }> = {
  active: {
    dot:   'bg-success',
    badge: 'bg-success-subtle text-success-text border border-success-border',
    defaultLabel: 'Activo',
  },
  inactive: {
    dot:   'bg-content-disabled',
    badge: 'bg-surface-overlay text-content-muted border border-edge',
    defaultLabel: 'Inactivo',
  },
  pending: {
    dot:   'bg-primary',
    badge: 'bg-primary-light text-primary border border-primary/30',
    defaultLabel: 'Pendiente',
  },
  expiring: {
    dot:   'bg-warning',
    badge: 'bg-warning-subtle text-warning-text border border-warning-border',
    defaultLabel: 'Por vencer',
  },
  expired: {
    dot:   'bg-danger',
    badge: 'bg-danger-subtle text-danger-text border border-danger-border',
    defaultLabel: 'Vencido',
  },
  'in-stock': {
    dot:   'bg-info',
    badge: 'bg-info-subtle text-info-text border border-info-border',
    defaultLabel: 'En bodega',
  },
};

const sizeCls = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-0.5 gap-1.5',
};

const dotSizeCls = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

export default function StatusBadge({
  variant,
  label,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const { dot, badge, defaultLabel } = config[variant];
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-semibold',
        badge,
        sizeCls[size],
        className,
      ].join(' ')}
    >
      <span className={['rounded-full flex-shrink-0', dot, dotSizeCls[size]].join(' ')} aria-hidden="true" />
      {label ?? defaultLabel}
    </span>
  );
}
