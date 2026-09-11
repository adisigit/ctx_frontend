import type { SyncStatus } from "@/shared/components/SyncStatusBadge"

export interface DeviceSync {
  deviceName: string
  lastSyncAt: string | null
  entryCount: number
  status: SyncStatus
}

export interface DashboardSummary {
  hasTeam: boolean
  activeContextCount: number
  logsLast7Days: number
  deviceSyncs: DeviceSync[]
}

const DUMMY_SUMMARY: DashboardSummary = {
  hasTeam: true,
  activeContextCount: 4,
  logsLast7Days: 23,
  deviceSyncs: [
    {
      deviceName: "fedora-laptop",
      lastSyncAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      entryCount: 18,
      status: "synced",
    },
    {
      deviceName: "macbook-office",
      lastSyncAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      entryCount: 5,
      status: "pending",
    },
    {
      deviceName: "wsl-home-pc",
      lastSyncAt: null,
      entryCount: 0,
      status: "never synced",
    },
  ],
}

export const dashboardService = {
  getSummary: (): Promise<DashboardSummary> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(DUMMY_SUMMARY), 500)
    })
  },
}
