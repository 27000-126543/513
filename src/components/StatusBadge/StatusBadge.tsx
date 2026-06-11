import { TaskStatus } from '../../types';
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../../utils/constants';
import { cn } from '../../utils/formatters';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = TASK_STATUS_COLORS[status] || 'badge-info';
  const label = TASK_STATUS_LABELS[status] || status;

  return (
    <span className={cn('badge', colorClass, className)}>
      {label}
    </span>
  );
}
