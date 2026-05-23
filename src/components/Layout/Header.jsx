import { useContext, useMemo, useState } from 'react'
import { Bell, ChevronDown, Moon, Search, Sun } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import { AppContext } from '../../context/AppContext'

const Header = ({ collapsed, onToggleSidebar, theme, setTheme }) => {
  const { currentUser, session, logout } = useContext(AuthContext)
  const { notifications, markNotificationRead, clearAllNotifications } = useContext(AppContext)
  const [panelOpen, setPanelOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const unreadCount = useMemo(() => notifications.filter((note) => !note.read).length, [notifications])

  const handleToggle = () => setPanelOpen((value) => !value)
  const markRead = (id) => markNotificationRead(id)

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="icon-btn" type="button" onClick={onToggleSidebar}>
          <span className="burger-line" />
          <span className="burger-line" />
          <span className="burger-line" />
        </button>
        <div className="page-meta">
          <p>Intelligent care system</p>
          <strong>Enterprise hospital platform</strong>
        </div>
      </div>

      <div className="header-right">
        <div className="header-action search-box">
          <Search size={16} />
          <input placeholder="Search patients, doctors, appointments" />
        </div>

        <button className="icon-btn" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="notification-menu">
          <button className="icon-btn badge" type="button" onClick={handleToggle}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
          </button>
          {panelOpen && (
            <div className="notification-panel">
              <div className="panel-header">
                <span>Notifications</span>
                <button type="button" onClick={() => notifications.forEach((note) => note.read || markRead(note.id))}>Mark all read</button>
              </div>
              <div className="panel-body">
                {notifications.length === 0 ? (
                  <div className="empty-state">You are all caught up.</div>
                ) : (
                  notifications.map((note) => (
                    <button key={note.id} type="button" className={`notification-item ${note.read ? 'read' : ''}`} onClick={() => markRead(note.id)}>
                      <strong>{note.type ? note.type.toUpperCase() : 'Notice'}</strong>
                      <p>{note.text}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-dropdown-wrapper">
          <button className="profile-card" type="button" onClick={() => setProfileOpen((value) => !value)}>
            <div className="avatar">{currentUser?.avatar || currentUser?.name?.charAt(0)}</div>
            <div className="profile-meta">
              <span>{currentUser?.name || 'Guest'}</span>
              <small>{currentUser?.role?.toUpperCase()}</small>
            </div>
            <ChevronDown size={16} />
          </button>
          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <span>{currentUser?.name}</span>
                <small>{currentUser?.email}</small>
              </div>
              <div className="profile-dropdown-actions">
                <button className="btn btn-secondary" type="button" onClick={() => { logout(); setProfileOpen(false); }}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
