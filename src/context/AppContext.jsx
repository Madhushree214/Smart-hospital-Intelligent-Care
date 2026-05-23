import React, { createContext, useState, useEffect } from "react";
import {
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_MEDICINES,
  INITIAL_BILLS,
  INITIAL_BEDS,
  INITIAL_LOGS
} from "../data/mockData";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- Persistent Global States ---
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem("medvitals_patients");
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem("medvitals_doctors");
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem("medvitals_appointments");
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem("medvitals_medicines");
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
  });

  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem("medvitals_bills");
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [beds, setBeds] = useState(() => {
    const saved = localStorage.getItem("medvitals_beds");
    return saved ? JSON.parse(saved) : INITIAL_BEDS;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("medvitals_logs");
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [notifications, setNotifications] = useState([
    { id: "notif-1", text: "New appointment request #appt3 is pending approval.", type: "warning", time: "Just now", read: false },
    { id: "notif-2", text: "Critical Alert: Paracetamol 650mg is below safe stock threshold (8 units left).", type: "alert", time: "10m ago", read: false },
    { id: "notif-3", text: "ICU Ward Room ICU-3 at 95% occupancy capacity.", type: "info", time: "1h ago", read: false }
  ]);

  const [toasts, setToasts] = useState([]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("medvitals_theme") || "dark";
  });

  // --- Save to LocalStorage on Change ---
  useEffect(() => {
    localStorage.setItem("medvitals_patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem("medvitals_doctors", JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem("medvitals_appointments", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem("medvitals_medicines", JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem("medvitals_bills", JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem("medvitals_beds", JSON.stringify(beds));
  }, [beds]);

  useEffect(() => {
    localStorage.setItem("medvitals_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("medvitals_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // --- Helper Action: Ephemeral Toasts ---
  const addToast = (message, type = "info") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Helper Action: Logs ---
  const addLog = (text, user = "System", role = "system") => {
    const newLog = {
      id: `log-${Date.now()}`,
      text,
      time: new Date().toLocaleString(),
      user,
      role
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // --- Helper Action: Notifications ---
  const addNotification = (text, type = "info") => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      text,
      type,
      time: "Just now",
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // --- Patient CRUD Ops ---
  const addPatient = (patient, actorName, actorRole) => {
    const newPatient = {
      ...patient,
      id: `pat-${Date.now()}`,
      history: patient.history || [{ date: new Date().toISOString().split("T")[0], type: "Registration", notes: "Registered in MedVitals database." }],
      vitals: patient.vitals || { heartRate: 75, bloodPressure: "120/80", oxygen: 98, temperature: 98.6, ecgHistory: [70, 72, 75, 73, 74, 76] }
    };
    setPatients((prev) => [newPatient, ...prev]);
    addLog(`Patient ${newPatient.name} added to records.`, actorName, actorRole);
    
    // Auto bed allocation if status is Admitted
    if (newPatient.status === "Admitted" && newPatient.room) {
      allocateBed(newPatient.room, newPatient.name);
    }
    return newPatient;
  };

  const updatePatient = (id, updatedPatient, actorName, actorRole) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          // If status or room changed, adjust bed occupancy
          if (updatedPatient.status && (p.status !== updatedPatient.status || p.room !== updatedPatient.room)) {
            // Free old bed if any
            if (p.room) {
              dischargeFromBed(p.room);
            }
            // Occupy new bed if Admitted
            if (updatedPatient.status === "Admitted" && updatedPatient.room) {
              allocateBed(updatedPatient.room, p.name);
            }
          }
          return { ...p, ...updatedPatient };
        }
        return p;
      })
    );
    addLog(`Patient records updated for ID ${id}.`, actorName, actorRole);
  };

  const deletePatient = (id, actorName, actorRole) => {
    const target = patients.find((p) => p.id === id);
    if (target) {
      if (target.room) {
        dischargeFromBed(target.room);
      }
      setPatients((prev) => prev.filter((p) => p.id !== id));
      addLog(`Patient record for ${target.name} (ID: ${id}) was deleted.`, actorName, actorRole);
    }
  };

  // --- Doctor Availability ---
  const toggleDoctorAvailability = (id, actorName, actorRole) => {
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus = d.availability === "Active" ? "On Call" : d.availability === "On Call" ? "On Leave" : "Active";
          addLog(`Doctor ${d.name} availability toggled to ${nextStatus}.`, actorName, actorRole);
          return { ...d, availability: nextStatus };
        }
        return d;
      })
    );
  };

  // --- Appointments Booking System ---
  const addAppointment = (appt) => {
    const newAppt = {
      ...appt,
      id: `appt-${Date.now()}`,
      status: appt.status || "Pending"
    };
    setAppointments((prev) => [newAppt, ...prev]);
    addNotification(`New appointment booking requested by ${newAppt.patientName}.`, "warning");
    addLog(`Appointment requested: Patient ${newAppt.patientName} with ${newAppt.doctorName}.`, newAppt.patientName, "patient");
    return newAppt;
  };

  const approveAppointment = (id, actorName, actorRole) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          addNotification(`Appointment approved for ${a.patientName} on ${a.date}.`, "success");
          addLog(`Approved appointment #${id} for ${a.patientName}.`, actorName, actorRole);
          return { ...a, status: "Approved" };
        }
        return a;
      })
    );
  };

  const cancelAppointment = (id, actorName, actorRole) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          addNotification(`Appointment cancelled for ${a.patientName}.`, "info");
          addLog(`Cancelled appointment #${id} for ${a.patientName}.`, actorName, actorRole);
          return { ...a, status: "Cancelled" };
        }
        return a;
      })
    );
  };

  // --- Pharmacy Stock Management ---
  const updateMedicineStock = (id, newStock, actorName, actorRole) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          // Trigger low-stock notifications if below threshold
          if (newStock <= m.threshold) {
            addNotification(`Alert: Medicine ${m.name} has critical stock level (${newStock} units left).`, "alert");
          }
          return { ...m, stock: newStock };
        }
        return m;
      })
    );
    addLog(`Pharmacy inventory adjusted for stock ID ${id} to ${newStock} units.`, actorName, actorRole);
  };

  // --- Invoice & Billing ---
  const addBill = (billData, actorName, actorRole) => {
    const newBill = {
      ...billData,
      id: `bill-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0]
    };
    setBills((prev) => [newBill, ...prev]);
    
    // Deduct medicines from stock if bill generated contains them
    billData.items.forEach((item) => {
      const match = medicines.find((m) => m.name === item.desc.split(" (")[0]);
      if (match) {
        updateMedicineStock(match.id, Math.max(0, match.stock - 1), actorName, actorRole);
      }
    });

    addLog(`Billing invoice ${newBill.id} generated for ${newBill.patientName}. Total: $${newBill.total}`, actorName, actorRole);
    return newBill;
  };

  const payBill = (id, actorName, actorRole) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          addLog(`Invoice ${b.id} marked as PAID.`, actorName, actorRole);
          return { ...b, status: "Paid" };
        }
        return b;
      })
    );
  };

  // --- Bed Allocation Ward Mapping ---
  const allocateBed = (room, occupantName) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.room === room) {
          return { ...b, status: "Occupied", occupant: occupantName };
        }
        return b;
      })
    );
  };

  const dischargeFromBed = (room) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.room === room) {
          return { ...b, status: "Available", occupant: null };
        }
        return b;
      })
    );
  };

  // --- Theme Toggle ---
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <AppContext.Provider
      value={{
        patients,
        doctors,
        appointments,
        medicines,
        bills,
        beds,
        logs,
        notifications,
        toasts,
        theme,
        toggleTheme,
        addPatient,
        updatePatient,
        deletePatient,
        toggleDoctorAvailability,
        addAppointment,
        approveAppointment,
        cancelAppointment,
        updateMedicineStock,
        addBill,
        payBill,
        addLog,
        addNotification,
        markNotificationRead,
        dismissNotification,
        clearAllNotifications,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
