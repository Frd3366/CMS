import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'brand';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default: 'bg-[#111111] text-[#F9C900] hover:bg-black dark:bg-white dark:text-[#111111] dark:hover:bg-slate-100 shadow-2xs',
  brand: 'bg-[#F9C900] text-[#111111] border border-[#E5B800] hover:bg-[#E5B800] shadow-2xs',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs',
  outline: 'border border-slate-200 dark:border-white/10 bg-white dark:bg-[#18181A] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
  ghost: 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white',
  link: 'text-slate-900 dark:text-[#F9C900] underline-offset-4 hover:underline'
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: 'h-9 px-4 py-2 text-xs',
  sm: 'h-8 rounded-lg px-3 text-xs',
  lg: 'h-10 rounded-xl px-6 text-sm',
  icon: 'h-9 w-9'
};

export function buttonVariants(options?: { variant?: ButtonVariant; size?: ButtonSize; className?: string }): string {
  const variant = options?.variant ?? 'default';
  const size = options?.size ?? 'default';
  return cn(
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-bold transition-colors disabled:pointer-events-none disabled:opacity-50',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    options?.className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        type={type}
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
