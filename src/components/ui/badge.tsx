import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-amber-500 text-slate-950 shadow hover:bg-amber-400',
        secondary:
          'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-750',
        destructive:
          'border-transparent bg-red-500 text-white shadow hover:bg-red-600',
        outline: 'text-slate-300 border-slate-700',
        gold: 'border-amber-500/40 bg-amber-500/10 text-amber-300 backdrop-blur-md',
        emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 backdrop-blur-md',
        luxury: 'border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-600/20 text-amber-200 uppercase tracking-widest text-[10px] font-bold shadow-md shadow-amber-950/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'gold' | 'emerald' | 'luxury';
  className?: string;
  children?: React.ReactNode;
}

function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
