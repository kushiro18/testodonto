const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { clinic: true }
    });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    if (!user.active)
      return res.status(403).json({ error: 'Usuario desactivado' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, clinicId: user.clinicId, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, clinic: user.clinic }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/register (solo superadmin crea clínicas nuevas)
router.post('/register-clinic', async (req, res) => {
  try {
    const { clinicName, adminName, adminEmail, adminPassword } = req.body;
    const hashedPw = await bcrypt.hash(adminPassword, 10);
    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({ data: { name: clinicName } });
      const admin  = await tx.user.create({
        data: { name: adminName, email: adminEmail, password: hashedPw, role: 'admin', clinicId: clinic.id }
      });
      return { clinic, admin };
    });
    res.status(201).json({ message: 'Clínica creada', clinicId: result.clinic.id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/auth/seed-demo — crea datos demo para probar
router.post('/seed-demo', async (req, res) => {
  try {
    const existing = await prisma.clinic.findFirst({ where: { name: 'Clínica Dental Puno' } });
    if (existing) return res.json({ message: 'Demo ya existe', clinicId: existing.id });

    const hashed = await bcrypt.hash('demo123', 10);
    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: { name: 'Clínica Dental Puno', address: 'Jr. Lima 123, Puno', phone: '051-351234', plan: 'pro' }
      });
      await tx.user.createMany({
        data: [
          { name: 'Dr. Carlos Mamani', email: 'admin@demo.com',    password: hashed, role: 'admin',    clinicId: clinic.id },
          { name: 'Dra. Ana Quispe',   email: 'dentista@demo.com', password: hashed, role: 'dentist',  clinicId: clinic.id },
          { name: 'María Flores',      email: 'recep@demo.com',    password: hashed, role: 'receptionist', clinicId: clinic.id },
        ]
      });
      const patients = await Promise.all([
        tx.patient.create({ data: { dni:'12345678', name:'Juan', lastName:'Huanca Quispe', birthDate: new Date('1985-03-15'), gender:'M', phone:'951234567', clinicId: clinic.id } }),
        tx.patient.create({ data: { dni:'87654321', name:'María', lastName:'Coila Mamani',  birthDate: new Date('1992-07-22'), gender:'F', phone:'962345678', clinicId: clinic.id } }),
        tx.patient.create({ data: { dni:'11223344', name:'Pedro', lastName:'Apaza Torres',  birthDate: new Date('1978-11-05'), gender:'M', phone:'973456789', clinicId: clinic.id } }),
      ]);
      return { clinic, patients };
    });
    res.json({ message: 'Demo creado', clinicId: result.clinic.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
