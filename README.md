# Brújula · Control de proyectos

MVP para controlar la cartera de proyectos de Banco Sabadell con la jerarquía:

`Cliente → Servicio → Código de proyecto → Iniciativa → Tarea → Asignación`

## Funcionalidades

- Horas estimadas y reales por tarea y persona, con desviación automática.
- Forecast de horas y coste según tarifa individual.
- Capacidad del equipo según ubicación, jornada, fines de semana y festivos configurables.
- Resumen de cartera, detalle editable, vista de equipo y calendarios laborales.
- Alta de iniciativas y tareas.
- Datos iniciales extraídos y validados de `Hoja Encargo OMC-AITO.xlsx`, hoja `Octubre (2)`.
- Reimportación de la misma estructura Excel y exportación del plan completo.
- Persistencia en `localStorage` para conservar los cambios en el mismo navegador.

## Desarrollo

```bash
npm install
npm run dev
```

La compilación de producción se valida con:

```bash
npm run build
```

## Importación desde Excel

El importador busca una pestaña llamada exactamente `Octubre (2)` y valida la estructura real de la hoja de encargo. Lee las filas 10 a 36, las asignaciones de las columnas de equipo, la planificación semanal y las horas imputadas. La fila de continuación `Bolsa de Horas SAER` se agrupa con `ID 132`, por lo que el resultado contiene 26 iniciativas.

Las horas imputadas del Excel están desglosadas por iniciativa y semana, pero no por persona. La aplicación las reparte proporcionalmente según la asignación estimada de cada persona. Este origen se muestra en el detalle de cada iniciativa. Las 7 horas de `Postdictamen · Prompts de Traspaso Valores`, que no tiene responsable en el fichero, se conservan como imputación sin asignar.

Totales validados contra la hoja:

- 538 horas planificadas.
- 494,5 horas imputadas.
- 15.509 € de forecast.
- Por persona: Jose Luis 132 h, Cristina 74 h, Adrián 89 h, Marcos 42 h, Ramirez 112 h y Salva 89 h.

## Datos iniciales

Los calendarios de 2026 incluyen festivos nacionales y una selección de autonómicos/locales; deben validarse antes de usarlos para compromisos de capacidad. Los festivos se pueden añadir o eliminar desde la aplicación.
