// Robust mock data for the MedVitals Smart Hospital Management System

export const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Oncology",
  "General Medicine",
  "Emergency Medicine"
];

export const INITIAL_DOCTORS = [
  {
    id: "doc1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    rating: 4.9,
    availability: "Active",
    schedule: ["Monday", "Wednesday", "Friday"],
    timeSlots: ["09:00 AM", "10:30 AM", "01:00 PM", "03:00 PM"],
    totalPatients: 245,
    performance: 98,
    email: "s.jenkins@medvitals.com",
    phone: "+1 (555) 019-2834",
    avatarColor: "var(--primary-color)"
  },
  {
    id: "doc2",
    name: "Dr. James Carter",
    specialty: "Neurology",
    rating: 4.8,
    availability: "On Call",
    schedule: ["Tuesday", "Thursday"],
    timeSlots: ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"],
    totalPatients: 189,
    performance: 95,
    email: "j.carter@medvitals.com",
    phone: "+1 (555) 014-9821",
    avatarColor: "var(--indigo-color)"
  },
  {
    id: "doc3",
    name: "Dr. Emily Ross",
    specialty: "Pediatrics",
    rating: 4.7,
    availability: "Active",
    schedule: ["Monday", "Tuesday", "Thursday"],
    timeSlots: ["08:30 AM", "11:00 AM", "01:30 PM", "03:30 PM"],
    totalPatients: 312,
    performance: 96,
    email: "e.ross@medvitals.com",
    phone: "+1 (555) 017-3849",
    avatarColor: "var(--purple-color)"
  },
  {
    id: "doc4",
    name: "Dr. Alan Turing",
    specialty: "General Medicine",
    rating: 4.9,
    availability: "Active",
    schedule: ["Monday", "Wednesday", "Thursday", "Friday"],
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
    totalPatients: 410,
    performance: 99,
    email: "a.turing@medvitals.com",
    phone: "+1 (555) 012-7489",
    avatarColor: "var(--teal-dark-color)"
  },
  {
    id: "doc5",
    name: "Dr. Lisa Park",
    specialty: "Oncology",
    rating: 4.6,
    availability: "On Leave",
    schedule: ["Monday", "Wednesday"],
    timeSlots: ["09:30 AM", "11:30 AM", "02:30 PM"],
    totalPatients: 98,
    performance: 92,
    email: "l.park@medvitals.com",
    phone: "+1 (555) 018-8746",
    avatarColor: "var(--orange-color)"
  },
  {
    id: "doc6",
    name: "Dr. Gregory House",
    specialty: "Emergency Medicine",
    rating: 5.0,
    availability: "Active",
    schedule: ["Tuesday", "Wednesday", "Friday"],
    timeSlots: ["11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"],
    totalPatients: 520,
    performance: 94,
    email: "g.house@medvitals.com",
    phone: "+1 (555) 011-9999",
    avatarColor: "var(--danger-color)"
  }
];

export const INITIAL_PATIENTS = [
  {
    id: "pat1",
    name: "John Doe",
    age: 45,
    gender: "Male",
    status: "Admitted",
    department: "Cardiology",
    room: "402-A",
    admissionDate: "2026-05-18",
    condition: "Hypertension & Mild Heart Attack",
    history: [
      { date: "2026-05-18", type: "Admission", notes: "Admitted due to acute chest pain and elevated BP." },
      { date: "2026-05-19", type: "Lab Test", notes: "ECG shows ST-segment elevation. Cardiac enzymes slightly elevated." },
      { date: "2026-05-20", type: "Physiotherapy", notes: "Light cardiac rehab session tolerated well." }
    ],
    prescriptions: [
      { id: "pr1", name: "Lisinopril 10mg", dosage: "1 tablet daily", doctor: "Dr. Sarah Jenkins", date: "2026-05-18" },
      { id: "pr2", name: "Atorvastatin 20mg", dosage: "1 tablet at bedtime", doctor: "Dr. Sarah Jenkins", date: "2026-05-18" },
      { id: "pr3", name: "Aspirin 81mg", dosage: "1 tablet with food", doctor: "Dr. Sarah Jenkins", date: "2026-05-19" }
    ],
    emergencyContact: {
      name: "Mary Doe",
      relation: "Spouse",
      phone: "+1 (555) 012-3456"
    },
    vitals: {
      heartRate: 78,
      bloodPressure: "135/85",
      oxygen: 97,
      temperature: 98.6,
      ecgHistory: [70, 74, 82, 75, 78, 79, 76, 75, 78, 77, 80]
    }
  },
  {
    id: "pat2",
    name: "Jane Smith",
    age: 34,
    gender: "Female",
    status: "Admitted",
    department: "Neurology",
    room: "105-B",
    admissionDate: "2026-05-20",
    condition: "Severe Chronic Migraines & Aura",
    history: [
      { date: "2026-05-20", type: "Admission", notes: "Admitted for comprehensive EEG and lumbar puncture investigation." },
      { date: "2026-05-21", type: "MRI Scan", notes: "Brain MRI results normal. No lesions or signs of vascular issues." }
    ],
    prescriptions: [
      { id: "pr4", name: "Sumatriptan 50mg", dosage: "As needed for migraine onset", doctor: "Dr. James Carter", date: "2026-05-20" },
      { id: "pr5", name: "Propranolol 40mg", dosage: "1 tablet twice daily", doctor: "Dr. James Carter", date: "2026-05-21" }
    ],
    emergencyContact: {
      name: "Robert Smith",
      relation: "Father",
      phone: "+1 (555) 015-8794"
    },
    vitals: {
      heartRate: 64,
      bloodPressure: "115/70",
      oxygen: 99,
      temperature: 98.2,
      ecgHistory: [62, 63, 65, 64, 66, 64, 63, 64, 65, 64, 64]
    }
  },
  {
    id: "pat3",
    name: "Robert Johnson",
    age: 62,
    gender: "Male",
    status: "Critical",
    department: "Emergency Medicine",
    room: "ICU-3",
    admissionDate: "2026-05-21",
    condition: "Acute Pneumonia & Respiratory Failure",
    history: [
      { date: "2026-05-21", type: "ICU Admission", notes: "Transferred to ICU due to severe respiratory distress. Started on high-flow oxygen." },
      { date: "2026-05-22", type: "Ventilation Adjust", notes: "O2 levels stabilized on high-flow nasal cannula. Avoided intubation." }
    ],
    prescriptions: [
      { id: "pr6", name: "Amoxicillin 500mg", dosage: "1 capsule every 8 hours", doctor: "Dr. Gregory House", date: "2026-05-21" },
      { id: "pr7", name: "Methylprednisolone 40mg", dosage: "IV injection daily", doctor: "Dr. Gregory House", date: "2026-05-21" },
      { id: "pr8", name: "Albuterol Nebulizer", dosage: "Every 4 hours as needed", doctor: "Dr. Gregory House", date: "2026-05-22" }
    ],
    emergencyContact: {
      name: "Sarah Johnson",
      relation: "Daughter",
      phone: "+1 (555) 018-2947"
    },
    vitals: {
      heartRate: 102,
      bloodPressure: "145/95",
      oxygen: 91,
      temperature: 101.4,
      ecgHistory: [98, 100, 105, 102, 103, 101, 104, 102, 105, 103, 102]
    }
  },
  {
    id: "pat4",
    name: "Alice Brown",
    age: 8,
    gender: "Female",
    status: "Discharged",
    department: "Pediatrics",
    room: "Outpatient",
    admissionDate: "2026-05-15",
    condition: "Acute Asthmatic Bronchitis",
    history: [
      { date: "2026-05-15", type: "Admission", notes: "Presented with severe wheezing. Nebulized and monitored." },
      { date: "2026-05-17", type: "Discharge", notes: "Breathing clear. Discharged home with maintenance inhaler prescription." }
    ],
    prescriptions: [
      { id: "pr9", name: "Fluticasone Inhaler", dosage: "1 puff twice daily", doctor: "Dr. Emily Ross", date: "2026-05-17" },
      { id: "pr10", name: "Albuterol Inhaler", dosage: "2 puffs as needed for wheezing", doctor: "Dr. Emily Ross", date: "2026-05-17" }
    ],
    emergencyContact: {
      name: "Thomas Brown",
      relation: "Father",
      phone: "+1 (555) 016-9283"
    },
    vitals: {
      heartRate: 85,
      bloodPressure: "105/65",
      oxygen: 98,
      temperature: 98.4,
      ecgHistory: [80, 82, 86, 85, 87, 84, 85, 86, 84, 85, 85]
    }
  },
  {
    id: "pat5",
    name: "Michael Green",
    age: 50,
    gender: "Male",
    status: "Admitted",
    department: "Orthopedics",
    room: "203-A",
    admissionDate: "2026-05-19",
    condition: "Post-op Hip Replacement Rehabilitation",
    history: [
      { date: "2026-05-19", type: "Surgery", notes: "Total left hip arthroplasty performed by Orthopedics team." },
      { date: "2026-05-20", type: "Physiotherapy", notes: "Stood and took 10 steps using walker. High pain tolerance." }
    ],
    prescriptions: [
      { id: "pr11", name: "Ibuprofen 400mg", dosage: "1 tablet every 6 hours with meals", doctor: "Dr. Lisa Park", date: "2026-05-19" },
      { id: "pr12", name: "Enoxaparin 40mg", dosage: "Subcutaneous injection daily", doctor: "Dr. Lisa Park", date: "2026-05-19" }
    ],
    emergencyContact: {
      name: "Linda Green",
      relation: "Spouse",
      phone: "+1 (555) 013-4876"
    },
    vitals: {
      heartRate: 72,
      bloodPressure: "128/80",
      oxygen: 96,
      temperature: 99.1,
      ecgHistory: [70, 71, 73, 72, 74, 73, 72, 72, 73, 72, 72]
    }
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    id: "appt1",
    patientName: "John Doe",
    patientId: "pat1",
    doctorName: "Dr. Sarah Jenkins",
    doctorId: "doc1",
    department: "Cardiology",
    date: "2026-05-25",
    timeSlot: "09:00 AM",
    status: "Approved",
    symptoms: "Routine post-attack evaluation and ECG tracking."
  },
  {
    id: "appt2",
    patientName: "Jane Smith",
    patientId: "pat2",
    doctorName: "Dr. James Carter",
    doctorId: "doc2",
    department: "Neurology",
    date: "2026-05-26",
    timeSlot: "10:00 AM",
    status: "Approved",
    symptoms: "EEG review and neurological stability check."
  },
  {
    id: "appt3",
    patientName: "Donald Harrison",
    patientId: "pat_new1", // Simulated guest patient
    doctorName: "Dr. Emily Ross",
    doctorId: "doc3",
    department: "Pediatrics",
    date: "2026-05-23",
    timeSlot: "08:30 AM",
    status: "Pending",
    symptoms: "Persistent child dry cough and minor fever for 3 days."
  },
  {
    id: "appt4",
    patientName: "Sarah Connor",
    patientId: "pat_new2",
    doctorName: "Dr. Gregory House",
    doctorId: "doc6",
    department: "Emergency Medicine",
    date: "2026-05-23",
    timeSlot: "11:00 AM",
    status: "Pending",
    symptoms: "Sharp joint pains in right hand and unexplained inflammation."
  },
  {
    id: "appt5",
    patientName: "Michael Green",
    patientId: "pat5",
    doctorName: "Dr. Alan Turing",
    doctorId: "doc4",
    department: "General Medicine",
    date: "2026-05-28",
    timeSlot: "02:00 PM",
    status: "Approved",
    symptoms: "General post-surgical physical check and routine blood screen."
  }
];

export const INITIAL_MEDICINES = [
  { id: "med1", name: "Amoxicillin 500mg", category: "Antibiotic", stock: 120, price: 12.50, threshold: 20 },
  { id: "med2", name: "Paracetamol 650mg", category: "Painkiller", stock: 8, price: 4.00, threshold: 15 }, // Critical
  { id: "med3", name: "Atorvastatin 20mg", category: "Cholesterol", stock: 45, price: 24.99, threshold: 10 },
  { id: "med4", name: "Metformin 500mg", category: "Diabetes", stock: 200, price: 15.20, threshold: 30 },
  { id: "med5", name: "Ibuprofen 400mg", category: "Painkiller/NSAID", stock: 12, price: 5.50, threshold: 15 }, // Low Stock
  { id: "med6", name: "Lisinopril 10mg", category: "Blood Pressure", stock: 90, price: 18.00, threshold: 20 },
  { id: "med7", name: "Propranolol 40mg", category: "Beta-Blocker", stock: 110, price: 16.50, threshold: 15 },
  { id: "med8", name: "Sumatriptan 50mg", category: "Migraine Relief", stock: 25, price: 34.00, threshold: 10 }
];

export const INITIAL_BILLS = [
  {
    id: "bill-1021",
    patientName: "John Doe",
    patientId: "pat1",
    date: "2026-05-18",
    items: [
      { desc: "Emergency Room Consultation", price: 150 },
      { desc: "Electrocardiogram (ECG) Procedure", price: 250 },
      { desc: "Atorvastatin 20mg (1 Box)", price: 24.99 },
      { desc: "Lisinopril 10mg (1 Box)", price: 18.00 }
    ],
    total: 442.99,
    status: "Paid",
    paymentMethod: "Insurance Claim"
  },
  {
    id: "bill-1022",
    patientName: "Jane Smith",
    patientId: "pat2",
    date: "2026-05-20",
    items: [
      { desc: "Neurologist Consultation fee", price: 180 },
      { desc: "Magnetic Resonance Imaging (MRI) Brain", price: 850 },
      { desc: "Sumatriptan 50mg (1 Box)", price: 34.00 }
    ],
    total: 1064.00,
    status: "Pending",
    paymentMethod: "Credit Card"
  },
  {
    id: "bill-1023",
    patientName: "Alice Brown",
    patientId: "pat4",
    date: "2026-05-17",
    items: [
      { desc: "Pediatric Outpatient Care", price: 80 },
      { desc: "Nebulizer Therapy Session", price: 60 },
      { desc: "Albuterol Inhaler Refill", price: 25.00 }
    ],
    total: 165.00,
    status: "Paid",
    paymentMethod: "Cash"
  }
];

export const INITIAL_BEDS = [
  { room: "101-A", type: "General Ward", status: "Available", occupant: null },
  { room: "101-B", type: "General Ward", status: "Available", occupant: null },
  { room: "102-A", type: "General Ward", status: "Occupied", occupant: "Jane Smith" },
  { room: "102-B", type: "General Ward", status: "Available", occupant: null },
  { room: "201-A", type: "Deluxe Private", status: "Available", occupant: null },
  { room: "203-A", type: "Deluxe Private", status: "Occupied", occupant: "Michael Green" },
  { room: "402-A", type: "Cardiac Ward", status: "Occupied", occupant: "John Doe" },
  { room: "402-B", type: "Cardiac Ward", status: "Available", occupant: null },
  { room: "ICU-1", type: "Intensive Care", status: "Available", occupant: null },
  { room: "ICU-2", type: "Intensive Care", status: "Available", occupant: null },
  { room: "ICU-3", type: "Intensive Care", status: "Critical ICU", occupant: "Robert Johnson" },
  { room: "ICU-4", type: "Intensive Care", status: "Available", occupant: null }
];

export const INITIAL_LOGS = [
  { id: "log-1", text: "System Initialized.", time: "2026-05-22 08:00 AM", user: "System", role: "system" },
  { id: "log-2", text: "Patient Robert Johnson admitted to room ICU-3.", time: "2026-05-21 02:40 PM", user: "Receptionist", role: "receptionist" },
  { id: "log-3", text: "Dr. Sarah Jenkins approved post-attack check for John Doe.", time: "2026-05-22 09:12 AM", user: "Dr. Sarah Jenkins", role: "doctor" },
  { id: "log-4", text: "Invoice bill-1021 issued & marked PAID.", time: "2026-05-18 11:30 AM", user: "Admin", role: "admin" }
];
