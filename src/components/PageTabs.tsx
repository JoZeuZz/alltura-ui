import React from 'react';

export interface PageTab<T extends string = string> {
  key: T;
  label: string;
}

export interface PageTabsProps<T extends string = string> {
  tabs: ReadonlyArray<PageTab<T>>;
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
}

export default function PageTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: PageTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={['flex border-b border-edge', className].join(' ')}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={[
              'px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-content-muted hover:text-content-primary',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
