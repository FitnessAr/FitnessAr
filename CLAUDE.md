@AGENTS.md

# Contexto del proyecto — FitnessAr

Plataforma para digitalizar la asignación y seguimiento de rutinas de entrenamiento en gimnasios
(profesores asignan, alumnos ejecutan y consultan progreso). Visión completa en `README.md`.

## Estado actual (no borrar esta sección sin confirmar con el usuario)

- Fase: **puro planeamiento**. El repo es el scaffold default de `create-next-app`, sin features
  de negocio implementadas todavía.
- Objetivo inmediato: construir una **demo genérica e interactiva** para salir a ofrecer
  comercialmente a gimnasios — no un desarrollo a medida todavía. Priorizar algo demostrable y
  prolijo por sobre completitud funcional.
- Es un proyecto compartido con un amigo, no un side project individual — confirmar antes de
  decisiones de arquitectura o de producto no triviales, no asumir unilateralmente.
- Pantalla de login implementada con autenticación **hardcodeada de demo** (`alumno`/`alumno`,
  `alumno2`/`alumno2`, `profesor`/`profesor`, `profesor2`/`profesor2` en
  `features/auth/demo-accounts.ts`) hasta que se conecte la autenticación propia real (decidido:
  sin Clerk — ver "Roles del sistema" y "Stack técnico"; falta sumar la cuenta `admin`/`admin` al
  mock y el panel de administrador cuando se planifique esa pantalla). Existe una **sesión mínima
  real**
  (`features/auth/session.ts`, `getCurrentIdentity()`) vía cookie no-httpOnly: el login guarda qué
  cuenta entró y cada pantalla de alumno/profesor la lee para saber a quién mostrar, en vez de
  tener un nombre hardcodeado por archivo. `alumno2`/`profesor2` son cuentas "vacías" (sin nadie
  agendado entre sí) para poder mostrar el estado de un alumno sin profesor asignado. "Cerrar
  sesión" (`features/auth/logout-link.tsx`) limpia esa cookie de verdad — si no, cambiar de cuenta
  quedaría pegado a la anterior.
- Home del alumno (`/alumno`) implementada con datos de fecha reales (no fija) — el día "hoy" del
  mini calendario y de la tarjeta de entrenamiento sale de `new Date()`, no está hardcodeado.
- Rutina del alumno (`/alumno/rutina`) implementada: nombre del programa, quién lo asignó y desde
  cuándo, los 7 días de la semana con su entrenamiento o "Descanso", y los ejercicios (nombre +
  series x reps) del día de hoy.
- El catálogo de rutinas (mock) vive en un solo lugar, `features/routines/catalog.ts`
  (`getRoutineCatalog()`) — hoy tiene "Fuerza Total" y "Cardio y Tonificación", global (no
  segmentado por profesor todavía). El pool de alumnos (mock) también es neutral, vive en
  `features/students/roster.ts` (`getAllStudents()`) — cada alumno tiene `assignedProfessorId`
  (`null` si no tiene profesor todavía) y, si tiene login de demo, `loginId`. El alumno
  (`features/alumno/active-routine.ts`) resuelve, según la identidad logueada, cuál rutina le
  corresponde y le suma `assignedBy`/`assignedSince` — **devuelve `null` si no tiene profesor
  asignado** (caso de `alumno2`/"Camila Ibáñez"), y ahí Home (`features/alumno/home/`) muestra la
  pantalla "Aún no tenés entrenamientos asignados" (`no-professor-assigned.tsx`, con dos botones
  todavía inactivos: "Unirme a un profesor" y "¿Cómo me uno a un profesor?" — la lógica de
  aceptación profesor↔alumno queda para más adelante), Rutina (`features/alumno/rutina/`) muestra
  un mensaje compacto, y el checklist de hoy (`features/alumno/session/`) redirige a Home. La
  pestaña Rutinas del profesor (`features/profesor/rutinas/`) cruza el catálogo con
  `features/profesor/roster.ts` (`getStudentRoster(professorId)`, que filtra el pool neutral por
  profesor) para contar asignaciones — son las fuentes a reemplazar por Prisma cuando esté el
  backend; los componentes de UI no cambian.
- Checklist de hoy (`/alumno/rutina/hoy`, se llega desde "Comenzar entrenamiento" en Home o "Ver"
  en Rutina): a propósito vive **fuera** del nav inferior de 4 pestañas (route group
  `app/alumno/(tabs)/` para Inicio/Rutina/Progreso/Perfil vs. `app/alumno/rutina/hoy/` aparte) —
  es una pantalla de foco total tipo "iniciar entrenamiento", sin la barra de navegación. Durante
  un descanso activo (`RestTimer`) se bloquea marcar cualquier otra serie salvo destildar la que
  disparó ese descanso (por si fue un error).
- Home (`/profesor`), Alumnos (`/profesor/alumnos`) y Rutinas (`/profesor/rutinas`) del profesor
  implementadas. `features/profesor/roster.ts` (`getStudentRoster(professorId)`) filtra el pool
  neutral de alumnos (`features/students/roster.ts`, con la regla de negocio de "actividad"/"activo
  hoy" documentada ahí mismo) por el profesor logueado — cada pantalla resuelve la identidad actual
  vía `getCurrentIdentity()` antes de pedir el roster. Home deriva de ahí sus 3 métricas + la lista
  de activos hoy — no hay un mock aparte por pantalla; con `profesor2` (sin alumnos) las 3 métricas
  dan `0` sin lógica extra. Rutinas cruza ese roster filtrado con `getRoutineCatalog()` para contar
  alumnos asignados por rutina. `features/profesor/professor.ts` (`getProfessorProfile(id)`)
  soporta más de un profesor (hoy "Rodrigo Vega" y "Lucía Fernández"). "+ Nueva rutina" (Home y
  Rutinas) apunta a
  `/profesor/rutinas/nueva`, fuera del route group `(tabs)` (mismo criterio que
  `/alumno/rutina/hoy`) — implementada como formulario interactivo
  (`features/profesor/rutinas/nueva/`): nombre editable, selector de días (pills tocables,
  convención `Date.getDay()` de `features/routines/catalog.ts`), sección de ejercicios vacía
  (arranca en 0, sin precargar nada) con "Agregar ejercicio" inactivo, y "Asignar alumnos" sobre
  el roster (muestra `routineName` actual de cada alumno como subtítulo en vez de un "nivel"
  inventado, mismo criterio que la pestaña Alumnos). "Guardar rutina" es **solo visual** por ahora:
  vuelve a la lista sin crear nada en el catálogo — pendiente resolver junto con el alta real de
  ejercicios. Perfil (`/profesor/perfil`, `features/profesor/perfil/`) implementado:
  avatar + nombre, y una lista Horario/Alumnos/Rutinas (título izquierda, dato derecha) — sin datos
  de relleno tipo especialidad/certificación/gimnasio. La identidad del profesor logueado
  (nombre, horario) vive en `features/profesor/professor.ts`, consumida tanto por Home como por
  Perfil. "Cerrar sesión" usa `features/auth/logout-link.tsx` (mismo componente que el stub de
  Perfil del alumno) para limpiar la cookie de sesión de verdad. El nav inferior
  (`components/bottom-nav.tsx`) y los helpers de iniciales/color por hash
  (`lib/get-initials.ts`, `lib/color-hash.ts`) son compartidos entre alumno y profesor — no
  duplicar por rol.
- Perfil del alumno (`/alumno/perfil`, `features/alumno/perfil/`) implementado: avatar + nombre,
  y una lista Profesor asignado/Rutina activa/Miembro desde/Próximo entrenamiento (título
  izquierda, dato derecha, mismo lenguaje visual que el Perfil del profesor) — sin subtítulo de
  "nivel" ni stat-tiles de relleno. Progreso (`/alumno/progreso`, `features/alumno/progreso/`)
  implementado: actividad semanal (check por día completo), 4 métricas (entrenamientos del mes,
  racha actual, tiempo total del mes, ejercicios de hoy) y récords personales. Sigue siendo
  **mock** — no se conecta con lo que se tilda en el checklist (`/alumno/rutina/hoy`, que no
  persiste nada todavía) — pero la lógica de negocio es real: `features/alumno/progreso/
  training-log.ts` genera un historial de sesiones relativo a "hoy" (con un hueco deliberado a
  mitad de camino, para poder probar que el corte de racha funciona) y
  `get-progreso-data.ts` calcula todo sobre ese historial (racha = días programados consecutivos
  completados, sin que un día de descanso la corte; récords = 1RM estimado por fórmula de Epley,
  ver nota de alcance más abajo). Ambas pantallas, sin profesor asignado, reusan el mismo mensaje
  compacto de Rutina (`features/alumno/no-professor-message.tsx`).

## Prioridad #1: Mobile-first

**Regla:** toda pantalla y componente se diseña y maqueta primero para mobile.
**Por qué:** los alumnos van a entrar casi 100% desde el celular, parados en el gimnasio — no hay
margen de UX para un flujo pensado desktop-first y adaptado después.
**Cómo aplicar:** breakpoints mobile como base (no como afterthought), botones y áreas táctiles
grandes, tipografía legible, mínimo texto por pantalla, navegación simple para usuarios de
cualquier edad (no asumir usuarios tech-savvy). El rol profesor tolera más densidad de información
que el rol cliente.

## Arquitectura y escalabilidad: white-label por instancia

**Modelo de despliegue (decidido con el usuario):** cada franquicia/gimnasio cliente es una
instancia separada — deploy propio + base de datos propia — no un SaaS multi-tenant compartido.
El mismo código base se reutiliza entre clientes; el objetivo es que sumar un cliente nuevo sea
"clonar + configurar", no "reescribir". Esto es una decisión de producto, no solo técnica — no
introducir un modelo multi-tenant (tenant_id compartido entre franquicias en una sola DB) salvo
que el usuario lo pida explícitamente.

Reglas concretas para que eso funcione en la práctica, a aplicar desde que se empiece a escribir
código (no solo a futuro):

1. **Todo lo que varíe entre gimnasios va en config/datos, no en código:**
   - Branding (logo, nombre, colores) → un único punto de configuración (env vars + theme tokens
     de Tailwind). Ningún componente debe tener colores o textos de marca hardcodeados inline.
   - Catálogo de ejercicios → datos (seed/DB), nunca hardcodeado en componentes o código.
   - Módulos activos (ej. futuros "comunicación", "métricas avanzadas") → feature flags simples
     (config o tabla), para vender distintos paquetes sin ramas de código separadas.
2. **Organización por dominio/feature, no por capa técnica:** cada función del sistema (rutinas,
   ejercicios, auth por rol, comentarios) vive en su propia carpeta autocontenida (UI + lógica +
   tipos), para poder agregar o quitar "piezas" sin desparramar cambios por todo el proyecto.
3. **Design system propio y chico** (botones, cards, layout base) con tokens de tema, para que un
   cambio visual de un cliente nuevo (paleta, logo, tipografía) sea cuestión de config, no de
   editar componentes uno por uno.
4. **Modelo de datos con jerarquía Gimnasio → Sucursal → Profesor/Cliente desde el MVP** (el brief
   original ya habla de "catálogo de ejercicios de la sucursal"), aunque la demo tenga una sola
   sucursal cargada. Evita una migración de schema dolorosa el día que un cliente real tenga
   varias sedes.
5. **Roles y permisos data-driven**, no if/else de rol repetido por todo el código, para poder
   sumar un rol nuevo (ej. "Recepcionista") a futuro sin tocar cada pantalla.
6. **Evitar forks de código por cliente.** Las diferencias entre instancias se resuelven con
   config/datos. Si un cliente pide una lógica de negocio realmente distinta (no solo visual), es
   señal de generalizar esa pieza en el core — un fork divide el mantenimiento y frena la
   propagación de fixes a los demás clientes.
7. Cuando exista el primer cliente real, documentar acá un checklist repetible para levantar una
   instancia nueva (proyecto Supabase, config Cloudinary, env vars, seed de catálogo, branding, y
   alta de la primera cuenta de administrador de esa instancia).

## Roles del sistema

El ingreso a la app es una **única pantalla de login** (usuario/contraseña), sin selector de rol
previo: el rol queda determinado por qué credencial matchea (DNI+PIN de cliente vs. email+
contraseña de profesor), no se le pregunta al usuario "¿sos alumno o profesor?".

- **Profesor**: login email+contraseña. Busca clientes por DNI, asigna rutinas semanales.
- **Cliente**: login simplificado DNI+PIN. Ve rutina activa, histórico reciente (peso/series/reps),
  comentarios del profesor.
- **Administrador de gimnasio**: login con credenciales. Gestiona catálogo de ejercicios de la
  sucursal y alta de profesores.

**Autenticación (decidido — sin Clerk):** login propio construido en el proyecto, usuario y
contraseña. Cuentas iniciales de cada instancia (seed): un admin, y al menos un profesor y un
cliente de ejemplo. A partir de ahí:
- Solo el **administrador** puede crear cuentas nuevas, y únicamente con rol Profesor o
  Administrador (no crea cuentas de Cliente — el alta de Cliente es un camino aparte, todavía sin
  definir del todo: ver "Decisiones de negocio pendientes").
- Solo el **administrador** puede eliminar cuentas, de cualquier rol (incluida otra cuenta de
  administrador).
- Pantalla de gestión de cuentas (alta/baja) del administrador: todavía sin diseñar — falta pasar
  por el mismo proceso de planeamiento que el resto de las pantallas (captura de referencia +
  plan) antes de implementarla.

## Alcance del MVP

- Rutinas organizadas por día de la semana.
- Ejercicio = series + repeticiones + descanso, parametrizables por el profesor.
- Cliente ve peso/reps de su última sesión de ese ejercicio.
- Comentarios del profesor por ejercicio.
- Ficha técnica de ejercicio: grupos musculares, descripción, GIF/imagen (vía Cloudinary).

## Fuera de alcance del MVP (no implementar salvo pedido explícito)

- Tipificación de rutinas (hipertrofia, fuerza, resistencia, descarga).
- Autogestión de rutinas por el cliente.
- Métricas avanzadas — sí se usa el 1RM estimado (fórmula de Epley) puntualmente para ordenar
  "récords personales" en Progreso del alumno, por pedido explícito del usuario (ver "Estado
  actual"); lo que sigue fuera de alcance es un módulo de métricas avanzadas más amplio.
- Módulo de comunicación y noticias del gimnasio.

## Decisiones de negocio pendientes

- Recuperación de acceso del cliente (login DNI+PIN): sin definir todavía. Opciones que el usuario
  está evaluando: recuperación por teléfono, o gestión manual vía administrador. No implementar un
  mecanismo propio sin confirmar cuál eligieron.
- Alta de cuentas de Cliente: el administrador **no** las crea (solo crea Profesor/Administrador —
  ver "Roles del sistema"). El camino real de alta de Cliente todavía no está definido — candidatos
  vistos hasta ahora en la demo: que el propio alumno se una a un profesor (botón "Unirme a un
  profesor", hoy inactivo en `no-professor-assigned.tsx`) y/o que el profesor dé de alta al
  cliente. No asumir cuál sin confirmar.

## Stack técnico

Next.js (App Router) + TypeScript + Tailwind · PostgreSQL vía Supabase · Prisma como ORM ·
**autenticación propia** (usuario/contraseña + roles + sesión, todo construido en el proyecto —
decidido explícitamente en contra de usar Clerk) · Cloudinary para media de ejercicios · Vercel
para deploy.

Este proyecto corre sobre Next.js 16.x — ver `AGENTS.md` (importado arriba): antes de escribir
código de Next.js, revisar `node_modules/next/dist/docs/` por breaking changes vs. conocimiento
de entrenamiento previo.

## Cómo trabajar en este repo

- No implementar features de negocio hasta que el usuario lo pida explícitamente — hoy estamos en
  fase de planeamiento puro.
- La demo debe ser genérica y reutilizable (pensada para múltiples gimnasios clientes, no
  hardcodeada a uno), priorizando componentes simples y reutilizables.
- Mantener este archivo actualizado a medida que se tomen decisiones de producto o técnicas
  (ej. cuando se defina la recuperación de acceso, o se agregue el schema de Prisma).
- Debe ser una PWA que priorice la idea de aplicación, aunque en el fondo sea un sitio web.