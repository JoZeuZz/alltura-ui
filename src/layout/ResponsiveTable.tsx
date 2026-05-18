import React, { useEffect, useRef, useState } from 'react';

export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface KebabAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'primary';
}

export interface ResponsiveTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  caption?: string;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string;
  getRowKey?: (row: T, index: number) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  mobileKebab?: (row: T, index: number) => KebabAction[];
}

export function ResponsiveTable<T = any>({
  columns,
  data,
  caption,
  className = '',
  onRowClick,
  rowClassName,
  getRowKey,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  mobileKebab,
}: ResponsiveTableProps<T>) {
  const [openKebabIndex, setOpenKebabIndex] = useState<number | null>(null);
  const kebabCellRefs = useRef(new Map<number, HTMLTableCellElement>());

  useEffect(() => {
    if (openKebabIndex === null) return;
    const handleMouseDown = (e: MouseEvent) => {
      const cell = kebabCellRefs.current.get(openKebabIndex);
      if (cell && !cell.contains(e.target as Node)) {
        setOpenKebabIndex(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenKebabIndex(null);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openKebabIndex]);

  const getCellValue = (row: T, key: string | keyof T): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj: any, k) => obj?.[k], row);
    }
    return (row as any)[key];
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right':  return 'text-right';
      default:       return 'text-left';
    }
  };

  const getVisibilityClass = (column: TableColumn<T>) => {
    if (column.hideOnMobile)  return 'hidden md:table-cell';
    if (column.hideOnTablet)  return 'hidden lg:table-cell';
    return '';
  };

  const kebabVariantCls = (variant?: KebabAction['variant']) => {
    switch (variant) {
      case 'danger':  return 'text-danger hover:bg-danger-subtle';
      case 'primary': return 'text-primary hover:bg-primary-light';
      default:        return 'text-content-secondary hover:bg-surface-overlay';
    }
  };

  const totalCols = columns.length + (mobileKebab ? 1 : 0);

  return (
    <div className={`bg-surface shadow-card rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full leading-normal">
          {caption && <caption className="sr-only">{caption}</caption>}

          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={`header-${index}`}
                  scope="col"
                  className={`px-5 py-3 border-b-2 border-edge bg-surface-muted text-xs font-semibold text-content-muted uppercase tracking-wider ${getAlignClass(column.align)} ${getVisibilityClass(column)} ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
              {mobileKebab && (
                <th
                  scope="col"
                  className="md:hidden px-2 py-3 border-b-2 border-edge bg-surface-muted w-12"
                  aria-label="Acciones"
                />
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={totalCols} className="px-5 py-10 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <span className="ml-3 text-content-secondary">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="px-5 py-10 text-center text-content-secondary">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const key = getRowKey ? getRowKey(row, rowIndex) : rowIndex;
                const additionalRowClass = rowClassName ? rowClassName(row, rowIndex) : '';
                const isClickable = !!onRowClick;
                const isOpen = openKebabIndex === rowIndex;

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    className={`${additionalRowClass} ${isClickable ? 'cursor-pointer hover:bg-surface-muted transition-colors' : ''}`}
                  >
                    {columns.map((column, colIndex) => {
                      const cellValue = getCellValue(row, column.key);
                      const content = column.render
                        ? column.render(cellValue, row, rowIndex)
                        : cellValue;
                      return (
                        <td
                          key={`cell-${rowIndex}-${colIndex}`}
                          className={`px-5 py-5 border-b border-edge bg-surface text-sm ${getAlignClass(column.align)} ${getVisibilityClass(column)} ${column.className || ''}`}
                        >
                          {content}
                        </td>
                      );
                    })}

                    {mobileKebab && (
                      <td
                        ref={(el) => {
                          if (el) kebabCellRefs.current.set(rowIndex, el);
                          else kebabCellRefs.current.delete(rowIndex);
                        }}
                        className="md:hidden px-2 py-3 border-b border-edge bg-surface relative"
                        style={{ width: 48 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          aria-label="Opciones"
                          aria-expanded={isOpen}
                          aria-haspopup="menu"
                          onClick={() => setOpenKebabIndex(isOpen ? null : rowIndex)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-overlay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <circle cx="10" cy="4" r="1.5" />
                            <circle cx="10" cy="10" r="1.5" />
                            <circle cx="10" cy="16" r="1.5" />
                          </svg>
                        </button>

                        {isOpen && (
                          <div
                            role="menu"
                            aria-label="Opciones de fila"
                            className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-surface rounded-xl shadow-dropdown border border-edge py-1"
                          >
                            {mobileKebab(row, rowIndex).map((action, actionIdx) => (
                              <button
                                key={actionIdx}
                                role="menuitem"
                                onClick={() => { action.onClick(); setOpenKebabIndex(null); }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:bg-surface-overlay min-h-[44px] flex items-center ${kebabVariantCls(action.variant)}`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResponsiveTable;
