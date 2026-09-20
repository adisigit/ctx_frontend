import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { Laptop, ShieldAlert } from "lucide-react"

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

import { accountService, type DeviceSession } from "../services/AccountServices"

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

function DevicesSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

function RevokeModal({
  device,
  onClose,
  onConfirm,
  isRevoking,
}: {
  device: DeviceSession | null
  onClose: () => void
  onConfirm: () => void
  isRevoking: boolean
}) {
  const [confirmText, setConfirmText] = useState("")

  const isMatch = device !== null && confirmText.trim() === device.deviceName

  return (
    <Modal
      open={device !== null}
      onClose={() => {
        setConfirmText("")
        onClose()
      }}
      title="Revoke device access"
      description="This device will be signed out immediately and will need to log in again."
    >
      {device && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/5 p-3">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-sm text-muted-foreground">
              To confirm, type{" "}
              <span className="font-semibold text-foreground">{device.deviceName}</span>{" "}
              below.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Device name
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={device.deviceName}
              autoFocus
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmText("")
                onClose()
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={!isMatch || isRevoking}
              onClick={onConfirm}
            >
              Revoke access
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function AccountPage() {
  const queryClient = useQueryClient()
  const [revokeTarget, setRevokeTarget] = useState<DeviceSession | null>(null)

  const { data: devices, isLoading, isError } = useQuery({
    queryKey: ["account", "devices"],
    queryFn: accountService.getDevices,
  })

  const revokeDevice = useMutation({
    mutationFn: (deviceId: string) => accountService.revokeDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "devices"] })
      setRevokeTarget(null)
    },
  })

  return (
    <div>
      <Header
        title="Account"
        description="Devices and CLI sessions currently logged into your account"
      />

      {isLoading && <DevicesSkeleton />}

      {!isLoading && (isError || !devices) && (
        <EmptyState
          icon={<Laptop className="size-8" />}
          title="Devices didn't load"
          description="The request to fetch your logged-in devices failed. Try again in a moment."
        />
      )}

      {!isLoading && devices && devices.length === 0 && (
        <EmptyState
          icon={<Laptop className="size-8" />}
          title="No active devices"
          description="Devices you log in from will show up here."
        />
      )}

      {!isLoading && devices && devices.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Logged in</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="flex items-center gap-2 font-medium">
                      <Laptop className="size-4 text-muted-foreground" />
                      {device.deviceName}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {device.lastUsedAt
                        ? formatDistanceToNow(new Date(device.lastUsedAt), {
                            addSuffix: true,
                          })
                        : "Never"}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(device.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(device.expiresAt), {
                        addSuffix: true,
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setRevokeTarget(device)}
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <RevokeModal
        device={revokeTarget}
        isRevoking={revokeDevice.isPending}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => {
          if (revokeTarget) revokeDevice.mutate(revokeTarget.id)
        }}
      />
    </div>
  )
}
