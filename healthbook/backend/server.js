const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

// Manual env-file parser
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0]?.trim();
      const value = parts.slice(1).join('=').trim();
      if (key) process.env[key] = value;
    }
  });
}

const clinicsRouter = require('./routes/clinics');
const doctorsRouter = require('./routes/doctors');
const appointmentsRouter = require('./routes/appointments');
const adminRouter = require('./routes/admin');
const chatbotRouter = require('./routes/chatbot');
const { readCSV } = require('./services/csvService');
const { sendReminderEmail, sendWelcomeEmail } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

// ================================
// Middleware
// ================================
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'https://sogvu.github.io'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString('vi-VN');
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ================================
// Routes
// ================================
app.use('/api/clinics', clinicsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chatbot', chatbotRouter);

// Route gửi email đăng ký tài khoản thành công
app.post('/api/auth/register-email', async (req, res) => {
  const { email, fullName } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ success: false, message: 'Thiếu email hoặc tên đầy đủ' });
  }

  try {
    const emailResult = await sendWelcomeEmail(email, fullName);
    res.json({
      success: true,
      message: 'Gửi email chào mừng thành công!',
      previewUrl: emailResult?.previewUrl || null
    });
  } catch (err) {
    console.error('❌ Lỗi gửi email chào mừng:', err);
    res.status(500).json({ success: false, message: 'Không thể gửi email chào mừng' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HealthBook API đang hoạt động',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} không tồn tại` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
});

// ================================
// Cron Job: Nhắc lịch tự động
// ================================

async function checkAndSendReminders() {
  try {
    const appointments = await readCSV('appointments.csv');
    const doctors = await readCSV('doctors.csv');
    const clinics = await readCSV('clinics.csv');

    const now = new Date();

    for (const apt of appointments) {
      if (apt.status === 'cancelled' || !apt.appointment_date || !apt.appointment_time) continue;

      const aptDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}:00`);
      const diffMs = aptDateTime - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      const doctor = doctors.find((d) => d.doctor_id === apt.doctor_id);
      const clinic = clinics.find((c) => c.clinic_id === apt.clinic_id);

      // Nhắc lịch trước 24 giờ (23.5h - 24.5h)
      if (diffHours >= 23.5 && diffHours <= 24.5) {
        console.log(`📧 Sending 24h reminder for appointment ${apt.appointment_id}`);
        await sendReminderEmail(apt, doctor, clinic, '24h');
      }

      // Nhắc lịch trước 1 giờ (0.75h - 1.25h)
      if (diffHours >= 0.75 && diffHours <= 1.25) {
        console.log(`📧 Sending 1h reminder for appointment ${apt.appointment_id}`);
        await sendReminderEmail(apt, doctor, clinic, '1h');
      }
    }
  } catch (error) {
    console.error('❌ Cron job error:', error);
  }
}

// Chạy mỗi 30 phút
cron.schedule('*/30 * * * *', () => {
  console.log('⏰ Running appointment reminder check...');
  checkAndSendReminders();
});

// ================================
// Start Server
// ================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║       🏥 HealthBook API Server        ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  ✅ Running on: http://localhost:${PORT}  ║`);
  console.log('║  📊 Admin:    /api/admin/stats        ║');
  console.log('║  👨‍⚕️  Doctors:  /api/doctors           ║');
  console.log('║  🏥 Clinics:  /api/clinics            ║');
  console.log('║  📅 Booking:  /api/appointments       ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
