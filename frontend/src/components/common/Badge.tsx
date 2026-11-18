import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'orange' | 'gx' | 'dark';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  size = 'md',
  dot = true,
}) => {
  const styles = {
    success: 'bg-emerald-50 text-[#178A56] border-emerald-200/80',
    error: 'bg-rose-50 text-[#C43D3D] border-rose-200/80',
    warning: 'bg-[#FFFBEA] text-[#8C6700] border-[#FFEE85]',
    info: 'bg-[#E7F0FE] text-[#111111] border-[#CBD5E1]',
    neutral: 'bg-[#F5F6F8] text-[#647084] border-[#E2E8F0]',
    orange: 'bg-[#E7F0FE] text-[#111111] border border-[#CBD5E1] border-[#CBD5E1]',
    gx: 'bg-[#F9C900]/20 text-[#111111] border-[#F9C900]/50 font-bold',
    dark: 'bg-[#111111] text-[#F9C900] border-black/20 font-bold',
  };

  const dotColors = {
    success: 'bg-[#178A56]',
    error: 'bg-[#C43D3D]',
    warning: 'bg-[#F9C900]',
    info: 'bg-[#647084]',
    neutral: 'bg-[#647084]',
    orange: 'bg-orange-500',
    gx: 'bg-[#F9C900]',
    dark: 'bg-[#F9C900]',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles[variant]} ${sizeClasses} select-none`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
