import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { Bell, CalendarDays, ClipboardList, LayoutDashboard, Pill, ShieldCheck, Stethoscope, UserCheck, Users } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'

const navConfig = {
  admin: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Patients', to: '/patients', icon: Users },
    { label: 'Doctors', to: '/doctors', icon: Stethoscope },
    { label: 'Appointments', to: '/appointments', icon: CalendarDays },
    { label: 'Pharmacy', to: '/pharmacy', icon: Pill },
    { label: 'Analytics', to: '/analytics', icon: ClipboardList }
  ],
  doctor: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', to: '/appointments', icon: CalendarDays },
    { label: 'Patients', to: '/patients', icon: Users },
    { label: 'Analytics', to: '/analytics', icon: ClipboardList }
  ],
  receptionist: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', to: '/appointments', icon: CalendarDays },
    { label: 'Patients', to: '/patients', icon: Users },
    { label: 'Pharmacy', to: '/pharmacy', icon: Pill }
  ],
  patient: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', to: '/appointments', icon: CalendarDays },
    { label: 'Health Hub', to: '/analytics', icon: ShieldCheck }
  ]
}

const Sidebar = ({ collapsed }) => {
  const { currentUser } = useContext(AuthContext)
  const role = currentUser?.role || 'patient'
  const items = navConfig[role] || navConfig.patient

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand-panel">
        <div className="brand-icon">SH</div>
        <div className="brand-text">
          <span>Smart Hospital</span>
          <small>Intelligent Care</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-status">
        <div>
          <span className="status-label">Role</span>
          <strong>{role?.toUpperCase()}</strong>
        </div>
        <div className="status-chip">
          <Bell size={14} />
          <span>Live</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
