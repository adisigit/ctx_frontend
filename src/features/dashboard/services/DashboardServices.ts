export type TimeRange = "today" | "7d" | "30d" | "all"

export interface MemberContextSummary {
  userName: string
  totalContexts: number
  contextsInRange: number
}

export interface TeamSummary {
  id: string
  name: string
  memberCount: number
  totalContexts: number
  contextsInRange: number
  members: MemberContextSummary[]
}

export interface TopContributor extends MemberContextSummary {
  teamNames: string[]
}

export interface OrgDashboardSummary {
  hasTeams: boolean
  teamCount: number
  memberCount: number
  totalContexts: number
  contextsInRange: number
  teams: TeamSummary[]
  topContributors: TopContributor[]
}

const RANGE_DAYS: Record<TimeRange, number> = {
  today: 1,
  "7d": 7,
  "30d": 30,
  all: Infinity,
}

interface BaseTeamMeta {
  id: string
  name: string
}

interface BaseUser {
  userName: string
  teamIds: string[]
  totalContexts: number
}

const BASE_TEAM_META: BaseTeamMeta[] = [
  { id: "platform", name: "Platform" },
  { id: "growth", name: "Growth" },
  { id: "infra", name: "Infra" },
  { id: "mobile", name: "Mobile" },
]

const BASE_USERS: BaseUser[] = [
  { userName: "arif.rahman", teamIds: ["platform"], totalContexts: 22 },
  { userName: "dwi.santoso", teamIds: ["platform", "infra"], totalContexts: 18 },
  { userName: "maya.putri", teamIds: ["platform"], totalContexts: 14 },
  { userName: "hendra.wijaya", teamIds: ["platform"], totalContexts: 7 },
  { userName: "sinta.dewi", teamIds: ["growth"], totalContexts: 16 },
  { userName: "budi.setiawan", teamIds: ["growth", "mobile"], totalContexts: 12 },
  { userName: "rina.amelia", teamIds: ["growth"], totalContexts: 6 },
  { userName: "fajar.nugroho", teamIds: ["infra"], totalContexts: 11 },
  { userName: "citra.lestari", teamIds: ["infra"], totalContexts: 8 },
  { userName: "yoga.pratama", teamIds: ["mobile"], totalContexts: 9 },
]

const CONTEXT_SPAN_DAYS = 60

function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash) || 1
}

function generateContextDates(userName: string, count: number): number[] {
  const rand = seededRandom(hashString(userName))
  const now = Date.now()
  const dates: number[] = []
  for (let i = 0; i < count; i++) {
    const daysAgo = rand() * CONTEXT_SPAN_DAYS
    dates.push(now - daysAgo * 24 * 60 * 60 * 1000)
  }
  return dates
}

function countInRange(dates: number[], range: TimeRange) {
  const days = RANGE_DAYS[range]
  if (days === Infinity) return dates.length
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return dates.filter((timestamp) => timestamp >= cutoff).length
}

function buildSummary(range: TimeRange): OrgDashboardSummary {
  const userSummaries = new Map<string, MemberContextSummary>()
  for (const user of BASE_USERS) {
    const dates = generateContextDates(user.userName, user.totalContexts)
    userSummaries.set(user.userName, {
      userName: user.userName,
      totalContexts: user.totalContexts,
      contextsInRange: countInRange(dates, range),
    })
  }

  const teams: TeamSummary[] = BASE_TEAM_META.map((teamMeta) => {
    const members = BASE_USERS.filter((user) =>
      user.teamIds.includes(teamMeta.id)
    )
      .map((user) => userSummaries.get(user.userName)!)
      .sort((a, b) => b.contextsInRange - a.contextsInRange)

    return {
      id: teamMeta.id,
      name: teamMeta.name,
      memberCount: members.length,
      totalContexts: members.reduce((sum, m) => sum + m.totalContexts, 0),
      contextsInRange: members.reduce((sum, m) => sum + m.contextsInRange, 0),
      members,
    }
  }).sort((a, b) => b.contextsInRange - a.contextsInRange)

  const topContributors: TopContributor[] = BASE_USERS.map((user) => ({
    ...userSummaries.get(user.userName)!,
    teamNames: user.teamIds.map(
      (id) => BASE_TEAM_META.find((t) => t.id === id)?.name ?? id
    ),
  }))
    .sort((a, b) => b.contextsInRange - a.contextsInRange)
    .slice(0, 8)

  return {
    hasTeams: teams.length > 0,
    teamCount: teams.length,
    memberCount: BASE_USERS.length,
    totalContexts: BASE_USERS.reduce((sum, u) => sum + u.totalContexts, 0),
    contextsInRange: Array.from(userSummaries.values()).reduce(
      (sum, u) => sum + u.contextsInRange,
      0
    ),
    teams,
    topContributors,
  }
}

let lastSyncedAt = new Date(Date.now() - 1000 * 60 * 42).toISOString()

export const dashboardService = {
  getSummary: (range: TimeRange = "7d"): Promise<OrgDashboardSummary> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(buildSummary(range)), 500)
    })
  },

  getLastSync: (): Promise<{ lastSyncedAt: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ lastSyncedAt }), 300)
    })
  },

  triggerSync: (): Promise<{ lastSyncedAt: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        lastSyncedAt = new Date().toISOString()
        resolve({ lastSyncedAt })
      }, 900)
    })
  },
}
