import axios from 'axios';

// Thay thế URL dưới đây bằng URL Backend của bạn sau khi deploy (ví dụ: trên Render)
const BACKEND_URL = 'https://bai-tap-lon-song-vu.onrender.com';

const api = axios.create({
  baseURL: import.meta.env.PROD ? `${BACKEND_URL}/api` : '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
    return Promise.reject({ message, status: error.response?.status });
  }
);

// Clinics API
export const clinicsApi = {
  getAll: () => api.get('/clinics'),
  getNearby: (lat, lng) => api.get(`/clinics/nearby?lat=${lat}&lng=${lng}`),
  getById: (id) => api.get(`/clinics/${id}`),
};

// Doctors API
export const doctorsApi = {
  getAll: (params) => api.get('/doctors', { params }),
  suggest: (symptoms) => api.get(`/doctors/suggest?symptoms=${encodeURIComponent(symptoms)}`),
  getSpecialties: () => api.get('/doctors/specialties'),
  getById: (id) => api.get(`/doctors/${id}`),
};

// Appointments API
export const appointmentsApi = {
  getAll: (params) => api.get('/appointments', { params }),
  getSlots: (doctorId, date) => api.get(`/appointments/slots?doctor_id=${doctorId}&date=${date}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getAppointmentsByDate: () => api.get('/admin/appointments-by-date'),
  getSpecialtyStats: () => api.get('/admin/specialty-stats'),
  getAllAppointments: (params) => api.get('/admin/all-appointments', { params }),
  
  // Doctors CRUD
  createDoctor: (data) => api.post('/doctors', data),
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),

  // Clinics CRUD
  createClinic: (data) => api.post('/clinics', data),
  updateClinic: (id, data) => api.put(`/clinics/${id}`, data),
  deleteClinic: (id) => api.delete(`/clinics/${id}`),
};

// Chatbot API
export const chatbotApi = {
  chat: (message, history) => api.post('/chatbot/chat', { message, history }),
};

// Auth API
export const authApi = {
  sendRegisterEmail: (data) => api.post('/auth/register-email', data),
};

export default api;
