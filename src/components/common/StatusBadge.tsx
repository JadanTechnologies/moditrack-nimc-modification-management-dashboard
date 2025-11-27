import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RequestStatus } from '@shared/types';
interface StatusBadgeProps {
  status: RequestStatus;
}
const statusStyles: Record<RequestStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800/50',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800/50',
  Completed: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800/50',
  Rejected: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800/50',
};
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-medium', statusStyles[status])}>
      {status}
    </Badge>
  );
}