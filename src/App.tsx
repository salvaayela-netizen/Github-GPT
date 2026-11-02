import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, ChevronDown, ChevronRight,
  CircleDollarSign, Clock3, Download, FileSpreadsheet, Gauge, LayoutDashboard, Plus, Search,
  Settings2, Users, X,
} from 'lucide-react'
import { initialData } from './data'
import { buildOctoberInitiatives, parseOctoberSheet } from './octoberData'
import type { AppData, Initiative, InitiativeStatus, TaskType } from './types'
import { businessHours, euro, initiativeHours, number, statusTone, uid } from './utils'

type View = 'dashboard' | 'initiatives' | 'team' | 'calendars'
const STORAGE_KEY = 'brujula-project-control-v2'

function cloneInitial(): AppData { return JSON.parse(JSON.stringify(initialData)) }

function App() {
  const [data, setData] = useState<AppData>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '') } catch { return cloneInitial() }
  })
  const [view, setView] = useState<View>('dashboard')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string[]>(['october-10'])
  const [modal, setModal] = useState<'initiative' | 'task' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 4500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const totals = useMemo(() => {
    const estimated = data.initiatives.reduce((s, i) => s + initiativeHours(i, 'estimatedHours'), 0)
    const actual = data.initiatives.reduce((s, i) => s + initiativeHours(i, 'actualHours'), 0)
    const forecast = data.initiatives.reduce((sum, i) => sum + i.tasks.flatMap(t => t.assignments).reduce((s, a) => {
      const member = data.members.find(m => m.id === a.memberId)
      return s + a.estimatedHours * (member?.hourlyRate ?? 0)
    }, 0), 0)
    const actualCost = data.initiatives.reduce((sum, i) => sum + i.tasks.flatMap(t => t.assignments).reduce((s, a) => {
      const member = data.members.find(m => m.id === a.memberId)
      return s + a.actualHours * (member?.hourlyRate ?? 0)
    }, 0), 0)
    return { estimated, actual, forecast, actualCost }
  }, [data])

  const filtered = data.initiatives.filter(i => `${i.name} ${i.projectCode} ${i.service}`.toLowerCase().includes(search.toLowerCase()))

  const updateHours = (initiativeId: string, taskId: string, memberId: string, field: 'estimatedHours' | 'actualHours', value: number) => {
    setData(current => ({ ...current, initiatives: current.initiatives.map(i => i.id !== initiativeId ? i : ({
      ...i, source: i.source ? { ...i.source, actualAllocation: 'manual' } : undefined,
      tasks: i.tasks.map(t => t.id !== taskId ? t : ({
        ...t, assignments: t.assignments.map(a => a.memberId !== memberId ? a : { ...a, [field]: Math.max(0, value || 0) }),
      })),
    })) }))
  }

  const importExcel = async (file: File) => {
    try {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(await file.arrayBuffer())
      const sheetName = workbook.SheetNames.find(n => n.trim().toLowerCase() === 'octubre (2)')
      if (!sheetName) throw new Error('No se encontró la pestaña “Octubre (2)”.')
      const rawRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, defval: null, raw: true })
      if (rawRows.length < 37 || String(rawRows[8]?.[1] ?? '').trim() !== 'Iniciativa / necesidad') throw new Error('La estructura de “Octubre (2)” no coincide con la hoja validada.')
      const imported = buildOctoberInitiatives(parseOctoberSheet(rawRows))
      const estimated = imported.reduce((sum, i) => sum + initiativeHours(i, 'estimatedHours'), 0)
      if (imported.length !== 26 || estimated !== 538) throw new Error(`Validación fallida: se detectaron ${imported.length} iniciativas y ${estimated} horas; se esperaban 26 y 538.`)
      setData(current => ({ ...current, initiatives: imported }))
      setExpanded([imported[0].id])
      setNotice('Importadas y validadas 26 iniciativas, 538 h y 15.509 € de forecast.')
      setView('initiatives')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'No se pudo importar el fichero.')
    } finally { if (fileRef.current) fileRef.current.value = '' }
  }

  const exportData = async () => {
    const XLSX = await import('xlsx')
    const rows = data.initiatives.flatMap(i => i.tasks.flatMap(t => t.assignments.map(a => {
      const member = data.members.find(m => m.id === a.memberId)!
      return { Cliente: i.client, Servicio: i.service, 'Código proyecto': i.projectCode, Iniciativa: i.name, Estado: i.status,
        'ID origen': i.source?.sourceId ?? '', Prioridad: i.source?.priority ?? '', Proceso: i.source?.process ?? '', Sponsor: i.source?.sponsor ?? '',
        Tarea: t.name, Tipo: t.type, Persona: member.name, Ubicación: member.location,
        'Horas estimadas': a.estimatedHours, 'Horas reales': a.actualHours, Desviación: a.actualHours - a.estimatedHours,
        'Tarifa €/h': member.hourlyRate, 'Forecast €': a.estimatedHours * member.hourlyRate, 'Coste real €': a.actualHours * member.hourlyRate }
    })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Planificación')
    XLSX.writeFile(workbook, 'control-proyectos-banco-sabadell.xlsx')
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">B</div><div><strong>Brújula</strong><span>Project control</span></div></div>
      <nav>
        <NavItem active={view === 'dashboard'} icon={<LayoutDashboard />} label="Resumen" onClick={() => setView('dashboard')} />
        <NavItem active={view === 'initiatives'} icon={<BriefcaseBusiness />} label="Iniciativas" onClick={() => setView('initiatives')} count={data.initiatives.length} />
        <NavItem active={view === 'team'} icon={<Users />} label="Equipo" onClick={() => setView('team')} count={data.members.length} />
        <NavItem active={view === 'calendars'} icon={<CalendarDays />} label="Calendarios" onClick={() => setView('calendars')} />
      </nav>
      <div className="sidebar-foot"><span>Cliente activo</span><strong>Banco Sabadell</strong><small>OMC · AITO</small></div>
    </aside>

    <main>
      <header className="topbar">
        <div><span className="eyebrow">BANCO SABADELL · CONTROL DE CARTERA</span><h1>{view === 'dashboard' ? 'Buenos días, Salva' : ({ initiatives: 'Iniciativas', team: 'Capacidad del equipo', calendars: 'Calendarios laborales' } as const)[view]}</h1></div>
        <div className="top-actions">
          <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={e => e.target.files?.[0] && importExcel(e.target.files[0])} />
          <button className="button secondary" onClick={() => fileRef.current?.click()}><FileSpreadsheet /> Importar Excel</button>
          <button className="button primary" onClick={() => setModal('initiative')}><Plus /> Nueva iniciativa</button>
        </div>
      </header>

      {view === 'dashboard' && <Dashboard data={data} totals={totals} setView={setView} />}
      {view === 'initiatives' && <Initiatives data={data} initiatives={filtered} search={search} setSearch={setSearch}
        expanded={expanded} setExpanded={setExpanded} updateHours={updateHours} setModal={setModal} exportData={exportData} />}
      {view === 'team' && <Team data={data} />}
      {view === 'calendars' && <Calendars data={data} setData={setData} />}
    </main>
    {modal && <CreateModal mode={modal} data={data} setData={setData} close={() => setModal(null)} />}
    {notice && <div className="toast">{notice}<button onClick={() => setNotice(null)}><X /></button></div>}
  </div>
}

function NavItem({ active, icon, label, count, onClick }: { active: boolean; icon: React.ReactNode; label: string; count?: number; onClick: () => void }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{count !== undefined && <em>{count}</em>}</button>
}

function Dashboard({ data, totals, setView }: { data: AppData; totals: { estimated: number; actual: number; forecast: number; actualCost: number }; setView: (v: View) => void }) {
  const deviation = totals.actual - totals.estimated
  const memberLoad = data.members.map(member => {
    const assigned = data.initiatives.reduce((sum, i) => sum + i.tasks.flatMap(t => t.assignments).filter(a => a.memberId === member.id).reduce((s, a) => s + a.estimatedHours, 0), 0)
    const rangeStart = data.initiatives.map(i => i.startDate).sort()[0]
    const rangeEnd = data.initiatives.map(i => i.endDate).sort().at(-1)!
    const capacity = businessHours(rangeStart, rangeEnd, member.location, data, member.hoursPerDay)
    return { member, assigned, capacity, pct: capacity ? Math.round(assigned / capacity * 100) : 0 }
  }).sort((a, b) => b.pct - a.pct)

  return <div className="content dashboard">
    <section className="hero-row">
      <div><h2>Visión general</h2><p>Datos validados de la hoja de encargo OMC → AITO · Octubre 2026</p></div>
      <div className="period"><CalendarDays /> 05 oct — 29 oct 2026</div>
    </section>
    <section className="kpi-grid">
      <Kpi icon={<Clock3 />} label="Horas planificadas" value={`${number.format(totals.estimated)} h`} foot={`${number.format(totals.actual)} h realizadas`} tone="green" />
      <Kpi icon={deviation > 0 ? <ArrowUpRight /> : <ArrowDownRight />} label="Desviación global" value={`${deviation > 0 ? '+' : ''}${number.format(deviation)} h`} foot={`${Math.abs(Math.round(deviation / Math.max(totals.estimated, 1) * 100))}% sobre la estimación`} tone={deviation > 0 ? 'red' : 'green'} />
      <Kpi icon={<CircleDollarSign />} label="Forecast" value={euro.format(totals.forecast)} foot={`${euro.format(totals.actualCost)} coste realizado`} tone="gold" />
      <Kpi icon={<Gauge />} label="Iniciativas activas" value={String(data.initiatives.filter(i => i.status !== 'Completada').length)} foot={`${data.initiatives.filter(i => i.status === 'En riesgo').length} requieren atención`} tone="blue" />
    </section>
    <section className="dashboard-grid">
      <div className="card span-2">
        <div className="card-title"><div><h3>Estado de iniciativas</h3><p>Estimación frente a horas realizadas</p></div><button className="text-button" onClick={() => setView('initiatives')}>Ver detalle <ChevronRight /></button></div>
        <div className="initiative-list">{data.initiatives.map(i => {
          const est = initiativeHours(i, 'estimatedHours'), real = initiativeHours(i, 'actualHours')
          return <div className="initiative-row" key={i.id}><div className="initiative-name"><span className={`status-dot ${statusTone(i.status)}`} /><div><strong>{i.name}</strong><small>{i.projectCode} · {i.service}</small></div></div><span className={`pill ${statusTone(i.status)}`}>{i.status}</span><div className="bar-cell"><div><span>Progreso de horas</span><b>{real} / {est} h</b></div><div className="progress"><i style={{ width: `${Math.min(100, real / Math.max(est, 1) * 100)}%` }} /></div></div><strong className={real > est ? 'negative' : 'positive'}>{real - est > 0 ? '+' : ''}{real - est} h</strong></div>
        })}</div>
      </div>
      <div className="card">
        <div className="card-title"><div><h3>Carga del equipo</h3><p>Capacidad según calendario laboral</p></div></div>
        <div className="load-list">{memberLoad.map(({ member, assigned, capacity, pct }) => <div className="load-row" key={member.id}><div className="avatar" style={{ background: member.color }}>{member.initials}</div><div><div><strong>{member.name}</strong><span>{pct}%</span></div><div className="progress slim"><i className={pct > 100 ? 'danger' : ''} style={{ width: `${Math.min(100, pct)}%` }} /></div><small>{assigned} h asignadas · {capacity} h disponibles</small></div></div>)}</div>
      </div>
    </section>
  </div>
}

function Kpi({ icon, label, value, foot, tone }: { icon: React.ReactNode; label: string; value: string; foot: string; tone: string }) {
  return <div className="kpi card"><div className={`kpi-icon ${tone}`}>{icon}</div><span>{label}</span><strong>{value}</strong><small>{foot}</small></div>
}

function Initiatives({ data, initiatives, search, setSearch, expanded, setExpanded, updateHours, setModal, exportData }: {
  data: AppData; initiatives: Initiative[]; search: string; setSearch: (s: string) => void; expanded: string[]; setExpanded: (v: string[]) => void;
  updateHours: (i: string, t: string, m: string, f: 'estimatedHours' | 'actualHours', v: number) => void; setModal: (v: 'task') => void; exportData: () => void
}) {
  return <div className="content">
    <div className="toolbar"><div className="search"><Search /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por iniciativa, código o servicio…" /></div><button className="button secondary"><Settings2 /> Filtros</button><button className="button secondary" onClick={exportData}><Download /> Exportar</button><button className="button primary" onClick={() => setModal('task')}><Plus /> Nueva tarea</button></div>
    <div className="card table-card"><table className="project-table"><thead><tr><th>Iniciativa / tarea</th><th>Estado / tipo</th><th>Periodo</th><th>Estimadas</th><th>Reales</th><th>Desviación</th><th>Forecast</th></tr></thead><tbody>{initiatives.map(i => {
      const est = initiativeHours(i, 'estimatedHours'), real = initiativeHours(i, 'actualHours'), isOpen = expanded.includes(i.id)
      const cost = i.tasks.flatMap(t => t.assignments).reduce((sum, a) => sum + a.estimatedHours * (data.members.find(m => m.id === a.memberId)?.hourlyRate ?? 0), 0)
      return <TableGroup key={i.id} initiative={i} data={data} open={isOpen} toggle={() => setExpanded(isOpen ? expanded.filter(x => x !== i.id) : [...expanded, i.id])} est={est} real={real} cost={cost} updateHours={updateHours} />
    })}</tbody></table>{!initiatives.length && <div className="empty">No hay iniciativas que coincidan con la búsqueda.</div>}</div>
  </div>
}

function TableGroup({ initiative: i, data, open, toggle, est, real, cost, updateHours }: { initiative: Initiative; data: AppData; open: boolean; toggle: () => void; est: number; real: number; cost: number; updateHours: (i: string, t: string, m: string, f: 'estimatedHours' | 'actualHours', v: number) => void }) {
  return <>
    <tr className="initiative-main" onClick={toggle}><td><div className="table-title">{open ? <ChevronDown /> : <ChevronRight />}<div><strong>{i.name}</strong><small>{i.source?.sourceId ? `${i.source.sourceId} · ` : ''}{i.service} · {i.projectCode}{i.source?.priority ? ` · Prioridad ${i.source.priority}` : ''}</small></div></div></td><td><span className={`pill ${statusTone(i.status)}`}>{i.status}</span></td><td><span className="date-range">{i.startDate.slice(5).replace('-', '/')} — {i.endDate.slice(5).replace('-', '/')}</span></td><td><b>{est} h</b></td><td><b>{real} h</b></td><td><strong className={real > est ? 'negative' : 'positive'}>{real - est > 0 ? '+' : ''}{real - est} h</strong></td><td><b>{euro.format(cost)}</b></td></tr>
    {open && i.source && <tr className="source-row"><td colSpan={7}><div><strong>{i.source.process || i.source.requestType || 'Detalle de origen'}</strong><span>{i.source.description || i.source.observations || 'Sin descripción en la hoja de encargo.'}</span></div><div><span>Plan semanal: {i.source.plannedWeeks.join(' · ')} h</span><span>Imputado: {i.source.actualWeeks.join(' · ')} h</span><span>{i.source.actualAllocation === 'proportional' ? 'Reales repartidas proporcionalmente por persona' : i.source.actualAllocation === 'unassigned' ? 'Imputación sin responsable asignado' : 'Horas editadas manualmente'}</span></div></td></tr>}
    {open && i.tasks.map(t => t.assignments.length ? t.assignments.map((a, idx) => {
      const member = data.members.find(m => m.id === a.memberId)!, diff = a.actualHours - a.estimatedHours
      return <tr className="task-row" key={`${t.id}-${a.memberId}`}><td><div className="task-title"><span className={`task-line ${idx ? 'continued' : ''}`} />{idx === 0 && <div><strong>{t.name}</strong><small><span className="avatar mini" style={{ background: member.color }}>{member.initials}</span>{member.name} · {member.location}</small></div>}{idx > 0 && <div><small><span className="avatar mini" style={{ background: member.color }}>{member.initials}</span>{member.name} · {member.location}</small></div>}</div></td><td><span className="type-pill">{t.type}</span></td><td>—</td><td><input className="hour-input" type="number" min="0" value={a.estimatedHours} onChange={e => updateHours(i.id, t.id, a.memberId, 'estimatedHours', +e.target.value)} /> h</td><td><input className="hour-input" type="number" min="0" value={a.actualHours} onChange={e => updateHours(i.id, t.id, a.memberId, 'actualHours', +e.target.value)} /> h</td><td><strong className={diff > 0 ? 'negative' : diff < 0 ? 'positive' : ''}>{diff > 0 ? '+' : ''}{diff} h</strong></td><td>{euro.format(a.estimatedHours * member.hourlyRate)}</td></tr>
    }) : <tr className="task-row" key={t.id}><td><div className="task-title"><span className="task-line" /><strong>{t.name}</strong></div></td><td><span className="type-pill">{t.type}</span></td><td colSpan={5} className="muted">Sin asignación</td></tr>)}
    {open && Boolean(i.unassignedActualHours) && <tr className="task-row unassigned-row"><td><div className="task-title"><span className="task-line" /><strong>Imputación sin responsable</strong></div></td><td><span className="type-pill">Pendiente</span></td><td>—</td><td>0 h</td><td><b>{i.unassignedActualHours} h</b></td><td><strong className="negative">+{i.unassignedActualHours} h</strong></td><td>—</td></tr>}
  </>
}

function Team({ data }: { data: AppData }) {
  const globalStart = data.initiatives.map(i => i.startDate).sort()[0]
  const globalEnd = data.initiatives.map(i => i.endDate).sort().at(-1)!
  return <div className="content"><div className="section-intro"><div><h2>Disponibilidad y forecast</h2><p>Capacidad calculada entre {globalStart} y {globalEnd}, descontando fines de semana y festivos.</p></div></div><div className="member-grid">{data.members.map(member => {
    const assignments = data.initiatives.flatMap(i => i.tasks.flatMap(t => t.assignments.filter(a => a.memberId === member.id)))
    const assigned = assignments.reduce((s, a) => s + a.estimatedHours, 0), actual = assignments.reduce((s, a) => s + a.actualHours, 0)
    const capacity = businessHours(globalStart, globalEnd, member.location, data, member.hoursPerDay), pct = Math.round(assigned / Math.max(capacity, 1) * 100)
    return <div className="member-card card" key={member.id}><div className="member-head"><div className="avatar large" style={{ background: member.color }}>{member.initials}</div><div><h3>{member.name}</h3><p>{member.role}</p></div><span className={`load-badge ${pct > 100 ? 'red' : pct > 80 ? 'gold' : 'green'}`}>{pct}%</span></div><div className="member-location"><span>{member.location}</span><span>{member.hoursPerDay} h/día</span></div><div className="metric-pair"><div><span>Capacidad</span><strong>{capacity} h</strong></div><div><span>Asignadas</span><strong>{assigned} h</strong></div><div><span>Reales</span><strong>{actual} h</strong></div><div><span>Forecast</span><strong>{euro.format(assigned * member.hourlyRate)}</strong></div></div><div className="progress"><i className={pct > 100 ? 'danger' : ''} style={{ width: `${Math.min(100, pct)}%` }} /></div><small className="rate">Tarifa: {euro.format(member.hourlyRate)}/h</small></div>
  })}</div></div>
}

function Calendars({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  const addHoliday = (location: string) => {
    const date = window.prompt('Fecha del festivo (AAAA-MM-DD)')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return
    const name = window.prompt('Nombre del festivo') || 'Festivo'
    setData(current => ({ ...current, calendars: current.calendars.map(c => c.location === location ? { ...c, holidays: [...c.holidays, { date, name }].sort((a, b) => a.date.localeCompare(b.date)) } : c) }))
  }
  const remove = (location: string, date: string) => setData(current => ({ ...current, calendars: current.calendars.map(c => c.location === location ? { ...c, holidays: c.holidays.filter(h => h.date !== date) } : c) }))
  return <div className="content"><div className="section-intro"><div><h2>Festivos por ubicación</h2><p>Estos días se descuentan automáticamente de la capacidad. Calendarios precargados para 2026; valida los festivos locales antes de planificar.</p></div></div><div className="calendar-grid">{data.calendars.map(calendar => <div className="calendar-card card" key={calendar.location}><div className="card-title"><div><h3>{calendar.location}</h3><p>{calendar.country} · {data.members.filter(m => m.location === calendar.location).map(m => m.name).join(', ')}</p></div><button className="icon-button" onClick={() => addHoliday(calendar.location)}><Plus /></button></div><div className="holiday-list">{calendar.holidays.map(h => <div key={h.date}><time>{new Date(`${h.date}T12:00:00`).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</time><span>{h.name}</span><button onClick={() => remove(calendar.location, h.date)}><X /></button></div>)}</div></div>)}</div></div>
}

function CreateModal({ mode, data, setData, close }: { mode: 'initiative' | 'task'; data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; close: () => void }) {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    if (mode === 'initiative') {
      const initiative: Initiative = { id: uid(), client: 'Banco Sabadell', service: String(form.get('service')), projectCode: String(form.get('code')), name: String(form.get('name')), status: String(form.get('status')) as InitiativeStatus, startDate: String(form.get('start')), endDate: String(form.get('end')), tasks: [] }
      setData(current => ({ ...current, initiatives: [...current.initiatives, initiative] }))
    } else {
      const initiativeId = String(form.get('initiative')), memberId = String(form.get('member'))
      setData(current => ({ ...current, initiatives: current.initiatives.map(i => i.id !== initiativeId ? i : ({ ...i, tasks: [...i.tasks, { id: uid(), name: String(form.get('name')), type: String(form.get('type')) as TaskType, assignments: memberId ? [{ memberId, estimatedHours: Number(form.get('estimated')) || 0, actualHours: 0 }] : [] }] })) }))
    } close()
  }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}><form className="modal" onSubmit={submit}><div className="modal-head"><div><span className="eyebrow">BANCO SABADELL</span><h2>{mode === 'initiative' ? 'Nueva iniciativa' : 'Nueva tarea'}</h2></div><button type="button" onClick={close}><X /></button></div>
    {mode === 'task' && <label>Iniciativa<select name="initiative" required>{data.initiatives.map(i => <option value={i.id} key={i.id}>{i.projectCode} · {i.name}</option>)}</select></label>}
    <label>Nombre<input name="name" required placeholder={mode === 'initiative' ? 'Nombre de la iniciativa' : 'Nombre de la tarea'} /></label>
    {mode === 'initiative' ? <><div className="form-grid"><label>Servicio<input name="service" required defaultValue="OMC · AITO" /></label><label>Código de proyecto<input name="code" required placeholder="BS-OMC-003" /></label></div><div className="form-grid"><label>Inicio<input type="date" name="start" required defaultValue="2026-11-02" /></label><label>Fin<input type="date" name="end" required defaultValue="2026-12-18" /></label></div><label>Estado<select name="status"><option>Planificada</option><option>En curso</option><option>En riesgo</option><option>Completada</option></select></label></> : <><div className="form-grid"><label>Tipo<select name="type"><option>Funcional</option><option>Técnica</option><option>Gestión</option></select></label><label>Horas estimadas<input name="estimated" type="number" min="0" defaultValue="8" /></label></div><label>Asignar a<select name="member"><option value="">Sin asignar</option>{data.members.map(m => <option value={m.id} key={m.id}>{m.name} · {m.role}</option>)}</select></label></>}
    <div className="modal-actions"><button type="button" className="button secondary" onClick={close}>Cancelar</button><button className="button primary">Crear {mode === 'initiative' ? 'iniciativa' : 'tarea'}</button></div>
  </form></div>
}

export default App
