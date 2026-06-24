# 🏥 HealthBook - Ứng dụng đặt lịch khám sức khỏe trực tuyến

Nền tảng đặt lịch khám sức khỏe hiện đại, được xây dựng theo phong cách BookingCare, Doctor Anywhere và Hello Bacsi.

## 🚀 Khởi động ứng dụng

### 1. Chạy Backend (Node.js + Express)

```bash
cd healthbook/backend
npm install
npm run dev
# Server chạy tại: http://localhost:5000
```

### 2. Chạy Frontend (React + Vite)

```bash
cd healthbook/frontend
npm install
npm run dev
# App chạy tại: http://localhost:5173
```

## 📱 Các trang & tính năng

| Trang | URL | Tính năng |
|-------|-----|-----------|
| Trang chủ | `/` | Hero, chuyên khoa, bác sĩ nổi bật, CTA |
| Bác sĩ | `/doctors` | Tìm bác sĩ, lọc chuyên khoa, tìm theo triệu chứng |
| Chi tiết bác sĩ | `/doctors/:id` | Hồ sơ, kinh nghiệm, phòng khám |
| Phòng khám | `/clinics` | Danh sách + tìm phòng khám gần nhất (GPS/tọa độ) |
| Chi tiết PK | `/clinics/:id` | Thông tin + danh sách bác sĩ |
| Đặt lịch | `/booking` or `/booking/:doctorId` | 4 bước đặt lịch, kiểm tra trùng |
| Lịch của tôi | `/my-appointments` | Tra cứu, xem, hủy lịch theo email |
| Admin | `/admin` | Dashboard thống kê, biểu đồ, quản lý tất cả lịch hẹn |

## 🛠 Công nghệ

- **Frontend**: React 19 + Vite + TailwindCSS v4 + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: CSV File Storage (doctors.csv, clinics.csv, appointments.csv)
- **Email**: NodeMailer (Ethereal test email)
- **Charts**: Recharts

## 🔑 API Endpoints

| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/clinics` | Tất cả phòng khám |
| GET | `/api/clinics/nearby?lat=&lng=` | Phòng khám gần nhất (Haversine) |
| GET | `/api/doctors` | Tất cả bác sĩ (lọc theo chuyên khoa, tên) |
| GET | `/api/doctors/suggest?symptoms=` | Gợi ý chuyên khoa từ triệu chứng |
| GET | `/api/appointments/slots?doctor_id=&date=` | Giờ trống của bác sĩ |
| POST | `/api/appointments` | Đặt lịch mới (kiểm tra trùng) |
| PUT | `/api/appointments/:id` | Cập nhật lịch |
| DELETE | `/api/appointments/:id` | Hủy lịch |
| GET | `/api/admin/stats` | Thống kê tổng quát |
| GET | `/api/admin/appointments-by-date` | Biểu đồ theo ngày |
| GET | `/api/admin/specialty-stats` | Biểu đồ chuyên khoa |

## 📧 Email nhắc lịch tự động

Hệ thống tự động kiểm tra mỗi 30 phút và gửi email:
- **Trước 24 giờ**: Nhắc lịch khám ngày mai
- **Trước 1 giờ**: Nhắc lịch khám sắp tới

Email được gửi qua NodeMailer. Trong môi trường dev, dùng Ethereal (email test). Link preview email được trả về trong response API.

## 📊 Dữ liệu mẫu

- **10 phòng khám** trên cả nước (Hà Nội + TP.HCM)
- **20 bác sĩ** thuộc 17 chuyên khoa
- **5 lịch hẹn mẫu** sẵn có

## 🎨 Thiết kế

- Dark Mode / Light Mode
- Responsive (Mobile 375px → Desktop 1440px+)
- Framer Motion animations
- Skeleton loading states
- Glassmorphism effects
