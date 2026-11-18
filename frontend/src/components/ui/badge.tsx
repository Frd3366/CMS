import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-[#111111] text-[#F9C900] dark:bg-white dark:text-[#111111]',
  secondary: 'border-transparent bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200',
  destructive: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-300',
  outline: 'border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'border-[#FFEE85] bg-[#FFFBEA] text-[#8C6700] dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300'
};

export function badgeVariants(options?: { variant?: BadgeVariant; className?: string }): string {
  const variant = options?.variant ?? 'default';
  return cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors',
    BADGE_VARIANTS[variant],
    options?.className
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}
