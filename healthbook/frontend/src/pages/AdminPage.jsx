import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Calendar, Users, Building2, CheckCircle, XCircle, Clock,
  TrendingUp, Activity, Search, RefreshCw, ChevronDown,
  LayoutDashboard, UserX, UserCheck, Trash2, Edit3, Plus, Phone, Mail,
  MapPin, Heart, Info, Clipboard, Settings, CalendarDays
} from 'lucide-react';
import { adminApi, doctorsApi, clinicsApi, appointmentsApi } from '../services/api';
import { getDoctorAvatar } from '../utils/avatarHelper';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  confirmed: '#10b981',
  pending: '#f59e0b',
  cancelled: '#ef4444',
};

const PIE_COLORS = ['#2563EB', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9', '#f97316', '#ec4899'];

// Import các ảnh phòng khám tương tự ClinicsPage
import clinic1 from '../assets/clinic1.png';
import hospital2 from '../assets/hospital2.png';
import hospital3 from '../assets/hospital3.png';
import clinic4 from '../assets/clinic4.png';
import hospital5 from '../assets/hospital5.png';
import clinic6 from '../assets/clinic6.png';

const CLINIC_IMAGE_MAP = {
  hospital1: hospital3,
  clinic2: clinic1,
  hospital3: hospital3,
  clinic4: clinic4,
  hospital5: hospital5,
  clinic6: clinic6,
};

export default function AdminPage() {
  const { user } = useAuth();

  // Kiểm tra phân quyền truy cập
  if (!user || user.role !== 'admin') {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem', background: 'var(--color-bg)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'var(--color-card)', border: '1px solid var(--color-border)',
            borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center',
            maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.1)',
            color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <XCircle size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Quyền Truy Cập Bị Từ Chối!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Bạn không có quyền truy cập vào trang quản trị của HealthBook. Vui lòng đăng nhập với tài khoản Admin để có quyền quản lý hệ thống.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/" className="btn-secondary" style={{ padding: '12px 20px', fontSize: '0.85rem' }}>
              Quay lại Trang chủ
            </Link>
            <Link to="/login" className="btn-primary" style={{ padding: '12px 20px', fontSize: '0.85rem', background: '#ef4444', borderColor: '#ef4444' }}>
              Đăng nhập Admin
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // State chung
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'appointments' | 'doctors' | 'clinics' | 'patients'
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [specialtyData, setSpecialtyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Lịch hẹn
  const [appointments, setAppointments] = useState([]);
  const [aptLoading, setAptLoading] = useState(true);
  const [aptFilter, setAptFilter] = useState('all');
  const [aptSearch, setAptSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // State CRUD Bác sĩ
  const [allDoctors, setAllDoctors] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [docForm, setDocForm] = useState({
    doctor_name: '',
    specialty: 'Tim mạch',
    clinic_id: '',
    experience: '5',
    email: '',
    phone: '',
    bio: ''
  });

  // State CRUD Phòng khám
  const [allClinics, setAllClinics] = useState([]);
  const [clinicLoading, setClinicLoading] = useState(false);
  const [clinicModalOpen, setClinicModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinicForm, setClinicForm] = useState({
    clinic_name: '',
    address: '',
    district: '',
    city: 'Hà Nội',
    latitude: '21.0289',
    longitude: '105.8471',
    phone: '',
    image: 'clinic2'
  });

  // State Bệnh nhân (LocalStorage)
  const [patients, setPatients] = useState([]);

  // State Modals Phụ
  const [selectedApt, setSelectedApt] = useState(null);
  const [aptDetailsOpen, setAptDetailsOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Load ban đầu
  useEffect(() => {
    loadAllStats();
    loadAllDoctorsAndClinics();
    loadPatients();
  }, []);

  // Gọi API cụ thể khi đổi Tab
  useEffect(() => {
    if (activeTab === 'stats') {
      loadAllStats();
    } else if (activeTab === 'appointments') {
      loadAppointments();
    } else if (activeTab === 'doctors' || activeTab === 'clinics') {
      loadAllDoctorsAndClinics();
    } else if (activeTab === 'patients') {
      loadPatients();
    }
  }, [activeTab, page, aptFilter]);

  // Loader thống kê
  async function loadAllStats() {
    setLoading(true);
    try {
      const [statsRes, chartRes, specialtyRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAppointmentsByDate(),
        adminApi.getSpecialtyStats(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (chartRes.success) setChartData(chartRes.data);
      if (specialtyRes.success) setSpecialtyData(specialtyRes.data);
    } catch {
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  }

  // Loader lịch hẹn
  async function loadAppointments() {
    setAptLoading(true);
    try {
      const params = { page, limit: 10 };
      if (aptFilter !== 'all') params.status = aptFilter;
      if (aptSearch) params.search = aptSearch;
      const res = await adminApi.getAllAppointments(params);
      if (res.success) {
        setAppointments(res.data);
        setPagination(res.pagination);
      }
    } catch {
      toast.error('Không thể tải lịch hẹn');
    } finally {
      setAptLoading(false);
    }
  }

  // Loader bác sĩ & phòng khám
  async function loadAllDoctorsAndClinics() {
    setDocLoading(true);
    setClinicLoading(true);
    try {
      const [docRes, clinicRes] = await Promise.all([
        doctorsApi.getAll(),
        clinicsApi.getAll()
      ]);
      if (docRes.success) setAllDoctors(docRes.data);
      if (clinicRes.success) {
        setAllClinics(clinicRes.data);
        // Tự động điền clinic_id mặc định cho Form bác sĩ nếu trống
        if (clinicRes.data.length > 0 && !docForm.clinic_id) {
          setDocForm(prev => ({ ...prev, clinic_id: clinicRes.data[0].clinic_id }));
        }
      }
    } catch {
      toast.error('Lỗi khi tải danh sách Bác sĩ / Phòng khám');
    } finally {
      setDocLoading(false);
      setClinicLoading(false);
    }
  }

  // Loader tài khoản từ LocalStorage
  function loadPatients() {
    const saved = localStorage.getItem('hb_users');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        setPatients(list.filter(u => u.role !== 'admin'));
      } catch {
        setPatients([]);
      }
    }
  }

  // Thao tác với Lịch hẹn
  async function handleConfirmAppointment(id) {
    try {
      const res = await adminApi.updateAppointment(id, { status: 'confirmed' });
      if (res.success) {
        toast.success('Đã xác nhận lịch hẹn thành công!');
        loadAppointments();
        loadAllStats();
      }
    } catch (e) {
      toast.error(e.message || 'Lỗi khi xác nhận lịch hẹn');
    }
  }

  async function handleCancelAppointment(id) {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;
    try {
      const res = await adminApi.updateAppointment(id, { status: 'cancelled' });
      if (res.success) {
        toast.success('Đã hủy lịch hẹn thành công!');
        loadAppointments();
        loadAllStats();
      }
    } catch (e) {
      toast.error(e.message || 'Lỗi khi hủy lịch hẹn');
    }
  }

  // Lấy giờ khám trống khi đổi ngày ở modal đổi lịch
  async function handleRescheduleDateChange(date) {
    if (!selectedApt) return;
    setRescheduleForm(prev => ({ ...prev, date, time: '' }));
    setLoadingSlots(true);
    try {
      const res = await appointmentsApi.getSlots(selectedApt.doctor_id, date);
      if (res.success) {
        setAvailableSlots(res.data);
      }
    } catch {
      toast.error('Không thể lấy khung giờ trống');
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleSaveReschedule() {
    if (!rescheduleForm.date || !rescheduleForm.time) {
      toast.error('Vui lòng chọn ngày và giờ khám mới');
      return;
    }
    try {
      const res = await adminApi.updateAppointment(selectedApt.appointment_id, {
        appointment_date: rescheduleForm.date,
        appointment_time: rescheduleForm.time
      });
      if (res.success) {
        toast.success('Đổi lịch hẹn thành công!');
        setRescheduleOpen(false);
        loadAppointments();
      }
    } catch (e) {
      toast.error(e.message || 'Lịch hẹn đã trùng hoặc có lỗi xảy ra');
    }
  }

  // Thao tác với Bác sĩ (CRUD)
  function handleOpenDocModal(doc = null) {
    if (doc) {
      setSelectedDoctor(doc);
      setDocForm({
        doctor_name: doc.doctor_name,
        specialty: doc.specialty,
        clinic_id: doc.clinic_id,
        experience: doc.experience,
        email: doc.email,
        phone: doc.phone,
        bio: doc.bio
      });
    } else {
      setSelectedDoctor(null);
      setDocForm({
        doctor_name: '',
        specialty: 'Tim mạch',
        clinic_id: allClinics[0]?.clinic_id || '',
        experience: '5',
        email: '',
        phone: '',
        bio: ''
      });
    }
    setDocModalOpen(true);
  }

  async function handleSaveDoctor(e) {
    e.preventDefault();
    if (!docForm.doctor_name || !docForm.specialty || !docForm.clinic_id) {
      toast.error('Vui lòng điền đủ Tên, Chuyên khoa và Phòng khám');
      return;
    }
    try {
      let res;
      if (selectedDoctor) {
        res = await adminApi.updateDoctor(selectedDoctor.doctor_id, docForm);
      } else {
        res = await adminApi.createDoctor(docForm);
      }
      if (res.success) {
        toast.success(selectedDoctor ? 'Cập nhật bác sĩ thành công!' : 'Thêm bác sĩ thành công!');
        setDocModalOpen(false);
        loadAllDoctorsAndClinics();
        loadAllStats();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu bác sĩ');
    }
  }

  async function handleDeleteDoctor(id) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này khỏi danh sách?')) return;
    try {
      const res = await adminApi.deleteDoctor(id);
      if (res.success) {
        toast.success('Đã xóa bác sĩ thành công!');
        loadAllDoctorsAndClinics();
        loadAllStats();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa bác sĩ');
    }
  }

  // Thao tác với Phòng khám (CRUD)
  function handleOpenClinicModal(clinic = null) {
    if (clinic) {
      setSelectedClinic(clinic);
      setClinicForm({
        clinic_name: clinic.clinic_name,
        address: clinic.address,
        district: clinic.district,
        city: clinic.city,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        phone: clinic.phone,
        image: clinic.image
      });
    } else {
      setSelectedClinic(null);
      setClinicForm({
        clinic_name: '',
        address: '',
        district: '',
        city: 'Hà Nội',
        latitude: '21.0289',
        longitude: '105.8471',
        phone: '',
        image: 'clinic2'
      });
    }
    setClinicModalOpen(true);
  }

  async function handleSaveClinic(e) {
    e.preventDefault();
    if (!clinicForm.clinic_name || !clinicForm.address) {
      toast.error('Tên phòng khám và Địa chỉ không được để trống');
      return;
    }
    try {
      let res;
      if (selectedClinic) {
        res = await adminApi.updateClinic(selectedClinic.clinic_id, clinicForm);
      } else {
        res = await adminApi.createClinic(clinicForm);
      }
      if (res.success) {
        toast.success(selectedClinic ? 'Cập nhật phòng khám thành công!' : 'Thêm phòng khám thành công!');
        setClinicModalOpen(false);
        loadAllDoctorsAndClinics();
        loadAllStats();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu phòng khám');
    }
  }

  async function handleDeleteClinic(id) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng khám này? Tất cả bác sĩ thuộc phòng khám cũng sẽ bị ảnh hưởng.')) return;
    try {
      const res = await adminApi.deleteClinic(id);
      if (res.success) {
        toast.success('Đã xóa phòng khám thành công!');
        loadAllDoctorsAndClinics();
        loadAllStats();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa phòng khám');
    }
  }

  // Xóa tài khoản bệnh nhân
  function handleDeletePatient(email) {
    if (!window.confirm(`Xác nhận xóa vĩnh viễn tài khoản bệnh nhân có email: ${email}?`)) return;
    const saved = localStorage.getItem('hb_users');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        const filtered = list.filter(u => u.email !== email);
        localStorage.setItem('hb_users', JSON.stringify(filtered));
        toast.success('Đã xóa tài khoản bệnh nhân khỏi LocalStorage');
        loadPatients();
      } catch {
        toast.error('Lỗi khi xóa tài khoản');
      }
    }
  }

  // Xem chi tiết lịch hẹn
  function handleOpenDetails(apt) {
    setSelectedApt(apt);
    // Tìm hồ sơ sức khỏe trong LocalStorage
    const savedUsers = JSON.parse(localStorage.getItem('hb_users') || '[]');
    const profile = savedUsers.find(u => u.email.toLowerCase() === apt.patient_email.toLowerCase());
    setSelectedApt(prev => ({ ...prev, profile }));
    setAptDetailsOpen(true);
  }

  const STAT_CARDS = stats ? [
    { label: 'Tổng lịch hẹn', value: stats.totalAppointments, icon: Calendar, color: '#2563EB', bg: '#eff6ff', trend: '+12%' },
    { label: 'Đã xác nhận', value: stats.confirmedAppointments, icon: CheckCircle, color: '#10b981', bg: '#ecfdf5', trend: '+8%' },
    { label: 'Tổng bác sĩ', value: stats.totalDoctors, icon: Users, color: '#8b5cf6', bg: '#f5f3ff', trend: `+${allDoctors.length - 20 || 0}` },
    { label: 'Phòng khám', value: stats.totalClinics, icon: Building2, color: '#f59e0b', bg: '#fffbeb', trend: 'Ổn định' },
  ] : [];

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #2563EB, #4f46e5)',
        padding: '2.5rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                Hệ Thống Quản Trị
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                Quản lý bác sĩ, phòng khám, lịch hẹn và bệnh nhân của HealthBook
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => {
                loadAllStats();
                loadAllDoctorsAndClinics();
                loadAppointments();
                loadPatients();
                toast.success('Đã cập nhật dữ liệu mới nhất!');
              }} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'white', cursor: 'pointer', fontWeight: 600,
                fontSize: '0.875rem',
              }}>
                <RefreshCw size={16} /> Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          {/* LEFT SIDEBAR: TAB NAVIGATION */}
          <div style={{ flex: '0 0 240px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
            <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', padding: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Danh mục quản lý
              </div>
              {[
                { id: 'stats', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
                { id: 'appointments', label: 'Quản lý Lịch hẹn', icon: CalendarDays },
                { id: 'doctors', label: 'Quản lý Bác sĩ', icon: Users },
                { id: 'clinics', label: 'Quản lý Phòng khám', icon: Building2 },
                { id: 'patients', label: 'Danh sách Bệnh nhân', icon: UserCheck }
              ].map(t => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTab(t.id); setPage(1); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px 14px', borderRadius: '10px',
                      border: 'none', background: active ? 'rgba(37,99,235,0.08)' : 'transparent',
                      color: active ? '#2563EB' : 'var(--color-text-muted)',
                      cursor: 'pointer', textAlign: 'left', fontWeight: 600,
                      fontSize: '0.85rem', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--color-bg)';
                        e.currentTarget.style.color = 'var(--color-text)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                      }
                    }}
                  >
                    <Icon size={18} color={active ? '#2563EB' : 'currentColor'} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Profile Widget */}
            <div className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                A
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.fullName || 'Administrator'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>admin@healthbook.vn</div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT WORKSPACE */}
          <div style={{ flex: 1, minWidth: '320px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* ==================== TAB 1: OVERVIEW STATS ==================== */}
                {activeTab === 'stats' && (
                  <div>
                    {/* Stats cards row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                      {loading ? (
                        [...Array(4)].map((_, i) => (
                          <div key={i} className="card" style={{ padding: '1.25rem' }}>
                            <div className="skeleton" style={{ height: 40, width: 40, borderRadius: '10px', marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 28, width: '50%', borderRadius: 6, marginBottom: 8 }} />
                            <div className="skeleton" style={{ height: 14, width: '70%', borderRadius: 4 }} />
                          </div>
                        ))
                      ) : (
                        STAT_CARDS.map(({ label, value, icon: Icon, color, bg, trend }) => (
                          <div key={label} className="card" style={{ padding: '1.25rem', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                              <div style={{ width: 42, height: 42, borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={20} color={color} />
                              </div>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '2px 6px', borderRadius: '6px' }}>
                                {trend}
                              </span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '2px' }}>
                              {value}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)' }}>{label}</div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Charts grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                      {/* Bar chart */}
                      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                          <TrendingUp size={18} color="#2563EB" />
                          <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Biểu đồ lịch hẹn theo ngày</h3>
                        </div>
                        {chartData.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            Chưa có dữ liệu lịch hẹn
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickFormatter={d => d.slice(5)} />
                              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '0.8rem' }} />
                              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Pie chart */}
                      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                          <Activity size={18} color="#8b5cf6" />
                          <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Phân bố chuyên khoa khám</h3>
                        </div>
                        {specialtyData.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            Chưa có dữ liệu chuyên khoa
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                              <Pie
                                data={specialtyData.slice(0, 5)}
                                dataKey="count"
                                nameKey="specialty"
                                cx="50%" cy="50%"
                                outerRadius={80}
                                innerRadius={35}
                                paddingAngle={2}
                              >
                                {specialtyData.slice(0, 5).map((_, idx) => (
                                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '0.8rem' }} />
                              <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Progress ratios */}
                    {stats && (
                      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Tỷ lệ trạng thái lịch hẹn</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {[
                            { label: 'Đã xác nhận', value: stats.confirmedAppointments, color: '#10b981' },
                            { label: 'Chờ xác nhận', value: stats.pendingAppointments, color: '#f59e0b' },
                            { label: 'Đã hủy', value: stats.cancelledAppointments, color: '#ef4444' }
                          ].map(s => {
                            const pct = stats.totalAppointments > 0 ? Math.round((s.value / stats.totalAppointments) * 100) : 0;
                            return (
                              <div key={s.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                                  <span style={{ fontWeight: 600 }}>{s.label} ({s.value})</span>
                                  <span style={{ fontWeight: 700 }}>{pct}%</span>
                                </div>
                                <div style={{ height: 6, borderRadius: '3px', background: 'var(--color-bg)', overflow: 'hidden' }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: '3px' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ==================== TAB 2: APPOINTMENTS MANAGEMENT ==================== */}
                {activeTab === 'appointments' && (
                  <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>Danh sách lịch hẹn</h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Filters */}
                        {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
                          <button key={f} onClick={() => { setAptFilter(f); setPage(1); }} style={{
                            padding: '6px 12px', borderRadius: '8px',
                            border: '1px solid',
                            borderColor: aptFilter === f ? '#2563EB' : 'var(--color-border)',
                            background: aptFilter === f ? 'rgba(37,99,235,0.08)' : 'transparent',
                            color: aptFilter === f ? '#2563EB' : 'var(--color-text-muted)',
                            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                            transition: 'all 0.2s',
                          }}>
                            {f === 'all' ? 'Tất cả' : f === 'confirmed' ? 'Đã xác nhận' : f === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                          </button>
                        ))}

                        {/* Search input */}
                        <form onSubmit={e => { e.preventDefault(); setPage(1); loadAppointments(); }} style={{ position: 'relative' }}>
                          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            value={aptSearch}
                            onChange={e => setAptSearch(e.target.value)}
                            placeholder="Tìm bệnh nhân..."
                            style={{
                              padding: '6px 10px 6px 26px',
                              borderRadius: '8px',
                              border: '1px solid var(--color-border)',
                              background: 'var(--color-bg)',
                              color: 'var(--color-text)',
                              fontSize: '0.78rem', outline: 'none',
                            }}
                          />
                        </form>
                      </div>
                    </div>

                    {/* Table list */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg)' }}>
                            {['Mã', 'Bệnh nhân', 'Bác sĩ', 'Phòng khám', 'Ngày & Giờ', 'Trạng thái', 'Hành động'].map(th => (
                              <th key={th} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                {th}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {aptLoading ? (
                            [...Array(5)].map((_, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {[...Array(7)].map((_, j) => (
                                  <td key={j} style={{ padding: '12px' }}>
                                    <div className="skeleton" style={{ height: 16, borderRadius: 4 }} />
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : appointments.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                Không tìm thấy lịch hẹn nào.
                              </td>
                            </tr>
                          ) : (
                            appointments.map(apt => {
                              const label = apt.status === 'confirmed' ? 'Đã xác nhận' : apt.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy';
                              const color = STATUS_COLORS[apt.status] || '#64748b';
                              return (
                                <tr key={apt.appointment_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                  <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 600 }}>{apt.appointment_id}</td>
                                  <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{apt.patient_name}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{apt.patient_email}</div>
                                  </td>
                                  <td style={{ padding: '12px' }}>{apt.doctor?.doctor_name || 'Bác sĩ'}</td>
                                  <td style={{ padding: '12px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {apt.clinic?.clinic_name || 'Phòng khám'}
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: 700 }}>{apt.appointment_time}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{apt.appointment_date}</div>
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                    <span style={{
                                      padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                                      background: `${color}15`, color
                                    }}>
                                      {label}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button onClick={() => handleOpenDetails(apt)} title="Chi tiết" style={{
                                        border: 'none', background: 'transparent', color: '#2563EB', cursor: 'pointer', padding: '4px'
                                      }}>
                                        <Info size={16} />
                                      </button>
                                      {apt.status === 'pending' && (
                                        <button onClick={() => handleConfirmAppointment(apt.appointment_id)} title="Xác nhận" style={{
                                          border: 'none', background: 'transparent', color: '#10b981', cursor: 'pointer', padding: '4px'
                                        }}>
                                          <CheckCircle size={16} />
                                        </button>
                                      )}
                                      {apt.status !== 'cancelled' && (
                                        <>
                                          <button onClick={() => { setSelectedApt(apt); setRescheduleForm({ date: apt.appointment_date, time: apt.appointment_time }); setRescheduleOpen(true); }} title="Đổi ngày/giờ" style={{
                                            border: 'none', background: 'transparent', color: '#f59e0b', cursor: 'pointer', padding: '4px'
                                          }}>
                                            <Edit3 size={16} />
                                          </button>
                                          <button onClick={() => handleCancelAppointment(apt.appointment_id)} title="Hủy lịch" style={{
                                            border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px'
                                          }}>
                                            <XCircle size={16} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem' }}>
                        <div style={{ color: 'var(--color-text-muted)' }}>
                          Hiển thị {Math.min(pagination.total, (page - 1) * 10 + 1)}–{Math.min(pagination.total, page * 10)} / {pagination.total} lịch
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                            padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-card)', cursor: 'pointer'
                          }}>
                            Trước
                          </button>
                          <span style={{ padding: '4px 10px', fontWeight: 700 }}>Trang {page} / {pagination.totalPages}</span>
                          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} style={{
                            padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-card)', cursor: 'pointer'
                          }}>
                            Sau
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ==================== TAB 3: DOCTORS CRUD ==================== */}
                {activeTab === 'doctors' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>Quản lý Bác sĩ ({allDoctors.length})</h3>
                      <button onClick={() => handleOpenDocModal(null)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '10px 16px', borderRadius: '12px', border: 'none',
                        background: '#2563EB', color: 'white', fontWeight: 700,
                        fontSize: '0.82rem', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                      }}>
                        <Plus size={16} /> Thêm Bác sĩ mới
                      </button>
                    </div>

                    {docLoading ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="card" style={{ padding: '1.25rem' }}>
                            <div className="skeleton" style={{ height: 70, width: 70, borderRadius: '50%', margin: '0 auto 12px' }} />
                            <div className="skeleton" style={{ height: 20, width: '70%', borderRadius: 4, margin: '0 auto 8px' }} />
                            <div className="skeleton" style={{ height: 14, width: '50%', borderRadius: 4, margin: '0 auto' }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        {allDoctors.map(doc => {
                          const avatar = getDoctorAvatar(doc.doctor_id);
                          const clinic = allClinics.find(c => c.clinic_id === doc.clinic_id);
                          return (
                            <div key={doc.doctor_id} className="card" style={{
                              padding: '1.25rem', border: '1px solid var(--color-border)',
                              position: 'relative', display: 'flex', flexDirection: 'column',
                              justifyContent: 'space-between', minHeight: '260px',
                            }}>
                              <div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
                                  <img src={avatar} alt={doc.doctor_name} style={{
                                    width: '56px', height: '56px', borderRadius: '12px',
                                    objectFit: 'cover', border: '2px solid rgba(37,99,235,0.1)',
                                  }} />
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text)' }}>{doc.doctor_name}</div>
                                    <span style={{
                                      fontSize: '0.72rem', background: 'rgba(37,99,235,0.08)',
                                      color: '#2563EB', padding: '2px 8px', borderRadius: '6px',
                                      fontWeight: 700, display: 'inline-block', marginTop: '3px'
                                    }}>
                                      {doc.specialty}
                                    </span>
                                  </div>
                                </div>

                                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '1rem' }}>
                                  <div style={{ display: 'flex', gap: '6px' }}><Building2 size={13} /> {clinic?.clinic_name || 'Phòng khám'}</div>
                                  <div style={{ display: 'flex', gap: '6px' }}><Mail size={13} /> {doc.email || 'Chưa cập nhật'}</div>
                                  <div style={{ display: 'flex', gap: '6px' }}><Phone size={13} /> {doc.phone || 'Chưa cập nhật'}</div>
                                </div>
                              </div>

                              <div style={{
                                display: 'flex', gap: '8px', paddingTop: '10px',
                                borderTop: '1px solid var(--color-border)'
                              }}>
                                <button onClick={() => handleOpenDocModal(doc)} style={{
                                  flex: 1, padding: '8px', borderRadius: '8px',
                                  border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                                  color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600,
                                  fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                  transition: 'all 0.2s',
                                }}
                                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2563EB'}
                                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                >
                                  <Edit3 size={13} /> Sửa
                                </button>
                                <button onClick={() => handleDeleteDoctor(doc.doctor_id)} style={{
                                  padding: '8px 12px', borderRadius: '8px',
                                  border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)',
                                  color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.2s',
                                }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ==================== TAB 4: CLINICS CRUD ==================== */}
                {activeTab === 'clinics' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>Quản lý Phòng khám ({allClinics.length})</h3>
                      <button onClick={() => handleOpenClinicModal(null)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '10px 16px', borderRadius: '12px', border: 'none',
                        background: '#10b981', color: 'white', fontWeight: 700,
                        fontSize: '0.82rem', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
                      }}>
                        <Plus size={16} /> Thêm Phòng khám mới
                      </button>
                    </div>

                    {clinicLoading ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="card" style={{ padding: '1.25rem' }}>
                            <div className="skeleton" style={{ height: 120, borderRadius: 10, marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 20, width: '80%', borderRadius: 4 }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        {allClinics.map(clinic => {
                          const img = CLINIC_IMAGE_MAP[clinic.image] || hospital3;
                          return (
                            <div key={clinic.clinic_id} className="card" style={{
                              overflow: 'hidden', border: '1px solid var(--color-border)',
                              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                              minHeight: '290px',
                            }}>
                              <div>
                                <div style={{ height: '130px', overflow: 'hidden', position: 'relative' }}>
                                  <img src={img} alt={clinic.clinic_name} style={{
                                    width: '100%', height: '100%', objectFit: 'cover'
                                  }} />
                                  <div style={{
                                    position: 'absolute', bottom: '10px', left: '10px',
                                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                                    color: 'white', padding: '2px 8px', borderRadius: '4px',
                                    fontSize: '0.7rem', fontWeight: 700
                                  }}>
                                    {clinic.clinic_id}
                                  </div>
                                </div>

                                <div style={{ padding: '1rem' }}>
                                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px', color: 'var(--color-text)' }}>
                                    {clinic.clinic_name}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><MapPin size={12} /> {clinic.address}, {clinic.city}</div>
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><Phone size={12} /> {clinic.phone}</div>
                                  </div>
                                </div>
                              </div>

                              <div style={{
                                display: 'flex', gap: '8px', padding: '1rem',
                                borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)'
                              }}>
                                <button onClick={() => handleOpenClinicModal(clinic)} style={{
                                  flex: 1, padding: '8px', borderRadius: '8px',
                                  border: '1px solid var(--color-border)', background: 'var(--color-card)',
                                  color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600,
                                  fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                }}
                                  onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                >
                                  <Edit3 size={13} /> Sửa
                                </button>
                                <button onClick={() => handleDeleteClinic(clinic.clinic_id)} style={{
                                  padding: '8px 12px', borderRadius: '8px',
                                  border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)',
                                  color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ==================== TAB 5: PATIENTS DIRECTORY ==================== */}
                {activeTab === 'patients' && (
                  <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '1.25rem' }}>Danh sách bệnh nhân đăng ký</h3>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg)' }}>
                            {['Họ và Tên', 'Email', 'Số điện thoại', 'Ngày sinh', 'Giới tính', 'Vai trò', 'Hành động'].map(th => (
                              <th key={th} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                {th}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {patients.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                Chưa có bệnh nhân nào đăng ký trên thiết bị này.
                              </td>
                            </tr>
                          ) : (
                            patients.map(p => (
                              <tr key={p.email} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px', fontWeight: 700 }}>{p.fullName}</td>
                                <td style={{ padding: '12px' }}>{p.email}</td>
                                <td style={{ padding: '12px' }}>{p.phone || 'Chưa cập nhật'}</td>
                                <td style={{ padding: '12px' }}>{p.dob || 'Chưa cập nhật'}</td>
                                <td style={{ padding: '12px' }}>{p.gender === 'male' ? 'Nam' : p.gender === 'female' ? 'Nữ' : 'Khác'}</td>
                                <td style={{ padding: '12px' }}>
                                  <span style={{
                                    padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700,
                                    background: 'rgba(37,99,235,0.08)', color: '#2563EB'
                                  }}>
                                    Bệnh nhân
                                  </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <button onClick={() => handleDeletePatient(p.email)} style={{
                                    border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px'
                                  }} title="Xóa tài khoản">
                                    <UserX size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* 1. Modal Chi tiết lịch hẹn + Chỉ số sinh học */}
      <AnimatePresence>
        {aptDetailsOpen && selectedApt && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem'
          }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px',
                padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.25rem' }}>Chi tiết lịch khám #{selectedApt.appointment_id}</h3>
                <button onClick={() => setAptDetailsOpen(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>×</button>
              </div>

              {/* Thông tin đặt lịch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#2563EB', marginBottom: '8px', textTransform: 'uppercase' }}>Thông tin lịch hẹn</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                    <div><strong>Bác sĩ:</strong> {selectedApt.doctor?.doctor_name}</div>
                    <div><strong>Chuyên khoa:</strong> {selectedApt.doctor?.specialty}</div>
                    <div style={{ gridColumn: 'span 2' }}><strong>Phòng khám:</strong> {selectedApt.clinic?.clinic_name}</div>
                    <div style={{ gridColumn: 'span 2' }}><strong>Địa chỉ:</strong> {selectedApt.clinic?.address}</div>
                    <div><strong>Ngày khám:</strong> {selectedApt.appointment_date}</div>
                    <div><strong>Giờ khám:</strong> {selectedApt.appointment_time}</div>
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#2563EB', marginBottom: '8px', textTransform: 'uppercase' }}>Thông tin liên hệ bệnh nhân</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem' }}>
                    <div><strong>Họ và tên:</strong> {selectedApt.patient_name}</div>
                    <div><strong>Email:</strong> {selectedApt.patient_email}</div>
                    <div><strong>Số điện thoại:</strong> {selectedApt.patient_phone || 'Chưa cung cấp'}</div>
                    <div style={{ marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '6px' }}>
                      <strong>Triệu chứng khai báo:</strong>
                      <p style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                        "{selectedApt.symptoms || 'Không có mô tả triệu chứng'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kết nối với Hồ sơ sức khỏe bệnh nhân thực tế từ LocalStorage */}
                {selectedApt.profile ? (
                  <div className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)', background: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.85rem', color: '#10b981', marginBottom: '10px', textTransform: 'uppercase' }}>
                      <Heart size={14} /> Hồ sơ sức khỏe sinh học liên kết
                    </div>
                    {selectedApt.profile.height || selectedApt.profile.weight ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                        <div><strong>Chiều cao:</strong> {selectedApt.profile.height} cm</div>
                        <div><strong>Cân nặng:</strong> {selectedApt.profile.weight} kg</div>
                        <div><strong>Nhóm máu:</strong> {selectedApt.profile.bloodType || 'Chưa cập nhật'}</div>
                        <div><strong>Dị ứng:</strong> {selectedApt.profile.allergies || 'Không'}</div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <strong>Tiền sử bệnh án:</strong> {selectedApt.profile.medicalHistory || 'Không ghi nhận'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Bệnh nhân chưa cập nhật chỉ số đo sinh học trong Hồ sơ cá nhân.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '0 6px' }}>
                    <Info size={12} /> Bệnh nhân này chưa đăng ký tài khoản trên trình duyệt hiện tại.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAptDetailsOpen(false)} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Đóng</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal Đổi ngày/giờ khám */}
      <AnimatePresence>
        {rescheduleOpen && selectedApt && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem'
          }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px',
                padding: '2rem', maxWidth: '450px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              <h3 style={{ fontWeight: 900, fontSize: '1.15rem', marginBottom: '1rem' }}>Đổi lịch khám bệnh nhân</h3>
              
              <div style={{ fontSize: '0.82rem', marginBottom: '1.25rem', color: 'var(--color-text-muted)' }}>
                Đổi ngày/giờ khám cho bệnh nhân <strong>{selectedApt.patient_name}</strong> với bác sĩ <strong>{selectedApt.doctor?.doctor_name}</strong>.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>Chọn ngày khám mới:</label>
                  <input type="date" value={rescheduleForm.date} min={new Date().toISOString().split('T')[0]}
                    onChange={e => handleRescheduleDateChange(e.target.value)}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)'
                    }}
                  />
                </div>

                {rescheduleForm.date && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>Chọn khung giờ trống:</label>
                    {loadingSlots ? (
                      <div className="skeleton" style={{ height: 40, borderRadius: 10 }} />
                    ) : availableSlots.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>Không có lịch trống cho ngày này. Vui lòng chọn ngày khác.</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {availableSlots.map(slot => (
                          <button key={slot.time} disabled={!slot.available}
                            onClick={() => setRescheduleForm(prev => ({ ...prev, time: slot.time }))}
                            style={{
                              padding: '8px 4px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                              cursor: slot.available ? 'pointer' : 'not-allowed',
                              background: rescheduleForm.time === slot.time ? '#2563EB' : slot.available ? 'var(--color-bg)' : 'rgba(239,68,68,0.05)',
                              color: rescheduleForm.time === slot.time ? 'white' : slot.available ? 'var(--color-text)' : 'var(--color-text-muted)',
                              border: '1px solid',
                              borderColor: rescheduleForm.time === slot.time ? '#2563EB' : 'var(--color-border)',
                              opacity: slot.available ? 1 : 0.4
                            }}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => setRescheduleOpen(false)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Hủy</button>
                <button onClick={handleSaveReschedule} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.82rem' }}>Lưu lịch mới</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Modal Thêm/Sửa Bác sĩ */}
      <AnimatePresence>
        {docModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem'
          }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px',
                padding: '2rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              <h3 style={{ fontWeight: 900, fontSize: '1.15rem', marginBottom: '1.25rem' }}>
                {selectedDoctor ? `Sửa thông tin: ${selectedDoctor.doctor_name}` : 'Thêm bác sĩ mới'}
              </h3>

              <form onSubmit={handleSaveDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Họ và Tên bác sĩ:</label>
                  <input type="text" required value={docForm.doctor_name} onChange={e => setDocForm(prev => ({ ...prev, doctor_name: e.target.value }))}
                    placeholder="VD: TS.BS Nguyễn Văn A"
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Chuyên khoa:</label>
                    <select value={docForm.specialty} onChange={e => setDocForm(prev => ({ ...prev, specialty: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                      }}
                    >
                      {['Tim mạch', 'Da liễu', 'Thần kinh', 'Nhi khoa', 'Tiêu hóa', 'Sản phụ khoa', 'Chỉnh hình', 'Mắt', 'Nội tiết', 'Hô hấp', 'Tiết niệu', 'Tâm thần', 'Ung bướu', 'Tai Mũi Họng', 'Cơ xương khớp', 'Dinh dưỡng'].map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Số năm kinh nghiệm:</label>
                    <input type="number" required value={docForm.experience} onChange={e => setDocForm(prev => ({ ...prev, experience: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Phòng khám trực thuộc:</label>
                  <select value={docForm.clinic_id} onChange={e => setDocForm(prev => ({ ...prev, clinic_id: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                    }}
                  >
                    {allClinics.map(c => (
                      <option key={c.clinic_id} value={c.clinic_id}>{c.clinic_name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Email liên hệ:</label>
                    <input type="email" value={docForm.email} onChange={e => setDocForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="vd: doctor@email.com"
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Số điện thoại:</label>
                    <input type="text" value={docForm.phone} onChange={e => setDocForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="vd: 0912-345-678"
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Tiểu sử & Mô tả:</label>
                  <textarea rows="3" value={docForm.bio} onChange={e => setDocForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Mô tả tóm tắt kinh nghiệm làm việc, học vấn của bác sĩ..."
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px', resize: 'vertical',
                      border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" onClick={() => setDocModalOpen(false)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Hủy</button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.82rem' }}>Lưu bác sĩ</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Modal Thêm/Sửa Phòng khám */}
      <AnimatePresence>
        {clinicModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem'
          }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px',
                padding: '2rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              <h3 style={{ fontWeight: 900, fontSize: '1.15rem', marginBottom: '1.25rem' }}>
                {selectedClinic ? `Sửa thông tin: ${selectedClinic.clinic_name}` : 'Thêm phòng khám mới'}
              </h3>

              <form onSubmit={handleSaveClinic} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Tên phòng khám / Bệnh viện:</label>
                  <input type="text" required value={clinicForm.clinic_name} onChange={e => setClinicForm(prev => ({ ...prev, clinic_name: e.target.value }))}
                    placeholder="vd: Bệnh viện Việt Pháp"
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Địa chỉ:</label>
                  <input type="text" required value={clinicForm.address} onChange={e => setClinicForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="vd: Số 1 Đường Giải Phóng"
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Quận/Huyện:</label>
                    <input type="text" value={clinicForm.district} onChange={e => setClinicForm(prev => ({ ...prev, district: e.target.value }))}
                      placeholder="vd: Đống Đa"
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Thành phố:</label>
                    <select value={clinicForm.city} onChange={e => setClinicForm(prev => ({ ...prev, city: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                      }}
                    >
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Vĩ độ (Latitude):</label>
                    <input type="text" value={clinicForm.latitude} onChange={e => setClinicForm(prev => ({ ...prev, latitude: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Kinh độ (Longitude):</label>
                    <input type="text" value={clinicForm.longitude} onChange={e => setClinicForm(prev => ({ ...prev, longitude: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Số điện thoại hotline:</label>
                    <input type="text" value={clinicForm.phone} onChange={e => setClinicForm(prev => ({ ...prev, phone: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Ảnh đại diện:</label>
                    <select value={clinicForm.image} onChange={e => setClinicForm(prev => ({ ...prev, image: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem'
                      }}
                    >
                      <option value="hospital1">Bệnh viện Đại Nam</option>
                      <option value="clinic2">Phòng khám Medlatec</option>
                      <option value="hospital3">Bệnh viện Bạch Mai</option>
                      <option value="clinic4">Phòng khám Thu Cúc</option>
                      <option value="hospital5">Bệnh viện Việt Đức</option>
                      <option value="clinic6">Phòng khám FV</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" onClick={() => setClinicModalOpen(false)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Hủy</button>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.82rem', background: '#10b981', borderColor: '#10b981' }}>Lưu phòng khám</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
