import { useState } from 'react'
import { Clock, Plus, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const defaultSchedule = DAYS.map((day, i) => ({
  day,
  enabled: i < 5,
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  maxPatients: 16,
}))

export default function Schedule() {
  const [schedule, setSchedule] = useState(defaultSchedule)
  const [saving, setSaving] = useState(false)

  const toggle = (i) => {
    const s = [...schedule]
    s[i].enabled = !s[i].enabled
    setSchedule(s)
  }

  const update = (i, field, value) => {
    const s = [...schedule]
    s[i][field] = value
    setSchedule(s)
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    toast.success('Schedule saved successfully!')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Schedule Management</h1>
          <p className="text-text-muted mt-1">Set your weekly availability for appointments</p>
        </div>

        <Card>
          <CardTitle className="mb-5">Weekly Schedule</CardTitle>
          <div className="space-y-3">
            {schedule.map((item, i) => (
              <div key={item.day} className={`p-4 rounded-xl border-2 transition-all ${item.enabled ? 'border-primary-100 bg-primary-50/30' : 'border-surface-200 bg-surface-50'}`}>
                <div className="flex items-center gap-4 flex-wrap">
                  <button onClick={() => toggle(i)} className="flex items-center gap-2 min-w-[120px]">
                    {item.enabled
                      ? <ToggleRight className="w-8 h-8 text-primary-600" />
                      : <ToggleLeft className="w-8 h-8 text-surface-300" />}
                    <span className={`font-semibold text-sm ${item.enabled ? 'text-text-primary' : 'text-text-muted'}`}>{item.day}</span>
                  </button>

                  {item.enabled ? (
                    <div className="flex items-center gap-3 flex-wrap flex-1">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-text-muted font-medium">From</label>
                        <input type="time" value={item.startTime}
                          onChange={e => update(i, 'startTime', e.target.value)}
                          className="px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-text-muted font-medium">To</label>
                        <input type="time" value={item.endTime}
                          onChange={e => update(i, 'endTime', e.target.value)}
                          className="px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-text-muted font-medium">Slot</label>
                        <select value={item.slotDuration} onChange={e => update(i, 'slotDuration', +e.target.value)}
                          className="px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none">
                          <option value={15}>15 min</option>
                          <option value={20}>20 min</option>
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>60 min</option>
                        </select>
                      </div>
                      <div className="ml-auto text-xs text-text-muted bg-white px-3 py-1.5 rounded-lg border border-surface-200">
                        Max {Math.floor(((+item.endTime.split(':')[0] * 60 + +item.endTime.split(':')[1]) - (+item.startTime.split(':')[0] * 60 + +item.startTime.split(':')[1])) / item.slotDuration)} slots
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-text-muted italic">Day off</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button loading={saving} icon={Save} onClick={handleSave}>Save Schedule</Button>
          </div>
        </Card>

        {/* Leave / block dates */}
        <Card>
          <CardTitle className="mb-4">Block Dates / Leaves</CardTitle>
          <p className="text-sm text-text-muted mb-4">Mark specific dates as unavailable (holidays, conferences, etc.)</p>
          <div className="flex gap-3">
            <input type="date" min={new Date().toISOString().split('T')[0]}
              className="flex-1 px-4 py-3 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <Button variant="secondary" icon={Plus} onClick={() => toast.success('Date blocked!')}>Block Date</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
