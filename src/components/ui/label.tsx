import * as React from 'react';
import { cn } from '@/src/lib/utils';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-xs font-semibold uppercase tracking-wider text-slate-400 select-none flex items-center gap-1.5',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export { Label };
