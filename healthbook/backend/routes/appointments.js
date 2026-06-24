const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readCSV, appendRow, updateRow, deleteRow } = require('../services/csvService');
const { sendConfirmationEmail } = require('../services/emailService');

// Các giờ khám có thể đặt
const AVAILABLE_TIMES = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

// GET /api/appointments - Lấy danh sách lịch hẹn
router.get('/', async (req, res) => {
  try {
    const { email, doctor_id, date, status } = req.query;
    let appointments = await readCSV('appointments.csv');
    const doctors = await readCSV('doctors.csv');
    const clinics = await readCSV('clinics.csv');

    // Lọc theo email bệnh nhân
    if (email) {
      appointments = appointments.filter(
        (a) => a.patient_email.toLowerCase() === email.toLowerCase()
      );
    }
    if (doctor_id) appointments = appointments.filter((a) => a.doctor_id === doctor_id);
    if (date) appointments = appointments.filter((a) => a.appointment_date === date);
    if (status) appointments = appointments.filter((a) => a.status === status);

    // Enrich với thông tin bác sĩ và phòng khám
    const enriched = appointments.map((apt) => {
      const doctor = doctors.find((d) => d.doctor_id === apt.doctor_id);
      const clinic = clinics.find((c) => c.clinic_id === apt.clinic_id);
      return { ...apt, doctor, clinic };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/appointments/slots?doctor_id=&date= - Lấy giờ trống của bác sĩ
router.get('/slots', async (req, res) => {
  try {
    const { doctor_id, date } = req.query;

    if (!doctor_id || !date) {
      return res.status(400).json({ success: false, message: 'Cần doctor_id và date' });
    }

    const appointments = await readCSV('appointments.csv');
    const bookedTimes = appointments
      .filter(
        (a) =>
          a.doctor_id === doctor_id &&
          a.appointment_date === date &&
          a.status !== 'cancelled'
      )
      .map((a) => a.appointment_time);

    const availableSlots = AVAILABLE_TIMES.map((time) => ({
      time,
      available: !bookedTimes.includes(time),
    }));

    res.json({ success: true, data: availableSlots, bookedTimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/appointments - Đặt lịch mới
router.post('/', async (req, res) => {
  try {
    const {
      patient_name,
      patient_email,
      patient_phone,
      doctor_id,
      clinic_id,
      appointment_date,
      appointment_time,
      symptoms,
    } = req.body;

    // Validate required fields
    if (!patient_name || !patient_email || !doctor_id || !clinic_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    // Kiểm tra trùng lịch
    const appointments = await readCSV('appointments.csv');
    const conflict = appointments.find(
      (a) =>
        a.doctor_id === doctor_id &&
        a.appointment_date === appointment_date &&
        a.appointment_time === appointment_time &&
        a.status !== 'cancelled'
    );

    if (conflict) {
      // Tính các giờ trống gần nhất
      const bookedTimes = appointments
        .filter(
          (a) =>
            a.doctor_id === doctor_id &&
            a.appointment_date === appointment_date &&
            a.status !== 'cancelled'
        )
        .map((a) => a.appointment_time);

      const suggestedTimes = AVAILABLE_TIMES.filter((t) => !bookedTimes.includes(t)).slice(0, 5);

      return res.status(409).json({
        success: false,
        conflict: true,
        message: `Khung giờ ${appointment_time} ngày ${appointment_date} đã được đặt trước.`,
        suggestedTimes,
      });
    }

    // Tạo lịch hẹn mới
    const newAppointment = {
      appointment_id: `APT${uuidv4().slice(0, 8).toUpperCase()}`,
      patient_name,
      patient_email,
      patient_phone: patient_phone || '',
      doctor_id,
      clinic_id,
      appointment_date,
      appointment_time,
      symptoms: symptoms || '',
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };

    await appendRow('appointments.csv', newAppointment);

    // Gửi email xác nhận
    const doctors = await readCSV('doctors.csv');
    const clinics = await readCSV('clinics.csv');
    const doctor = doctors.find((d) => d.doctor_id === doctor_id);
    const clinic = clinics.find((c) => c.clinic_id === clinic_id);

    const emailResult = await sendConfirmationEmail(newAppointment, doctor, clinic);

    res.status(201).json({
      success: true,
      message: 'Đặt lịch thành công!',
      data: newAppointment,
      emailPreview: emailResult?.previewUrl || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/appointments/:id - Cập nhật lịch hẹn
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Nếu đổi giờ/ngày, kiểm tra trùng lịch
    if (updates.appointment_date || updates.appointment_time) {
      const appointments = await readCSV('appointments.csv');
      const current = appointments.find((a) => a.appointment_id === id);

      if (!current) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
      }

      const newDate = updates.appointment_date || current.appointment_date;
      const newTime = updates.appointment_time || current.appointment_time;

      const conflict = appointments.find(
        (a) =>
          a.appointment_id !== id &&
          a.doctor_id === current.doctor_id &&
          a.appointment_date === newDate &&
          a.appointment_time === newTime &&
          a.status !== 'cancelled'
      );

      if (conflict) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: `Khung giờ ${newTime} ngày ${newDate} đã được đặt trước.`,
        });
      }
    }

    const updated = await updateRow('appointments.csv', 'appointment_id', id, updates);
    res.json({ success: true, message: 'Cập nhật lịch hẹn thành công', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/appointments/:id - Hủy lịch hẹn
router.delete('/:id', async (req, res) => {
  try {
    await updateRow('appointments.csv', 'appointment_id', req.params.id, { status: 'cancelled' });
    res.json({ success: true, message: 'Hủy lịch hẹn thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
