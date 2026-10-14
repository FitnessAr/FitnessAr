@AGENTS.md

# Contexto del proyecto — FitnessAr

Plataforma para digitalizar la asignación y seguimiento de rutinas de entrenamiento en gimnasios
(profesores asignan, clientes ejecutan y consultan progreso). Visión completa en `README.md`.

Es un proyecto compartido con un amigo, no un side project individual — confirmar antes de
decisiones de arquitectura o de producto no triviales, no asumir unilateralmente.

## Estado actual

**Backend real conectado de punta a punta — ya no hay mocks en ningún rol.** Admin, Profesor y
Cliente corren 100% sobre Prisma/Supabase.

- **Auth**: login único por DNI + contraseña para los 3 roles (sin selector previo, el rol lo
  determina qué cuenta matchea ese DNI). Sesión en cookie httpOnly firmada con HMAC
  (`features/auth/session.ts`). Cliente se autoregistra en `/registro`; Admin/Profesor los da de
  alta el administrador desde `/admin/usuarios`. Cada rol tiene su propio guard
  (`requireAdmin()`, `requireProfesor()`, `requireCliente()`) que exige sesión real + rol + cuenta
  activa + fila de perfil asociada.
- **Seed** (`prisma/seed.ts`) deja la base vacía salvo una cuenta de bootstrap (nombre `admin`,
  DNI `12345678`, contraseña `admin`). **Es pública y permanente a propósito** (decisión explícita
  del usuario): sirve de demo y de puerta de entrada al onboarding real. Riesgo evaluado y
  aceptado — mitigación manual vía Supabase, no de código. **No reabrir esta decisión** sin pedido
  explícito del usuario.
- **Admin** (`/admin`): Usuarios (alta/edición/activar-desactivar/borrar Profesores y Admins),
  Ejercicios (catálogo real — API externa de ~1300 ejercicios + propios con imagen, toggle de
  inclusión por sucursal), Configuración (tab Usuario: cuenta propia + profesores activos en vivo
  con hora de Argentina; tab Rutinas: todas las rutinas de la sucursal, togglear activa/inactiva o
  borrar de verdad).
- **Profesor** (`/profesor`): Home/Perfil con datos reales, Clientes (roster propio + buscador que
  encuentra clientes sin profesor de la sucursal por DNI y los reclama), Rutinas (lista todas las
  activas de la sucursal; "Nueva rutina" arma rutinas de verdad con selector de ejercicios del
  catálogo, sets/reps/descanso editables, y asignación a clientes del propio roster).
- **Cliente** (`/cliente`): Home/Rutina/Perfil leen la rutina real asignada
  (`features/cliente/active-routine.ts`). El checklist de hoy (`/cliente/rutina/hoy`, fuera del
  nav de 4 pestañas) crea/recupera la `TrainingSession` del día y persiste cada serie tildada
  (sobrevive a un reload). Progreso calcula racha (días consecutivos completados) y récords
  personales (1RM por fórmula de Epley) sobre el historial real de `TrainingSession`.
- **Estructura de carpetas**: `src/` envuelve `app/` (ruteo de Next.js, archivos finos que solo
  hacen guard → data-fetch → render), `features/` (lógica real por dominio: UI + actions + queries
  + tipos), `components/` (UI genérica compartida entre roles) y `lib/` (utilidades de bajo
  nivel). `prisma/`, `generated/` (cliente Prisma, gitignored) y `public/` quedan fuera de `src/`,
  en la raíz — convención estándar de Next.js.

## Prioridad #1: Mobile-first

**Regla:** toda pantalla y componente se diseña y maqueta primero para mobile.
**Por qué:** los clientes van a entrar casi 100% desde el celular, parados en el gimnasio.
**Cómo aplicar:** breakpoints mobile como base, botones y áreas táctiles grandes, tipografía
legible, mínimo texto por pantalla, navegación simple para usuarios de cualquier edad. El rol
profesor tolera más densidad de información que el rol cliente.

## Arquitectura y escalabilidad: white-label por instancia

**Modelo de despliegue:** cada gimnasio cliente es una instancia separada — deploy propio + base
de datos propia — no un SaaS multi-tenant compartido. El objetivo es que sumar un cliente nuevo
sea "clonar + configurar", no "reescribir". No introducir un modelo multi-tenant (tenant_id
compartido en una sola DB) salvo pedido explícito.

Reglas concretas:

1. **Todo lo que varíe entre gimnasios va en config/datos, no en código**: branding en env
   vars/theme tokens de Tailwind, catálogo de ejercicios en DB, módulos activos como feature flags.
2. **Organización por dominio/feature, no por capa técnica** (ver "Estructura de carpetas" arriba).
3. **Design system propio y chico** (tokens de tema en `app/globals.css`) para que un cambio visual
   de cliente nuevo sea config, no editar componentes uno por uno.
4. **Jerarquía Branch → User/Profesor/Cliente** ya en el schema, aunque hoy solo haya una sucursal
   por instancia — evita una migración dolorosa el día que un cliente tenga varias sedes.
5. **Roles y permisos data-driven**, no if/else de rol repetido por todo el código.
6. **Evitar forks de código por cliente** — las diferencias se resuelven con config/datos.
7. Cuando exista el primer cliente real, documentar acá un checklist repetible para levantar una
   instancia nueva (proyecto Supabase, Cloudinary, env vars, seed de catálogo, branding).

## Roles del sistema

Login único (DNI + contraseña, sin selector de rol previo) para los 3 roles.

- **Profesor**: busca y reclama clientes por DNI, crea y asigna rutinas semanales.
- **Cliente**: se autoregistra, ve su rutina activa y progreso una vez que un profesor lo reclama.
- **Administrador**: gestiona catálogo de ejercicios de la sucursal y alta de Profesores/Admins.

Solo el **administrador** crea cuentas de Profesor/Admin y puede desactivar o eliminar cualquier
cuenta (incluida otra de admin) — **dos mecanismos distintos**: el toggle Activo/Inactivo
desactiva (`deactivatedAt`, reversible, el historial se conserva); el ícono de basura borra la
fila de verdad (irreversible). **Un admin nunca puede desactivarse ni eliminarse a sí mismo**
(guardia server-side, no solo UI — evita un lockout sin forma de revertirlo). El admin también
puede resetear la contraseña de cualquier cuenta sin ver la anterior (solo se guarda el hash).

**Login con límite de intentos**: 5 fallos seguidos sobre la misma cuenta la bloquean 1 minuto
(`User.failedLoginAttempts`/`lockedUntil`). Acotado por cuenta, no por IP — fuera de alcance para
esta etapa.

## Alcance del MVP

- Rutinas organizadas por día de la semana; ejercicio = series + repeticiones + descanso.
- Cliente ve peso/reps de su última sesión de ese ejercicio.
- Ficha técnica de ejercicio: grupos musculares, descripción, GIF/imagen.

## Fuera de alcance del MVP (no implementar salvo pedido explícito)

- Tipificación de rutinas (hipertrofia, fuerza, resistencia, descarga).
- Autogestión de rutinas por el cliente — el cliente nunca elige ni cambia su propia rutina, eso
  lo hace el profesor.
- Métricas avanzadas — excepción puntual ya implementada: 1RM estimado (Epley) para ordenar
  récords personales en Progreso, por pedido explícito del usuario.
- Módulo de comunicación y noticias del gimnasio.
- Comentarios del profesor por ejercicio (estaba en el brief original, todavía no se construyó).
- Reasignar una rutina ya existente a un cliente que ya tenía otra, editar una rutina después de
  creada, y notificaciones al cliente (cuando lo reclaman o le asignan rutina).

## Decisiones de negocio pendientes

- Recuperación de acceso del cliente (contraseña olvidada): sin definir. El admin ya puede
  resetear contraseñas de Profesor/Admin desde `/admin/usuarios/[id]/editar`, pero no gestiona
  cuentas de Cliente ahí — para Cliente sigue siendo un camino aparte. No implementar un mecanismo
  propio sin confirmar cuál eligieron.

## Stack técnico

Next.js (App Router, directorio `src/`) + TypeScript + Tailwind · PostgreSQL vía Supabase · Prisma
como ORM · autenticación propia (decidido explícitamente en contra de Clerk) · Cloudinary/Supabase
Storage para media de ejercicios · Vercel para deploy · PWA.

Este proyecto corre sobre **Next.js 16.x** — ver `AGENTS.md` (importado arriba): antes de escribir
código de Next.js, revisar `node_modules/next/dist/docs/` por breaking changes vs. conocimiento de
entrenamiento previo.

También corre sobre **Prisma 7.x**, con breaking changes grandes vs. conocimiento de entrenamiento
previo: motor de queries no embebido (driver adapter `@prisma/adapter-pg`), datasource sin
`url`/`directUrl` en el `.prisma` (se mueve a `prisma.config.ts`, que usa `DIRECT_URL` — distinto
de `lib/db.ts`, que usa `DATABASE_URL` pooled), y cliente generado a `generated/prisma/`
(gitignored, se regenera con `npx prisma generate` después de cualquier cambio de schema). Antes
de tocar `prisma/schema.prisma`, `prisma.config.ts` o `prisma/seed.ts`, verificar contra la doc
oficial (`prisma.io/docs`) en vez de asumir sintaxis de versiones anteriores.

## Cómo trabajar en este repo

- El backend ya es real de punta a punta — cualquier feature nueva se conecta a Prisma desde el
  principio, no se agregan mocks nuevos.
- La demo debe ser genérica y reutilizable (pensada para múltiples gimnasios clientes, no
  hardcodeada a uno), priorizando componentes simples y reutilizables.
- Mantener este archivo actualizado a medida que se tomen decisiones de producto o técnicas.
- Debe ser una PWA que priorice la idea de aplicación, aunque en el fondo sea un sitio web.
