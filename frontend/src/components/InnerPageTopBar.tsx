import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appName } from '@/constants';
import { cn } from '@/lib/utils';

type InnerPageTopBarProps = {
  variant?: 'dark' | 'light';
  className?: string;
  backTo?: string;
  brandTo?: string;
  backLabel?: string;
};

const InnerPageTopBar = ({
  variant = 'dark',
  className,
  backTo = '/',
  brandTo = '/',
  backLabel = 'Back to website',
}: InnerPageTopBarProps) => {
  const isDark = variant === 'dark';

  return (
    <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      <div
        className={cn(
          'flex items-center justify-between gap-4 border-b px-0 py-4 sm:py-5',
          isDark
            ? 'border-white/10 bg-transparent'
            : 'border-slate-200/80 bg-transparent'
        )}
      >
        <Button
          asChild
          className={cn(
            'h-auto rounded-none border-0 bg-transparent px-0 py-0 text-sm font-medium shadow-none transition hover:bg-transparent',
            isDark
              ? 'text-white/90 hover:text-white'
              : 'text-slate-700 hover:text-slate-950'
          )}
        >
          <Link to={backTo} aria-label={backLabel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>

        <Link
          to={brandTo}
          aria-label={appName}
          className={cn(
            'inline-flex items-center justify-end text-xs font-semibold uppercase tracking-[0.45em] transition-opacity hover:opacity-80 sm:text-sm',
            isDark ? 'text-white/65' : 'text-slate-500'
          )}
        >
          <span>{appName}</span>
        </Link>
      </div>
    </div>
  );
};

export default InnerPageTopBar;
