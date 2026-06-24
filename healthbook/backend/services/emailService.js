const nodemailer = require('nodemailer');

/**
 * Tạo Ethereal test account (không cần cấu hình SMTP thật)
 * Xem email tại https://ethereal.email
 */
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  try {
    // Tạo test account Ethereal
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('📧 Email service ready - Ethereal test account:', testAccount.user);
    console.log('📧 View emails at: https://ethereal.email');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    return null;
  }
}

/**
 * Tạo HTML email template nhắc lịch
 */
function createReminderEmailHTML(appointment, doctor, clinic) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563EB 0%, #1e40af 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; color: #1e293b; margin-bottom: 16px; }
    .card { background: #f8faff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 20px 0; }
    .card-row { display: flex; margin-bottom: 12px; }
    .card-label { color: #64748b; font-size: 13px; font-weight: 600; width: 140px; flex-shrink: 0; }
    .card-value { color: #1e293b; font-size: 14px; font-weight: 500; }
    .highlight { background: linear-gradient(135deg, #2563EB, #7c3aed); color: white; border-radius: 8px; padding: 3px 10px; display: inline-block; }
    .footer { background: #f8faff; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
    .logo { font-size: 20px; font-weight: 800; color: white; }
    .logo span { color: #93c5fd; }
    .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 16px; }
    .note p { margin: 0; color: #92400e; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Health<span>Book</span></div>
      <h1>🗓️ Nhắc Nhở Lịch Khám</h1>
      <p>Hệ thống đặt lịch khám bệnh trực tuyến</p>
    </div>
    <div class="body">
      <p class="greeting">Xin chào <strong>${appointment.patient_name}</strong>,</p>
      <p style="color:#475569; font-size:15px;">Bạn có lịch khám bệnh sắp tới. Vui lòng đến đúng giờ để được phục vụ tốt nhất.</p>
      
      <div class="card">
        <div class="card-row">
          <span class="card-label">👨‍⚕️ Bác sĩ</span>
          <span class="card-value"><strong>${doctor ? doctor.doctor_name : 'N/A'}</strong></span>
        </div>
        <div class="card-row">
          <span class="card-label">🏥 Phòng khám</span>
          <span class="card-value">${clinic ? clinic.clinic_name : 'N/A'}</span>
        </div>
        <div class="card-row">
          <span class="card-label">📍 Địa chỉ</span>
          <span class="card-value">${clinic ? `${clinic.address}, ${clinic.district}, ${clinic.city}` : 'N/A'}</span>
        </div>
        <div class="card-row">
          <span class="card-label">📅 Ngày khám</span>
          <span class="card-value"><span class="highlight">${appointment.appointment_date}</span></span>
        </div>
        <div class="card-row">
          <span class="card-label">🕐 Giờ khám</span>
          <span class="card-value"><span class="highlight">${appointment.appointment_time}</span></span>
        </div>
        <div class="card-row">
          <span class="card-label">📋 Mã lịch hẹn</span>
          <span class="card-value" style="color:#6366f1;font-weight:700;">${appointment.appointment_id}</span>
        </div>
      </div>

      <div class="note">
        <p>💡 <strong>Lưu ý:</strong> Hãy mang theo CMND/CCCD và các kết quả xét nghiệm trước đây (nếu có). Đến trước giờ hẹn 15 phút để làm thủ tục.</p>
      </div>
    </div>
    <div class="footer">
      <p>Email này được gửi tự động từ hệ thống <strong>HealthBook</strong></p>
      <p>Nếu bạn cần hủy hoặc đổi lịch, vui lòng truy cập website hoặc gọi hotline: <strong>1800-1234</strong></p>
      <p style="margin-top:12px;color:#cbd5e1;">© 2026 HealthBook. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Gửi email nhắc lịch
 */
async function sendReminderEmail(appointment, doctor, clinic, reminderType) {
  const transport = await getTransporter();
  if (!transport) {
    console.log('⚠️ Email transporter not available, skipping...');
    return null;
  }

  const subject = reminderType === '24h'
    ? `[HealthBook] Nhắc lịch khám ngày mai - ${appointment.appointment_date}`
    : `[HealthBook] Lịch khám của bạn sau 1 giờ nữa!`;

  try {
    const info = await transport.sendMail({
      from: '"HealthBook 🏥" <noreply@healthbook.vn>',
      to: appointment.patient_email,
      subject,
      html: createReminderEmailHTML(appointment, doctor, clinic),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`✅ Email sent to ${appointment.patient_email}: ${previewUrl}`);
    return { messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return null;
  }
}

/**
 * Gửi email xác nhận đặt lịch
 */
async function sendConfirmationEmail(appointment, doctor, clinic) {
  const transport = await getTransporter();
  if (!transport) return null;

  const confirmHTML = createReminderEmailHTML(appointment, doctor, clinic).replace(
    '🗓️ Nhắc Nhở Lịch Khám',
    '✅ Đặt Lịch Thành Công'
  );

  try {
    const info = await transport.sendMail({
      from: '"HealthBook 🏥" <noreply@healthbook.vn>',
      to: appointment.patient_email,
      subject: `[HealthBook] Xác nhận đặt lịch khám - ${appointment.appointment_id}`,
      html: confirmHTML,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`✅ Confirmation email sent: ${previewUrl}`);
    return { messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('❌ Confirmation email error:', error);
    return null;
  }
}

/**
 * Gửi email chào mừng khi đăng ký tài khoản thành công
 */
async function sendWelcomeEmail(email, fullName) {
  const transport = await getTransporter();
  if (!transport) return null;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563EB 0%, #1e40af 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; color: #1e293b; margin-bottom: 16px; }
    .logo { font-size: 20px; font-weight: 800; color: white; }
    .logo span { color: #93c5fd; }
    .footer { background: #f8faff; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Health<span>Book</span></div>
      <h1>👋 Chào mừng bạn mới!</h1>
    </div>
    <div class="body">
      <p class="greeting">Xin chào <strong>${fullName}</strong>,</p>
      <p style="color:#475569; font-size:15px; line-height: 1.6;">
        Chào mừng bạn đã đăng ký tài khoản thành công tại <strong>HealthBook Plus</strong> - Nền tảng đặt lịch khám sức khỏe trực tuyến thông minh.
      </p>
      <p style="color:#475569; font-size:15px; line-height: 1.6;">
        Tài khoản của bạn đã sẵn sàng hoạt động. Bây giờ bạn có thể dễ dàng tìm kiếm bác sĩ chuyên khoa, đặt lịch hẹn khám sức khỏe, và quản lý lịch hẹn trực tuyến nhanh chóng.
      </p>
      <p style="color:#475569; font-size:15px; line-height: 1.6;">
        Chúc bạn có nhiều trải nghiệm chăm sóc sức khỏe tuyệt vời cùng HealthBook!
      </p>
    </div>
    <div class="footer">
      <p>Email này được gửi tự động từ hệ thống <strong>HealthBook</strong></p>
      <p>Nếu bạn có thắc mắc, vui lòng liên hệ hotline: <strong>1900-1234</strong></p>
      <p style="margin-top:12px;color:#cbd5e1;">© 2026 HealthBook. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transport.sendMail({
      from: '"HealthBook 🏥" <noreply@healthbook.vn>',
      to: email,
      subject: `[HealthBook] Đăng ký tài khoản thành công - Chào mừng ${fullName}!`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`✅ Welcome email sent to ${email}: ${previewUrl}`);
    return { messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return null;
  }
}

module.exports = { sendReminderEmail, sendConfirmationEmail, sendWelcomeEmail, getTransporter };
