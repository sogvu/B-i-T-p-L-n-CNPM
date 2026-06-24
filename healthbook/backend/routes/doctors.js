const express = require('express');
const router = express.Router();
const { readCSV, appendRow, updateRow, deleteRow } = require('../services/csvService');
const { suggestSpecialties, ALL_SPECIALTIES } = require('../services/symptomService');

// GET /api/doctors - Lấy tất cả bác sĩ (có thể lọc)
router.get('/', async (req, res) => {
  try {
    const { specialty, clinic_id, search } = req.query;
    let doctors = await readCSV('doctors.csv');
    const clinics = await readCSV('clinics.csv');

    // Lọc theo chuyên khoa
    if (specialty) {
      doctors = doctors.filter((d) =>
        d.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    // Lọc theo phòng khám
    if (clinic_id) {
      doctors = doctors.filter((d) => d.clinic_id === clinic_id);
    }

    // Tìm kiếm theo tên
    if (search) {
      const searchLower = search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.doctor_name.toLowerCase().includes(searchLower) ||
          d.specialty.toLowerCase().includes(searchLower)
      );
    }

    // Gắn thông tin phòng khám vào bác sĩ
    const enriched = doctors.map((doctor) => {
      const clinic = clinics.find((c) => c.clinic_id === doctor.clinic_id);
      return { ...doctor, clinic };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/doctors/suggest?symptoms= - Gợi ý bác sĩ từ triệu chứng
router.get('/suggest', async (req, res) => {
  try {
    const { symptoms } = req.query;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập triệu chứng',
      });
    }

    // Gợi ý chuyên khoa
    const specialtySuggestions = suggestSpecialties(symptoms);

    if (specialtySuggestions.length === 0) {
      return res.json({
        success: true,
        suggestions: [],
        doctors: [],
        message: 'Không tìm thấy chuyên khoa phù hợp. Vui lòng thử từ khóa khác.',
      });
    }

    // Lấy danh sách bác sĩ cho các chuyên khoa được gợi ý
    const doctors = await readCSV('doctors.csv');
    const clinics = await readCSV('clinics.csv');

    const suggestedSpecialties = specialtySuggestions.map((s) => s.specialty);
    const matchedDoctors = doctors
      .filter((d) => suggestedSpecialties.includes(d.specialty))
      .map((doctor) => {
        const clinic = clinics.find((c) => c.clinic_id === doctor.clinic_id);
        const specialtyScore = specialtySuggestions.find(
          (s) => s.specialty === doctor.specialty
        )?.score || 0;
        return { ...doctor, clinic, specialtyScore };
      })
      .sort((a, b) => b.specialtyScore - a.specialtyScore);

    res.json({
      success: true,
      suggestions: specialtySuggestions,
      doctors: matchedDoctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/doctors/specialties - Lấy danh sách chuyên khoa
router.get('/specialties', async (req, res) => {
  try {
    res.json({ success: true, data: ALL_SPECIALTIES });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/doctors/:id - Chi tiết bác sĩ
router.get('/:id', async (req, res) => {
  try {
    const doctors = await readCSV('doctors.csv');
    const doctor = doctors.find((d) => d.doctor_id === req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ' });
    }

    const clinics = await readCSV('clinics.csv');
    const clinic = clinics.find((c) => c.clinic_id === doctor.clinic_id);

    // Lấy lịch đã đặt của bác sĩ này
    const appointments = await readCSV('appointments.csv');
    const doctorAppointments = appointments.filter(
      (a) => a.doctor_id === doctor.doctor_id && a.status !== 'cancelled'
    );

    res.json({
      success: true,
      data: { ...doctor, clinic, appointments: doctorAppointments },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/doctors - Thêm bác sĩ mới (Admin)
router.post('/', async (req, res) => {
  try {
    const { doctor_name, specialty, clinic_id, experience, email, phone, bio } = req.body;
    if (!doctor_name || !specialty || !clinic_id) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (tên, chuyên khoa, phòng khám)' });
    }

    const doctors = await readCSV('doctors.csv');
    const ids = doctors.map(d => parseInt(d.doctor_id.replace('D', ''), 10)).filter(num => !isNaN(num));
    const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    const newId = `D${String(nextNum).padStart(3, '0')}`;

    const newDoctor = {
      doctor_id: newId,
      doctor_name,
      specialty,
      clinic_id,
      experience: experience || '0',
      email: email || '',
      phone: phone || '',
      rating: '5.0',
      bio: bio || '',
    };

    await appendRow('doctors.csv', newDoctor);
    res.status(201).json({ success: true, message: 'Thêm bác sĩ thành công!', data: newDoctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/doctors/:id - Cập nhật bác sĩ (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateRow('doctors.csv', 'doctor_id', id, req.body);
    res.json({ success: true, message: 'Cập nhật bác sĩ thành công!', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/doctors/:id - Xóa bác sĩ (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRow('doctors.csv', 'doctor_id', id);
    res.json({ success: true, message: 'Xóa bác sĩ thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
