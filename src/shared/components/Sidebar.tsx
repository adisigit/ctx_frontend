import { NavLink, useNavigate } from "react-router-dom"
import { Activity, ChevronDown, LayoutDashboard, LogOut, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { authService } from "@/features/auth/services/AuthServices"
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from "@/components/ui/collapsible"

interface SidebarProps {
  onNavigate?: () => void
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium tracking-[-0.16px] transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-foreground/70 hover:bg-muted hover:text-foreground"
  )

const teamLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-sm px-3 py-2 pl-9 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-foreground/70 hover:bg-muted hover:text-foreground"
  )

export function Sidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authService.logOut()
    navigate("/login", { replace: true })
  }

  const teams = [
    {
      id: "team-1",
      name: "Acme Project",
    },
    {
      id: "team-2",
      name: "Nedo Team",
    },
    {
      id: "team-3",
      name: "Personal",
    },
  ]

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="hidden p-5 md:block">
        <div className="text-base font-semibold tracking-[-0.16px] text-foreground">
          ctx
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">Context tracker</p>
      </div>

      {/* Tambah NavLink lain di sini seiring fitur baru (Contexts, Team, Devices, Settings) */}
      <nav className="flex-1 space-y-1 p-3 pt-16 md:pt-3">
        <NavLink to="/dashboard" className={navLinkClass} onClick={onNavigate}>
          <LayoutDashboard className="size-4" />
          Dashboard
        </NavLink>
        <Collapsible defaultOpen>
          <CollapsibleTrigger
            className={cn(
              "group flex w-full items-center gap-2 rounded-sm px-3 py-2",
              "text-sm font-medium tracking-[-0.16px]",
              "text-foreground/70 transition-colors",
              "hover:bg-muted hover:text-foreground"
            )}
          >
            <Users className="size-4" />

            <span className="flex-1 text-left">
              Team
            </span>

            <ChevronDown
              className="size-4 transition-transform group-data-[state=open]:rotate-180"
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-1 space-y-1">
            {teams.map((team) => (
              <NavLink
                key={team.id}
                to={`/team/${team.id}`}
                className={teamLinkClass}
                onClick={onNavigate}
              >
                {team.name}
              </NavLink>
            ))}
          </CollapsibleContent>
        </Collapsible>
        <NavLink to="/myactivity" className={navLinkClass} onClick={onNavigate}>
          <Activity className="size-4" />
          My Activity
        </NavLink>
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium tracking-[-0.16px] text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
