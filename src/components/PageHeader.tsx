import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  className?: string;
}

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

export default function PageHeader({
  title,
  subtitle,
  actions,
  backHref,
  onBack,
  className = '',
}: PageHeaderProps) {
  const hasBack = backHref || onBack;

  return (
    <div className={['flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between', className].join(' ')}>
      <div className="flex items-start gap-3 min-w-0">
        {hasBack && (
          <a
            href={backHref ?? '#'}
            onClick={
              onBack
                ? (e) => {
                    if (!backHref) e.preventDefault();
                    onBack();
                  }
                : undefined
            }
            className="flex-shrink-0 mt-1 inline-flex items-center justify-center w-7 h-7 rounded-md text-content-muted hover:text-content-primary hover:bg-surface-overlay transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            aria-label="Volver"
          >
            <BackIcon />
          </a>
        )}
        <div className="min-w-0">
          <h1 className="heading-4 text-content-primary truncate">{title}</h1>
          {subtitle && (
            <p className="body-small text-content-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
