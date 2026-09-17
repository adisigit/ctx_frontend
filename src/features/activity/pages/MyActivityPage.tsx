import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { Activity, Download, RefreshCw } from "lucide-react"

import { EmptyState } from "@/shared/components/EmptyState"
import { Modal } from "@/shared/components/Modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { myActivityService, exportActivityToExcel } from "../services/MyActivityServices"

function Header({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <span className="text-xs font-medium uppercase tracking-[0.6px] text-muted-foreground">
        Overview
      </span>

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>

      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

export default function MyActivityPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [fromDate, setFromDate] = useState(daysAgoIso(7))
  const [toDate, setToDate] = useState(todayIso())
  const [exportError, setExportError] = useState<string | null>(null)

  const {
    data: activities,
    isLoading: isActivityLoading,
    isError: isActivityError,
  } = useQuery({
    queryKey: ["my-activity"],
    queryFn: myActivityService.getMyActivity,
  })

  const { data: lastSyncAt } = useQuery({
    queryKey: ["my-activity", "last-sync"],
    queryFn: myActivityService.getLastSyncAt,
  })

  const maxDate = todayIso()

  function openExportModal() {
    setExportError(null)
    setExportOpen(true)
  }

  function handleExport() {
    if (!fromDate || !toDate) {
      setExportError("Choose a start and end date.")
      return
    }

    if (toDate > maxDate) {
      setExportError("End date can't be later than today.")
      return
    }

    if (fromDate > toDate) {
      setExportError("Start date can't be after the end date.")
      return
    }

    const from = new Date(fromDate)
    const to = new Date(toDate)
    to.setHours(23, 59, 59, 999)

    const filtered = (activities ?? []).filter((log) => {
      const created = new Date(log.createdAt)
      return created >= from && created <= to
    })

    if (filtered.length === 0) {
      setExportError("No activity found in that date range.")
      return
    }

    exportActivityToExcel(filtered, fromDate, toDate)
    setExportOpen(false)
  }

  return (
    <div>
      <Header
        title="My Activity"
        description="All of your context activity across every team"
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="size-4" />
          {lastSyncAt ? (
            <span>
              Last synced {formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })}
            </span>
          ) : (
            <span>No sync recorded yet</span>
          )}
        </div>

        <Button onClick={openExportModal}>
          <Download className="size-4" />
          Export to Excel
        </Button>
      </div>

      {isActivityLoading && <ActivitySkeleton />}

      {!isActivityLoading && (isActivityError || !activities) && (
        <EmptyState
          icon={<Activity className="size-8" />}
          title="Activity didn't load"
          description="The request to fetch your activity failed. Try again in a moment."
        />
      )}

      {!isActivityLoading && activities && activities.length === 0 && (
        <EmptyState
          icon={<Activity className="size-8" />}
          title="No activity yet"
          description="Your context activity across teams will show up here."
        />
      )}

      {!isActivityLoading && activities && activities.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {activities.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.teamName}</TableCell>
                    <TableCell className="text-muted-foreground">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.contextName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export activity to Excel"
        description="Choose a date range. The end date can't be later than today."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              max={toDate || maxDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                setExportError(null)
              }}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              To
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={maxDate}
              onChange={(e) => {
                setToDate(e.target.value)
                setExportError(null)
              }}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          {exportError && (
            <p className="text-sm text-destructive">{exportError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleExport}>
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
