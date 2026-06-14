import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Local appointment store — persisted in localStorage.
 * Used as the source of truth when Supabase is unreachable.
 * BookAppointment page writes here; Patient Appointments page reads here.
 */
const useAppointmentStore = create(
  persist(
    (set, get) => ({
      // keyed by userId so each patient sees only their own
      appointmentsByUser: {},

      // Called when a patient successfully books an appointment
      addAppointment: (userId, appointment) => {
        const { appointmentsByUser } = get()
        const existing = appointmentsByUser[userId] || []
        set({
          appointmentsByUser: {
            ...appointmentsByUser,
            [userId]: [appointment, ...existing],
          },
        })
      },

      // Called when assistant verifies payment
      updateStatus: (userId, appointmentId, status) => {
        const { appointmentsByUser } = get()
        const list = appointmentsByUser[userId] || []
        set({
          appointmentsByUser: {
            ...appointmentsByUser,
            [userId]: list.map(a =>
              a.id === appointmentId ? { ...a, status } : a
            ),
          },
        })
      },

      // Get appointments for a specific patient
      getAppointments: (userId) => {
        const { appointmentsByUser } = get()
        return appointmentsByUser[userId] || []
      },

      // Get ALL appointments across all patients (for assistant/admin)
      getAllAppointments: () => {
        const { appointmentsByUser } = get()
        return Object.values(appointmentsByUser).flat()
      },
    }),
    {
      name: 'appointment-store',
    }
  )
)

export default useAppointmentStore
