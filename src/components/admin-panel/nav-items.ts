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
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  icon: LucideIcon
  href: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
      { title: "Data Member", icon: UserCircle, href: "/admin/members" },
    ],
  },
  {
    label: "Manajemen Taaruf",
    items: [
      { title: "Manajemen Event", icon: CalendarDays, href: "/admin/events" },
      { title: "Live Match-Making", icon: HeartHandshake, href: "/admin/matches" },
    ],
  },
  {
    label: "Master Data",
    items: [
      { title: "Manajemen Wilayah", icon: MapPin, href: "/admin/master" },
    ],
  },
  {
    label: "Tim Lapangan",
    items: [
      { title: "Studio Foto", icon: Camera, href: "/admin/events/photography" },
      { title: "Manajemen Staff", icon: Users, href: "/admin/staff" },
    ],
  },
]
