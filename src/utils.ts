import type { AppData, Initiative } from './types'

export const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
export const number = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })

export const initiativeHours = (initiative: Initiative, field: 'estimatedHours' | 'actualHours') =>
  initiative.tasks.flatMap(t => t.assignments).reduce((sum, a) => sum + a[field], 0) +
  (field === 'actualHours' ? initiative.unassignedActualHours ?? 0 : 0)

export const businessHours = (start: string, end: string, location: string, data: AppData, hoursPerDay = 8) => {
  const holidays = new Set(data.calendars.find(c => c.location === location)?.holidays.map(h => h.date) ?? [])
  const cursor = new Date(`${start}T12:00:00`)
  const finish = new Date(`${end}T12:00:00`)
  let days = 0
  while (cursor <= finish) {
    const iso = cursor.toISOString().slice(0, 10)
    const day = cursor.getDay()
    if (day !== 0 && day !== 6 && !holidays.has(iso)) days++
    cursor.setDate(cursor.getDate() + 1)
  }
  return days * hoursPerDay
}

export const statusTone = (status: string) => ({
  'En curso': 'blue', 'Planificada': 'neutral', 'En riesgo': 'red', 'Completada': 'green',
}[status] ?? 'neutral')

export const uid = () => Math.random().toString(36).slice(2, 10)
