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
  `profesor`/`profesor` en `features/auth/demo-accounts.ts`) hasta que se integre Clerk.
- Home del alumno (`/alumno`) implementada con datos de fecha reales (no fija) — el día "hoy" del
  mini calendario y de la tarjeta de entrenamiento sale de `new Date()`, no está hardcodeado.
- Rutina del alumno (`/alumno/rutina`) implementada: nombre del programa, quién lo asignó y desde
  cuándo, los 7 días de la semana con su entrenamiento o "Descanso", y los ejercicios (nombre +
  series x reps) del día de hoy. Progreso/Perfil siguen como stubs ("Próximamente") vía el nav
  inferior de 4 pestañas.
- El catálogo de rutinas (mock) vive en un solo lugar, `features/routines/catalog.ts`
  (`getRoutineCatalog()`) — hoy tiene "Fuerza Total" y "Cardio y Tonificación". El alumno
  (`features/alumno/active-routine.ts`) resuelve cuál le corresponde a la alumna logueada de la
  demo ("Valentina Ruiz", asignada a Fuerza Total) y le suma `assignedBy`/`assignedSince`; Home
  (`features/alumno/home/`), Rutina (`features/alumno/rutina/`) y el checklist de hoy
  (`features/alumno/session/`) arman su propio "view model" a partir de eso. La pestaña Rutinas del
  profesor (`features/profesor/rutinas/`) cruza el mismo catálogo con el roster de alumnos para
  contar asignaciones — es la única fuente a reemplazar por Prisma cuando esté el backend; los
  componentes de UI no cambian.
- Checklist de hoy (`/alumno/rutina/hoy`, se llega desde "Comenzar entrenamiento" en Home o "Ver"
  en Rutina): a propósito vive **fuera** del nav inferior de 4 pestañas (route group
  `app/alumno/(tabs)/` para Inicio/Rutina/Progreso/Perfil vs. `app/alumno/rutina/hoy/` aparte) —
  es una pantalla de foco total tipo "iniciar entrenamiento", sin la barra de navegación. Durante
  un descanso activo (`RestTimer`) se bloquea marcar cualquier otra serie salvo destildar la que
  disparó ese descanso (por si fue un error).
- Home (`/profesor`), Alumnos (`/profesor/alumnos`) y Rutinas (`/profesor/rutinas`) del profesor
  implementadas. El roster de alumnos vive en un solo lugar, `features/profesor/roster.ts`
  (`getStudentRoster()`, con la regla de negocio de "actividad"/"activo hoy" documentada ahí
  mismo), y Home deriva de ahí sus 3 métricas + la lista de activos hoy — no hay un mock aparte por
  pantalla. Rutinas cruza `getStudentRoster()` con `getRoutineCatalog()` para contar alumnos
  asignados por rutina. "+ Nueva rutina" (Home y Rutinas) apunta al stub
  `/profesor/rutinas/nueva`, fuera del route group `(tabs)` (mismo criterio que
  `/alumno/rutina/hoy`). Perfil sigue como stub. El nav inferior (`components/bottom-nav.tsx`) y
  los helpers de iniciales/color por hash (`lib/get-initials.ts`, `lib/color-hash.ts`) son
  compartidos entre alumno y profesor — no duplicar por rol.

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
   instancia nueva (proyecto Supabase, app Clerk, config Cloudinary, env vars, seed de catálogo y
   branding).

## Roles del sistema

El ingreso a la app es una **única pantalla de login** (usuario/contraseña), sin selector de rol
previo: el rol queda determinado por qué credencial matchea (DNI+PIN de cliente vs. email+
contraseña de profesor), no se le pregunta al usuario "¿sos alumno o profesor?".

- **Profesor**: login email+contraseña. Busca clientes por DNI, asigna rutinas semanales.
- **Cliente**: login simplificado DNI+PIN. Ve rutina activa, histórico reciente (peso/series/reps),
  comentarios del profesor.
- **Administrador de gimnasio**: login con credenciales. Gestiona catálogo de ejercicios de la
  sucursal y alta de profesores.

## Alcance del MVP

- Rutinas organizadas por día de la semana.
- Ejercicio = series + repeticiones + descanso, parametrizables por el profesor.
- Cliente ve peso/reps de su última sesión de ese ejercicio.
- Comentarios del profesor por ejercicio.
- Ficha técnica de ejercicio: grupos musculares, descripción, GIF/imagen (vía Cloudinary).

## Fuera de alcance del MVP (no implementar salvo pedido explícito)

- Tipificación de rutinas (hipertrofia, fuerza, resistencia, descarga).
- Autogestión de rutinas por el cliente.
- Métricas avanzadas / cálculo de 1RM.
- Módulo de comunicación y noticias del gimnasio.

## Decisiones de negocio pendientes

- Recuperación de acceso del cliente (login DNI+PIN): sin definir todavía. Opciones que el usuario
  está evaluando: recuperación por teléfono, o gestión manual vía administrador. No implementar un
  mecanismo propio sin confirmar cuál eligieron.

## Stack técnico

Next.js (App Router) + TypeScript + Tailwind · PostgreSQL vía Supabase · Prisma como ORM · Clerk
para autenticación y roles · Cloudinary para media de ejercicios · Vercel para deploy.

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