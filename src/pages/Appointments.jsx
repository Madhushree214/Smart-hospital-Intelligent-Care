import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import {
  Calendar,
  Clock,
  User,
  Activity,
  Plus,
  Inbox,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search
} from "lucide-react";
import Modal from "../components/Common/Modal";
import "../styles/appointments.css";

const Appointments = () => {
  const { currentUser } = useContext(AuthContext);
  const {
    appointments,
    doctors,
    patients,
    addAppointment,
    approveAppointment,
    cancelAppointment,
    addToast
  } = useContext(AppContext);

  const [showBookModal, setShowBookModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Interactive Calendar Selection
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Booking Form State
  const [booking, setBooking] = useState({
    patientId: currentUser.role === "patient" ? currentUser.id : "pat1",
    doctorId: "doc1",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "09:00 AM",
    symptoms: ""
  });

  const selectedDoctor = doctors.find((d) => d.id === booking.doctorId) || doctors[0];

  // --- Dynamic Busy Slots Filter ---
  // Find slots already booked for selected doctor on selected date
  const busySlots = appointments
    .filter((a) => a.doctorId === booking.doctorId && a.date === booking.date && a.status !== "Cancelled")
    .map((a) => a.timeSlot);

  const timeSlotsOptions = [
    "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM", "02:00 PM",
    "02:30 PM", "03:00 PM", "03:30 PM", "04:30 PM", "05:00 PM"
  ];

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!booking.symptoms.trim()) {
      addToast("Please provide details of symptoms/complaints.", "danger");
      return;
    }

    const patientMatch = patients.find((p) => p.id === booking.patientId) || patients[0];
    const doctorMatch = doctors.find((d) => d.id === booking.doctorId) || doctors[0];

    const newAppt = {
      patientName: patientMatch.name,
      patientId: patientMatch.id,
      doctorName: doctorMatch.name,
      doctorId: doctorMatch.id,
      department: doctorMatch.specialty,
      date: booking.date,
      timeSlot: booking.timeSlot,
      symptoms: booking.symptoms,
      status: currentUser.role === "patient" ? "Pending" : "Approved"
    };

    addAppointment(newAppt);
    addToast(
      currentUser.role === "patient"
        ? "Appointment booked! Awaiting desk receptionist approval."
        : "Appointment scheduled and auto-approved!",
      "success"
    );
    setShowBookModal(false);
    
    // Reset form
    setBooking({
      patientId: currentUser.role === "patient" ? currentUser.id : "pat1",
      doctorId: "doc1",
      date: new Date().toISOString().split("T")[0],
      timeSlot: "09:00 AM",
      symptoms: ""
    });
  };

  const handleApprove = (id) => {
    approveAppointment(id, currentUser.name, currentUser.role);
    addToast("Appointment request approved!", "success");
  };

  const handleCancel = (id) => {
    cancelAppointment(id, currentUser.name, currentUser.role);
    addToast("Appointment request cancelled.", "info");
  };

  // --- Calendar UI Helper ---
  // Create range of 7 calendar days starting today for selection
  const calendarDays = [];
  const todayDate = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() + i);
    calendarDays.push(d.toISOString().split("T")[0]);
  }

  // --- Filtering Logic ---
  const filteredAppts = appointments.filter((appt) => {
    const matchesSearch =
      appt.patientName.toLowerCase().includes(search.toLowerCase()) ||
      appt.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      appt.department.toLowerCase().includes(search.toLowerCase());
    
    // If patient role, ONLY show their own appointments
    const matchesRole = currentUser.role !== "patient" || appt.patientId === currentUser.id;
    const matchesStatus = statusFilter === "All" || appt.status === statusFilter;
    const matchesCalendar = selectedCalendarDate === "" || appt.date === selectedCalendarDate;

    return matchesSearch && matchesRole && matchesStatus && matchesCalendar;
  });

  const pendingAppts = appointments.filter((a) => a.status === "Pending");

  return (
    <div className="appt-page-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>Clinical Appointment Manager</h1>
          <p>Book specialty consultations and manage time slots</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBookModal(true)}>
          <Plus size={18} />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Grid of the page: Left Calendar, Right List */}
      <div className="appt-scheduler-columns">
        {/* Left Column: Interactive Scheduler Panel */}
        <div className="appt-scheduler-left">
          {/* Calendar Widget */}
          <div className="glass-card scheduler-calendar-card">
            <h3 className="widget-title"><Calendar size={18} /> Select Date View</h3>
            <p className="widget-subtitle">Click a date slot below to filter scheduled consultations</p>
            
            <div className="calendar-dates-deck">
              {calendarDays.map((dateStr) => {
                const parts = new Date(dateStr).toDateString().split(" "); // ["Fri", "May", "22", "2026"]
                const isSelected = selectedCalendarDate === dateStr;
                return (
                  <div
                    key={dateStr}
                    className={`calendar-date-bubble ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedCalendarDate(dateStr === selectedCalendarDate ? "" : dateStr)}
                  >
                    <span className="cal-day">{parts[0]}</span>
                    <span className="cal-date">{parts[2]}</span>
                    <span className="cal-month">{parts[1]}</span>
                  </div>
                );
              })}
            </div>
            
            {selectedCalendarDate && (
              <div className="selected-date-indicator">
                <span>Active Filters: <strong>{new Date(selectedCalendarDate).toDateString()}</strong></span>
                <button className="clear-date-btn" onClick={() => setSelectedCalendarDate("")}>Show All Dates</button>
              </div>
            )}
          </div>

          {/* Inbox Workflow for Desk Admins */}
          {currentUser.role !== "patient" && (
            <div className="glass-card appt-inbox-card">
              <div className="module-header" style={{ border: "none", padding: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Inbox size={18} className="text-secondary" />
                  <h3>Approvals Inbox</h3>
                </div>
                <span className="badge-alert-count">{pendingAppts.length} Pending</span>
              </div>

              <div className="inbox-list-wrapper">
                {pendingAppts.length === 0 ? (
                  <div className="empty-inbox"><p>Inbox clear! No outstanding actions.</p></div>
                ) : (
                  <ul className="inbox-strip-list">
                    {pendingAppts.map((appt) => (
                      <li key={appt.id} className="inbox-strip-item glass-card">
                        <div className="inbox-item-top">
                          <span className="inbox-patient">{appt.patientName}</span>
                          <span className="inbox-date">{appt.date} @ {appt.timeSlot}</span>
                        </div>
                        <p className="inbox-details">
                          <strong>Doctor:</strong> {appt.doctorName} ({appt.department})
                        </p>
                        <p className="inbox-details truncate-desc">
                          <strong>Complaints:</strong> {appt.symptoms}
                        </p>
                        <div className="inbox-actions">
                          <button className="btn btn-secondary btn-inbox-cancel" onClick={() => handleCancel(appt.id)}>
                            <XCircle size={14} /> Cancel
                          </button>
                          <button className="btn btn-primary btn-inbox-approve" onClick={() => handleApprove(appt.id)}>
                            <CheckCircle size={14} /> Approve
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Directory and Filter list */}
        <div className="appt-scheduler-right glass-card">
          <div className="scheduler-header-bar">
            <h3>Consultation Checklist</h3>
            <div className="scheduler-filters">
              <div className="search-box">
                <Search size={14} className="text-secondary" />
                <input
                  type="text"
                  placeholder="Search patients, specialists..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="filter-select-inline"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All States</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="scheduled-bookings-scroller">
            {filteredAppts.length === 0 ? (
              <div className="empty-scheduler-placeholder">
                <AlertCircle size={32} className="text-muted" />
                <p>No appointments match the active directory parameters.</p>
              </div>
            ) : (
              <ul className="scheduler-timeline-list">
                {filteredAppts.map((appt) => (
                  <li key={appt.id} className="scheduler-booking-node glass-card">
                    <div className="node-head">
                      <div className="patient-avatar-node" style={{ backgroundColor: "var(--indigo-color)" }}>
                        {appt.patientName[0]}
                      </div>
                      <div className="node-pat-details">
                        <span className="node-pat-name">{appt.patientName}</span>
                        <span className="node-doc-meta">Consulting {appt.doctorName} • {appt.department}</span>
                      </div>
                      <span className={`status-pill ${appt.status.toLowerCase()}`}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="node-time-strip">
                      <div className="time-metric">
                        <Calendar size={12} />
                        <span>{appt.date}</span>
                      </div>
                      <div className="time-metric">
                        <Clock size={12} />
                        <span>{appt.timeSlot}</span>
                      </div>
                    </div>

                    <p className="node-complaint"><strong>Reason:</strong> {appt.symptoms}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* BOOK APPOINTMENT MODAL DIALOG */}
      <Modal isOpen={showBookModal} onClose={() => setShowBookModal(false)} title="Schedule Medical Consultation">
        <form onSubmit={handleBookingSubmit} className="booking-modal-form">
          {currentUser.role !== "patient" && (
            <div className="form-group">
              <label>Select Admitted Patient</label>
              <select
                className="form-control"
                value={booking.patientId}
                onChange={(e) => setBooking({ ...booking, patientId: e.target.value })}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Age {p.age})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Select Doctor Specialist</label>
              <select
                className="form-control"
                value={booking.doctorId}
                onChange={(e) => setBooking({ ...booking, doctorId: e.target.value })}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Consultation Date</label>
              <input
                type="date"
                className="form-control"
                value={booking.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBooking({ ...booking, date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Available Daily Time Slots</label>
            <div className="booking-slots-picker-grid">
              {timeSlotsOptions.map((slot) => {
                const isBusy = busySlots.includes(slot);
                const isSelected = booking.timeSlot === slot;
                
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-bubble-btn ${isBusy ? "busy" : ""} ${isSelected ? "selected" : ""}`}
                    disabled={isBusy}
                    onClick={() => setBooking({ ...booking, timeSlot: slot })}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            <span className="slot-warning-text">Busy time slots are marked with diagnostic red and disabled to prevent double bookings.</span>
          </div>

          <div className="form-group">
            <label>Describe Active Symptoms / Consultation Reason</label>
            <textarea
              className="form-control"
              placeholder="e.g. Regular monthly post attack checkup or minor chest discomfort and dizziness..."
              value={booking.symptoms}
              onChange={(e) => setBooking({ ...booking, symptoms: e.target.value })}
              rows={3}
              style={{ resize: "none" }}
            />
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowBookModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentUser.role === "patient" ? "Submit Booking Request" : "Schedule & Approve"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
