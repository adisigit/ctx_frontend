import * as XLSX from "xlsx"

import { apiGet } from "@/lib/api"

const USE_DUMMY_DATA = true

export interface MyActivityLog {
  id: string
  teamId: string
  teamName: string
  action: string
  contextName: string
  createdAt: string
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

const dummyMyActivity: MyActivityLog[] = [
  {
    id: "m1",
    teamId: "team-1",
    teamName: "Acme Project",
    action: "Pushed context",
    contextName: "acme-project",
    createdAt: hoursAgo(2),
  },
  {
    id: "m2",
    teamId: "team-1",
    teamName: "Acme Project",
    action: "Synced device",
    contextName: "auth-service",
    createdAt: daysAgo(1),
  },
  {
    id: "m3",
    teamId: "team-1",
    teamName: "Acme Project",
    action: "Renamed context",
    contextName: "payment-gateway",
    createdAt: daysAgo(4),
  },
  {
    id: "m4",
    teamId: "team-2",
    teamName: "Nedo Team",
    action: "Pushed context",
    contextName: "nedo-team",
    createdAt: hoursAgo(8),
  },
  {
    id: "m5",
    teamId: "team-2",
    teamName: "Nedo Team",
    action: "Deleted context",
    contextName: "legacy-module",
    createdAt: daysAgo(6),
  },
  {
    id: "m6",
    teamId: "team-3",
    teamName: "Personal",
    action: "Pushed context",
    contextName: "personal",
    createdAt: hoursAgo(5),
  },
  {
    id: "m7",
    teamId: "team-3",
    teamName: "Personal",
    action: "Synced device",
    contextName: "personal",
    createdAt: daysAgo(2),
  },
  {
    id: "m8",
    teamId: "team-1",
    teamName: "Acme Project",
    action: "Synced device",
    contextName: "acme-project",
    createdAt: daysAgo(12),
  },
  {
    id: "m9",
    teamId: "team-2",
    teamName: "Nedo Team",
    action: "Pushed context",
    contextName: "nedo-team",
    createdAt: daysAgo(20),
  },
]

const dummyLastSyncAt = hoursAgo(2)

async function getMyActivity(): Promise<MyActivityLog[]> {
  if (USE_DUMMY_DATA) {
    const sorted = [...dummyMyActivity].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return delay(sorted)
  }
  return apiGet<MyActivityLog[]>(`/me/activity`)
}

async function getLastSyncAt(): Promise<string | null> {
  if (USE_DUMMY_DATA) return delay(dummyLastSyncAt)
  const result = await apiGet<{ lastSyncAt: string | null }>(`/me/last-sync`)
  return result.lastSyncAt
}

export const myActivityService = {
  getMyActivity,
  getLastSyncAt,
}

export function exportActivityToExcel(
  logs: MyActivityLog[],
  fromDate: string,
  toDate: string
): void {
  const rows = logs.map((log) => ({
    Team: log.teamName,
    Action: log.action,
    Context: log.contextName,
    Date: new Date(log.createdAt).toLocaleString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Activity")
  XLSX.writeFile(workbook, `my-activity_${fromDate}_to_${toDate}.xlsx`)
}
