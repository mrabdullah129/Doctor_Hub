import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, Send, Paperclip, MoreVertical, Phone, Video, MessageSquare } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Avatar from '../../components/ui/Avatar'
import { cn } from '../../lib/utils'
import useAuthStore from '../../store/authStore'
import useAppointmentStore from '../../store/appointmentStore'

// ── Shared message store (localStorage) ──────────────────────────────────────
// Key format: sorted([patientUserId, doctorProfileId]).join('__')
// Both sides use the same key so they see the same thread.
const MSG_KEY = 'doctorhub-messages-v2'

const loadMsgs = () => {
  try { return JSON.parse(localStorage.getItem(MSG_KEY) || '{}') } catch { return {} }
}
const saveMsgs = (data) => {
  try { localStorage.setItem(MSG_KEY, JSON.stringify(data)) } catch {}
}

// Build a stable conversation key from two user IDs (order-independent)
const convKey = (idA, idB) => [String(idA), String(idB)].sort().join('__')

export default function Messages() {
  const { profile, user } = useAuthStore()
  const { getAllAppointments } = useAppointmentStore()
  const role = profile?.role || 'patient'

  const [search, setSearch] = useState('')
  const [selectedContact, setSelectedContact] = useState(null)
  const [message, setMessage] = useState('')
  const [allMessages, setAllMessages] = useState(loadMsgs)
  const messagesEndRef = useRef(null)

  // ── Build contact list from appointments ─────────────────
  const contacts = useMemo(() => {
    const all = getAllAppointments()
    const map = new Map()

    if (role === 'doctor') {
      // Doctor sees patients — contact ID = patient's userId
      const doctorName = (profile?.full_name || '').toLowerCase().trim()
      all
        .filter(a =>
          (a.doctor || '').toLowerCase().trim() === doctorName ||
          String(a.doctorId) === String(profile?.id) ||
          String(a.doctorProfileId) === String(profile?.id)
        )
        .forEach(a => {
          if (!a.patientId || map.has(String(a.patientId))) return
          map.set(String(a.patientId), {
            id: String(a.patientId),           // patient's user ID
            name: a.patientName || a.patient || (a.patientEmail ? a.patientEmail.split('@')[0] : 'Patient'),
            role: 'Patient',
            online: false,
          })
        })
    } else {
      // Patient sees doctors — contact ID = doctor's profile ID
      // doctorProfileId is the doctor's auth user.id (set for real registered doctors).
      // For pre-seeded demo doctors (v1–v5), doctorProfileId is null/undefined — skip messaging.
      const mine = all.filter(a => String(a.patientId) === String(user?.id))
      mine.forEach(a => {
        // Only use doctorProfileId if it looks like a real ID (not a v- prefixed store ID)
        const rawId = a.doctorProfileId || a.doctorId || ''
        const isRealId = rawId && !String(rawId).startsWith('v')
        const contactId = isRealId ? String(rawId) : null
        if (!contactId) return  // skip demo/pre-seeded doctors (no real profile to message)
        if (map.has(contactId)) return
        map.set(contactId, {
          id: contactId,
          name: a.doctor || 'Doctor',
          role: a.specialty || 'Doctor',
          online: false,
        })
      })
    }

    return Array.from(map.values())
  }, [getAllAppointments, role, profile, user])

  // Auto-select first contact
  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0])
    }
  }, [contacts])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages, selectedContact?.id])

  // ── Conversation key for the selected contact ─────────────
  // Always: sorted([myUserId, contactId])
  // Doctor: myId = profile.id, contactId = patient's userId
  // Patient: myId = user.id, contactId = doctor's profileId
  const myId = String(user?.id || '')
  const currentKey = selectedContact ? convKey(myId, selectedContact.id) : null
  const currentMessages = currentKey ? (allMessages[currentKey] || []) : []

  const lastMsg  = (c) => { const k = convKey(myId, c.id); const m = allMessages[k] || []; return m[m.length - 1]?.text || 'No messages yet' }
  const lastTime = (c) => { const k = convKey(myId, c.id); const m = allMessages[k] || []; return m[m.length - 1]?.time || '' }
  const unreadCount = (c) => { const k = convKey(myId, c.id); return (allMessages[k] || []).filter(m => m.sender !== 'me' && !m.read).length }

  const sendMessage = () => {
    if (!message.trim() || !currentKey) return
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      senderName: profile?.full_name || 'You',
      text: message.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    const updated = { ...allMessages, [currentKey]: [...(allMessages[currentKey] || []), newMsg] }
    setAllMessages(updated)
    saveMsgs(updated)
    setMessage('')
  }

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)] flex bg-white rounded-2xl border border-surface-200 shadow-soft overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <div className="w-72 border-r border-surface-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-surface-200">
            <h2 className="text-lg font-bold text-text-primary mb-3">Messages</h2>
            <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-text-primary placeholder-text-muted" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-10 h-10 text-surface-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-text-primary">No conversations yet</p>
                <p className="text-xs text-text-muted mt-1">
                  {role === 'doctor'
                    ? 'Patients who book with you will appear here'
                    : 'Book an appointment to start a conversation'}
                </p>
              </div>
            ) : (
              filteredContacts.map(contact => {
                const unread = unreadCount(contact)
                return (
                  <button key={contact.id} onClick={() => setSelectedContact(contact)}
                    className={cn(
                      'w-full flex items-start gap-3 p-4 hover:bg-surface-50 transition-colors text-left border-b border-surface-100',
                      selectedContact?.id === contact.id && 'bg-primary-50 hover:bg-primary-50'
                    )}>
                    <Avatar name={contact.name} size="md" online={contact.online} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={cn('text-sm font-semibold truncate',
                          selectedContact?.id === contact.id ? 'text-primary-700' : 'text-text-primary')}>
                          {contact.name}
                        </p>
                        <span className="text-xs text-text-muted flex-shrink-0 ml-2">{lastTime(contact)}</span>
                      </div>
                      <p className="text-xs text-text-muted truncate">{contact.role}</p>
                      <p className={cn('text-xs truncate mt-0.5',
                        unread > 0 ? 'text-primary-600 font-semibold' : 'text-text-muted italic')}>
                        {lastMsg(contact)}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unread}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Chat area ───────────────────────────────────────── */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={selectedContact.name} size="md" />
                <div>
                  <p className="font-bold text-text-primary">{selectedContact.name}</p>
                  <p className="text-xs text-text-muted capitalize">{selectedContact.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors"><Phone className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors"><Video className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-surface-50">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Avatar name={selectedContact.name} size="xl" />
                  <p className="font-semibold text-text-primary">{selectedContact.name}</p>
                  <p className="text-sm text-text-muted">Start the conversation</p>
                </div>
              ) : (
                currentMessages.map(msg => (
                  <div key={msg.id} className={cn('flex gap-2', msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                    {msg.sender !== 'me' && <Avatar name={selectedContact.name} size="sm" />}
                    <div>
                      <div className={cn(
                        'px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-xs lg:max-w-sm',
                        msg.sender === 'me'
                          ? 'bg-primary-600 text-white rounded-tr-sm'
                          : 'bg-white text-text-primary shadow-soft border border-surface-200 rounded-tl-sm'
                      )}>
                        {msg.text}
                      </div>
                      <p className={cn('text-xs text-text-muted mt-1', msg.sender === 'me' ? 'text-right' : '')}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-surface-200 bg-white flex-shrink-0">
              <div className="flex items-end gap-2">
                <button className="p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <div className="flex-1 bg-surface-50 border border-surface-200 rounded-2xl px-4 py-2.5">
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder="Type a message… (Enter to send)"
                    rows={1}
                    className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none resize-none" />
                </div>
                <button onClick={sendMessage} disabled={!message.trim()}
                  className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shadow-glow">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-surface-50">
            <div className="w-16 h-16 rounded-3xl bg-primary-50 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary-600" />
            </div>
            <div className="text-center">
              <p className="font-bold text-text-primary">Your Messages</p>
              <p className="text-sm text-text-muted mt-1">
                {contacts.length === 0
                  ? role === 'doctor'
                    ? 'Patients who book with you will appear here'
                    : 'Book an appointment to start messaging'
                  : 'Select a conversation from the left'}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
