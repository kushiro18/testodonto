const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const where = { dentist: { clinicId: req.user.clinicId } };
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      where.date = { gte: d, lt: next };
    }
    const appts = await prisma.appointment.findMany({
      where, orderBy: { date: 'asc' },
      include: {
        patient: { select: { name: true, lastName: true } },
        dentist: { select: { name: true } }
      }
    });
    res.json(appts);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { patientId, dentistId, date, duration, notes } = req.body;
    const appt = await prisma.appointment.create({
      data: { patientId, dentistId: dentistId || req.user.id, date: new Date(date), duration: duration || 30, notes }
    });
    res.status(201).json(appt);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const appt = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    res.json(appt);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
