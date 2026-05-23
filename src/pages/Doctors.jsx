import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import {
  Star,
  Mail,
  Phone,
  Calendar,
  Award,
  Users,
  Activity,
  Heart,
  TrendingUp
} from "lucide-react";
import "../styles/doctors.css";

const Doctors = () => {
  const { currentUser } = useContext(AuthContext);
  const { doctors, toggleDoctorAvailability, addToast } = useContext(AppContext);
  
  // Department filter
  const [selectedDept, setSelectedDept] = useState("All");

  const handleStatusToggle = (id) => {
    toggleDoctorAvailability(id, currentUser.name, currentUser.role);
    addToast("Doctor availability status cycled successfully!", "success");
  };

  const departmentsList = ["All", "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Oncology", "Emergency Medicine"];

  const filteredDoctors = selectedDept === "All"
    ? doctors
    : doctors.filter((d) => d.specialty === selectedDept);

  return (
    <div className="doctors-page-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>Medical Specialist Directory</h1>
          <p>Review specialty allocations, ratings, and real-time duty availability</p>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="dept-tabs-container glass-card">
        {departmentsList.map((dept) => (
          <button
            key={dept}
            className={`dept-tab-btn ${selectedDept === dept ? "active" : ""}`}
            onClick={() => setSelectedDept(dept)}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Doctors Grid Deck */}
      <div className="doctors-deck-grid">
        {filteredDoctors.map((doc) => {
          let statusClass = "active";
          if (doc.availability === "On Call") statusClass = "on-call";
          if (doc.availability === "On Leave") statusClass = "on-leave";

          return (
            <div key={doc.id} className="glass-card doctor-profile-card">
              {/* Header profile initials & ratings */}
              <div className="doc-card-top">
                <div className="avatar-placeholder doc-avatar" style={{ backgroundColor: doc.avatarColor }}>
                  {doc.name.split(" ").slice(1).map(n => n[0]).join("")}
                </div>
                <div className="doc-meta-header">
                  <h3 className="doc-name">{doc.name}</h3>
                  <span className="doc-specialty-badge">{doc.specialty}</span>
                  <div className="doc-rating">
                    <Star size={14} className="star-icon" />
                    <span>{doc.rating} Stars</span>
                  </div>
                </div>
              </div>

              {/* Contact Grid details */}
              <div className="doc-details-divider"></div>
              
              <div className="doc-contact-grid">
                <div className="contact-node">
                  <Mail size={14} className="text-secondary" />
                  <span>{doc.email}</span>
                </div>
                <div className="contact-node">
                  <Phone size={14} className="text-secondary" />
                  <span>{doc.phone}</span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="doc-performance-box glass-card">
                <div className="perf-metric">
                  <Users size={16} className="text-primary" />
                  <div>
                    <span className="perf-val">{doc.totalPatients}</span>
                    <span className="perf-lbl">Patients Treated</span>
                  </div>
                </div>
                <div className="perf-metric">
                  <TrendingUp size={16} className="text-success" />
                  <div>
                    <span className="perf-val">{doc.performance}%</span>
                    <span className="perf-lbl">Cure rate score</span>
                  </div>
                </div>
              </div>

              {/* Duty Schedule Days */}
              <div className="doc-duty-schedule">
                <span className="schedule-lbl">Duty Days Schedule:</span>
                <div className="duty-days-row">
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => {
                    // Match day character
                    const isDuty = doc.schedule.some(s => s.startsWith(day) || (day === "Mon" && doc.schedule.includes("Monday")) || (day === "Tue" && doc.schedule.includes("Tuesday")) || (day === "Wed" && doc.schedule.includes("Wednesday")) || (day === "Thu" && doc.schedule.includes("Thursday")) || (day === "Fri" && doc.schedule.includes("Friday")));
                    return (
                      <span key={day} className={`duty-day-dot ${isDuty ? "active" : ""}`}>
                        {day[0]}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Availability status pill & actions */}
              <div className="doc-card-footer">
                <div className="status-indicator-block">
                  <span className="status-label">Availability:</span>
                  <span className={`status-pill ${statusClass}`}>
                    {doc.availability}
                  </span>
                </div>
                {currentUser.role !== "patient" && (
                  <button className="btn btn-secondary cycle-status-action" onClick={() => handleStatusToggle(doc.id)}>
                    Cycle Duty Status
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Doctors;
