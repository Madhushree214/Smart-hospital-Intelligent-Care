import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AppContext } from "../../context/AppContext";
import {
  Heart,
  Shield,
  Stethoscope,
  CalendarDays,
  UserCheck,
  KeyRound,
  ArrowRight
} from "lucide-react";
import "./Auth.css";

const Login = () => {
  const { login, quickLogin, currentUser } = useContext(AuthContext);
  const { addToast } = useContext(AppContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    const res = login(email, password);
    if (res.success) {
      if (res.user.role !== role) {
        setError(`Please select the correct role for ${role} access.`);
        return;
      }
      addToast(`Welcome back, ${res.user.name}!`, "success");
      navigate("/dashboard");
    } else {
      setError(res.error || "Invalid login credentials.");
    }
  };

  const handleQuickLogin = (selectedRole) => {
    quickLogin(selectedRole);
    addToast(`Quick Login: Logged in successfully as ${selectedRole.toUpperCase()}`, "success");
    navigate("/dashboard");
  };

  return (
    <div className="auth-wrapper">
      {/* Visual background shapes */}
      <div className="blur-circle circle-1"></div>
      <div className="blur-circle circle-2"></div>

      <div className="auth-container">
        {/* Left Side: Branding and details */}
        <div className="auth-branding glass-card">
          <div className="auth-brand-logo">
            <Heart size={32} className="heart-icon pulse-animation" />
          </div>
          <h2>Med<span className="accent">Vitals</span></h2>
          <p className="subtitle">Enterprise Smart Healthcare Management Platform</p>
          
          <div className="feature-bullets">
            <div className="feature-item">
              <Shield size={16} className="feature-icon" />
              <span>Role-Based Access Protections</span>
            </div>
            <div className="feature-item">
              <Stethoscope size={16} className="feature-icon" />
              <span>Smart Hospital Bed Grid Visualizer</span>
            </div>
            <div className="feature-item">
              <CalendarDays size={16} className="feature-icon" />
              <span>Integrated Doctor Schedules & Appointments</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form and quick fills */}
        <div className="auth-form-card glass-card">
          <div className="form-card-header">
            <h3>Sign In</h3>
            <p>Access your professional hospital portal</p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Select Workspace Portal</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Administrator Portal</option>
                <option value="doctor">Medical Specialist Portal</option>
                <option value="receptionist">Reception & Desk Portal</option>
                <option value="patient">Patient Portal</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@medvitals.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "2.5rem" }}
                />
                <KeyRound size={16} className="input-inner-icon" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn">
              <span>Enter Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Login Testing panel */}
          <div className="quick-testing-panel">
            <div className="panel-divider">
              <span>Or Switch instantly (Demo Mode)</span>
            </div>
            <p className="test-desc">Click any avatar below to log in instantly with that role</p>
            <div className="quick-role-buttons">
              <button onClick={() => handleQuickLogin("admin")} className="quick-role-card admin" title="Login as Admin">
                <Shield size={18} />
                <span>Admin</span>
              </button>
              <button onClick={() => handleQuickLogin("doctor")} className="quick-role-card doctor" title="Login as Doctor">
                <Stethoscope size={18} />
                <span>Doctor</span>
              </button>
              <button onClick={() => handleQuickLogin("receptionist")} className="quick-role-card receptionist" title="Login as Receptionist">
                <UserCheck size={18} />
                <span>Desk</span>
              </button>
              <button onClick={() => handleQuickLogin("patient")} className="quick-role-card patient" title="Login as Patient">
                <Heart size={18} />
                <span>Patient</span>
              </button>
            </div>
            
            <div className="auth-footer-links">
              <span className="register-prompt" onClick={() => navigate("/register")}>
                New Patient? <strong>Register here</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
