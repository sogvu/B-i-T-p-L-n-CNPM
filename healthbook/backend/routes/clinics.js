const express = require('express');
const router = express.Router();
const { readCSV, appendRow, updateRow, deleteRow } = require('../services/csvService');
const { sortClinicsByDistance } = require('../services/geoService');

// GET /api/clinics - Lấy tất cả phòng khám
router.get('/', async (req, res) => {
  try {
    const clinics = await readCSV('clinics.csv');
    const doctors = await readCSV('doctors.csv');

    // Gắn số lượng bác sĩ vào mỗi phòng khám
    const enriched = clinics.map((clinic) => ({
      ...clinic,
      doctorCount: doctors.filter((d) => d.clinic_id === clinic.clinic_id).length,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/clinics/nearby?lat=&lng= - Lấy phòng khám gần nhất
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Cần cung cấp tọa độ lat và lng',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        message: 'Tọa độ không hợp lệ',
      });
    }

    const clinics = await readCSV('clinics.csv');
    const doctors = await readCSV('doctors.csv');

    // Sort theo khoảng cách
    const sorted = sortClinicsByDistance(clinics, userLat, userLng);

    // Gắn số lượng bác sĩ
    const enriched = sorted.map((clinic) => ({
      ...clinic,
      doctorCount: doctors.filter((d) => d.clinic_id === clinic.clinic_id).length,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/clinics/:id - Chi tiết phòng khám
router.get('/:id', async (req, res) => {
  try {
    const clinics = await readCSV('clinics.csv');
    const clinic = clinics.find((c) => c.clinic_id === req.params.id);

    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng khám' });
    }

    const doctors = await readCSV('doctors.csv');
    const clinicDoctors = doctors.filter((d) => d.clinic_id === clinic.clinic_id);

    res.json({ success: true, data: { ...clinic, doctors: clinicDoctors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/clinics - Thêm phòng khám mới (Admin)
router.post('/', async (req, res) => {
  try {
    const { clinic_name, address, district, city, latitude, longitude, phone, image } = req.body;
    if (!clinic_name || !address) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (tên phòng khám, địa chỉ)' });
    }

    const clinics = await readCSV('clinics.csv');
    const ids = clinics.map(c => parseInt(c.clinic_id.replace('C', ''), 10)).filter(num => !isNaN(num));
    const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    const newId = `C${String(nextNum).padStart(3, '0')}`;

    const newClinic = {
      clinic_id: newId,
      clinic_name,
      address,
      district: district || '',
      city: city || '',
      latitude: latitude || '21.0289',
      longitude: longitude || '105.8471',
      phone: phone || '',
      rating: '5.0',
      image: image || 'clinic1',
    };

    await appendRow('clinics.csv', newClinic);
    res.status(201).json({ success: true, message: 'Thêm phòng khám thành công!', data: newClinic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/clinics/:id - Cập nhật phòng khám (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateRow('clinics.csv', 'clinic_id', id, req.body);
    res.json({ success: true, message: 'Cập nhật phòng khám thành công!', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/clinics/:id - Xóa phòng khám (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRow('clinics.csv', 'clinic_id', id);
    res.json({ success: true, message: 'Xóa phòng khám thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
