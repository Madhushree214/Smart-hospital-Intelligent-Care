import { createContext, useEffect, useMemo, useReducer, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import {
  DEPARTMENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_BEDS,
  INITIAL_BILLS,
  INITIAL_DOCTORS,
  INITIAL_MEDICINES,
  INITIAL_LOGS,
  INITIAL_PATIENTS
} from '../data/mockData'

const DataContext = createContext(null)

const initialState = {
  patients: INITIAL_PATIENTS,
  doctors: INITIAL_DOCTORS,
  appointments: INITIAL_APPOINTMENTS,
  medicines: INITIAL_MEDICINES,
  bills: INITIAL_BILLS,
  beds: INITIAL_BEDS,
  logs: INITIAL_LOGS,
  notifications: [
    { id: 'note-1', title: 'New appointment request', message: 'A new appointment is waiting approval.', read: false },
    { id: 'note-2', title: 'Medicine stock alert', message: 'Ibuprofen inventory is below threshold.', read: false },
    { id: 'note-3', title: 'Patient admitted', message: 'Robert Johnson was moved to ICU-3.', read: false }
  ],
  toasts: []
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PATIENT':
      return { ...state, patients: [action.payload, ...state.patients], logs: [{ id: `log-${Date.now()}`, text: `New patient ${action.payload.name} registered.`, role: 'receptionist', user: 'Reception', time: new Date().toLocaleString() }, ...state.logs] }
    case 'UPDATE_PATIENT':
      return { ...state, patients: state.patients.map((patient) => (patient.id === action.payload.id ? action.payload : patient)) }
    case 'DELETE_PATIENT':
      return { ...state, patients: state.patients.filter((patient) => patient.id !== action.payload), logs: [{ id: `log-${Date.now()}`, text: `Patient record removed from system.`, role: 'admin', user: 'Admin', time: new Date().toLocaleString() }, ...state.logs] }
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [action.payload, ...state.appointments], logs: [{ id: `log-${Date.now()}`, text: `Appointment booked for ${action.payload.patientName}.`, role: 'receptionist', user: 'Reception', time: new Date().toLocaleString() }, ...state.logs] }
    case 'UPDATE_APPOINTMENT_STATUS':
      return {
        ...state,
        appointments: state.appointments.map((appt) => (appt.id === action.payload.id ? { ...appt, status: action.payload.status } : appt)),
        logs: [{ id: `log-${Date.now()}`, text: `Appointment ${action.payload.id} updated to ${action.payload.status}.`, role: 'doctor', user: 'Doctor', time: new Date().toLocaleString() }, ...state.logs]
      }
    case 'UPDATE_DOCTOR':
      return {
        ...state,
        doctors: state.doctors.map((doctor) => (doctor.id === action.payload.id ? { ...doctor, ...action.payload.updates } : doctor)),
        logs: [{ id: `log-${Date.now()}`, text: `Doctor profile updated for ${action.payload.updates.name || action.payload.id}.`, role: 'admin', user: 'Admin', time: new Date().toLocaleString() }, ...state.logs]
      }
    case 'UPDATE_MEDICINE_STOCK':
      return {
        ...state,
        medicines: state.medicines.map((medicine) => (medicine.id === action.payload.id ? { ...medicine, stock: action.payload.stock } : medicine)),
        logs: [{ id: `log-${Date.now()}`, text: `Medicine inventory adjusted for ${action.payload.name}.`, role: 'pharmacy', user: 'Pharmacy', time: new Date().toLocaleString() }, ...state.logs]
      }
    case 'ADD_BILL':
      return { ...state, bills: [action.payload, ...state.bills], logs: [{ id: `log-${Date.now()}`, text: `Invoice ${action.payload.id} generated.`, role: 'admin', user: 'Admin', time: new Date().toLocaleString() }, ...state.logs] }
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map((note) => (note.id === action.payload ? { ...note, read: true } : note)) }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] }
    case 'PUSH_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.payload) }
    default:
      return state
  }
}

const DataProvider = ({ children }) => {
  const [storedState, setStoredState] = useLocalStorage('shms_data_state', initialState)
  const [state, dispatch] = useReducer(reducer, storedState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    setStoredState(state)
  }, [state, setStoredState])

  const totals = useMemo(() => {
    const totalRevenue = state.bills.reduce((sum, bill) => sum + bill.total, 0)
    const admitted = state.patients.filter((patient) => patient.status === 'Admitted').length
    const availableBeds = state.beds.filter((bed) => bed.status === 'Available').length
    const approvedAppointments = state.appointments.filter((appt) => appt.status === 'Approved').length
    const pendingAppointments = state.appointments.filter((appt) => appt.status === 'Pending').length
    const criticalCases = state.patients.filter((patient) => patient.status === 'Critical').length
    const activeDoctors = state.doctors.filter((doctor) => doctor.availability === 'Active').length

    return {
      totalRevenue,
      admitted,
      availableBeds,
      approvedAppointments,
      pendingAppointments,
      criticalCases,
      activeDoctors
    }
  }, [state])

  const value = useMemo(
    () => ({
      ...state,
      loading,
      dispatch,
      totals,
      DEPARTMENTS
    }),
    [state, loading, totals],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export { DataContext, DataProvider }
