const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/odontogram/:patientId — obtener último odontograma inicial
router.get('/:patientId', auth, async (req, res) => {
  try {
    const odontogram = await prisma.odontogram.findFirst({
      where: { patientId: req.params.patientId, patient: { clinicId: req.user.clinicId } },
      orderBy: { createdAt: 'desc' },
      include: { dentist: { select: { name: true } }, patient: { select: { name: true, lastName: true, dni: true } } }
    });
    res.json(odontogram || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/odontogram/:patientId/all — historial
router.get('/:patientId/all', auth, async (req, res) => {
  try {
    const list = await prisma.odontogram.findMany({
      where: { patientId: req.params.patientId, patient: { clinicId: req.user.clinicId } },
      orderBy: { createdAt: 'desc' },
      include: { dentist: { select: { name: true } } }
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/odontogram/:patientId — crear/guardar odontograma
router.post('/:patientId', auth, async (req, res) => {
  try {
    const { data, type = 'initial', notes } = req.body;
    // Verificar que el paciente pertenece a la clínica
    const patient = await prisma.patient.findFirst({
      where: { id: req.params.patientId, clinicId: req.user.clinicId }
    });
    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });

    const odontogram = await prisma.odontogram.create({
      data: { patientId: req.params.patientId, dentistId: req.user.id, data, type, notes }
    });
    res.status(201).json(odontogram);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/odontogram/:id — actualizar odontograma
router.put('/:id', auth, async (req, res) => {
  try {
    const { data, notes } = req.body;
    const updated = await prisma.odontogram.update({
      where: { id: req.params.id },
      data: { data, notes }
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
