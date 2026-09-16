import { useState } from "react"
import { useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { Activity, Check, User, UserPlus, Users, X } from "lucide-react"

import { EmptyState } from "@/shared/components/EmptyState"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { teamService, type ActivityLog } from "../services/TeamServices"

type TabKey = "members" | "requests" | "team-activity" | "user-activity"

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "members", label: "Members", icon: <Users className="size-4" /> },
  { key: "requests", label: "Join requests", icon: <UserPlus className="size-4" /> },
  { key: "team-activity", label: "Team activity", icon: <Activity className="size-4" /> },
  { key: "user-activity", label: "Your activity", icon: <User className="size-4" /> },
]

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

function TabBar({
  active,
  onChange,
}: {
  active: TabKey
  onChange: (tab: TabKey) => void
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium tracking-[-0.16px] transition-colors",
            active === tab.key
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

function ActivityTable({ logs }: { logs: ActivityLog[]; showUser?: boolean }) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="size-8" />}
        title="No activity yet"
        description="Context activity will show up here once it happens."
      />
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.userName}</TableCell>
                <TableCell className="text-muted-foreground">{log.action}</TableCell>
                <TableCell className="text-muted-foreground">{log.contextName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function MembersSection({ teamId }: { teamId: string }) {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => teamService.getTeamDetail(teamId),
  })

  const removeMember = useMutation({
    mutationFn: (memberId: string) => teamService.removeMember(teamId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] })
    },
  })

  if (isLoading) return <TableSkeleton />

  if (isError || !data) {
    return (
      <EmptyState
        icon={<Users className="size-8" />}
        title="Members didn't load"
        description="The request to fetch team members failed. Try again in a moment."
      />
    )
  }

  if (data.members.length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-8" />}
        title="No members yet"
        description="Invite people to join this team from the CLI."
      />
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className="text-muted-foreground">{member.email}</TableCell>
                <TableCell className="text-muted-foreground capitalize">
                  {member.role}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  {member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={removeMember.isPending}
                      onClick={() => removeMember.mutate(member.id)}
                    >
                      Remove
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function JoinRequestsSection({ teamId }: { teamId: string }) {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["team-join-requests", teamId],
    queryFn: () => teamService.getJoinRequests(teamId),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["team-join-requests", teamId] })

  const acceptRequest = useMutation({
    mutationFn: (requestId: string) => teamService.acceptJoinRequest(teamId, requestId),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ["team", teamId] })
    },
  })

  const rejectRequest = useMutation({
    mutationFn: (requestId: string) => teamService.rejectJoinRequest(teamId, requestId),
    onSuccess: invalidate,
  })

  if (isLoading) return <TableSkeleton />

  if (isError || !data) {
    return (
      <EmptyState
        icon={<UserPlus className="size-8" />}
        title="Requests didn't load"
        description="The request to fetch join requests failed. Try again in a moment."
      />
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<UserPlus className="size-8" />}
        title="No pending requests"
        description="People asking to join this team will show up here."
      />
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.name}</TableCell>
                <TableCell className="text-muted-foreground">{request.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={rejectRequest.isPending}
                      onClick={() => rejectRequest.mutate(request.id)}
                    >
                      <X className="size-4" />
                      Reject
                    </Button>

                    <Button
                      size="sm"
                      disabled={acceptRequest.isPending}
                      onClick={() => acceptRequest.mutate(request.id)}
                    >
                      <Check className="size-4" />
                      Accept
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TeamActivitySection({ teamId }: { teamId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["team-activity", teamId],
    queryFn: () => teamService.getTeamActivity(teamId),
  })

  if (isLoading) return <TableSkeleton />

  if (isError || !data) {
    return (
      <EmptyState
        icon={<Activity className="size-8" />}
        title="Activity didn't load"
        description="The request to fetch team activity failed. Try again in a moment."
      />
    )
  }

  return <ActivityTable logs={data} showUser />
}

function UserActivitySection({ teamId }: { teamId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-activity", teamId],
    queryFn: () => teamService.getUserActivity(teamId),
  })

  if (isLoading) return <TableSkeleton />

  if (isError || !data) {
    return (
      <EmptyState
        icon={<Activity className="size-8" />}
        title="Activity didn't load"
        description="The request to fetch your activity failed. Try again in a moment."
      />
    )
  }

  return <ActivityTable logs={data} />
}

export default function TeamPage() {
  const { id: teamId } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabKey>("members")

  const { data: team } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => teamService.getTeamDetail(teamId!),
    enabled: !!teamId,
  })

  if (!teamId) {
    return (
      <div>
        <Header title="Team" />
        <EmptyState
          icon={<Users className="size-10" />}
          title="No team selected"
          description="Choose a team from the sidebar to see its details."
        />
      </div>
    )
  }

  return (
    <div>
      <Header
        title={team?.repoName ?? "Team"}
        description="Members, join requests, and context activity for this team"
      />

      <Separator className="mb-6" />

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === "members" && <MembersSection teamId={teamId} />}
      {activeTab === "requests" && <JoinRequestsSection teamId={teamId} />}
      {activeTab === "team-activity" && <TeamActivitySection teamId={teamId} />}
      {activeTab === "user-activity" && <UserActivitySection teamId={teamId} />}
    </div>
  )
}
