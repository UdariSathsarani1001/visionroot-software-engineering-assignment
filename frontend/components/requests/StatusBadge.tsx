import { Badge } from "@/components/ui/badge";
import { RequestStatus, RequestPriority } from "@/types/request";
import { REQUEST_STATUS_LABELS, REQUEST_PRIORITY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const statusStyles: Record<RequestStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  RESOLVED: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
};

const priorityStyles: Record<RequestPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
  HIGH: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge className={cn("border font-medium", statusStyles[status])}>
      {REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  return (
    <Badge className={cn("border font-medium", priorityStyles[priority])}>
      {REQUEST_PRIORITY_LABELS[priority]}
    </Badge>
  );
}
