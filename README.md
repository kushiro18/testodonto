# OdontoSys — Sistema de Gestión Odontológica
### Tesis: Sistema de información para clínica odontológica — Puno, Perú

---

## 🏗️ Arquitectura

```
clinica-odontologica/
├── backend/          → Node.js + Express + Prisma + PostgreSQL
├── frontend/         → React + Vite + Tailwind CSS  (próximo sprint)
├── odontosys-demo.html  → Demo HTML standalone (para mostrar al cliente)
└── docs/
```

## 🚀 Instalación local (desarrollo)

### Requisitos
- Node.js 18+
- PostgreSQL 14+ (o cuenta en Railway)
- Git

### 1. Clonar y configurar
```bash
git clone https://github.com/TU_USUARIO/odontosys.git
cd odontosys/backend
npm install
```

### 2. Variables de entorno
```bash
cp .env.example .env
# Edita .env con tu DATABASE_URL y JWT_SECRET
```

### 3. Base de datos
```bash
# Con PostgreSQL local:
createdb odontologia

# Generar cliente Prisma + crear tablas
npx prisma generate
npx prisma db push

# Crear datos demo
curl -X POST http://localhost:4000/api/auth/seed-demo
```

### 4. Ejecutar
```bash
npm run dev        # Backend en puerto 4000
```

---

## 🌐 Deploy en Railway (GRATIS para empezar)

### Paso a paso:
1. Crear cuenta en [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Add Plugin → PostgreSQL (Railway te da DATABASE_URL automáticamente)
4. En Variables agregar:
   - `JWT_SECRET` = cualquier string largo y secreto
   - `FRONTEND_URL` = URL de tu Vercel (o * para pruebas)
5. Railway detecta el `package.json` y despliega automático

### Deploy Frontend (Vercel — GRATIS)
1. Crear cuenta en [vercel.com](https://vercel.com)
2. Import Git Repository → selecciona la carpeta `frontend/`
3. En Environment Variables agregar:
   - `VITE_API_URL` = URL de Railway (ej: `https://odontosys.up.railway.app/api`)
4. Deploy

---

## 👤 Cuentas demo

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@demo.com | demo123 |
| Odontólogo | dentista@demo.com | demo123 |
| Recepcionista | recep@demo.com | demo123 |

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/login              → { token, user }
POST /api/auth/register-clinic    → crear nueva clínica
POST /api/auth/seed-demo          → datos de prueba
```

### Pacientes
```
GET    /api/patients              → listar (con ?search=nombre&page=1)
GET    /api/patients/:id          → detalle + historial
POST   /api/patients              → crear
PUT    /api/patients/:id          → actualizar
DELETE /api/patients/:id          → eliminar
```

### Odontograma
```
GET    /api/odontogram/:patientId        → último odontograma
GET    /api/odontogram/:patientId/all   → historial completo
POST   /api/odontogram/:patientId       → crear/guardar
PUT    /api/odontogram/:id              → actualizar
```

### Admin
```
GET  /api/admin/stats             → estadísticas del dashboard
GET  /api/admin/users             → usuarios de la clínica
POST /api/admin/users             → crear usuario
GET  /api/admin/clinics           → (superadmin) todas las clínicas + pagos
PUT  /api/admin/clinics/:id/plan  → (superadmin) actualizar suscripción
```

### Citas
```
GET  /api/appointments            → listar (con ?date=2024-05-13)
POST /api/appointments            → crear cita
PUT  /api/appointments/:id/status → actualizar estado
```

---

## 💰 Modelo de cobro (para tu negocio)

| Plan | Precio sugerido | Incluye |
|------|----------------|---------|
| Demo | S/. 0 | 30 días, 10 pacientes |
| Básico | S/. 120/mes | 1 odontólogo, ilimitado |
| Pro | S/. 220/mes | 5 odontólogos, reportes |
| Multi | S/. 350/mes | Cadena de clínicas |

**Tu costo real:** Railway Pro ~$5/mes + Vercel gratis = S/.20/mes
**Ganancia neta con 1 cliente básico:** S/.100/mes

---

## 📋 Norma Técnica MINSA implementada

El odontograma implementa:
- ✅ Sistema dígito-dos FDI/OMS
- ✅ 32 dientes permanentes (11-18, 21-28, 31-38, 41-48)
- ✅ 20 dientes deciduos (51-55, 61-65, 71-75, 81-85)
- ✅ Colores rojo (patología) y azul (buen estado)
- ✅ 19 condiciones: Caries, Restauración, Coronas, Ausente, Tratamiento pulpar, etc.
- ✅ Campo de especificaciones por pieza y general
- ✅ Persistencia en BD con historial de evolución

---

## 🗓️ Roadmap sugerido para la tesis

**Sprint 1 (demo al cliente) — LISTO ✅**
- Login con roles
- Dashboard con estadísticas
- Lista de pacientes
- Odontograma interactivo (HTML demo)

**Sprint 2 (2-3 semanas)**
- Frontend React completo con Vite + Tailwind
- Conexión real con el backend
- CRUD pacientes completo

**Sprint 3 (2-3 semanas)**
- Módulo de citas con calendario
- Reportes PDF del odontograma
- Notificaciones por cita

**Sprint 4 (1-2 semanas)**
- Panel superadmin (gestión de pagos)
- PWA (funciona en celular como app)
- Deploy final + documentación de tesis

---

## 🛠️ Stack tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Backend | Node.js + Express | Rápido, miles de librerías, fácil deploy |
| ORM | Prisma | Tipado, migraciones, muy legible |
| Base de datos | PostgreSQL | Relacional, perfecto para historias clínicas |
| Auth | JWT + bcrypt | Estándar de la industria, sin estado |
| Frontend | React + Vite | Escalable, componentes reutilizables |
| Estilos | Tailwind CSS | Responsive rápido, mobile-first |
| Host backend | Railway | Gratis para empezar, 1 clic deploy |
| Host frontend | Vercel | Gratis, CDN global, deploy automático |

---

*Sistema desarrollado como tesis de Ingeniería de Sistemas — Universidad — Puno, Perú*
*Conforme a la Norma Técnica del Odontograma — Colegio Odontológico del Perú*
