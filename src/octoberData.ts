import type { Initiative, InitiativeStatus, TaskType } from './types'

export interface OctoberRow {
  row: number
  id: string
  name: string
  code: string
  service: string
  process: string
  requestType: string
  description: string
  priority: string
  sponsor: string
  requested: number
  assignments: Record<string, number>
  plannedWeeks: number[]
  actualWeeks: number[]
  observations: string
  status: string
  dedication: string
}

type RawRow = [string, string, string, string, string, string, string, string, number, string, Record<string, number>, number[], number[], string, string, string]

const rawRows: RawRow[] = [
  ['BAU','Weekly Innova','N/A','Todos','Todos','Reuniones','Alta','Leticia Egea',4,'.-',{salva:8},[2,2,2,2],[2,2,2,2],'','',''],
  ['BAU','Comités BS + preparación','N/A','Todos','Todos','Reuniones','Alta','Enric Gurrea',3,'.-',{salva:12},[4,0,8,0],[1,0,8,0],'','',''],
  ['BAU','Checkpoint BS','N/A','Todos','Todos','Reuniones','Alta','Enric Gurrea',0,'.-',{salva:4},[1,1,1,1],[1,1,1,1],'','',''],
  ['BAU','Daily Access','EXT-024930-00038','Testamentaria','Todos','Reuniones','Alta','Leticia Egea',6,'.-',{},[0,0,0,0],[0,0,0,0],'','',''],
  ['BAU','Check point IA dictámenes','EXT-024930-00038','Testamentaria','Dictámenes','Reuniones','Alta','Leticia Egea',6,'.-',{},[0,0,0,0],[0,0,0,0],'','',''],
  ['BAU','MdT IA dictámens','EXT-024930-00038','Testamentaria','Dictámenes','Reuniones','Alta','Leticia Egea',0,'',{},[0,0,0,0],[0,0,0,0],'','',''],
  ['BAU','Retiro BS','N/A','Todos','Todos','Reuniones','Alta','Leticia Egea',4,'',{salva:11},[0,11,0,0],[0,11,0,0],'','','5 en UCO'],
  ['BAU','Coordinación y seguimiento iniciativas','N/A','Todos','','Gestión','','',0,'',{salva:31},[10,7,7,7],[10,7,7,7],'','',''],
  ['ID 38','IA Dictámenes','EXT-024930-00038','Testamentaria','Dictámenes','IA','Alta','Leticia Egea',10,'Output proceso. Evolutivos shori, cambio y testing de nueva versión IA. Montar cuadro de mandos y estudiar capacidades.',{'jose-luis':37},[7,10,10,10],[7,10,10,10],'paso a producción semana 02/11','ok',''],
  ['ID 39','IA Noel','EXT-024930-00042','Legal Operations','Notificaciones Electrónicas','IA','Media','Victor Aroca',10,'Dashboard de seguimiento, estudio de capacidades y versión IA.',{'jose-luis':11},[0,11,0,0],[0,11,0,0],'validación de BS','ok',''],
  ['ID 140','IA Bastanteos','EXT-024930-00018','Legal Operations','Bastanteos','IA','Alta','Albert Barenys',3,'Business case, capacidades, reporte semanal y testing de nueva versión IA.',{salva:3},[1.5,1.5,0,0],[1.5,1.5,0,0],'en curso','ok','1ª semana con TMO Tool y 2ª con Shori'],
  ['ID 141','Migración Access TEST a ORACLE','EXT-024930-00038','Testamentaria','Todos','Técnico','Alta','Leticia Egea',20,'Planificación de trabajos con Israel Coello de la Rosa BS.',{adrian:42,marcos:10},[12,12.5,15,12.5],[12,25,25,12.5],'más demanda','',''],
  ['BAU','Incidencias Access y otras','N/A','Todos','Todos','Técnico','Alta','Leticia Egea',20,'Atender incidencias reportadas por servicios.',{adrian:25},[7,6,6,6],[7,6,6,6],'se siguen recibiendo solicitudes por Teams','',''],
  ['ID 104','Buzones IA','EXT-024930-00038','Varios','Varios','Funcional','Alta','Leticia Egea',10,'Cotización para desarrollos de escenario 1 y escenario 2.',{marcos:30,salva:12},[42,0,0,0],[17,0,0,0],'Presentado a BS','ok','Cotización y arquitectura pendiente'],
  ['ID 132','Bolsa de Horas SFAC','EXT-024930-00016','Activo','Alta Expediente Riesgo','Desarrollo Activo','Alta','Marina Gomez Montero',40,'Dashboard HTML.',{'jose-luis':18,ramirez:20},[19,19,0,0],[19,19,10,0],'En producción - Pte evolutivos','','Solución + Dashboard'],
  ['','Bolsa de Horas SAER','','','','Desarrollo Activo','','',0,'Automatismo de reparto y dashboard.',{'jose-luis':20,ramirez:20},[0,0,20,20],[0,0,0,20],'','pte','Solución + Dashboard'],
  ['ID 21','Shori Financiaciones','EXT-024930-00011','Activo','BEPIS','Definición + Desarrollo Activo','Media','Ivan Castells',40,'Proyecto Argos: automatizar input, output, informe y RAG.',{'jose-luis':5,ramirez:10},[0,5,10,0],[0,5,10,0],'en PRE sin cargas ni output','',''],
  ['ID 143','Shori gastos hipotecarios','EXT-024930-00011','Activo','Gastos Hipotecarios','Definición + Desarrollo Activo','Media','Ivan Castells',40,'Proyecto Argos: automatizar input, output, informe y RAG.',{'jose-luis':5,ramirez:10},[0,5,10,0],[0,5,10,0],'en PRE sin cargas ni output','',''],
  ['ID 144','Shori para administración de préstamos','EXT-024930-00017','Activo','Administración Préstamos','Definición + Desarrollo Activo','Alta','Evelyn Rocio Malqui',20,'Proyecto Argos: automatizar input, output, informe y RAG.',{'jose-luis':4,cristina:29,ramirez:10},[0,15,18,10],[0,15,0,10],'en PRE, carga diseñada sin output','',''],
  ['ID 157','Revisión y automatización de certificados ADP','EXT-024930-00044','Activo','Certificados hipotecarios y no hipotecarios','Definición + Desarrollo Activo','Alta','Reyes Castello',20,'Preparar macros para automatización de tipologías de certificados.',{cristina:25,adrian:15,ramirez:12},[25,27,0,0],[25,3,0,5],'tipología 1 en testing; falta desarrollo tipología 2','corregido',''],
  ['ID 139','Cuadre Cajeros - Shori','EXT-024930-00020','Medios de Pago','Cuadre Cajeros','Desarrollo Otros','Alta','Milagros Myte',20,'Proyecto Argos: reorganización de los productos.',{'jose-luis':24,ramirez:30,salva:8},[0,16,16,30],[0,4,0,30],'','',''],
  ['ID 72','Pólizas SFAC','EXT-024930-00015','Activo','','Funcional','','',0,'Prompt para automatizar la elaboración de pólizas multicrédito.',{cristina:12},[12,0,0,0],[16,0,0,0],'2 horas adicionales por ajustes del nuevo alcance; en testing','',''],
  ['ID 151','Revisar Macro Gastos Hipotecarios','EXT-024930-00011','Activo','','Funcional','','',0,'Macro entregada al servicio en julio.',{cristina:2,marcos:2},[4,0,0,0],[4,0,0,0],'En Producción','ok',''],
  ['ID 94','Testamentaria Express','EXT-024930-00038','Testamentaria','','Funcional','','',0,'Documento funcional, nuevos procedimientos y cotización.',{'jose-luis':8},[8,0,10,0],[8,12,26,0],'','',''],
  ['Pte','Comprimir datos Access transferencias recibidas','EXT-024930-00036','Medios de Pago','','Técnico','','',0,'Objetivo: mejorar rendimiento.',{cristina:1,adrian:2},[0,3,0,0],[0,1,0,0],'pte desarrollo','',''],
  ['Pte','Capacidades transferencias emitidas','EXT-024930-00036','Medios de Pago','','Técnico','','',0,'Calculadora online de dimensionamiento por horas, Power App e informe HTML.',{cristina:5,adrian:5},[0,0,10,0],[0,0,0,0],'pte iniciar','','Calculadora'],
  ['ID 89','Postdictamen · Prompts de Traspaso Valores','EXT-024930-00038','Sin servicio','','Funcional','','',0,'',{},[0,2,1.5,0],[0,0,7,0],'Derivada de incidencias de los Access de traspasos','',''],
]

export const octoberRows: OctoberRow[] = rawRows.map((r, index) => ({
  row: index + 10, id: r[0], name: r[1], code: r[2], service: r[3], process: r[4], requestType: r[5],
  priority: r[6], sponsor: r[7], requested: r[8], description: r[9], assignments: r[10],
  plannedWeeks: r[11], actualWeeks: r[12], status: r[13], dedication: r[14], observations: r[15],
}))

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)
const round = (value: number) => Math.round(value * 10) / 10
const memberType = (memberId: string): TaskType => memberId === 'salva' ? 'Gestión' : ['jose-luis', 'cristina'].includes(memberId) ? 'Funcional' : 'Técnica'

const mapStatus = (row: OctoberRow): InitiativeStatus => {
  const text = row.status.toLowerCase()
  if (text.includes('más demanda')) return 'En riesgo'
  if (text.includes('pte iniciar') || text.includes('pte desarrollo')) return 'Planificada'
  if (text === 'en producción' || (row.dedication === 'ok' && sum(row.actualWeeks) >= sum(Object.values(row.assignments)))) return 'Completada'
  return sum(row.actualWeeks) > 0 ? 'En curso' : 'Planificada'
}

const rowTasks = (row: OctoberRow) => {
  const entries = Object.entries(row.assignments)
  const estimatedTotal = sum(entries.map(([, hours]) => hours))
  const actualTotal = sum(row.actualWeeks)
  let allocated = 0
  const allocations = entries.map(([memberId, estimatedHours], index) => {
    const actualHours = index === entries.length - 1 ? round(actualTotal - allocated) : round(actualTotal * estimatedHours / Math.max(estimatedTotal, 1))
    allocated += actualHours
    return { memberId, estimatedHours, actualHours }
  })
  return (['Funcional', 'Técnica', 'Gestión'] as TaskType[]).flatMap(type => {
    const assignments = allocations.filter(a => memberType(a.memberId) === type)
    return assignments.length ? [{ id: `row-${row.row}-${type}`, name: row.name, type, assignments }] : []
  })
}

export const buildOctoberInitiatives = (rows: OctoberRow[]): Initiative[] => {
  const initiatives: Initiative[] = []
  rows.forEach(row => {
    const isContinuation = !row.id && initiatives.length > 0
    if (isContinuation) {
      const current = initiatives[initiatives.length - 1]
      current.tasks.push(...rowTasks(row))
      current.source!.rows.push(row.row)
      current.source!.plannedWeeks = current.source!.plannedWeeks.map((v, i) => v + row.plannedWeeks[i])
      current.source!.actualWeeks = current.source!.actualWeeks.map((v, i) => v + row.actualWeeks[i])
      current.source!.actualAllocation = 'proportional'
      return
    }
    const plannedTotal = sum(Object.values(row.assignments))
    const actualTotal = sum(row.actualWeeks)
    initiatives.push({
      id: `october-${row.row}`, client: 'Banco Sabadell', service: row.service || 'Sin servicio',
      projectCode: row.code || 'N/A', name: row.name, status: mapStatus(row), startDate: '2026-10-05', endDate: '2026-10-29',
      tasks: rowTasks(row), unassignedActualHours: plannedTotal === 0 ? actualTotal : 0,
      source: { sheet: 'Octubre (2)', rows: [row.row], sourceId: row.id, process: row.process, requestType: row.requestType,
        description: row.description, priority: row.priority, sponsor: row.sponsor, requestedHours: row.requested,
        plannedWeeks: [...row.plannedWeeks], actualWeeks: [...row.actualWeeks], sourceStatus: row.status,
        dedication: row.dedication, observations: row.observations,
        actualAllocation: plannedTotal ? 'proportional' : actualTotal ? 'unassigned' : 'manual' },
    })
  })
  return initiatives
}

export const parseOctoberSheet = (rows: unknown[][]): OctoberRow[] => {
  const text = (value: unknown) => value == null ? '' : String(value).trim()
  const num = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : Number(String(value ?? '').replace(',', '.')) || 0
  const people = ['jose-luis', 'cristina', 'adrian', 'marcos', 'ramirez', 'salva']
  return rows.slice(9, 36).filter(row => text(row[1])).map((row, index) => ({
    row: index + 10, id: text(row[0]), name: text(row[1]), code: text(row[2]), service: text(row[3]), process: text(row[4]),
    requestType: text(row[5]), description: text(row[6]), priority: text(row[7]), sponsor: text(row[8]), requested: num(row[9]),
    assignments: Object.fromEntries(people.map((person, i) => [person, num(row[12 + i])]).filter(([, hours]) => Number(hours) > 0)),
    plannedWeeks: [22, 23, 24, 25].map(i => num(row[i])), actualWeeks: [32, 33, 34, 35].map(i => num(row[i])),
    observations: text(row[21]), status: text(row[36]), dedication: text(row[37]),
  }))
}
