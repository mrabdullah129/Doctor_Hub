import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Search, SlidersHorizontal, MapPin, Clock, Stethoscope,
  X, Calendar
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Select from '../../components/ui/Select'
import StarRating from '../../components/ui/StarRating'
import { SPECIALIZATIONS, DISEASES, CITIES, TREATMENT_TYPES } from '../../lib/constants'
import useAuthStore from '../../store/authStore'
import useDoctorStore from '../../store/doctorStore'
import { cn } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

// Fetches verified doctors from Supabase; maps DB fields to the UI shape

function DoctorCard({ doctor }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleBook = () => {
    if (!user) {
      // redirect to login, remember where to go after
      navigate(`/login?redirect=/book/${doctor.id}`)
    } else {
      navigate(`/book/${doctor.id}`)
    }
  }

  return (
    <div className="card hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex gap-4">
        <Avatar name={doctor.name} size="xl" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-bold text-text-primary">{doctor.name}</h3>
              <p className="text-text-muted text-sm">{doctor.qualifications}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary-600">Rs {doctor.fee.toLocaleString()}</p>
              <p className="text-xs text-text-muted">per consultation</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3 mt-2">
            <Badge variant="blue">{doctor.specialty}</Badge>
            <div className="flex items-center gap-1 text-sm text-text-muted">
              <MapPin className="w-3.5 h-3.5" />
              {doctor.city}
            </div>
            <div className="flex items-center gap-1 text-sm text-text-muted">
              <Stethoscope className="w-3.5 h-3.5" />
              {doctor.experience} yrs exp
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={doctor.rating} showValue />
            <span className="text-xs text-text-muted">({doctor.reviews} reviews)</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {doctor.diseases.slice(0, 3).map((d) => (
              <span key={d} className="bg-surface-100 text-text-muted text-xs px-2 py-0.5 rounded-lg">{d}</span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', doctor.available ? 'bg-secondary-500' : 'bg-surface-300')} />
              <span className={cn('text-xs font-medium', doctor.available ? 'text-secondary-600' : 'text-text-muted')}>
                {doctor.available ? 'Available' : 'Unavailable'}
              </span>
              {doctor.available && (
                <>
                  <span className="text-surface-300">•</span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Next: {doctor.nextSlot}
                  </span>
                </>
              )}
            </div>
            <Button
              size="sm"
              disabled={!doctor.available}
              onClick={handleBook}
            >
              <Calendar className="w-3.5 h-3.5" />
              {user ? 'Book Now' : 'Login to Book'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DoctorSearch({ dashboardLayout = false }) {
  const [searchParams] = useSearchParams()
  const { verifiedDoctors: storeDoctors } = useDoctorStore()   // ← from shared store

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    specialty: searchParams.get('specialty') || '',
    disease: '',
    city: '',
    treatmentType: '',
    rating: '',
    available: false,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('rating')
  const [supabaseDoctors, setSupabaseDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)

  // ── Merge store doctors + Supabase doctors (deduplicated) ──────────────────
  // Store doctors always win (they're the latest source of truth for demo mode)
  const allDoctors = (() => {
    // Normalise store doctors to the same shape as supabase-mapped doctors
    const fromStore = storeDoctors.map(d => ({
      id:           d.id,
      name:         d.name,
      specialty:    d.specialty   || '',
      city:         d.city        || '',
      experience:   d.experience  || 0,
      rating:       d.rating      || 0,
      reviews:      d.reviews     || 0,
      fee:          d.fee         || 0,
      available:    d.available   ?? true,
      qualifications: d.qualifications || '',
      treatmentType:  d.treatmentType  || 'allopathic',
      diseases:     Array.isArray(d.diseases) ? d.diseases : [],
      nextSlot:     d.nextSlot    || 'Available',
      bio:          d.bio         || '',
    }))

    // Merge: supabase results that are NOT already in store (by profileId or id)
    const storeIds = new Set(storeDoctors.map(d => d.id))
    const storeProfileIds = new Set(storeDoctors.map(d => d.profileId).filter(Boolean))
    const fromSupabase = supabaseDoctors.filter(
      d => !storeIds.has(d.id) && !storeProfileIds.has(d.profileId)
    )

    return [...fromStore, ...fromSupabase]
  })()

  const filtered = allDoctors.filter((d) => {
    const matchQuery = !query ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.specialty.toLowerCase().includes(query.toLowerCase()) ||
      (d.diseases || []).some(dis => dis.toLowerCase().includes(query.toLowerCase()))
    const matchSpecialty  = !filters.specialty    || d.specialty === filters.specialty
    const matchDisease    = !filters.disease      || (d.diseases || []).some(dis => dis.toLowerCase() === filters.disease.toLowerCase())
    const matchCity       = !filters.city         || d.city === filters.city
    const matchTreatment  = !filters.treatmentType|| d.treatmentType === filters.treatmentType
    const matchRating     = !filters.rating       || d.rating >= parseFloat(filters.rating)
    const matchAvailable  = !filters.available    || d.available
    return matchQuery && matchSpecialty && matchDisease && matchCity && matchTreatment && matchRating && matchAvailable
  }).sort((a, b) => {
    if (sortBy === 'rating')     return b.rating - a.rating
    if (sortBy === 'fee_low')    return a.fee - b.fee
    if (sortBy === 'fee_high')   return b.fee - a.fee
    if (sortBy === 'experience') return b.experience - a.experience
    return 0
  })

  // ── Try fetching from Supabase (fails silently in demo mode) ───────────────
  useEffect(() => {
    let mounted = true
    const fetchFromSupabase = async () => {
      setLoadingDoctors(true)
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('is_verified', true)
          .order('rating', { ascending: false })
          .limit(200)

        if (!error && data && mounted) {
          const mapped = data.map(d => ({
            id:            d.id,
            profileId:     d.profile_id,
            name:          d.display_name || `Dr. ${d.specialization || ''}`.trim(),
            specialty:     d.specialization || '',
            city:          d.city || '',
            experience:    d.experience_years || 0,
            rating:        parseFloat(d.rating) || 0,
            reviews:       d.total_reviews || 0,
            fee:           Number(d.consultation_fee) || 0,
            available:     d.is_available ?? true,
            qualifications: Array.isArray(d.qualifications)
              ? d.qualifications.join(', ')
              : (d.qualifications || ''),
            treatmentType: d.treatment_type || 'allopathic',
            diseases:      Array.isArray(d.diseases) ? d.diseases : [],
            nextSlot:      '',
            bio:           d.bio || '',
          }))
          setSupabaseDoctors(mapped)
        }
      } catch {
        // Supabase not configured — silently ignore, store data is used instead
      } finally {
        if (mounted) setLoadingDoctors(false)
      }
    }

    fetchFromSupabase()
    return () => { mounted = false }
  }, [])

  // Also stop loading spinner quickly if store already has data
  useEffect(() => {
    if (storeDoctors.length > 0) setLoadingDoctors(false)
  }, [storeDoctors])

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const page = (
    <>
      {/* Search header */}
      <div className="bg-white border-b border-surface-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Find a Doctor</h1>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-4 py-3">
              <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, specialty, or disease..."
                className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none text-sm"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-primary">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-primary-600 text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-5 bg-surface-50 rounded-2xl border border-surface-200 animate-slide-down">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Select
                  placeholder="Specialty"
                  options={SPECIALIZATIONS}
                  value={filters.specialty}
                  onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                />
                <Select
                  placeholder="Disease"
                  options={DISEASES}
                  value={filters.disease}
                  onChange={(e) => setFilters({ ...filters, disease: e.target.value })}
                />
                <Select
                  placeholder="City"
                  options={CITIES}
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
                <Select
                  placeholder="Treatment Type"
                  options={TREATMENT_TYPES}
                  value={filters.treatmentType}
                  onChange={(e) => setFilters({ ...filters, treatmentType: e.target.value })}
                />
                <Select
                  placeholder="Min Rating"
                  options={[
                    { value: '4.5', label: '4.5+ Stars' },
                    { value: '4', label: '4+ Stars' },
                    { value: '3.5', label: '3.5+ Stars' },
                  ]}
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.available}
                    onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-text-secondary font-medium">Available today only</span>
                </label>
                <button
                  onClick={() => setFilters({ specialty: '', disease: '', city: '', treatmentType: '', rating: '', available: false })}
                  className="text-sm text-primary-600 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <p className="text-text-muted text-sm">
            <span className="font-bold text-text-primary">{filtered.length}</span> doctors found
          </p>
          <Select
            placeholder="Sort by"
            options={[
              { value: 'rating', label: 'Highest Rated' },
              { value: 'fee_low', label: 'Lowest Fee' },
              { value: 'fee_high', label: 'Highest Fee' },
              { value: 'experience', label: 'Most Experienced' },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-44"
          />
        </div>

        {loadingDoctors && allDoctors.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-surface-100 flex items-center justify-center mx-auto mb-5">
              <Stethoscope className="w-10 h-10 text-surface-300 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Loading doctors...</h3>
            <p className="text-text-muted">Fetching verified doctors</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-surface-100 flex items-center justify-center mx-auto mb-5">
              <Stethoscope className="w-10 h-10 text-surface-300" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No doctors found</h3>
            <p className="text-text-muted mb-5">Try adjusting your search or filters</p>
            <Button variant="secondary" onClick={() => {
              setQuery('')
              setFilters({ specialty: '', disease: '', city: '', treatmentType: '', rating: '', available: false })
            }}>
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </>
  )

  if (dashboardLayout) {
    return (
      <DashboardLayout title="Find Doctors">
        {page}
      </DashboardLayout>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      {page}
    </div>
  )
}
