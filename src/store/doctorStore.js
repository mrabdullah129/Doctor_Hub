import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_DOCTORS = [
  {
    id: 'v1', name: 'Dr. Sarah Ahmed', specialty: 'Cardiologist',
    city: 'Karachi', experience: 10, rating: 4.9, reviews: 240,
    fee: 2000, available: true, qualifications: 'MBBS, FCPS (Cardiology)',
    treatmentType: 'allopathic', diseases: ['Heart Disease', 'Hypertension'],
    nextSlot: 'Today 3:00 PM', bio: 'Experienced cardiologist with 10+ years in treating heart conditions.',
  },
  {
    id: 'v2', name: 'Dr. Hassan Khan', specialty: 'Neurologist',
    city: 'Karachi', experience: 15, rating: 5.0, reviews: 310,
    fee: 3500, available: true, qualifications: 'MBBS, FRCP (Neurology)',
    treatmentType: 'allopathic', diseases: ['Migraine', 'Epilepsy', 'Neurological Disorders'],
    nextSlot: 'Mon 11:00 AM', bio: 'Top neurologist specializing in migraine and epilepsy management.',
  },
  {
    id: 'v3', name: 'Dr. Fatima Shah', specialty: 'Dermatologist',
    city: 'Islamabad', experience: 6, rating: 4.8, reviews: 162,
    fee: 2500, available: true, qualifications: 'MBBS, MD (Dermatology)',
    treatmentType: 'allopathic', diseases: ['Skin Disease', 'Eczema', 'Acne'],
    nextSlot: 'Wed 2:00 PM', bio: 'Specialist in skin disorders, cosmetic dermatology, and hair treatment.',
  },
  {
    id: 'v4', name: 'Dr. Muhammad Ali', specialty: 'General Physician',
    city: 'Lahore', experience: 8, rating: 4.7, reviews: 185,
    fee: 1500, available: true, qualifications: 'MBBS, FCPS',
    treatmentType: 'allopathic', diseases: ['Diabetes', 'Hypertension', 'General Medicine'],
    nextSlot: 'Tomorrow 10:00 AM', bio: 'Family physician with expertise in chronic disease management.',
  },
  {
    id: 'v5', name: 'Dr. Ayesha Raza', specialty: 'Pediatrician',
    city: 'Rawalpindi', experience: 9, rating: 4.9, reviews: 278,
    fee: 1800, available: true, qualifications: 'MBBS, DCH, FCPS (Pediatrics)',
    treatmentType: 'allopathic', diseases: ['Respiratory Issues', 'Fever', 'Child Nutrition'],
    nextSlot: 'Today 5:00 PM', bio: 'Dedicated pediatrician providing comprehensive child healthcare.',
  },
]

/**
 * Shared global store for doctor approval workflow.
 * Works fully in demo mode (no Supabase needed).
 * Persisted in localStorage so data survives page refresh.
 */
const useDoctorStore = create(
  persist(
    (set, get) => ({
      pendingDoctors: [],
      verifiedDoctors: DEFAULT_DOCTORS,
      _version: 2, // bump this to force-reset old cached data

      // ── Doctor submits profile ────────────────────────────
      submitDoctorProfile: (profileData) => {
        const { pendingDoctors, verifiedDoctors } = get()

        // If already verified, just update
        const existingVerified = verifiedDoctors.find(d => d.profileId === profileData.profileId)
        if (existingVerified) {
          set({
            verifiedDoctors: verifiedDoctors.map(d =>
              d.profileId === profileData.profileId ? { ...d, ...profileData } : d
            ),
          })
          return 'updated'
        }

        // If already pending, update existing
        const existingPending = pendingDoctors.find(d => d.profileId === profileData.profileId)
        if (existingPending) {
          set({
            pendingDoctors: pendingDoctors.map(d =>
              d.profileId === profileData.profileId ? { ...d, ...profileData, submittedAt: new Date().toISOString() } : d
            ),
          })
          return 'resubmitted'
        }

        // New application
        const newDoc = {
          id: 'pending-' + Date.now(),
          ...profileData,
          submittedAt: new Date().toISOString(),
          available: false,
          rating: 0,
          reviews: 0,
          diseases: [],
          nextSlot: 'TBD',
        }
        set({ pendingDoctors: [...pendingDoctors, newDoc] })
        return 'submitted'
      },

      // ── Admin approves ────────────────────────────────────
      approveDoctor: (id) => {
        const { pendingDoctors, verifiedDoctors } = get()
        const doc = pendingDoctors.find(d => d.id === id)
        if (!doc) return

        set({
          pendingDoctors: pendingDoctors.filter(d => d.id !== id),
          verifiedDoctors: [
            ...verifiedDoctors,
            {
              ...doc,
              available: true,
              id: 'v-' + Date.now(),
              // Keep profileId so messaging key works
              profileId: doc.profileId,
            },
          ],
        })
      },

      // ── Admin rejects ─────────────────────────────────────
      rejectDoctor: (id) => {
        const { pendingDoctors } = get()
        set({ pendingDoctors: pendingDoctors.filter(d => d.id !== id) })
      },

      // ── Admin manually adds a verified doctor ─────────────
      addVerifiedDoctor: (docData) => {
        const { verifiedDoctors } = get()
        set({
          verifiedDoctors: [
            ...verifiedDoctors,
            {
              id: 'v-' + Date.now(),
              available: true,
              rating: 0,
              reviews: 0,
              diseases: [],
              nextSlot: 'TBD',
              submittedAt: new Date().toISOString(),
              ...docData,
            },
          ],
        })
      },
    }),
    {
      name: 'doctor-store',
      version: 2,
      // On version mismatch, merge stored user-added doctors with fresh defaults
      migrate: (stored, fromVersion) => {
        if (fromVersion < 2) {
          // Keep any user-added/approved doctors but reset to new defaults
          const userAdded = (stored.verifiedDoctors || []).filter(
            d => !['v1', 'v2'].includes(d.id) // keep non-seed doctors
          )
          return {
            ...stored,
            _version: 2,
            verifiedDoctors: [...DEFAULT_DOCTORS, ...userAdded],
          }
        }
        return stored
      },
      // Always ensure defaults exist even if localStorage has old data
      merge: (persisted, current) => {
        const persistedIds = new Set((persisted.verifiedDoctors || []).map(d => d.id))
        const missingDefaults = DEFAULT_DOCTORS.filter(d => !persistedIds.has(d.id))
        return {
          ...current,
          ...persisted,
          verifiedDoctors: [
            ...missingDefaults,                    // add any missing defaults
            ...(persisted.verifiedDoctors || []),  // keep existing approved
          ],
          pendingDoctors: persisted.pendingDoctors || [],
        }
      },
    }
  )
)

export default useDoctorStore
