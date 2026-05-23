import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import {
  Plus,
  Search,
  Filter,
  User,
  Heart,
  Calendar,
  Layers,
  FileSpreadsheet,
  X,
  Stethoscope,
  Trash2,
  FileText
} from "lucide-react";
import Modal from "../components/Common/Modal";
import "../styles/tables.css";

const Patients = () => {
  const { currentUser } = useContext(AuthContext);
  const {
    patients,
    beds,
    doctors,
    addPatient,
    updatePatient,
    deletePatient,
    addToast
  } = useContext(AppContext);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  // Selection Drawer States
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Modal control States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);

  // Add Patient Form State
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "Male",
    status: "Admitted",
    department: "General Medicine",
    room: "",
    condition: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "Spouse"
  });

  // Prescribe Medicine Form State
  const [newPres, setNewPres] = useState({
    name: "Amoxicillin 500mg",
    dosage: "1 tablet daily",
    doctor: "Dr. Sarah Jenkins"
  });

  const [filterCount, setFilterCount] = useState(0);
  const patientListRef = useRef(null);

  useEffect(() => {
    const count = patients.filter((patient) => {
      const matchesSearch = patient.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || patient.status === statusFilter;
      const matchesDept = deptFilter === "All" || patient.department === deptFilter;
      return matchesSearch && matchesStatus && matchesDept;
    }).length;
    setFilterCount(count);
  }, [patients, search, statusFilter, deptFilter]);

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  const handleAddPatientSubmit = (e) => {
    e.preventDefault();
    if (!newPatient.name.trim() || !newPatient.age || !newPatient.condition.trim()) {
      addToast("Please fill in all core fields.", "danger");
      return;
    }

    const packagedData = {
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      status: newPatient.status,
      department: newPatient.department,
      room: newPatient.status === "Admitted" ? newPatient.room || "101-A" : "Outpatient",
      condition: newPatient.condition,
      emergencyContact: {
        name: newPatient.emergencyName || "Not Provided",
        phone: newPatient.emergencyPhone || "Not Provided",
        relation: newPatient.emergencyRelation
      }
    };

    addPatient(packagedData, currentUser.name, currentUser.role);
    addToast(`Patient ${newPatient.name} admitted successfully!`, "success");
    setShowAddModal(false);
    
    // Reset form
    setNewPatient({
      name: "",
      age: "",
      gender: "Male",
      status: "Admitted",
      department: "General Medicine",
      room: "",
      condition: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelation: "Spouse"
    });
  };

  const handleDeletePatient = (id) => {
    if (window.confirm("Are you sure you want to delete this patient record?")) {
      deletePatient(id, currentUser.name, currentUser.role);
      addToast("Patient profile removed from records.", "info");
      if (selectedPatient?.id === id) {
        setSelectedPatient(null);
      }
    }
  };

  const handlePrescribeSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const prescriptionItem = {
      id: `pr-${Date.now()}`,
      name: newPres.name,
      dosage: newPres.dosage,
      doctor: newPres.doctor,
      date: new Date().toISOString().split("T")[0]
    };

    const updatedPrescriptions = [...selectedPatient.prescriptions, prescriptionItem];
    const newHistory = [
      ...selectedPatient.history,
      {
        date: new Date().toISOString().split("T")[0],
        type: "Prescription Issued",
        notes: `Prescribed ${newPres.name} - ${newPres.dosage} by ${newPres.doctor}.`
      }
    ];

    updatePatient(
      selectedPatient.id,
      { prescriptions: updatedPrescriptions, history: newHistory },
      currentUser.name,
      currentUser.role
    );

    addToast(`Successfully prescribed ${newPres.name}!`, "success");
    setSelectedPatient({
      ...selectedPatient,
      prescriptions: updatedPrescriptions,
      history: newHistory
    });
    setShowPrescribeModal(false);
  };

  // --- Filter and Search Logic ---
  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.condition.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesDept = deptFilter === "All" || p.department === deptFilter;
    
    return matchesSearch && matchesStatus && matchesDept;
  });

  const vacantBeds = beds.filter((b) => b.status === "Available");

  return (
    <div className="patients-page-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>Patient Records Directory</h1>
          <p>Manage, audit, and analyze hospital clinical admissions</p>
        </div>
        {currentUser.role !== "patient" && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Admit New Patient</span>
          </button>
        )}
      </div>

      {/* Filters Strip */}
      <div className="glass-card filters-strip">
        <div className="search-box">
          <Search size={16} className="text-secondary" />
          <input
            type="text"
            placeholder="Search patient name, condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="select-filters">
          <div className="filter-group">
            <Filter size={14} className="text-secondary" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Admitted">Admitted</option>
              <option value="Critical">Critical ICU</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>

          <div className="filter-group">
            <Layers size={14} className="text-secondary" />
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Emergency Medicine">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      <div className="patients-summary-row glass-card">
        <div className="summary-item">
          <span className="summary-label">Total Patients</span>
          <strong>{patients.length}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Filtered Results</span>
          <strong>{filterCount}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Available Beds</span>
          <strong>{vacantBeds.length}</strong>
        </div>
      </div>

      {/* Directory Content Layout (Split column if drawer is open!) */}
      <div className="patients-grid-layout">
        <div className={`glass-card directory-card ${selectedPatient ? "drawer-open" : ""}`}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient Detail</th>
                  <th>Clinical Status</th>
                  <th>Department</th>
                  <th>Room</th>
                  <th>Primary Diagnosis</th>
                  {currentUser.role === "admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)" }}>
                      No patient profiles match the active search filters.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => handlePatientClick(p)}
                      className={`patient-row ${selectedPatient?.id === p.id ? "selected" : ""}`}
                    >
                      <td>
                        <div className="patient-name-block">
                          <div className="avatar-placeholder sm" style={{ backgroundColor: "var(--indigo-color)" }}>
                            {p.name[0]}
                          </div>
                          <div>
                            <div className="pat-tbl-name">{p.name}</div>
                            <div className="pat-tbl-meta">Age {p.age} • {p.gender}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${p.status.toLowerCase().replace(" ", "-")}`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: "500" }}>{p.department}</td>
                      <td>{p.room}</td>
                      <td className="truncate-text">{p.condition}</td>
                      {currentUser.role === "admin" && (
                        <td>
                          <button
                            className="btn-icon text-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePatient(p.id);
                            }}
                            title="Delete Profile"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Slide-out Drawer */}
        {selectedPatient && (
          <div className="glass-card patient-drawer-card animated-step">
            <div className="drawer-header">
              <div className="drawer-title-block">
                <h3>Clinical Record File</h3>
                <span className="patient-id-tag">ID: {selectedPatient.id}</span>
              </div>
              <button className="btn-icon drawer-close-btn" onClick={() => setSelectedPatient(null)} title="Close Drawer">
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body-scroller">
              {/* Profile Card Summary */}
              <div className="drawer-summary-card glass-card">
                <div className="avatar-placeholder" style={{ backgroundColor: "var(--primary-color)", width: "48px", height: "48px", fontSize: "1.25rem" }}>
                  {selectedPatient.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h4 className="drawer-pat-name">{selectedPatient.name}</h4>
                  <p className="drawer-pat-sub">
                    Age {selectedPatient.age} • {selectedPatient.gender} • Room {selectedPatient.room}
                  </p>
                </div>
              </div>

              {/* Vitals Board */}
              <div className="drawer-section">
                <h4 className="section-title"><Heart size={14} className="text-danger" /> Vital Signs Monitoring</h4>
                <div className="drawer-vitals-grid">
                  <div className="vital-node pulse-slow">
                    <span className="node-lbl">Heart Rate</span>
                    <span className="node-val text-danger">{selectedPatient.vitals.heartRate} bpm</span>
                  </div>
                  <div className="vital-node">
                    <span className="node-lbl">Blood Pressure</span>
                    <span className="node-val text-success">{selectedPatient.vitals.bloodPressure}</span>
                  </div>
                  <div className="vital-node">
                    <span className="node-lbl">Oxygen Sat</span>
                    <span className="node-val text-info">{selectedPatient.vitals.oxygen}%</span>
                  </div>
                </div>
              </div>

              {/* Prescriptions Board */}
              <div className="drawer-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h4 className="section-title" style={{ marginBottom: 0 }}>
                    <Stethoscope size={14} className="text-primary" /> Assigned Medicines
                  </h4>
                  {currentUser.role === "doctor" && (
                    <button className="btn btn-secondary prescribe-shortcut-btn" onClick={() => setShowPrescribeModal(true)}>
                      Prescribe
                    </button>
                  )}
                </div>
                {selectedPatient.prescriptions.length === 0 ? (
                  <p className="empty-lbl-gray">No medications currently prescribed.</p>
                ) : (
                  <ul className="drawer-pres-list">
                    {selectedPatient.prescriptions.map((pr) => (
                      <li key={pr.id} className="drawer-pres-item glass-card">
                        <div>
                          <div className="pres-med">{pr.name}</div>
                          <div className="pres-dose">{pr.dosage}</div>
                        </div>
                        <span className="pres-author-lbl">By {pr.doctor}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Clinical History Log */}
              <div className="drawer-section">
                <h4 className="section-title"><FileText size={14} className="text-secondary" /> Clinical Log & History</h4>
                <ul className="drawer-history-timeline">
                  {selectedPatient.history.map((hist, idx) => (
                    <li key={idx} className="timeline-node">
                      <div className="node-bullet"></div>
                      <div className="node-meta">
                        <span className="node-date">{hist.date}</span>
                        <span className="node-type">{hist.type}</span>
                      </div>
                      <p className="node-notes">{hist.notes}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Emergency Contact */}
              <div className="drawer-section contact-section glass-card">
                <h4 className="section-title" style={{ border: "none", padding: 0 }}><User size={14} /> Emergency Contact</h4>
                <p><strong>Name:</strong> {selectedPatient.emergencyContact.name}</p>
                <p><strong>Relation:</strong> {selectedPatient.emergencyContact.relation}</p>
                <p><strong>Mobile:</strong> {selectedPatient.emergencyContact.phone}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADMIT PATIENT MODAL DIALOG */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Admit Patient / Intake Record">
        <form onSubmit={handleAddPatientSubmit} className="add-patient-form">
          <div className="form-group">
            <label>Patient Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Donald Harrison"
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 45"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                className="form-control"
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Admit Status</label>
              <select
                className="form-control"
                value={newPatient.status}
                onChange={(e) => setNewPatient({ ...newPatient, status: e.target.value })}
              >
                <option value="Admitted">Admitted</option>
                <option value="Critical">Critical ICU</option>
                <option value="Discharged">Discharged Outpatient</option>
              </select>
            </div>
            <div className="form-group">
              <label>Medical Department</label>
              <select
                className="form-control"
                value={newPatient.department}
                onChange={(e) => setNewPatient({ ...newPatient, department: e.target.value })}
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
              </select>
            </div>
          </div>

          {newPatient.status !== "Discharged" && (
            <div className="form-group">
              <label>Bed Ward Room Assignment</label>
              <select
                className="form-control"
                value={newPatient.room}
                onChange={(e) => setNewPatient({ ...newPatient, room: e.target.value })}
              >
                <option value="">-- Select Vacant Bed Room --</option>
                {vacantBeds.map((bed, idx) => (
                  <option key={idx} value={bed.room}>
                    {bed.room} - {bed.type}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Admitting Condition/Diagnosis</label>
            <textarea
              className="form-control"
              placeholder="e.g. Acute respiratory failure or minor chest discomfort..."
              value={newPatient.condition}
              onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
              rows={2}
              style={{ resize: "none" }}
            />
          </div>

          <div className="form-divider"><span>Emergency Contact Profile</span></div>

          <div className="form-group">
            <label>Emergency Contact Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Mary Harrison"
              value={newPatient.emergencyName}
              onChange={(e) => setNewPatient({ ...newPatient, emergencyName: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Relationship</label>
              <select
                className="form-control"
                value={newPatient.emergencyRelation}
                onChange={(e) => setNewPatient({ ...newPatient, emergencyRelation: e.target.value })}
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Child">Child</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={newPatient.emergencyPhone}
                onChange={(e) => setNewPatient({ ...newPatient, emergencyPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Admission
            </button>
          </div>
        </form>
      </Modal>

      {/* PRESCRIBE MEDICINE MODAL DIALOG */}
      <Modal isOpen={showPrescribeModal} onClose={() => setShowPrescribeModal(false)} title={`Prescribe Medicine: ${selectedPatient?.name}`}>
        <form onSubmit={handlePrescribeSubmit} className="prescribe-medicine-form">
          <div className="form-group">
            <label>Medicine Selection</label>
            <select
              className="form-control"
              value={newPres.name}
              onChange={(e) => setNewPres({ ...newPres, name: e.target.value })}
            >
              <option value="Amoxicillin 500mg">Amoxicillin 500mg (Antibiotic)</option>
              <option value="Paracetamol 650mg">Paracetamol 650mg (Painkiller)</option>
              <option value="Atorvastatin 20mg">Atorvastatin 20mg (Cholesterol)</option>
              <option value="Metformin 500mg">Metformin 500mg (Diabetes)</option>
              <option value="Ibuprofen 400mg">Ibuprofen 400mg (NSAID)</option>
              <option value="Lisinopril 10mg">Lisinopril 10mg (Blood Pressure)</option>
              <option value="Propranolol 40mg">Propranolol 40mg (Beta-Blocker)</option>
              <option value="Sumatriptan 50mg">Sumatriptan 50mg (Migraine Relief)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Dosage Instructions</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 1 capsule every 8 hours for 7 days"
              value={newPres.dosage}
              onChange={(e) => setNewPres({ ...newPres, dosage: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Authorizing Specialist</label>
            <select
              className="form-control"
              value={newPres.doctor}
              onChange={(e) => setNewPres({ ...newPres, doctor: e.target.value })}
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowPrescribeModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Prescription
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Patients;
