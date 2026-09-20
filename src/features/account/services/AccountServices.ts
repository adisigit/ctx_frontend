import { apiDelete, apiGet } from "@/lib/api"

const USE_DUMMY_DATA = true

export interface DeviceSession {
  id: string
  deviceName: string
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let dummyDevices: DeviceSession[] = [
  {
    id: "d1",
    deviceName: "sinta-macbook-pro",
    createdAt: daysAgo(45),
    lastUsedAt: hoursAgo(1),
    expiresAt: daysFromNow(45),
  },
  {
    id: "d2",
    deviceName: "sinta-ubuntu-desktop",
    createdAt: daysAgo(20),
    lastUsedAt: daysAgo(3),
    expiresAt: daysFromNow(70),
  },
  {
    id: "d3",
    deviceName: "office-ci-runner",
    createdAt: daysAgo(80),
    lastUsedAt: daysAgo(10),
    expiresAt: daysFromNow(10),
  },
]

async function getDevices(): Promise<DeviceSession[]> {
  if (USE_DUMMY_DATA) {
    const sorted = [...dummyDevices].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return delay(sorted)
  }
  return apiGet<DeviceSession[]>(`/auth/cli/list`)
}

async function revokeDevice(deviceId: string): Promise<void> {
  if (USE_DUMMY_DATA) {
    dummyDevices = dummyDevices.filter((d) => d.id !== deviceId)
    return delay(undefined)
  }
  await apiDelete<void>(`/auth/cli/revoke/${deviceId}`)
}

export const accountService = {
  getDevices,
  revokeDevice,
}
