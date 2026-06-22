import {
  LayoutDashboard,
  CalendarDays,
  HeartHandshake,
  Users,
  Camera,
  UserCircle,
  MapPin,
  Home,
  Layers,
  PhoneCall,
  Eye,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  icon: LucideIcon
  href: string
  roles?: string[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
  roles?: string[]
}

export const navGroups: NavGroup[] = [
  {
    label: "General",
    roles: ["ADMIN"],
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
      { title: "Data Member", icon: UserCircle, href: "/admin/members" },
    ],
  },
  {
    label: "Manajemen Taaruf",
    roles: ["ADMIN"],
    items: [
      { title: "Manajemen Event", icon: CalendarDays, href: "/admin/events" },
      { title: "Live Match-Making", icon: HeartHandshake, href: "/admin/matches" },
    ],
  },
  {
    label: "Master Data",
    roles: ["ADMIN"],
    items: [
      { title: "Manajemen Wilayah", icon: MapPin, href: "/admin/master" },
      { title: "Kontak Tim Daerah", icon: PhoneCall, href: "/admin/contacts" },
    ],
  },
  {
    label: "Tim Lapangan",
    roles: ["ADMIN"],
    items: [
      { title: "Studio Foto", icon: Camera, href: "/admin/events/photography" },
      { title: "Manajemen Staff", icon: Users, href: "/admin/staff" },
    ],
  },
  {
    label: "Sistem",
    roles: ["ADMIN"],
    items: [
      { title: "Pengaturan", icon: Settings, href: "/admin/settings" },
    ],
  },
  {
    label: "Perantara",
    roles: ["PERANTARA"],
    items: [
      { title: "Daftar Event", icon: CalendarDays, href: "/admin/perantara" },
    ],
  },
]

export function getNavGroupsForRole(role: string): NavGroup[] {
  return navGroups.filter((group) => !group.roles || group.roles.includes(role))
}