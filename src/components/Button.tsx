import React from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'secondary';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantCls: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-content-inverse hover:bg-primary-hover border border-transparent focus-visible:ring-primary',
  ghost:
    'bg-transparent text-primary hover:bg-primary-light border border-primary focus-visible:ring-primary',
  danger:
    'bg-danger text-content-inverse hover:bg-red-700 border border-transparent focus-visible:ring-danger',
  secondary:
    'bg-surface text-content-secondary hover:bg-surface-overlay border border-edge focus-visible:ring-primary',
};

const sizeCls: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
  md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
  lg: 'px-5 py-2.5 text-base gap-2 min-h-[48px]',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className = '',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={[
          'inline-flex items-center justify-center rounded-lg font-semibold',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          variantCls[variant],
          sizeCls[size],
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {loading ? (
          <span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0"
            aria-hidden="true"
          />
        ) : (
          leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
