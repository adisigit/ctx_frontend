import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type SyncStatus = "synced" | "pending" | "failed" | "never synced"

const STATUS_STYLES: Record<SyncStatus, string> = {
  synced: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  failed: "bg-red-500/15 text-red-600 dark:text-red-400",
  "never synced": "bg-muted text-muted-foreground",
}

const STATUS_LABEL: Record<SyncStatus, string> = {
  synced: "Synced",
  pending: "Pending",
  failed: "Failed",
  "never synced": "Never synced",
}

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-0 font-medium", STATUS_STYLES[status])}
    >
      {STATUS_LABEL[status]}
    </Badge>
  )
}
