import React, { useEffect, useRef, useState } from 'react';

/**
 * Defines a single column in a `ResponsiveTable`.
 * @template T - The row data type.
 */
export interface TableColumn<T = any> {
  /** Property key on the row object. Supports dot notation for nested properties (e.g. `"address.city"`). */
  key: keyof T | string;
  /** Column header label displayed in `<th>`. */
  header: string;
  /** Custom render function. Receives the cell value, full row, and row index. */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Additional CSS classes applied to both `<th>` and `<td>`. */
  className?: string;
  /** Hide this column on mobile (`< md`). Shows on `md+`. */
  hideOnMobile?: boolean;
  /** Hide this column on tablet (`< lg`). Shows on `lg+`. */
  hideOnTablet?: boolean;
  /** Text alignment for the column. Defaults to `left`. */
  align?: 'left' | 'center' | 'right';
}

/** Represents a single action item in the mobile kebab (⋮) dropdown menu. */
export interface KebabAction {
  /** Display label shown in the dropdown. */
  label: string;
  /** Callback fired when the action is tapped. The dropdown closes automatically. */
  onClick: () => void;
  /** Visual style variant for the item. Defaults to `'default'`. */
  variant?: 'default' | 'danger' | 'primary';
}

/**
 * Props for `ResponsiveTable`.
 * @template T - The row data type.
 *
 * @example
 * ```tsx
 * <ResponsiveTable
 *   columns={[
 *     { key: 'name', header: 'Nombre' },
 *     { key: 'status', header: 'Estado', hideOnMobile: true },
 *     { key: 'actions', header: 'Acciones', hideOnMobile: true, render: (_, row) => <button>Editar</button> },
 *   ]}
 *   data={workers}
 *   mobileKebab={(row) => [
 *     { label: 'Editar', onClick: () => handleEdit(row) },
 *     { label: 'Eliminar', onClick: () => handleDelete(row), variant: 'danger' },
 *   ]}
 * />
 * ```
 */
export interface ResponsiveTableProps<T = any> {
  /** Column definitions. */
  columns: TableColumn<T>[];
  /** Row data array. */
  data: T[];
  /** Accessible caption read by screen readers (rendered as `sr-only`). */
  caption?: string;
  /** Additional CSS classes applied to the outer container. */
  className?: string;
  /** Callback fired when a row is clicked. Makes rows appear clickable. */
  onRowClick?: (row: T, index: number) => void;
  /** Returns additional CSS classes for a given row. */
  rowClassName?: (row: T, index: number) => string;
  /** Returns a stable React key for a given row. Defaults to row index. */
  getRowKey?: (row: T, index: number) => string | number;
  /** Show a loading spinner overlay instead of data. */
  loading?: boolean;
  /** Message shown when `data` is empty. */
  emptyMessage?: string;
  /**
   * When provided, renders a ⋮ kebab button on mobile (`< md`) at the end of each row.
   * Clicking the button opens a dropdown with the returned actions.
   * Hidden on `md+` — desktop shows the normal action columns instead.
   *
   * @param row - The row data object.
   * @param index - The row index.
   */
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

  useEffect(() => { setOpenKebabIndex(null); }, [data]);

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
                        className="md:hidden px-2 py-3 border-b border-edge bg-surface relative w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          aria-label={`Opciones de fila ${rowIndex + 1}`}
                          aria-expanded={isOpen}
                          aria-haspopup="menu"
                          onClick={() => setOpenKebabIndex(isOpen ? null : rowIndex)}
                          className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-overlay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
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
                                key={action.label ?? actionIdx}
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
