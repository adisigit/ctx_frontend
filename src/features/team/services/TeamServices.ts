import { apiDelete, apiGet, apiPost } from "@/lib/api"

const USE_DUMMY_DATA = true

export type MemberRole = "owner" | "member"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: MemberRole
  joinedAt: string
}

export interface JoinRequest {
  id: string
  name: string
  email: string
  requestedAt: string
}

export interface ActivityLog {
  id: string
  userName: string
  action: string
  contextName: string
  createdAt: string
}

export interface TeamDetail {
  id: string
  repoName: string
  members: TeamMember[]
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const dummyTeams: Record<string, TeamDetail> = {
  "team-1": {
    id: "team-1",
    repoName: "acme-project",
    members: [
      {
        id: "u1",
        name: "Sinta Wijaya",
        email: "sinta@acme.dev",
        role: "owner",
        joinedAt: daysAgo(120),
      },
      {
        id: "u2",
        name: "Budi Santoso",
        email: "budi@acme.dev",
        role: "member",
        joinedAt: daysAgo(80),
      },
      {
        id: "u3",
        name: "Rangga Pratama",
        email: "rangga@acme.dev",
        role: "member",
        joinedAt: daysAgo(30),
      },
      {
        id: "u4",
        name: "Dewi Lestari",
        email: "dewi@acme.dev",
        role: "member",
        joinedAt: daysAgo(5),
      },
    ],
  },
  "team-2": {
    id: "team-2",
    repoName: "nedo-team",
    members: [
      {
        id: "u5",
        name: "Andi Kusuma",
        email: "andi@nedo.dev",
        role: "owner",
        joinedAt: daysAgo(200),
      },
      {
        id: "u6",
        name: "Putri Ramadhani",
        email: "putri@nedo.dev",
        role: "member",
        joinedAt: daysAgo(45),
      },
    ],
  },
  "team-3": {
    id: "team-3",
    repoName: "personal",
    members: [
      {
        id: "u7",
        name: "You",
        email: "you@personal.dev",
        role: "owner",
        joinedAt: daysAgo(300),
      },
    ],
  },
}

const dummyJoinRequestsMap: Record<string, JoinRequest[]> = {
  "team-1": [
    {
      id: "r1",
      name: "Fajar Nugroho",
      email: "fajar@acme.dev",
      requestedAt: hoursAgo(3),
    },
    {
      id: "r2",
      name: "Maya Anggraini",
      email: "maya@acme.dev",
      requestedAt: hoursAgo(20),
    },
  ],
  "team-2": [
    {
      id: "r3",
      name: "Hendra Saputra",
      email: "hendra@nedo.dev",
      requestedAt: hoursAgo(10),
    },
  ],
  "team-3": [],
}

const dummyTeamActivityMap: Record<string, ActivityLog[]> = {
  "team-1": [
    {
      id: "a1",
      userName: "Budi Santoso",
      action: "Pushed context",
      contextName: "auth-service",
      createdAt: hoursAgo(1),
    },
    {
      id: "a2",
      userName: "Dewi Lestari",
      action: "Synced device",
      contextName: "payment-gateway",
      createdAt: hoursAgo(4),
    },
    {
      id: "a3",
      userName: "Rangga Pratama",
      action: "Deleted context",
      contextName: "legacy-api",
      createdAt: hoursAgo(9),
    },
    {
      id: "a4",
      userName: "Sinta Wijaya",
      action: "Pushed context",
      contextName: "acme-project",
      createdAt: daysAgo(2),
    },
  ],
  "team-2": [
    {
      id: "a5",
      userName: "Putri Ramadhani",
      action: "Pushed context",
      contextName: "nedo-team",
      createdAt: hoursAgo(6),
    },
    {
      id: "a6",
      userName: "Andi Kusuma",
      action: "Synced device",
      contextName: "nedo-team",
      createdAt: daysAgo(3),
    },
  ],
  "team-3": [
    {
      id: "a7",
      userName: "You",
      action: "Pushed context",
      contextName: "personal",
      createdAt: hoursAgo(5),
    },
  ],
}

const dummyUserActivityMap: Record<string, ActivityLog[]> = {
  "team-1": [
    {
      id: "ua1",
      userName: "You",
      action: "Pushed context",
      contextName: "acme-project",
      createdAt: hoursAgo(2),
    },
    {
      id: "ua2",
      userName: "You",
      action: "Synced device",
      contextName: "auth-service",
      createdAt: daysAgo(1),
    },
    {
      id: "ua3",
      userName: "You",
      action: "Renamed context",
      contextName: "payment-gateway",
      createdAt: daysAgo(4),
    },
  ],
  "team-2": [
    {
      id: "ua4",
      userName: "You",
      action: "Pushed context",
      contextName: "nedo-team",
      createdAt: hoursAgo(8),
    },
  ],
  "team-3": [
    {
      id: "ua5",
      userName: "You",
      action: "Pushed context",
      contextName: "personal",
      createdAt: hoursAgo(5),
    },
    {
      id: "ua6",
      userName: "You",
      action: "Synced device",
      contextName: "personal",
      createdAt: daysAgo(2),
    },
  ],
}

function teamData(teamId: string): TeamDetail {
  return dummyTeams[teamId] ?? dummyTeams["team-1"]
}

function joinRequestsData(teamId: string): JoinRequest[] {
  return dummyJoinRequestsMap[teamId] ?? []
}

function teamActivityData(teamId: string): ActivityLog[] {
  return dummyTeamActivityMap[teamId] ?? []
}

function userActivityData(teamId: string): ActivityLog[] {
  return dummyUserActivityMap[teamId] ?? []
}

async function getTeamDetail(teamId: string): Promise<TeamDetail> {
  if (USE_DUMMY_DATA) return delay(teamData(teamId))
  return apiGet<TeamDetail>(`/teams/${teamId}`)
}

async function getJoinRequests(teamId: string): Promise<JoinRequest[]> {
  if (USE_DUMMY_DATA) return delay(joinRequestsData(teamId))
  return apiGet<JoinRequest[]>(`/teams/${teamId}/join-requests`)
}

async function getTeamActivity(teamId: string): Promise<ActivityLog[]> {
  if (USE_DUMMY_DATA) return delay(teamActivityData(teamId))
  return apiGet<ActivityLog[]>(`/teams/${teamId}/activity`)
}

async function getUserActivity(teamId: string): Promise<ActivityLog[]> {
  if (USE_DUMMY_DATA) return delay(userActivityData(teamId))
  return apiGet<ActivityLog[]>(`/teams/${teamId}/activity/me`)
}

async function removeMember(teamId: string, memberId: string): Promise<void> {
  if (USE_DUMMY_DATA) {
    const team = teamData(teamId)
    team.members = team.members.filter((m) => m.id !== memberId)
    return delay(undefined)
  }
  await apiDelete<void>(`/teams/${teamId}/members/${memberId}`)
}

async function acceptJoinRequest(teamId: string, requestId: string): Promise<void> {
  if (USE_DUMMY_DATA) {
    const requests = joinRequestsData(teamId)
    const accepted = requests.find((r) => r.id === requestId)
    dummyJoinRequestsMap[teamId] = requests.filter((r) => r.id !== requestId)
    if (accepted) {
      const team = teamData(teamId)
      team.members = [
        ...team.members,
        {
          id: accepted.id,
          name: accepted.name,
          email: accepted.email,
          role: "member",
          joinedAt: new Date().toISOString(),
        },
      ]
    }
    return delay(undefined)
  }
  await apiPost<void>(`/teams/${teamId}/join-requests/${requestId}/accept`)
}

async function rejectJoinRequest(teamId: string, requestId: string): Promise<void> {
  if (USE_DUMMY_DATA) {
    dummyJoinRequestsMap[teamId] = joinRequestsData(teamId).filter(
      (r) => r.id !== requestId
    )
    return delay(undefined)
  }
  await apiPost<void>(`/teams/${teamId}/join-requests/${requestId}/reject`)
}

export const teamService = {
  getTeamDetail,
  getJoinRequests,
  getTeamActivity,
  getUserActivity,
  removeMember,
  acceptJoinRequest,
  rejectJoinRequest,
}
