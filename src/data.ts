import type { AppData } from './types'
import { buildOctoberInitiatives, octoberRows } from './octoberData'

const commonSpain = [
  ['2026-01-01', 'Año Nuevo'], ['2026-01-06', 'Reyes'], ['2026-04-03', 'Viernes Santo'],
  ['2026-05-01', 'Día del Trabajo'], ['2026-08-15', 'Asunción'], ['2026-10-12', 'Fiesta Nacional'],
  ['2026-11-02', 'Traslado de Todos los Santos'], ['2026-12-07', 'Traslado de la Constitución'],
  ['2026-12-08', 'Inmaculada'], ['2026-12-25', 'Navidad'],
]

const cal = (location: string, extra: string[][] = []) => ({
  location,
  country: location === 'Lima' ? 'Perú' : 'España',
  holidays: [...(location === 'Lima' ? [
    ['2026-01-01', 'Año Nuevo'], ['2026-04-02', 'Jueves Santo'], ['2026-04-03', 'Viernes Santo'],
    ['2026-05-01', 'Día del Trabajo'], ['2026-06-29', 'San Pedro y San Pablo'],
    ['2026-07-28', 'Fiestas Patrias'], ['2026-07-29', 'Fiestas Patrias'], ['2026-08-30', 'Santa Rosa de Lima'],
    ['2026-10-08', 'Combate de Angamos'], ['2026-11-01', 'Todos los Santos'],
    ['2026-12-08', 'Inmaculada'], ['2026-12-09', 'Batalla de Ayacucho'], ['2026-12-25', 'Navidad'],
  ] : commonSpain), ...extra].map(([date, name]) => ({ date, name })),
})

export const initialData: AppData = {
  members: [
    { id: 'salva', name: 'Salva', role: 'Líder funcional', location: 'Alicante', initials: 'SA', color: '#27695f', hourlyRate: 33, hoursPerDay: 8 },
    { id: 'jose-luis', name: 'Jose Luis', role: 'Funcional', location: 'Sevilla', initials: 'JL', color: '#d28a45', hourlyRate: 28, hoursPerDay: 8 },
    { id: 'cristina', name: 'Cristina', role: 'Funcional', location: 'Madrid', initials: 'CR', color: '#6979a8', hourlyRate: 28, hoursPerDay: 8 },
    { id: 'adrian', name: 'Adrián', role: 'Técnico', location: 'Salamanca', initials: 'AD', color: '#a65f73', hourlyRate: 28, hoursPerDay: 8 },
    { id: 'marcos', name: 'Marcos', role: 'Técnico senior', location: 'Alicante', initials: 'MA', color: '#467b9c', hourlyRate: 28, hoursPerDay: 8 },
    { id: 'ramirez', name: 'Ramirez', role: 'Técnico', location: 'Lima', initials: 'RA', color: '#8b6d9e', hourlyRate: 28, hoursPerDay: 8 },
    { id: 'marti', name: 'Martí', role: 'Becario técnico', location: 'Barcelona', initials: 'MT', color: '#669b68', hourlyRate: 0, hoursPerDay: 8 },
  ],
  calendars: [
    cal('Alicante', [['2026-03-19', 'San José'], ['2026-06-24', 'San Juan'], ['2026-10-09', 'Día de la Comunitat Valenciana']]),
    cal('Sevilla', [['2026-02-28', 'Día de Andalucía'], ['2026-04-02', 'Jueves Santo']]),
    cal('Madrid', [['2026-05-02', 'Día de Madrid'], ['2026-05-15', 'San Isidro'], ['2026-11-09', 'Almudena']]),
    cal('Salamanca', [['2026-04-23', 'Día de Castilla y León'], ['2026-06-12', 'San Juan de Sahagún']]),
    cal('Barcelona', [['2026-04-06', 'Lunes de Pascua'], ['2026-06-24', 'San Juan'], ['2026-09-11', 'Diada'], ['2026-09-24', 'La Mercè']]),
    cal('Lima'),
  ],
  initiatives: buildOctoberInitiatives(octoberRows),
}
