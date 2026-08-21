@AGENTS.md

# Contexto del proyecto — FitnessAr

Plataforma para digitalizar la asignación y seguimiento de rutinas de entrenamiento en gimnasios
(profesores asignan, clientes ejecutan y consultan progreso). Visión completa en `README.md`.

## Estado actual (no borrar esta sección sin confirmar con el usuario)

- Fase: **puro planeamiento**. El repo es el scaffold default de `create-next-app`, sin features
  de negocio implementadas todavía.
- Objetivo inmediato: construir una **demo genérica e interactiva** para salir a ofrecer
  comercialmente a gimnasios — no un desarrollo a medida todavía. Priorizar algo demostrable y
  prolijo por sobre completitud funcional.
- Es un proyecto compartido con un amigo, no un side project individual — confirmar antes de
  decisiones de arquitectura o de producto no triviales, no asumir unilateralmente.
- **Backend real: fase 1 lista** (DB migrada y poblada, la app todavía corre 100% sobre mocks —
  ver más abajo, no se tocó nada de `features/`/`app/`). `prisma/schema.prisma` tiene el modelo
  acordado (Branch → User/Profesor/Cliente/Exercise/Routine → RoutineDay → RoutineExercise, más
  TrainingSession/SessionExercise/SessionSet como historial de ejecución). Decisiones clave
  cerradas ahí: sin tabla `Gym` (cada instancia ya es una DB propia), auth propia sin Clerk
  (`User.passwordHash` sirve tanto de contraseña como de PIN), y "eliminar cuenta" es
  **desactivar** (`User.deactivatedAt`), nunca un borrado real.
  - **Proyecto Supabase real conectado**, migración inicial corrida (`prisma/migrations/`).
  - **Prisma 7** trajo breaking changes importantes vs. el diseño original del schema: el
    datasource ya no lleva `url`/`directUrl` (se sacaron del `.prisma`), la conexión para la CLI
    (migrate/seed/studio) vive en `prisma.config.ts` (usa `DIRECT_URL`), y el motor de queries ya
    no viene embebido — el `generator client` genera código a `generated/prisma/` (gitignored,
    se regenera con `npx prisma generate`) y tanto el seed como el futuro cliente de la app
    necesitan un **driver adapter** (`@prisma/adapter-pg` + `pg`) en vez de instanciar
    `new PrismaClient()` a secas.
  - **El seed (`prisma/seed.ts`) deja la base vacía a propósito**, salvo una única cuenta admin
    de bootstrap — nombre `admin`, DNI (`loginId`) `12345678`, contraseña `admin` hasheada con
    `bcryptjs` (reemplazó a la credencial original `admin`/`admin` cuando el login pasó a ser por
    DNI en vez de usuario libre, ver "Roles del sistema") — mismo criterio que "alta de la primera
    cuenta de administrador de esa instancia" ya anotado más abajo. Los datos de la demo comercial
    (Valentina Ruiz, Fuerza Total, etc.) **no** se migran a esta base — siguen viviendo solo en
    `features/*`, que sigue siendo lo único que alimenta la demo mientras tanto.
  - **La cuenta de bootstrap (DNI `12345678` / contraseña `admin`) es pública y permanente a
    propósito (decisión explícita del usuario, no un descuido)** — sirve tanto para mostrar la
    demo del panel de admin como de puerta de entrada para el onboarding real de un cliente
    nuevo. Riesgo evaluado y aceptado: cualquiera que conozca la credencial (no solo un cliente
    real) puede entrar y crear una cuenta admin propia que sobrevive aunque después se borre esta
    cuenta de bootstrap — se juzgó la probabilidad baja para el contexto de demo/etapa temprana.
    Mitigación **manual, no de código**: si se detecta un uso indebido, se corrige a mano desde el
    dashboard de Supabase (borrar la cuenta intrusa, rotar credenciales). No reabrir esta decisión
    (auto-desactivación, credencial única por instancia, etc.) sin que el usuario lo pida de nuevo
    explícitamente — ya se evaluaron esas alternativas y
    se descartaron.
  - `.env.example` documenta `DATABASE_URL` (pooled, para cuando la app se conecte de verdad —
    todavía sin usar) y `DIRECT_URL` (conexión directa, la que usan hoy `prisma.config.ts` y el
    seed). El `.env` real es local, nunca se commitea ni se pega en el chat.
  - **Login real conectado** (`features/auth/authenticate-real-user.ts`, Server Action) — valida
    contra `User` de verdad (por `loginId` o `email`, bcrypt). Al principio convivía con 4 cuentas
    de demo hardcodeadas en `login-form.tsx`; esas cuentas se sacaron por completo más adelante en
    esta misma sesión de trabajo (ver más abajo, "Login real único") — hoy `login-form.tsx` llama
    directo a esta función, sin ningún chequeo previo. La cookie de sesión distingue de dónde viene
    la identidad (`demo:<key>` vs. `real:<userId>.<firma>`, ver `features/auth/session-cookie.ts`)
    — `getCurrentIdentity()` (usada por todo `features/cliente/` y `features/profesor/`) resuelve
    identidades demo (hoy siempre `null`, nada las escribe ya); `getCurrentRealUserId()` resuelve
    las reales. `lib/db.ts` es el singleton de
    `PrismaClient` de la app (con `@prisma/adapter-pg` + `DATABASE_URL` pooled — a diferencia del
    seed, que usa `DIRECT_URL`), cacheado en `globalThis` para el hot-reload de desarrollo.
  - **Panel de administración** (`/admin`, route group `(tabs)` con Inicio/Usuarios/Ejercicios/
    Configuración, mismo patrón de `BottomNav` que cliente/profesor) — protegido por
    `features/admin/require-admin.ts` (exige sesión real + rol `ADMIN` + cuenta activa, si no
    redirige a `/`). **Usuarios** (`features/admin/usuarios/`) es el entregable real: lista
    Administradores/Profesores (nunca Clientes, ver "Roles del sistema") con pills de filtro y
    contador (fila de pills con scroll horizontal, `flex-nowrap overflow-x-auto`, para que entren
    las tres sin partirse en dos líneas en mobile), alta real vía formulario (`/admin/usuarios/nuevo`,
    fuera de `(tabs)`, mismo criterio que `/profesor/rutinas/nueva`) que pide **DNI + contraseña
    + confirmar contraseña** (nunca email — `User.loginId` guarda el DNI, mismo mecanismo que la
    cuenta de bootstrap; el campo `User.email` queda sin usarse desde el alta) y crea `User` +
    `Profesor` en una transacción.
    Por fila: interruptor de Activo/Inactivo (desactivar/reactivar) y basura (borrado real, con
    confirmación) son **mecanismos distintos** — ver el detalle completo en "Roles del sistema".
    "Editar" (lápiz) abre `/admin/usuarios/[id]/editar` para resetear la contraseña de esa cuenta
    (ver también "Roles del sistema"). Ejercicios y Configuración son stubs ("Próximamente");
    Configuración tiene el `LogoutLink`.
  - **Pendiente, próximas pasadas**: reemplazar cada `get-*-data.ts` mock de cliente/profesor por
    queries de Prisma, pantalla por pantalla — hoy siguen 100% sobre mocks aunque el login y el
    panel de admin ya sean reales.
- **Login real único** — la pantalla de login (`login-form.tsx`) ya no tiene cuentas de demo
  hardcodeadas: se sacaron por completo (`features/auth/demo-accounts.ts` no existe más), todo
  intento de login consulta directo la base real vía `authenticateRealUser`, por DNI+contraseña.
  De acá en más los caminos de entrada son la cuenta de bootstrap (DNI `12345678` / contraseña
  `admin`), lo que el propio admin cree desde `/admin/usuarios` (Profesor/Administrador), y el
  autoregistro de Cliente en `/registro` (ver más
  abajo). `features/cliente/` y `features/profesor/` siguen resolviendo identidad vía
  `getCurrentIdentity()` (`features/auth/session.ts`, formato de cookie `demo:<key>`) — ese
  mecanismo no se tocó, pero como ya nada lo escribe, esas pantallas quedan sin puerta de entrada
  hasta que exista login real de Cliente/Profesor dentro de esas pantallas específicas (Fase 4) —
  intencional y esperado, no un bug (un Cliente registrado desde `/registro` sí entra de verdad,
  ver más abajo — lo que falta es reemplazar los mocks de esas pantallas por datos reales).
  Existe una **sesión mínima real** (`features/auth/session.ts`) vía cookie
  (`fitnessar_demo_identity`), hoy siempre en formato `real:<userId>.<firma>` — **httpOnly y
  firmada con HMAC** (`SESSION_SECRET`, variable de entorno en `.env.example`). Corrige un hueco
  real detectado en esta misma sesión de trabajo: antes la cookie real la escribía el propio JS
  del cliente sin firma, así que cualquiera podía editarla a mano en devtools y suplantar a un
  usuario si conocía su `id`. Ahora solo `setRealSession(userId)` (`features/auth/session.ts`,
  usado por `authenticateRealUser` y por `registerClienteAction`) puede generarla —vía
  `cookies().set(...)` del servidor, siempre después de validar contraseña o crear la cuenta— y
  `getCurrentRealUserId()` verifica la firma antes de confiar en el `userId`; una cookie editada a
  mano se rechaza. "Cerrar sesión" ya no limpia la cookie con JS de cliente (una cookie httpOnly no
  se puede tocar desde `document.cookie`) — `features/auth/logout-link.tsx` llama a un Server
  Action (`features/auth/logout.ts`, `logoutAction()`) que la borra del lado del servidor.
- **Registro de Cliente** (`/registro`, `features/cliente/registro/`) — pantalla pública (sin
  sesión previa, mismo nivel que el login) que pide Nombre, DNI, Contraseña y Confirmar
  contraseña, y crea `User` (rol `CLIENTE`) + `Cliente` de verdad en una transacción
  (`registerClienteAction`, sin `requireAdmin()` a propósito: es la única acción de alta pensada
  para alguien sin cuenta todavía). `branchId` se resuelve con `prisma.branch.findFirst()` (una
  sola sucursal por instancia en la práctica, mismo criterio que `prisma/seed.ts`). El Cliente
  recién creado queda con `profesorId: null` (mismo estado "sin profesor asignado" que ya maneja
  `features/cliente/home/no-professor-assigned.tsx`) y **loguea automáticamente** al terminar
  (`setRealSession`), sin volver a pedirle DNI/contraseña — cae directo en `/cliente`. Login
  (`login-form.tsx`) tiene un link "¿No tenés una cuenta? Registrate" debajo del botón de
  ingresar que lleva acá; esta pantalla tiene el inverso ("¿Ya tenés cuenta? Iniciar sesión") de
  vuelta a `/`.
- Home del cliente (`/cliente`) implementada con datos de fecha reales (no fija) — el día "hoy"
  del mini calendario y de la tarjeta de entrenamiento sale de `new Date()`, no está hardcodeado.
- Rutina del cliente (`/cliente/rutina`) implementada: nombre del programa, quién lo asignó y
  desde cuándo, los 7 días de la semana con su entrenamiento o "Descanso", y los ejercicios
  (nombre + series x reps) del día de hoy.
- El catálogo de rutinas (mock) vive en un solo lugar, `features/routines/catalog.ts`
  (`getRoutineCatalog()`) — hoy tiene "Fuerza Total" y "Cardio y Tonificación", global (no
  segmentado por profesor todavía). El pool de clientes (mock) también es neutral, vive en
  `features/clients/roster.ts` (`getAllClients()`) — cada cliente tiene `assignedProfessorId`
  (`null` si no tiene profesor todavía) y, si tiene login de demo, `loginId`. El cliente
  (`features/cliente/active-routine.ts`) resuelve, según la identidad logueada, cuál rutina le
  corresponde y le suma `assignedBy`/`assignedSince` — **devuelve `null` si no tiene profesor
  asignado** (caso de `cliente2`/"Camila Ibáñez"), y ahí Home (`features/cliente/home/`) muestra
  la pantalla "Aún no tenés entrenamientos asignados" (`no-professor-assigned.tsx`, con dos
  botones todavía inactivos: "Unirme a un profesor" y "¿Cómo me uno a un profesor?" — la lógica de
  aceptación profesor↔cliente queda para más adelante), Rutina (`features/cliente/rutina/`)
  muestra un mensaje compacto, y el checklist de hoy (`features/cliente/session/`) redirige a
  Home. El lado profesor **ya no usa este catálogo mock** — ver más abajo, tiene su propia fuente
  real (`features/profesor/rutinas/get-branch-routines.ts`); `features/routines/catalog.ts` sigue
  viva únicamente porque el lado cliente todavía depende de ella (`active-routine.ts`), pendiente
  de su propia migración a Prisma aparte.
- Checklist de hoy (`/cliente/rutina/hoy`, se llega desde "Comenzar entrenamiento" en Home o "Ver"
  en Rutina): a propósito vive **fuera** del nav inferior de 4 pestañas (route group
  `app/cliente/(tabs)/` para Inicio/Rutina/Progreso/Perfil vs. `app/cliente/rutina/hoy/` aparte) —
  es una pantalla de foco total tipo "iniciar entrenamiento", sin la barra de navegación. Durante
  un descanso activo (`RestTimer`) se bloquea marcar cualquier otra serie salvo destildar la que
  disparó ese descanso (por si fue un error).
- **Lado profesor conectado a Prisma de verdad** (Home, Clientes, Rutinas, Perfil, y
  `/profesor/rutinas/nueva`) — ya no hay ningún mock de por medio salvo lo explícitamente marcado
  abajo. Guardia nueva `features/profesor/require-profesor.ts` (`requireProfesor()`, mismo patrón
  que `requireAdmin()`): exige sesión real con rol `PROFESOR`, cuenta activa, y una fila `Profesor`
  asociada — las 5 páginas de `app/profesor/**` la llaman primero y le pasan `{user, profesor}` a
  cada `get-*-data.ts` (antes cada una resolvía identidad por su cuenta vía `getCurrentIdentity()`,
  que dejó de funcionar en cuanto se sacaron las cuentas demo — por eso se veía siempre "Rodrigo
  Vega" y un roster/catálogo que nadie creó). `features/profesor/roster.ts` (`getClientRoster`)
  consulta `Cliente` real filtrado por `profesorId`; `features/profesor/rutinas/get-branch-routines.ts`
  (nuevo) consulta `Routine`/`RoutineDay`/`RoutineExercise` reales de la sucursal — ninguno de los
  dos toca los mocks compartidos (`features/clients/roster.ts`, `features/routines/catalog.ts`),
  que siguen vivos solo porque el lado cliente todavía depende de ellos. El nombre/horario del
  profesor salen directo de `User.name`/`Profesor.schedule` (`features/profesor/professor.ts`,
  que tenía hardcodeado "Rodrigo Vega"/"Lucía Fernández", se borró). Cada listado que da vacío
  (el caso normal para cualquier profesor recién registrado, sin clientes ni rutinas todavía)
  muestra un cartel a medida en vez de quedar en blanco: "Todavía no tenés clientes asignados."
  (Clientes, antes de buscar) vs. "No se encontraron clientes." (búsqueda sin resultados, ambos en
  `clientes-screen.tsx`), "Nadie entrenó hoy todavía." (Home, sección Activos hoy) y "No se crearon
  rutinas." (Rutinas). `formatLastActivity` (`features/profesor/format-last-activity.ts`) ahora
  acepta `null` → "Sin actividad todavía": sin ninguna tabla de historial de entrenamiento poblada
  todavía (`TrainingSession` sin usar en ningún lado), `streakDays`/`setsCompletedToday` quedan en
  `0` y `lastActivityAt` en `null` para cualquier cliente real — mostrar que no hay datos en vez de
  inventar un número. "+ Nueva rutina" (Home y Rutinas) sigue apuntando a `/profesor/rutinas/nueva`
  (fuera del route group `(tabs)`, mismo criterio que `/cliente/rutina/hoy`), y **"Guardar rutina"
  sigue siendo solo visual** (no crea nada) — a propósito fuera de alcance hasta tener un catálogo
  real de `Exercise` (la tabla existe en el schema pero está vacía; el usuario todavía tiene que
  pasar la fuente de verdad de ejercicios). El nav inferior
  (`components/bottom-nav.tsx`) y los helpers de iniciales/color por hash
  (`lib/get-initials.ts`, `lib/color-hash.ts`) son compartidos entre cliente y profesor — no
  duplicar por rol.
- Perfil del cliente (`/cliente/perfil`, `features/cliente/perfil/`) implementado: avatar +
  nombre, y una lista Profesor asignado/Rutina activa/Miembro desde/Próximo entrenamiento (título
  izquierda, dato derecha, mismo lenguaje visual que el Perfil del profesor) — sin subtítulo de
  "nivel" ni stat-tiles de relleno. Progreso (`/cliente/progreso`, `features/cliente/progreso/`)
  implementado: actividad semanal (check por día completo), 4 métricas (entrenamientos del mes,
  racha actual, tiempo total del mes, ejercicios de hoy) y récords personales. Sigue siendo
  **mock** — no se conecta con lo que se tilda en el checklist (`/cliente/rutina/hoy`, que no
  persiste nada todavía) — pero la lógica de negocio es real: `features/cliente/progreso/
  training-log.ts` genera un historial de sesiones relativo a "hoy" (con un hueco deliberado a
  mitad de camino, para poder probar que el corte de racha funciona) y
  `get-progreso-data.ts` calcula todo sobre ese historial (racha = días programados consecutivos
  completados, sin que un día de descanso la corte; récords = 1RM estimado por fórmula de Epley,
  ver nota de alcance más abajo). Ambas pantallas, sin profesor asignado, reusan el mismo mensaje
  compacto de Rutina (`features/cliente/no-professor-message.tsx`).

## Prioridad #1: Mobile-first

**Regla:** toda pantalla y componente se diseña y maqueta primero para mobile.
**Por qué:** los clientes van a entrar casi 100% desde el celular, parados en el gimnasio — no hay
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

El ingreso a la app es una **única pantalla de login** (DNI+contraseña), sin selector de rol
previo: el rol queda determinado por qué cuenta matchea ese DNI, no se le pregunta al usuario
"¿sos cliente o profesor?". Los 3 roles comparten el mismo mecanismo de login — **DNI +
contraseña** (unificado; ver "Autenticación" más abajo, reemplaza tanto un "usuario" genérico
como el DNI+PIN separado que se había planteado en un principio para Cliente).

- **Profesor**: login DNI+contraseña (igual que Administrador y Cliente). Busca clientes por DNI,
  asigna rutinas semanales.
- **Cliente**: login DNI+contraseña (igual que Profesor/Administrador). Ve rutina activa,
  histórico reciente (peso/series/reps), comentarios del profesor.
- **Administrador de gimnasio**: login DNI+contraseña. Gestiona catálogo de ejercicios de la
  sucursal y alta de profesores.

**Autenticación (decidido — sin Clerk):** login propio construido en el proyecto, DNI y
contraseña (`User.loginId` guarda el DNI para los 3 roles; excepción: la cuenta de bootstrap
(nombre `admin`, DNI `12345678`), cuyo DNI es un valor fijo elegido a propósito, no el documento
real de nadie). Cuentas iniciales de cada
instancia (seed): solo un admin de bootstrap, nada más — ver "Estado actual". A partir de ahí:
- Solo el **administrador** puede crear cuentas de Profesor o Administrador (`/admin/usuarios/nuevo`).
  **Cliente es la excepción: se autoregistra** desde `/registro` (ver "Estado actual" y
  `features/cliente/registro/`), sin necesitar que un admin lo dé de alta — queda sin profesor
  asignado hasta que se una a uno (flujo todavía sin construir, ver "Decisiones de negocio
  pendientes").
- Solo el **administrador** puede desactivar o eliminar cuentas, de cualquier rol (incluida otra
  cuenta de administrador) — **dos mecanismos distintos y a propósito separados en la UI**
  (`features/admin/usuarios/user-row.tsx`):
  - El interruptor "Activo/Inactivo" (`setUserActiveAction`) **desactiva** (`User.deactivatedAt`):
    la cuenta sigue en la base con su historial y rutinas creadas intactos, solo deja de poder
    loguear y de aparecer en listados activos. Reversible en cualquier momento reactivándola.
  - El ícono de basura (`deleteUserAction`, con confirmación) hace un **borrado real** de la fila
    (`prisma.user.delete`) — irreversible. `Profesor.user` tiene `onDelete: Cascade`, así que el
    perfil de Profesor asociado se borra junto con el `User`; las rutinas y clientes que tenía
    asignados **no** se borran (`Routine.profesorId`/`Cliente.profesorId` son `SetNull` en el
    schema), solo quedan sin profesor asignado.
  **Excepción explícita en los dos casos: un admin nunca puede desactivarse ni eliminarse a sí
  mismo** — guardia server-side en ambas actions (`features/admin/usuarios/actions.ts`), no solo
  deshabilitado en la UI (`user-row.tsx` también deshabilita el toggle/basura en la propia fila,
  marcada "(Vos)"). El caso de desactivación se agregó después de un lockout real en desarrollo: al
  no haber ninguna otra cuenta admin, desactivarse a sí mismo deja el sistema sin forma de loguear
  (la única recuperación en ese caso es editar `deactivatedAt` a mano en la base) — el borrado
  propio se bloqueó por el mismo motivo, agravado por no tener siquiera un "reactivar" después.
  Además, el admin puede **resetear la contraseña de cualquier cuenta** (`/admin/usuarios/[id]/editar`,
  ícono de lápiz, `updateUserPasswordAction`) sin ver ni necesitar la anterior — solo se guarda el
  hash, así que "revelarla" no es técnicamente posible; simplemente carga una nueva con
  confirmación. Esto también sirve para la propia cuenta.
- Pantalla de gestión de cuentas del administrador **implementada** — `/admin/usuarios` (ver
  "Estado actual").
- **Login con límite de intentos**: 5 intentos fallidos seguidos sobre la misma cuenta la bloquean
  por 1 minuto (`User.failedLoginAttempts`/`User.lockedUntil`, `authenticateRealUser` en
  `features/auth/authenticate-real-user.ts`) — durante el bloqueo se rechaza cualquier intento,
  incluso con la contraseña correcta, para que el límite sea real. El contador se resetea a 0 en
  cualquier login exitoso. Alcance a propósito acotado **por cuenta** (`User.id`), no por IP: no
  protege contra probar muchos usuarios distintos en simultáneo, se consideró fuera de alcance para
  esta etapa (no hay infraestructura de rate-limit por IP en el proyecto).

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
  "récords personales" en Progreso del cliente, por pedido explícito del usuario (ver "Estado
  actual"); lo que sigue fuera de alcance es un módulo de métricas avanzadas más amplio.
- Módulo de comunicación y noticias del gimnasio.

## Decisiones de negocio pendientes

- Recuperación de acceso del cliente (contraseña olvidada): sin definir todavía. Opciones que el
  usuario está evaluando: recuperación por teléfono, o gestión manual vía administrador (mismo
  mecanismo que ya existe para Profesor/Admin: el admin resetea la contraseña desde
  `/admin/usuarios/[id]/editar` — pero el admin no gestiona cuentas de Cliente en esa pantalla,
  ver "Roles del sistema", así que para Cliente sigue siendo un camino aparte). No implementar un
  mecanismo propio sin confirmar cuál eligieron.
- ~~Alta de cuentas de Cliente~~ — **resuelto**: autoregistro en `/registro` (ver "Roles del
  sistema" y "Estado actual"). Sigue pendiente el paso siguiente — cómo un Cliente ya registrado
  pero sin profesor se une a uno (botón "Unirme a un profesor", hoy inactivo en
  `no-professor-assigned.tsx`) — no asumir el mecanismo sin confirmar.

## Stack técnico

Next.js (App Router) + TypeScript + Tailwind · PostgreSQL vía Supabase · Prisma como ORM ·
**autenticación propia** (DNI/contraseña + roles + sesión, todo construido en el proyecto —
decidido explícitamente en contra de usar Clerk) · Cloudinary para media de ejercicios · Vercel
para deploy.

Este proyecto corre sobre Next.js 16.x — ver `AGENTS.md` (importado arriba): antes de escribir
código de Next.js, revisar `node_modules/next/dist/docs/` por breaking changes vs. conocimiento
de entrenamiento previo.

También corre sobre **Prisma 7.x**, una versión con breaking changes grandes vs. conocimiento de
entrenamiento previo (motor de queries ya no embebido — hace falta un driver adapter tipo
`@prisma/adapter-pg`; el datasource ya no lleva `url`/`directUrl` en el `.prisma`, se mueve a
`prisma.config.ts`; el cliente generado va a una carpeta de salida propia en vez de
`node_modules/@prisma/client`). Antes de tocar `prisma/schema.prisma`, `prisma.config.ts` o
`prisma/seed.ts`, verificar contra la doc oficial (`prisma.io/docs`) en vez de asumir la sintaxis
de versiones anteriores.

## Cómo trabajar en este repo

- No implementar features de negocio hasta que el usuario lo pida explícitamente — hoy estamos en
  fase de planeamiento puro.
- La demo debe ser genérica y reutilizable (pensada para múltiples gimnasios clientes, no
  hardcodeada a uno), priorizando componentes simples y reutilizables.
- Mantener este archivo actualizado a medida que se tomen decisiones de producto o técnicas
  (ej. cuando se defina la recuperación de acceso, o se agregue el schema de Prisma).
- Debe ser una PWA que priorice la idea de aplicación, aunque en el fondo sea un sitio web.