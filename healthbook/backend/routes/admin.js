const express = require('express');
const router = express.Router();
const { readCSV } = require('../services/csvService');

// GET /api/admin/stats - Thống kê tổng quát
router.get('/stats', async (req, res) => {
  try {
    const appointments = await readCSV('appointments.csv');
    const doctors = await readCSV('doctors.csv');
    const clinics = await readCSV('clinics.csv');

    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const pending = appointments.filter((a) => a.status === 'pending').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;

    res.json({
      success: true,
      data: {
        totalAppointments: total,
        confirmedAppointments: confirmed,
        pendingAppointments: pending,
        cancelledAppointments: cancelled,
        totalDoctors: doctors.length,
        totalClinics: clinics.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/appointments-by-date - Lịch hẹn theo ngày (7 ngày gần nhất)
router.get('/appointments-by-date', async (req, res) => {
  try {
    const appointments = await readCSV('appointments.csv');

    const counts = {};
    appointments.forEach((a) => {
      if (a.appointment_date) {
        counts[a.appointment_date] = (counts[a.appointment_date] || 0) + 1;
      }
    });

    const sorted = Object.entries(counts)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-14) // 14 ngày gần nhất
      .map(([date, count]) => ({ date, count }));

    res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/specialty-stats - Thống kê chuyên khoa phổ biến
router.get('/specialty-stats', async (req, res) => {
  try {
    const appointments = await readCSV('appointments.csv');
    const doctors = await readCSV('doctors.csv');

    const specialtyCounts = {};
    appointments.forEach((apt) => {
      const doctor = doctors.find((d) => d.doctor_id === apt.doctor_id);
      if (doctor) {
        const specialty = doctor.specialty;
        specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
      }
    });

    const sorted = Object.entries(specialtyCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([specialty, count]) => ({ specialty, count }));

    res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/all-appointments - Tất cả lịch hẹn cho admin
router.get('/all-appointments', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    let appointments = await readCSV('appointments.csv');
    const doctors = await readCSV('doctors.csv');
    const clinics = await readCSV('clinics.csv');

    if (status) appointments = appointments.filter((a) => a.status === status);
    if (search) {
      const s = search.toLowerCase();
      appointments = appointments.filter(
        (a) =>
          a.patient_name?.toLowerCase().includes(s) ||
          a.patient_email?.toLowerCase().includes(s) ||
          a.appointment_id?.toLowerCase().includes(s)
      );
    }

    const total = appointments.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginated = appointments.slice(start, start + parseInt(limit));

    const enriched = paginated.map((apt) => ({
      ...apt,
      doctor: doctors.find((d) => d.doctor_id === apt.doctor_id),
      clinic: clinics.find((c) => c.clinic_id === apt.clinic_id),
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
