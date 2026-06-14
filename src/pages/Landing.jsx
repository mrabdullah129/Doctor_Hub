import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Star, MapPin, Calendar, Shield, FileText, MessageSquare,
  CheckCircle2, ChevronDown, Stethoscope, Heart, Activity,
  Users, TrendingUp, Award, ArrowRight, Play, Phone, Mail,
  Globe, Link2, ExternalLink, Share2, Clock, Pill
} from 'lucide-react'
import Button from '../components/ui/Button'
import Navbar from '../components/layout/Navbar'
import { SPECIALIZATIONS } from '../lib/constants'
import { cn } from '../lib/utils'

const stats = [
  { label: 'Verified Doctors', value: '500+', icon: Stethoscope, color: 'text-primary-600 bg-primary-50' },
  { label: 'Happy Patients', value: '25K+', icon: Heart, color: 'text-pink-500 bg-pink-50' },
  { label: 'Appointments Done', value: '100K+', icon: Calendar, color: 'text-secondary-500 bg-secondary-50' },
  { label: 'Success Rate', value: '98%', icon: TrendingUp, color: 'text-teal-500 bg-teal-50' },
]

const features = [
  {
    icon: Search,
    title: 'Smart Doctor Search',
    desc: 'Find the right doctor instantly with AI-powered search by specialty, disease, location, and availability.',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: Shield,
    title: 'Secure Medical Records',
    desc: 'Your health data is encrypted and stored securely. Access your medical history anytime, anywhere.',
    color: 'bg-secondary-50 text-secondary-600',
  },
  {
    icon: Calendar,
    title: 'Online Booking',
    desc: 'Book appointments in minutes with real-time availability. Get instant confirmation.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Pill,
    title: 'Digital Prescriptions',
    desc: 'Receive, store, and manage digital prescriptions. Export as PDF or share with pharmacies.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Award,
    title: 'Verified Doctors',
    desc: 'All doctors are verified with their credentials, licenses, and peer reviews validated.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: MessageSquare,
    title: 'Secure Messaging',
    desc: 'Communicate directly with your doctor through our secure, HIPAA-compliant messaging system.',
    color: 'bg-pink-50 text-pink-600',
  },
]

const testimonials = [
  {
    name: 'Fatima Malik',
    role: 'Patient',
    city: 'Karachi',
    text: 'DoctorHub made it incredibly easy to find a specialist for my chronic condition. The booking process was seamless and the doctor was excellent.',
    rating: 5,
    avatar: 'FM',
  },
  {
    name: 'Dr. Hassan Ali',
    role: 'Cardiologist',
    city: 'Lahore',
    text: "As a doctor, this platform has streamlined my practice management significantly. Patient records, appointments, and prescriptions all in one place.",
    rating: 5,
    avatar: 'HA',
  },
  {
    name: 'Ayesha Raza',
    role: 'Patient',
    city: 'Islamabad',
    text: 'The prescription management feature is fantastic. I can access all my prescriptions digitally and share them with any pharmacy.',
    rating: 5,
    avatar: 'AR',
  },
]

const faqs = [
  {
    q: 'How do I book an appointment?',
    a: 'Search for a doctor by specialty or disease, select your preferred time slot, upload your payment proof, and wait for confirmation from the doctor\'s assistant.',
  },
  {
    q: 'Are all doctors verified?',
    a: 'Yes, every doctor on our platform undergoes a thorough verification process including medical license validation, credentials check, and peer reviews.',
  },
  {
    q: 'How is my medical data kept secure?',
    a: 'We use enterprise-grade encryption (AES-256) for all stored data and TLS 1.3 for data in transit. Your medical records are never shared without explicit consent.',
  },
  {
    q: 'Can I see my prescription history?',
    a: 'Yes, all prescriptions are permanently stored in your profile. You can view, download as PDF, or share them with any healthcare provider.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept bank transfers, Easypaisa, JazzCash, and other payment methods. You upload a payment screenshot which is verified by the doctor\'s assistant.',
  },
]

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-surface-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-50 transition-colors"
      >
        <span className="font-semibold text-text-primary pr-4">{q}</span>
        <ChevronDown className={cn('w-5 h-5 text-text-muted flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-text-secondary leading-relaxed text-sm border-t border-surface-100 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('')
  const [counts, setCounts] = useState({ doctors: 0, patients: 0, appointments: 0 })

  // Animate counters
  useEffect(() => {
    const targets = { doctors: 500, patients: 25000, appointments: 100000 }
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCounts({
        doctors: Math.floor(targets.doctors * eased),
        patients: Math.floor(targets.patients * eased),
        appointments: Math.floor(targets.appointments * eased),
      })
      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-teal-50 pt-16 pb-24">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50/50 to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-2 text-sm text-primary-700 font-semibold mb-8">
                <Activity className="w-4 h-4" />
                Pakistan's #1 Healthcare Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6">
                Find the Right Doctor{' '}
                <span className="text-gradient">Instantly</span>
              </h1>

              <p className="text-lg text-text-secondary leading-relaxed mb-10 max-w-lg">
                Book appointments with top-rated doctors, manage your health records, and get digital prescriptions — all from one trusted platform.
              </p>

              {/* Search bar */}
              <div className="flex gap-3 bg-white rounded-2xl shadow-medium border border-surface-200 p-2 mb-8 max-w-lg">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctors, specialties, diseases..."
                    className="w-full bg-transparent text-text-primary placeholder-text-muted focus:outline-none text-sm"
                  />
                </div>
                <Link to={`/doctors${searchQuery ? `?q=${searchQuery}` : ''}`}>
                  <Button>Search</Button>
                </Link>
              </div>

              {/* Popular specialties */}
              <div className="flex flex-wrap gap-2 mb-10">
                <span className="text-sm text-text-muted font-medium mr-1">Popular:</span>
                {['Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist'].map((s) => (
                  <Link
                    key={s}
                    to={`/doctors?specialty=${s}`}
                    className="px-3 py-1.5 bg-white border border-surface-200 rounded-full text-sm text-text-secondary hover:border-primary-300 hover:text-primary-600 transition-all shadow-soft"
                  >
                    {s}
                  </Link>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-2xl font-bold text-text-primary">{counts.doctors}+</p>
                  <p className="text-sm text-text-muted">Doctors</p>
                </div>
                <div className="w-px h-10 bg-surface-200" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">{(counts.patients / 1000).toFixed(0)}K+</p>
                  <p className="text-sm text-text-muted">Patients</p>
                </div>
                <div className="w-px h-10 bg-surface-200" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">98%</p>
                  <p className="text-sm text-text-muted">Success Rate</p>
                </div>
              </div>
            </div>

            {/* Right - Hero illustration */}
            <div className="hidden lg:block relative animate-float">
              <div className="relative">
                {/* Main card */}
                <div className="bg-white rounded-3xl shadow-large p-8 border border-surface-200 mx-auto max-w-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-text-primary">Dr. Sarah Ahmed</p>
                      <p className="text-sm text-text-muted">Cardiologist • 10 yrs exp</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                        <span className="text-xs text-text-muted ml-1">4.9 (240 reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: 'Availability', value: 'Today', icon: Clock, color: 'text-secondary-500 bg-secondary-50' },
                      { label: 'Consultation', value: 'Rs 2000', icon: Activity, color: 'text-primary-600 bg-primary-50' },
                    ].map((item) => (
                      <div key={item.label} className="bg-surface-50 rounded-xl p-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', item.color)}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-text-muted">{item.label}</p>
                        <p className="text-sm font-bold text-text-primary">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full">
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </Button>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-medium px-4 py-3 border border-surface-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary-50 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-secondary-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">Appointment Confirmed</p>
                      <p className="text-xs text-text-muted">Today 3:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-medium px-4 py-3 border border-surface-200">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {['FM', 'AR', 'HK'].map((init, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold border-2 border-white">
                          {init}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">+2.5K patients</p>
                      <p className="text-xs text-text-muted">joined this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110',
                  stat.color
                )}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <p className="text-3xl font-bold text-text-primary mb-1">{stat.value}</p>
                <p className="text-text-muted text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-2 text-sm text-primary-700 font-semibold mb-5">
              Everything you need
            </div>
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Powerful Features for{' '}
              <span className="text-gradient">Better Healthcare</span>
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              From booking to billing, DoctorHub brings modern technology to make healthcare accessible and efficient.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="card hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform',
                  feature.color
                )}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-text-muted text-lg">Book an appointment in just 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Search Doctor', desc: 'Find doctors by specialty, disease, city, or availability.', icon: Search },
              { step: '02', title: 'Book Slot', desc: 'Choose your preferred date and time slot.', icon: Calendar },
              { step: '03', title: 'Pay & Upload', desc: 'Make payment and upload the receipt screenshot.', icon: Shield },
              { step: '04', title: 'Get Confirmed', desc: 'Assistant verifies and confirms your appointment.', icon: CheckCircle2 },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-5 shadow-glow group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="inline-block bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    Step {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / About */}
      <section id="about" className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Loved by Patients & Doctors
            </h2>
            <p className="text-text-muted text-lg">Real experiences from our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-text-secondary leading-relaxed mb-5 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role} • {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-text-muted">Everything you need to know about DoctorHub</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQ key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Start Your Health Journey Today
          </h2>
          <p className="text-primary-100 text-xl mb-10 leading-relaxed">
            Join 25,000+ patients who trust DoctorHub for their healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-large">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/doctors">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm">
                Browse Doctors
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-text-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DoctorHub</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Pakistan's most trusted healthcare platform connecting patients with verified doctors.
              </p>
              <div className="flex items-center gap-3">
                {[Globe, Link2, ExternalLink, Share2].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary-600 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'For Patients',
                links: ['Find Doctors', 'Book Appointment', 'Medical Records', 'Prescriptions', 'Help Center'],
              },
              {
                title: 'For Doctors',
                links: ['Join as Doctor', 'Manage Practice', 'Patient Management', 'Analytics', 'Support'],
              },
              {
                title: 'Company',
                links: ['About Us', 'Careers', 'Blog', 'Terms of Service', 'Privacy Policy'],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-white mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © 2026 DoctorHub. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="tel:+923001234567" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                <Phone className="w-4 h-4" />
                +92 300 1234567
              </a>
              <a href="mailto:info@doctorhub.pk" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                <Mail className="w-4 h-4" />
                info@doctorhub.pk
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
