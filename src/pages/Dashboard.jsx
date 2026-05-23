import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import {
  Users,
  Calendar,
  CreditCard,
  AlertOctagon,
  Shield,
  Stethoscope,
  Clock,
  Briefcase,
  Activity,
  Heart,
  TrendingUp,
  Sliders,
  DollarSign
} from "lucide-react";
import Modal from "../components/Common/Modal";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const {
    patients,
    doctors,
    appointments,
    beds,
    bills,
    logs,
    theme,
    updatePatient,
    approveAppointment,
    cancelAppointment,
    payBill,
    addToast
  } = useContext(AppContext);

  // Modal active variables
  const [selectedBed, setSelectedBed] = useState(null);
  const [showBedModal, setShowBedModal] = useState(false);

  if (!currentUser) return null;

  const role = currentUser.role;

  // --- Compute Global Hospital Metrics ---
  const totalPatients = patients.length;
  const activeDoctors = doctors.filter((d) => d.availability === "Active").length;
  const pendingAppointments = appointments.filter((a) => a.status === "Pending").length;
  const criticalCases = patients.filter((p) => p.status === "Critical").length;
  const totalPaidRevenue = bills
    .filter((b) => b.status === "Paid")
    .reduce((acc, curr) => acc + curr.total, 0);

  const occupiedBeds = beds.filter((b) => b.status !== "Available").length;
  const bedOccupancyRate = Math.round((occupiedBeds / beds.length) * 100);

  // --- Sub-render: Analytical KPIs ---
  const renderKPIs = () => {
    return (
      <div className="kpi-grid">
        <div className="glass-card kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Total Patients</span>
            <span className="kpi-value">{totalPatients}</span>
            <span className="kpi-subtext text-success">Active database profiles</span>
          </div>
          <div className="kpi-icon-wrapper cyan">
            <Users size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Bed Occupancy</span>
            <span className="kpi-value">{bedOccupancyRate}%</span>
            <span className="kpi-subtext text-warning">{occupiedBeds} of {beds.length} occupied</span>
          </div>
          <div className="kpi-icon-wrapper teal">
            <Activity size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Pending Bookings</span>
            <span className="kpi-value">{pendingAppointments}</span>
            <span className="kpi-subtext text-info">Awaiting specialist review</span>
          </div>
          <div className="kpi-icon-wrapper indigo">
            <Calendar size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Daily Revenue</span>
            <span className="kpi-value">${totalPaidRevenue.toLocaleString()}</span>
            <span className="kpi-subtext text-success">Cleared insurance/cash payments</span>
          </div>
          <div className="kpi-icon-wrapper green">
            <DollarSign size={24} />
          </div>
        </div>
      </div>
    );
  };

  // --- SUB-RENDER 1: ADMIN DASHBOARD ---
  const renderAdminDashboard = () => {
    const handleBedClick = (bed) => {
      setSelectedBed(bed);
      setShowBedModal(true);
    };

    const handleDischargePatient = () => {
      if (selectedBed && selectedBed.occupant) {
        const patient = patients.find((p) => p.name === selectedBed.occupant);
        if (patient) {
          updatePatient(patient.id, { status: "Discharged", room: "Outpatient" }, currentUser.name, currentUser.role);
          addToast(`Patient ${patient.name} has been successfully discharged and room freed!`, "success");
        }
        setShowBedModal(false);
      }
    };

    return (
      <div className="dashboard-layout-columns">
        {/* Left Column: Interactive Beds Grid & Analytics */}
        <div className="column-left">
          {/* Bed Grid Visual Mapper */}
          <div className="glass-card module-card">
            <div className="module-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Stethoscope className="pulse-primary-dot" size={18} />
                <h3>Interactive Ward Bed Status Grid</h3>
              </div>
              <span className="bed-legend-summary">Click any bed to view allocation details</span>
            </div>
            
            <div className="bed-legend-bar">
              <span className="legend-item"><span className="legend-dot green"></span>Available</span>
              <span className="legend-item"><span className="legend-dot orange"></span>Occupied</span>
              <span className="legend-item"><span className="legend-dot red"></span>Critical ICU</span>
            </div>

            <div className="beds-grid-display">
              {beds.map((bed, idx) => {
                let statusClass = "green";
                if (bed.status === "Occupied") statusClass = "orange";
                if (bed.status === "Critical ICU") statusClass = "red";
                
                return (
                  <div
                    key={idx}
                    className={`bed-slot-card ${statusClass}`}
                    onClick={() => handleBedClick(bed)}
                  >
                    <span className="bed-room-num">{bed.room}</span>
                    <span className="bed-type-lbl">{bed.type}</span>
                    {bed.occupant ? (
                      <span className="bed-occupant-name">{bed.occupant}</span>
                    ) : (
                      <span className="bed-occupant-free">VACANT</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inline Pure CSS Analytics Charts */}
          <div className="glass-card module-card">
            <div className="module-header">
              <h3>Analytical Revenue & Resource Breakdown</h3>
            </div>
            
            <div className="charts-flexbox">
              {/* CSS Bar Chart */}
              <div className="custom-css-bar-chart">
                <span className="chart-title">Revenue by Department (K$)</span>
                <div className="bar-chart-grid">
                  <div className="chart-bar-col">
                    <div className="bar-fill" style={{ height: "85%" }}><span className="bar-val">$45K</span></div>
                    <span className="bar-lbl">Cardiology</span>
                  </div>
                  <div className="chart-bar-col">
                    <div className="bar-fill" style={{ height: "60%" }}><span className="bar-val">$32K</span></div>
                    <span className="bar-lbl">Neurology</span>
                  </div>
                  <div className="chart-bar-col">
                    <div className="bar-fill" style={{ height: "45%" }}><span className="bar-val">$24K</span></div>
                    <span className="bar-lbl">Pediatrics</span>
                  </div>
                  <div className="chart-bar-col">
                    <div className="bar-fill" style={{ height: "70%" }}><span className="bar-val">$38K</span></div>
                    <span className="bar-lbl">Orthopedics</span>
                  </div>
                  <div className="chart-bar-col">
                    <div className="bar-fill" style={{ height: "95%" }}><span className="bar-val">$52K</span></div>
                    <span className="bar-lbl">Emergency</span>
                  </div>
                </div>
              </div>

              {/* Progress Radial Gauges */}
              <div className="chart-gauges-container">
                <span className="chart-title">Global KPIs Saturation</span>
                <div className="gauge-item">
                  <div className="gauge-info-text">
                    <span className="gauge-name">ICU Capacity Load</span>
                    <span className="gauge-percent text-danger">75%</span>
                  </div>
                  <div className="gauge-track"><div className="gauge-fill danger" style={{ width: "75%" }}></div></div>
                </div>
                <div className="gauge-item">
                  <div className="gauge-info-text">
                    <span className="gauge-name">Pharmacy Stock Levels</span>
                    <span className="gauge-percent text-success">92%</span>
                  </div>
                  <div className="gauge-track"><div className="gauge-fill success" style={{ width: "92%" }}></div></div>
                </div>
                <div className="gauge-item">
                  <div className="gauge-info-text">
                    <span className="gauge-name">Patient Satisfaction</span>
                    <span className="gauge-percent text-primary">96%</span>
                  </div>
                  <div className="gauge-track"><div className="gauge-fill primary" style={{ width: "96%" }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Logs Activity Feed */}
        <div className="column-right">
          <div className="glass-card audit-log-module">
            <div className="module-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={18} className="text-secondary" />
                <h3>Hospital Core Activity & Audit Feed</h3>
              </div>
            </div>

            <div className="audit-feed-wrapper">
              {logs.length === 0 ? (
                <div className="empty-logs"><p>No system activity captured yet.</p></div>
              ) : (
                <ul className="audit-logs-list">
                  {logs.map((log) => {
                    let roleBadgeClass = "sys";
                    if (log.role === "admin") roleBadgeClass = "admin";
                    if (log.role === "doctor") roleBadgeClass = "doctor";
                    if (log.role === "receptionist") roleBadgeClass = "rec";
                    if (log.role === "patient") roleBadgeClass = "pat";

                    return (
                      <li key={log.id} className="audit-log-item">
                        <div className="log-top">
                          <span className={`log-actor-badge ${roleBadgeClass}`}>{log.user} ({log.role.toUpperCase()})</span>
                          <span className="log-time-stamp">{log.time.split(",")[1] || log.time}</span>
                        </div>
                        <p className="log-text-content">{log.text}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Bed Allocation detail Modal */}
        <Modal isOpen={showBedModal} onClose={() => setShowBedModal(false)} title={`Bed Ward ${selectedBed?.room} Details`}>
          {selectedBed && (
            <div className="bed-details-body">
              <div className="bed-details-top-info">
                <p><strong>Ward Room Number:</strong> {selectedBed.room}</p>
                <p><strong>Bed Type Class:</strong> {selectedBed.type}</p>
                <p>
                  <strong>Occupancy Status:</strong> 
                  <span className={`status-pill ${selectedBed.status.toLowerCase().replace(" ", "-")}`}>
                    {selectedBed.status}
                  </span>
                </p>
              </div>

              {selectedBed.occupant ? (
                <div className="bed-occupant-details-box glass-card">
                  <h4>Active Occupant Detail</h4>
                  <p className="occupant-name-highlight">{selectedBed.occupant}</p>
                  <p className="occupant-desc">Admitted patient receiving specialized department care.</p>
                  <div className="bed-occupant-actions">
                    <button className="btn btn-danger" onClick={handleDischargePatient}>
                      Discharge Patient & Free Bed
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bed-empty-placeholder-box">
                  <p>This bed is currently vacant. Patients can be allocated to this room from the Patients Module during admission check-in.</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    );
  };

  // --- SUB-RENDER 2: DOCTOR DASHBOARD ---
  const renderDoctorDashboard = () => {
    // Get clinical patients under their active specialty Sarah Jenkins -> Cardiology
    const targetDept = currentUser.role === "doctor" ? "Cardiology" : "General Medicine";
    const myPatients = patients.filter((p) => p.department === targetDept);
    const myAppointments = appointments.filter((a) => a.doctorId === "doc1" && a.status === "Approved");

    return (
      <div className="dashboard-layout-columns">
        <div className="column-left">
          {/* Assigned Patients Table */}
          <div className="glass-card module-card">
            <div className="module-header">
              <h3>Specialty Patients Directory ({targetDept})</h3>
            </div>
            
            <div className="table-container">
              {myPatients.length === 0 ? (
                <div className="empty-logs"><p>No patients under your specialty currently admitted.</p></div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Room</th>
                      <th>Vital Status</th>
                      <th>O2 Sat</th>
                      <th>Pulse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myPatients.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: "600" }}>{p.name} (Age {p.age})</td>
                        <td>{p.room}</td>
                        <td>
                          <span className={`status-pill ${p.status.toLowerCase()}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>{p.vitals.oxygen}%</td>
                        <td>{p.vitals.heartRate} bpm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="column-right">
          {/* Today's Appointments */}
          <div className="glass-card module-card">
            <div className="module-header">
              <h3>Today's Clinical Consultations</h3>
            </div>
            
            <div className="appointments-queue-list">
              {myAppointments.length === 0 ? (
                <div className="empty-logs"><p>No consultations scheduled today.</p></div>
              ) : (
                <ul className="dashboard-consultations-list">
                  {myAppointments.map((appt) => (
                    <li key={appt.id} className="consult-queue-item glass-card">
                      <div className="consult-time-bar">
                        <Clock size={14} className="text-primary" />
                        <span>{appt.timeSlot} - {appt.date}</span>
                      </div>
                      <div className="consult-patient-name">{appt.patientName}</div>
                      <p className="consult-notes"><strong>Indicated symptoms:</strong> {appt.symptoms}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- SUB-RENDER 3: RECEPTIONIST DASHBOARD ---
  const renderReceptionistDashboard = () => {
    const pendingAppts = appointments.filter((a) => a.status === "Pending");

    const handleApprove = (id) => {
      approveAppointment(id, currentUser.name, currentUser.role);
      addToast(`Appointment booking #${id} has been approved!`, "success");
    };

    const handleReject = (id) => {
      cancelAppointment(id, currentUser.name, currentUser.role);
      addToast(`Appointment booking #${id} was marked as Cancelled.`, "info");
    };

    return (
      <div className="dashboard-layout-columns">
        <div className="column-left">
          {/* Pending Appointments Approval Dashboard */}
          <div className="glass-card module-card">
            <div className="module-header">
              <h3>Appointments Awaiting Scheduling Review</h3>
              <span className="notif-count-badge" style={{ position: "relative", top: "unset", right: "unset", display: "inline-flex" }}>
                {pendingAppts.length}
              </span>
            </div>

            <div className="pending-approvals-wrapper">
              {pendingAppts.length === 0 ? (
                <div className="empty-logs"><p>No pending appointment requests to review.</p></div>
              ) : (
                <ul className="approvals-queue-list">
                  {pendingAppts.map((appt) => (
                    <li key={appt.id} className="approval-card glass-card">
                      <div className="approval-card-top">
                        <div className="patient-meta">
                          <span className="patient-name-lbl">{appt.patientName}</span>
                          <span className="patient-dept-lbl">{appt.department} Department</span>
                        </div>
                        <span className="appt-time-lbl">{appt.date} @ {appt.timeSlot}</span>
                      </div>
                      <p className="appt-symptoms-lbl"><strong>Specialist requested:</strong> {appt.doctorName}</p>
                      <p className="appt-symptoms-lbl"><strong>Reported complaints:</strong> {appt.symptoms}</p>
                      <div className="approval-card-actions">
                        <button className="btn btn-secondary" onClick={() => handleReject(appt.id)}>
                          Reject/Cancel
                        </button>
                        <button className="btn btn-primary" onClick={() => handleApprove(appt.id)}>
                          Approve Request
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="column-right">
          {/* Bed Vacancies Quick Overview */}
          <div className="glass-card module-card">
            <div className="module-header">
              <h3>Core Ward Bed Allocations</h3>
            </div>
            
            <div className="bed-list-overview">
              <ul className="bed-info-strip-list">
                {beds.slice(0, 6).map((bed, idx) => (
                  <li key={idx} className="bed-info-strip-item">
                    <span className="strip-room">{bed.room}</span>
                    <span className="strip-type">{bed.type}</span>
                    <span className={`status-pill ${bed.status.toLowerCase().replace(" ", "-")}`}>
                      {bed.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- SUB-RENDER 4: PATIENT DASHBOARD ---
  const renderPatientDashboard = () => {
    // John Doe pat1 matches
    const myProfile = patients.find((p) => p.id === "pat1");
    const myInvoices = bills.filter((b) => b.patientId === "pat1");
    const myAppts = appointments.filter((a) => a.patientId === "pat1");

    const handlePayBill = (id) => {
      payBill(id, currentUser.name, currentUser.role);
      addToast(`Invoice ${id} paid in full! Transaction completed.`, "success");
    };

    return (
      <div className="dashboard-layout-columns">
        <div className="column-left">
          {/* Diagnostic Profile Vitals Log */}
          {myProfile && (
            <div className="glass-card module-card">
              <div className="module-header">
                <h3>My Live Diagnostics Profile</h3>
              </div>
              
              <div className="patient-vitals-strip">
                <div className="vital-metric-card text-danger">
                  <span className="metric-title">Heart Rate</span>
                  <span className="metric-val">{myProfile.vitals.heartRate} bpm</span>
                  <span className="metric-lbl">Optimal Normal Range</span>
                </div>
                <div className="vital-metric-card text-success">
                  <span className="metric-title">Blood Pressure</span>
                  <span className="metric-val">{myProfile.vitals.bloodPressure}</span>
                  <span className="metric-lbl">Controlled</span>
                </div>
                <div className="vital-metric-card text-info">
                  <span className="metric-title">Oxygen Level</span>
                  <span className="metric-val">{myProfile.vitals.oxygen}% SpO2</span>
                  <span className="metric-lbl">Healthy Capacity</span>
                </div>
              </div>

              {/* Active Prescriptions list */}
              <div className="patient-prescriptions-box">
                <h4 style={{ margin: "1.5rem 0 0.75rem 0", fontSize: "1rem" }}>My Active Doctor Prescriptions</h4>
                {myProfile.prescriptions.length === 0 ? (
                  <p className="empty-lbl">No current active medicine prescriptions.</p>
                ) : (
                  <ul className="prescriptions-grid-list">
                    {myProfile.prescriptions.map((pr) => (
                      <li key={pr.id} className="prescription-card-item glass-card">
                        <span className="pres-med-name">{pr.name}</span>
                        <span className="pres-dosage">{pr.dosage}</span>
                        <span className="pres-doctor">Assigned by {pr.doctor}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="column-right">
          {/* Pending Bills Invoices */}
          <div className="glass-card module-card">
            <div className="module-header">
              <h3>My Billing Invoices</h3>
            </div>
            
            <div className="patient-billing-queue">
              {myInvoices.length === 0 ? (
                <p>No billing statement issued.</p>
              ) : (
                <ul className="billing-receipts-list">
                  {myInvoices.map((b) => (
                    <li key={b.id} className="bill-receipt-card glass-card">
                      <div className="bill-receipt-top">
                        <span className="receipt-id">Invoice #{b.id}</span>
                        <span className={`status-pill ${b.status.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="receipt-total">${b.total}</div>
                      {b.status === "Pending" ? (
                        <button className="btn btn-primary pay-now-action-btn" onClick={() => handlePayBill(b.id)}>
                          Simulate Payment Now
                        </button>
                      ) : (
                        <p className="receipt-paid-text">Paid via {b.paymentMethod}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>Welcome, {currentUser.name}</h1>
          <p>MedVitals Clinical Portal Dashboard Shell — Role: <strong>{role.toUpperCase()}</strong></p>
        </div>
      </div>

      {/* Baseline analytics cards */}
      {renderKPIs()}

      {/* Render Dynamic layout based on logged-in role */}
      {role === "admin" && renderAdminDashboard()}
      {role === "doctor" && renderDoctorDashboard()}
      {role === "receptionist" && renderReceptionistDashboard()}
      {role === "patient" && renderPatientDashboard()}
    </div>
  );
};

export default Dashboard;
