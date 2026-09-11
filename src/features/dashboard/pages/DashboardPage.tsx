import { formatDistanceToNow } from "date-fns"
import { Activity, FileText, Terminal } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { EmptyState } from "@/shared/components/EmptyState"
import { SyncStatusBadge, type SyncStatus } from "@/shared/components/SyncStatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

import { dashboardService } from "../services/DashboardServices"

function Header({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-8">
      <span className="text-xs font-medium uppercase tracking-[0.6px] text-muted-foreground">
        Overview
      </span>

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>

      {description && (
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  accent: "purple" | "blue"
}) {
  const accentClass =
    accent === "purple" ? "bg-[#7a3dff]" : "bg-[#3b89ff]"

  return (
    <Card className={`border-0 ${accentClass} text-white shadow-none`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/80">
            {label}
          </span>

          <span className="flex size-7 items-center justify-center rounded-full bg-white/15">
            {icon}
          </span>
        </div>

        <div className="mt-4 text-4xl font-semibold tracking-tight">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div>
      <Header
        title="Dashboard"
        description="Overview of your context activity"
      />

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <Skeleton className="h-31 w-full rounded-lg" />
        <Skeleton className="h-31 w-full rounded-lg" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}

function DashboardError() {
  return (
    <div>
      <Header title="Dashboard" />

      <EmptyState
        icon={<Activity className="size-10" />}
        title="Dashboard didn't load"
        description="The request to fetch your dashboard data failed. Try again in a moment."
      />
    </div>
  )
}

function NoTeamState() {
  return (
    <div>
      <Header
        title="Dashboard"
        description="Overview of your context activity"
      />

      <EmptyState
        icon={<Terminal className="size-10" />}
        title="No team yet"
        description="Run `ctx join` in your terminal inside your repo to create or join a team."
      />
    </div>
  )
}

function DeviceSyncSection({
  deviceSyncs,
}: {
  deviceSyncs: {
    deviceName: string
    lastSyncAt: string | null
    entryCount: number
    status: SyncStatus
  }[]
}) {
  return (
    <section>
      <div className="mb-4">
        <div className="text-xl font-semibold tracking-tight">
          Last sync per device
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor when each device last synchronized its context.
        </p>
      </div>

      <Separator className="mb-6" />

      {deviceSyncs.length === 0 ? (
        <EmptyState
          icon={<Terminal className="size-8" />}
          title="No devices synced"
          description="Run `ctx sync` from the CLI to push your local context data."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Last sync</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {deviceSyncs.map((device) => (
                  <TableRow key={device.deviceName}>
                    <TableCell className="font-medium">
                      {device.deviceName}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {device.lastSyncAt
                        ? formatDistanceToNow(
                            new Date(device.lastSyncAt),
                            {
                              addSuffix: true,
                            }
                          )
                        : "—"}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {device.entryCount}
                    </TableCell>

                    <TableCell>
                      <SyncStatusBadge status={device.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardService.getSummary,
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !data) {
    return <DashboardError />
  }

  if (!data.hasTeam) {
    return <NoTeamState />
  }

  return (
    <div>
      <Header
        title="Dashboard"
        description="Overview of your context activity"
      />

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <StatCard
          label="Active contexts"
          value={data.activeContextCount}
          icon={<Activity className="size-3.5" />}
          accent="purple"
        />

        <StatCard
          label="Logs (last 7 days)"
          value={data.logsLast7Days}
          icon={<FileText className="size-3.5" />}
          accent="blue"
        />
      </div>

      <DeviceSyncSection deviceSyncs={data.deviceSyncs} />
    </div>
  )
}
