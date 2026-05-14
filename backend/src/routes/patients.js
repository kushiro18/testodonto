const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/patients — listar pacientes de la clínica
router.get('/', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const where = {
      clinicId: req.user.clinicId,
      ...(search && {
        OR: [
          { name:     { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { dni:      { contains: search } },
        ]
      })
    };
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({ where, skip: +skip, take: +limit, orderBy: { createdAt: 'desc' } }),
      prisma.patient.count({ where })
    ]);
    res.json({ patients, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/patients/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params.id, clinicId: req.user.clinicId },
      include: {
        odontograms: { orderBy: { createdAt: 'desc' }, take: 5,
          include: { dentist: { select: { name: true } } } },
        appointments: { orderBy: { date: 'desc' }, take: 5,
          include: { dentist: { select: { name: true } } } }
      }
    });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(patient);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/patients
router.post('/', auth, async (req, res) => {
  try {
    const { dni, name, lastName, birthDate, gender, phone, email, address } = req.body;
    const patient = await prisma.patient.create({
      data: { dni, name, lastName, birthDate: birthDate ? new Date(birthDate) : null,
              gender, phone, email, address, clinicId: req.user.clinicId }
    });
    res.status(201).json(patient);
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'DNI ya registrado' });
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/patients/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { dni, name, lastName, birthDate, gender, phone, email, address } = req.body;
    const patient = await prisma.patient.updateMany({
      where: { id: req.params.id, clinicId: req.user.clinicId },
      data: { dni, name, lastName, birthDate: birthDate ? new Date(birthDate) : undefined,
              gender, phone, email, address }
    });
    res.json({ updated: patient.count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/patients/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.patient.deleteMany({ where: { id: req.params.id, clinicId: req.user.clinicId } });
    res.json({ message: 'Eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
