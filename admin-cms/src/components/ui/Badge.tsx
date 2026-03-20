import clsx from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  danger:  'bg-red-50 text-red-700 border-red-200',
  info:    'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ── Convenience wrappers for common states ────────────────────────────────

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'success' : 'neutral'}>
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}

export function BookingStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
  };
  return (
    <Badge variant={variantMap[status] ?? 'neutral'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
