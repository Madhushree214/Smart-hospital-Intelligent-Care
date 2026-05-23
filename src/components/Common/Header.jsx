import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { AppContext } from "../../context/AppContext";
import {
  Bell,
  Sun,
  Moon,
  Search,
  ChevronDown,
  RefreshCw,
  LogOut,
  X
} from "lucide-react";
import "./Header.css";

const Header = ({ isSidebarCollapsed }) => {
  const { currentUser, logout, quickLogin } = useContext(AuthContext);
  const {
    notifications,
    dismissNotification,
    clearAllNotifications,
    theme,
    toggleTheme,
    addToast
  } = useContext(AppContext);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const handleRoleSwitch = (newRole) => {
    quickLogin(newRole);
    addToast(`Switched user role to ${newRole.toUpperCase()} successfully!`, "success");
    setShowUserMenu(false);
  };

  return (
    <header className={`app-header ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Search Bar */}
      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search records, schedules, inventory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Action Controls */}
      <div className="header-actions">
        {/* Rapid Role Swapper Alert info */}
        <div className="role-badge pulse-dot">
          <span>Active Session: <strong>{currentUser.role.toUpperCase()}</strong></span>
        </div>

        {/* Theme Toggle */}
        <button
          className="header-action-btn theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Bell */}
        <div className="notif-bell-container" ref={notifRef}>
          <button
            className="header-action-btn bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="notif-count-badge">{notifications.length}</span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="notif-dropdown glass-card">
              <div className="notif-header">
                <h3>System Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={clearAllNotifications} className="clear-all-btn">
                    Clear All
                  </button>
                )}
              </div>
              <div className="notif-body">
                {notifications.length === 0 ? (
                  <div className="empty-notifs">
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <ul className="notifs-list">
                    {notifications.map((notif) => (
                      <li key={notif.id} className={`notif-item ${notif.type}`}>
                        <div className="notif-content-wrapper">
                          <p className="notif-text">{notif.text}</p>
                          <span className="notif-time">{notif.time}</span>
                        </div>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="dismiss-notif-btn"
                          title="Dismiss"
                        >
                          <X size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Controls */}
        <div className="user-dropdown-container" ref={userRef}>
          <button className="user-menu-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="avatar-header" style={{ backgroundColor: "var(--primary-color)" }}>
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </div>
            <span className="username-header">{currentUser.name}</span>
            <ChevronDown size={14} className={`chevron-icon ${showUserMenu ? "rotate" : ""}`} />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="user-menu-dropdown glass-card">
              <div className="user-menu-header">
                <h4>{currentUser.name}</h4>
                <p>{currentUser.email}</p>
              </div>
              
              <div className="role-swapper-section">
                <h5>Switch Role (Evaluation Mode)</h5>
                <div className="role-button-grid">
                  {["admin", "doctor", "receptionist", "patient"].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSwitch(r)}
                      className={`role-switch-btn ${currentUser.role === r ? "active" : ""}`}
                    >
                      <RefreshCw size={12} className="spin-on-hover" />
                      <span>{r.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="user-menu-footer">
                <button onClick={logout} className="menu-logout-btn">
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
