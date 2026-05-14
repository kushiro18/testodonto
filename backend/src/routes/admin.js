const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth, role } = require('../middleware/auth');
const prisma = new PrismaClient();

// Dashboard stats de la clínica
router.get('/stats', auth, async (req, res) => {
  try {
    const clinicId = req.user.clinicId;
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const [totalPatients, todayAppts, totalOdontograms] = await Promise.all([
      prisma.patient.count({ where: { clinicId } }),
      prisma.appointment.count({ where: { dentist: { clinicId }, date: { gte: today, lt: tomorrow } } }),
      prisma.odontogram.count({ where: { patient: { clinicId } } }),
    ]);
    res.json({ totalPatients, todayAppts, totalOdontograms });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Listar usuarios de la clínica (solo admin)
router.get('/users', auth, role('admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { clinicId: req.user.clinicId },
      select: { id:true, name:true, email:true, role:true, active:true, createdAt:true }
    });
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Crear usuario dentro de la clínica
router.post('/users', auth, role('admin'), async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { name, email, password, role: userRole } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: userRole || 'dentist', clinicId: req.user.clinicId }
    });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Email ya registrado' });
    res.status(500).json({ error: e.message });
  }
});

// SUPERADMIN: listar todas las clínicas + estado de pago (para tu monitoreo)
router.get('/clinics', auth, role('superadmin'), async (req, res) => {
  try {
    const clinics = await prisma.clinic.findMany({
      include: {
        _count: { select: { patients: true, users: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clinics);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Actualizar plan / pago de clínica
router.put('/clinics/:id/plan', auth, role('superadmin'), async (req, res) => {
  try {
    const { plan, paidUntil } = req.body;
    const clinic = await prisma.clinic.update({
      where: { id: req.params.id },
      data: { plan, paidUntil: paidUntil ? new Date(paidUntil) : undefined }
    });
    res.json(clinic);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
