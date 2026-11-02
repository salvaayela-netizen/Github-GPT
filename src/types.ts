export type TaskType = 'Funcional' | 'Técnica' | 'Gestión'
export type InitiativeStatus = 'Planificada' | 'En curso' | 'En riesgo' | 'Completada'

export interface Member {
  id: string
  name: string
  role: string
  location: string
  initials: string
  color: string
  hourlyRate: number
  hoursPerDay: number
}

export interface Assignment {
  memberId: string
  estimatedHours: number
  actualHours: number
}

export interface Task {
  id: string
  name: string
  type: TaskType
  assignments: Assignment[]
}

export interface Initiative {
  id: string
  client: string
  service: string
  projectCode: string
  name: string
  status: InitiativeStatus
  startDate: string
  endDate: string
  tasks: Task[]
  source?: {
    sheet: string
    rows: number[]
    sourceId: string
    process: string
    requestType: string
    description: string
    priority: string
    sponsor: string
    requestedHours: number
    plannedWeeks: number[]
    actualWeeks: number[]
    sourceStatus: string
    dedication: string
    observations: string
    actualAllocation: 'proportional' | 'unassigned' | 'manual'
  }
  unassignedActualHours?: number
}

export interface HolidayCalendar {
  location: string
  country: string
  holidays: { date: string; name: string }[]
}

export interface AppData {
  members: Member[]
  initiatives: Initiative[]
  calendars: HolidayCalendar[]
}
