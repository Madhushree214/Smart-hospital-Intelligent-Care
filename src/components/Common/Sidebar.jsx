import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  Cpu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Define navigation items based on user role
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "receptionist", "patient"] },
    { path: "/patients", label: "Patients", icon: Users, roles: ["admin", "doctor", "receptionist"] },
    { path: "/doctors", label: "Doctors", icon: UserCheck, roles: ["admin", "receptionist"] },
    { path: "/appointments", label: "Appointments", icon: Calendar, roles: ["admin", "doctor", "receptionist", "patient"] },
    { path: "/billing", label: "Pharmacy & Billing", icon: CreditCard, roles: ["admin", "receptionist", "patient"] },
    { path: "/analytics", label: "AI Health Analytics", icon: Cpu, roles: ["admin", "doctor", "patient"] }
  ];

  // Filter navigation items by active user role
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className={`sidebar-aside ${isCollapsed ? "collapsed" : ""}`}>
      {/* Branding Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Heart className="heart-icon pulse-animation" size={24} />
        </div>
        {!isCollapsed && <span className="brand-name">Med<span className="accent">Vitals</span></span>}
      </div>

      {/* Collapse Toggle */}
      <button
        className="collapse-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <ul>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  title={isCollapsed ? item.label : ""}
                >
                  <Icon size={20} className="nav-icon" />
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile Footer */}
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <div className="user-profile-summary">
            <div className="avatar-placeholder" style={{ backgroundColor: "var(--primary-color)" }}>
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="user-details-text">
              <div className="user-profile-name">{currentUser.name}</div>
              <div className="user-profile-role">{currentUser.role.toUpperCase()}</div>
            </div>
          </div>
        ) : (
          <div className="avatar-placeholder collapsed-avatar" style={{ backgroundColor: "var(--primary-color)" }}>
            {currentUser.name.split(" ").map(n => n[0]).join("")}
          </div>
        )}
        <button className="logout-btn" onClick={logout} title="Log Out">
          <LogOut size={20} />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
