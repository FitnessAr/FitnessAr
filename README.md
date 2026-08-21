# FitnessAr

Plataforma web para digitalizar la asignación y el seguimiento de rutinas de entrenamiento en
gimnasios, conectando profesores y clientes en un flujo simple, pensado mobile-first.

## Estado del proyecto

En etapa de planeamiento y armado de una **demo genérica e interactiva**, pensada para salir a
ofrecer comercialmente a gimnasios. La arquitectura debe ser escalable para, una vez validada,
derivar en un desarrollo a medida por cliente.

## Visión

Optimizar la asignación y el seguimiento de rutinas de entrenamiento, digitalizando la interacción
profesor-cliente: seguimiento estructurado, instrucciones visuales claras y un canal directo para
indicaciones personalizadas.

## Prioridad de diseño: Mobile-first

Los clientes usan la plataforma casi exclusivamente desde el celular, dentro del gimnasio. Toda
decisión de UI/UX debe priorizar mobile primero: usabilidad clara para todas las edades, botones
grandes, tipografía legible, navegación simple. El rol profesor puede usarse también desde
tablet/desktop, pero mobile sigue siendo el caso de uso principal a validar.

## Modelo de producto: white-label por cliente

Cada gimnasio o franquicia que contrate el servicio recibe **su propia instancia** (deploy y base
de datos propios), armada a partir del mismo producto base — no todos los clientes comparten una
única base de datos. Lo que cambia de un cliente a otro (logo, colores, catálogo de ejercicios,
qué módulos están activos) es configuración y datos, no una reescritura del producto. Esto permite
ofrecer hoy una demo genérica y, cuando un gimnasio contrate el servicio, adaptar el look & feel y
activar o desactivar funciones rápidamente sin partir de cero.

## Roles

### Profesor
- Acceso con email y contraseña.
- Búsqueda de clientes por DNI.
- Asignación de rutinas semanales.

### Cliente
- Acceso simplificado (DNI + PIN).
- Consulta de su rutina activa.
- Histórico reciente (peso, series, repeticiones) por ejercicio.
- Lectura de comentarios del profesor.
- ⚠️ Pendiente de definir: mecanismo de recuperación de acceso (¿por teléfono? ¿vía administrador?).

### Administrador de Gimnasio
- Acceso con credenciales.
- Gestión del catálogo de ejercicios de la sucursal.
- Alta de profesores.

## Módulo de Rutinas y Ejercicios

- **Estructura semanal**: rutinas organizadas por día.
- **Ejercicio**: series, repeticiones y descanso parametrizables por el profesor.
- **Progreso**: el cliente ve peso y repeticiones logradas en su última sesión de ese día.
- **Personalización**: comentarios del profesor por ejercicio.
- **Ficha técnica**: grupos musculares, descripción textual, GIF o imagen demostrativa.

## Roadmap (post-MVP)

- Tipificación de rutinas (hipertrofia, fuerza máxima, resistencia, descarga).
- Autogestión de rutinas por clientes avanzados.
- Métricas avanzadas: progresión de volumen, 1RM estimado.
- Módulo de comunicación/noticias del gimnasio (horarios, feriados, vencimientos de cuota).

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) |
| Base de datos | PostgreSQL |
| Backend as a Service | Supabase |
| Autenticación | Propia (usuario/contraseña + roles) |
| ORM | Prisma |
| Media (GIFs/imágenes de ejercicios) | Cloudinary |
| Hosting / Deploy | Vercel |

## Getting Started

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Colaboración

Proyecto compartido — antes de decisiones de arquitectura o de producto no triviales, alinear con
ambos.
