import { useState } from "react"
import { Activity, ChevronDown, RefreshCw, Terminal, Users } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"

import { EmptyState } from "@/shared/components/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

import {
  dashboardService,
  type TeamSummary,
  type TimeRange,
} from "../services/DashboardServices"

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All time" },
]

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
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

function RangeFilter({
  value,
  onChange,
}: {
  value: TimeRange
  onChange: (value: TimeRange) => void
}) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-1">
      {RANGE_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onChange(option.value)}
          className={cn(
            "h-8 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-transparent",
            value === option.value &&
              "bg-background text-foreground shadow-sm hover:bg-background"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

function SyncStatus() {
  const queryClient = useQueryClient()

  const { data: lastSync, isLoading } = useQuery({
    queryKey: ["dashboard", "last-sync"],
    queryFn: dashboardService.getLastSync,
  })

  const syncMutation = useMutation({
    mutationFn: dashboardService.triggerSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "last-sync"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] })
    },
  })

  const lastSyncedLabel =
    isLoading || !lastSync
      ? "Checking last sync…"
      : `Last synced ${formatDistanceToNow(new Date(lastSync.lastSyncedAt), {
          addSuffix: true,
        })}`

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{lastSyncedLabel}</span>

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => syncMutation.mutate()}
        disabled={syncMutation.isPending}
      >
        <RefreshCw
          className={cn("size-3.5", syncMutation.isPending && "animate-spin")}
        />
        {syncMutation.isPending ? "Syncing…" : "Sync now"}
      </Button>
    </div>
  )
}

function StatRow({
  items,
}: {
  items: { label: string; value: number | string }[]
}) {
  return (
    <Card className="mb-8">
      <CardContent className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(index > 0 && "sm:border-l sm:pl-6")}
          >
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              {item.value}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function BarChart({
  title,
  description,
  data,
  valueLabel,
}: {
  title: string
  description?: string
  data: { label: string; sublabel?: string; value: number }[]
  valueLabel: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {description && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-foreground">
                  {d.label}
                  {d.sublabel && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {d.sublabel}
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {d.value} {valueLabel}
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground/80 transition-[width] duration-500"
                  style={{ width: `${(d.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TeamCard({
  team,
  activeRangeLabel,
}: {
  team: TeamSummary
  activeRangeLabel: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold tracking-tight text-foreground">
              {team.name}
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="size-3.5" />
              <span>
                {team.memberCount}{" "}
                {team.memberCount === 1 ? "member" : "members"}
              </span>
            </div>
          </div>

          <Badge variant="secondary" className="shrink-0">
            {team.totalContexts} contexts all time
          </Badge>
        </div>

        <div className="mt-4">
          <div className="text-xs text-muted-foreground">
            Contexts ({activeRangeLabel})
          </div>
          <div className="text-2xl font-semibold tracking-tight">
            {team.contextsInRange}
          </div>
        </div>

        <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
          <CollapsibleTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                open && "rotate-180"
              )}
            />
            {open ? "Hide members" : "Show members"}
          </CollapsibleTrigger>

          <CollapsibleContent>
            <Separator className="mb-3 mt-1" />

            <ul className="space-y-2">
              {team.members.map((member) => (
                <li
                  key={member.userName}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">{member.userName}</span>

                  <span className="text-muted-foreground">
                    {member.contextsInRange} contexts ({member.totalContexts}{" "}
                    all time)
                  </span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div>
      <Header title="Dashboard" description="Overview across all teams" />

      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-9 w-64 rounded-lg" />
      </div>

      <Skeleton className="mb-8 h-24 w-full rounded-lg" />

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-lg" />
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-lg" />
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

function NoTeamsState() {
  return (
    <div>
      <Header title="Dashboard" description="Overview across all teams" />

      <EmptyState
        icon={<Terminal className="size-10" />}
        title="No teams yet"
        description="Run `ctx join` in your terminal inside your repo to create or join a team."
      />
    </div>
  )
}

export default function DashboardPage() {
  const [range, setRange] = useState<TimeRange>("7d")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "summary", range],
    queryFn: () => dashboardService.getSummary(range),
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !data) {
    return <DashboardError />
  }

  if (!data.hasTeams) {
    return <NoTeamsState />
  }

  const activeRangeLabel =
    RANGE_OPTIONS.find((option) => option.value === range)?.label ??
    "selected range"

  const contextsByTeam = data.teams.map((team) => ({
    label: team.name,
    value: team.contextsInRange,
  }))

  const topContributors = data.topContributors.map((member) => ({
    label: member.userName,
    sublabel: member.teamNames.join(", "),
    value: member.contextsInRange,
  }))

  return (
    <div>
      <Header title="Dashboard" description="Overview across all teams" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <RangeFilter value={range} onChange={setRange} />
        <SyncStatus />
      </div>

      <StatRow
        items={[
          { label: "Teams", value: data.teamCount },
          { label: "Members", value: data.memberCount },
          {
            label: `Contexts (${activeRangeLabel})`,
            value: data.contextsInRange,
          },
          { label: "Contexts (all time)", value: data.totalContexts },
        ]}
      />

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <BarChart
          title="Contexts by team"
          description={activeRangeLabel}
          data={contextsByTeam}
          valueLabel="contexts"
        />

        <BarChart
          title="Top contributors"
          description={`Across every team · ${activeRangeLabel}`}
          data={topContributors}
          valueLabel="contexts"
        />
      </div>

      <div className="mb-4">
        <div className="text-xl font-semibold tracking-tight">Teams</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Context activity for every team in your org.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            activeRangeLabel={activeRangeLabel}
          />
        ))}
      </div>
    </div>
  )
}
