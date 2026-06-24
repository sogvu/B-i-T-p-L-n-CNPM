import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Heart, Shield, Edit2, Check,
  Activity, Scale, Ruler, Award, RefreshCw, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentsApi } from '../services/api';
import profile3d from '../assets/3d_profile.png';
import { useAuth } from '../context/AuthContext';

const DEFAULT_PROFILE = {
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@gmail.com',
  phone: '0987654321',
  dob: '1995-10-15',
  gender: 'Nam',
  address: 'Hai Bà Trưng, Hà Nội',
  bloodType: 'O+',
  height: 172,
  weight: 65,
  bloodPressure: '120/80',
  heartRate: 75,
  allergies: 'Không dị ứng'
};

export default function PatientProfilePage() {
  const { user } = useAuth();

  if (!user || user.role !== 'patient') {
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
            width: 72, height: 72, borderRadius: '50%', background: 'rgba(37,99,235,0.1)',
            color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <User size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Yêu Cầu Đăng Nhập
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Vui lòng đăng nhập với tài khoản Bệnh nhân để xem hồ sơ bệnh án, chỉ số cơ thể BMI, huyết áp và quản lý lịch hẹn khám của bạn.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/" className="btn-secondary" style={{ padding: '12px 20px', fontSize: '0.85rem' }}>
              Quay lại Trang chủ
            </Link>
            <Link to="/login" className="btn-primary" style={{ padding: '12px 20px', fontSize: '0.85rem' }}>
              Đăng nhập ngay
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(DEFAULT_PROFILE);
  const [appointments, setAppointments] = useState([]);
  const [loadingApts, setLoadingApts] = useState(false);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'history'

  // Load from local storage and fetch appointments
  useEffect(() => {
    const saved = localStorage.getItem('hb_patient_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setEditForm(parsed);
      } catch (e) {}
    }
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoadingApts(true);
    try {
      const res = await appointmentsApi.getAll({ email: profile.email });
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApts(false);
    }
  }

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(editForm);
    localStorage.setItem('hb_patient_profile', JSON.stringify(editForm));
    setIsEditing(false);
    toast.success('Cập nhật hồ sơ thành công!');
    // Reload appointments in case email changed
    appointmentsApi.getAll({ email: editForm.email })
      .then(res => {
        if (res.success) setAppointments(res.data);
      });
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  // BMI Calculation
  const heightInMeters = profile.height / 100;
  const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  
  let bmiCategory = 'Bình thường';
  let bmiColor = '#10b981'; // green
  if (bmi < 18.5) {
    bmiCategory = 'Thiếu cân';
    bmiColor = '#3b82f6'; // blue
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = 'Thừa cân';
    bmiColor = '#f59e0b'; // orange
  } else if (bmi >= 30) {
    bmiCategory = 'Béo phì';
    bmiColor = '#ef4444'; // red
  }

  return (
    <div style={{ padding: '2rem 1.5rem', minHeight: '85vh', background: 'var(--color-bg)' }}>
      <div className="container">
        
        {/* Header Block */}
        <div style={{
          background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
          borderRadius: '24px', padding: '2.5rem', color: 'white',
          position: 'relative', overflow: 'hidden', marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(13, 148, 136, 0.2)'
        }}>
          <div style={{
            position: 'absolute', width: '200px', height: '200px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
            top: '-50px', right: '-50px', filter: 'blur(30px)'
          }} />
          
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)', padding: '5px 12px',
                borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                display: 'inline-block', marginBottom: '0.75rem'
              }}>
                Hồ Sơ Sức Khỏe Cá Nhân
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                Xin chào, {profile.fullName}!
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
                Mã bệnh nhân: <strong style={{ color: '#2dd4bf' }}>HB-{profile.phone.slice(-4)}</strong> • Theo dõi và quản lý chỉ số sinh học của bạn.
              </p>
            </div>
            <div style={{ display: 'none' }} className="hero-3d-wrapper">
              <img src={profile3d} alt="Profile 3D" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }} className="profile-grid">
          
          {/* LEFT: DEMOGRAPHICS CARD */}
          <div style={{
            background: 'var(--color-card)', border: '1px solid var(--color-border)',
            borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Thông tin cá nhân</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700
                  }}
                >
                  <Edit2 size={14} /> Sửa
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Họ và tên</label>
                  <input
                    className="input"
                    value={editForm.fullName}
                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Ngày sinh</label>
                    <input
                      type="date"
                      className="input"
                      value={editForm.dob}
                      onChange={e => setEditForm({ ...editForm, dob: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Giới tính</label>
                    <select
                      className="input"
                      value={editForm.gender}
                      onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                      <option>Nam</option>
                      <option>Nữ</option>
                      <option>Khác</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Email nhận nhắc lịch</label>
                  <input
                    type="email"
                    className="input"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Số điện thoại</label>
                  <input
                    className="input"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Địa chỉ</label>
                  <input
                    className="input"
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Chiều cao (cm)</label>
                    <input
                      type="number"
                      className="input"
                      value={editForm.height}
                      onChange={e => setEditForm({ ...editForm, height: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Cân nặng (kg)</label>
                    <input
                      type="number"
                      className="input"
                      value={editForm.weight}
                      onChange={e => setEditForm({ ...editForm, weight: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                  <button type="button" onClick={handleCancel} className="btn-secondary" style={{ flex: 1, padding: '10px' }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px', background: '#0d9488', borderColor: '#0d9488', gap: '6px' }}>
                    <Check size={16} /> Lưu lại
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(13,148,136,0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Giới tính & Tuổi</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{profile.gender} • {new Date().getFullYear() - new Date(profile.dob).getFullYear()} tuổi</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(13,148,136,0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Email liên hệ</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', wordBreak: 'break-all' }}>{profile.email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(13,148,136,0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Số điện thoại</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{profile.phone}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(13,148,136,0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Địa chỉ</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{profile.address}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: TABBED BODY STATS & HISTORY */}
          <div>
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setActiveTab('stats')}
                style={{
                  padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  fontWeight: 800, fontSize: '1rem',
                  color: activeTab === 'stats' ? '#0d9488' : 'var(--color-text-muted)',
                  borderBottom: activeTab === 'stats' ? '3px solid #0d9488' : 'none'
                }}
              >
                Chỉ số sức khỏe
              </button>
              <button
                onClick={() => setActiveTab('history')}
                style={{
                  padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  fontWeight: 800, fontSize: '1rem',
                  color: activeTab === 'history' ? '#0d9488' : 'var(--color-text-muted)',
                  borderBottom: activeTab === 'history' ? '3px solid #0d9488' : 'none'
                }}
              >
                Lịch sử đặt khám ({appointments.length})
              </button>
            </div>

            {/* TAB CONTENT: STATS */}
            {activeTab === 'stats' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Body indices grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  
                  {/* BMI Card */}
                  <div style={{
                    padding: '1.25rem', borderRadius: '16px', background: 'var(--color-card)',
                    border: '1.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Chỉ số BMI</span>
                      <Activity size={18} color={bmiColor} />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: bmiColor }}>{bmi}</div>
                    <span style={{
                      display: 'inline-block', alignSelf: 'flex-start',
                      background: `${bmiColor}15`, color: bmiColor, padding: '3px 10px',
                      borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800
                    }}>
                      {bmiCategory}
                    </span>
                  </div>

                  {/* Height */}
                  <div style={{
                    padding: '1.25rem', borderRadius: '16px', background: 'var(--color-card)',
                    border: '1.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Chiều cao</span>
                      <Ruler size={18} color="#0d9488" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)' }}>{profile.height} cm</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Cập nhật lần cuối: Hôm nay</span>
                  </div>

                  {/* Weight */}
                  <div style={{
                    padding: '1.25rem', borderRadius: '16px', background: 'var(--color-card)',
                    border: '1.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Cân nặng</span>
                      <Scale size={18} color="#0d9488" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)' }}>{profile.weight} kg</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Cân nặng lý tưởng: 60-70kg</span>
                  </div>
                  
                  {/* Blood Type */}
                  <div style={{
                    padding: '1.25rem', borderRadius: '16px', background: 'var(--color-card)',
                    border: '1.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Nhóm máu</span>
                      <Award size={18} color="#ef4444" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ef4444' }}>{profile.bloodType}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Nhóm máu hiếm/phổ biến</span>
                  </div>

                </div>

                {/* Additional Clinical Indices */}
                <div style={{
                  background: 'var(--color-card)', border: '1px solid var(--color-border)',
                  borderRadius: '16px', padding: '1.5rem'
                }}>
                  <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem' }}>Chỉ số lâm sàng định kỳ</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Huyết áp trung bình</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', marginTop: '4px' }}>{profile.bloodPressure} mmHg</div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>✓ Mức huyết áp bình thường</div>
                    </div>
                    
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Nhịp tim lúc nghỉ</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', marginTop: '4px' }}>{profile.heartRate} bpm</div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>✓ Nhịp tim khỏe mạnh</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>Tiền sử dị ứng & bệnh nền</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', marginTop: '4px', fontWeight: 600 }}>{profile.allergies}</p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: APPOINTMENT HISTORY */}
            {activeTab === 'history' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>Các cuộc hẹn liên kết với email: {profile.email}</h4>
                  <button onClick={loadAppointments} style={{ background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                    <RefreshCw size={12} /> Làm mới
                  </button>
                </div>

                {loadingApts ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[1, 2].map(i => (
                      <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
                    ))}
                  </div>
                ) : appointments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '16px', color: 'var(--color-text-muted)' }}>
                    <p style={{ marginBottom: '1rem' }}>Không tìm thấy cuộc hẹn nào liên quan đến địa chỉ email này.</p>
                    <Link to="/booking" className="btn-primary" style={{ display: 'inline-flex', padding: '8px 16px', fontSize: '0.85rem' }}>Đặt lịch khám đầu tiên</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {appointments.map((apt) => {
                      const isPast = new Date(`${apt.appointment_date}T${apt.appointment_time}`) < new Date();
                      
                      return (
                        <div
                          key={apt.appointment_id}
                          style={{
                            background: 'var(--color-card)', border: '1.5px solid var(--color-border)',
                            borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                                MÃ LỊCH HẸN: {apt.appointment_id}
                              </span>
                              <h5 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginTop: '2px' }}>
                                Bác sĩ khám: {apt.doctor_name || `Bác sĩ ID: ${apt.doctor_id}`}
                              </h5>
                              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                Phòng khám: {apt.clinic_name || 'Phòng khám đa khoa HealthBook'}
                              </p>
                            </div>
                            
                            <span style={{
                              background: apt.status === 'confirmed' ? 'rgba(16,185,129,0.12)' : apt.status === 'cancelled' ? 'rgba(239,68,68,0.12)' : 'rgba(148,163,184,0.12)',
                              color: apt.status === 'confirmed' ? '#10b981' : apt.status === 'cancelled' ? '#ef4444' : '#64748b',
                              padding: '4px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase'
                            }}>
                              {apt.status === 'confirmed' ? 'Đã xác nhận' : apt.status === 'cancelled' ? 'Đã hủy' : apt.status}
                            </span>
                          </div>

                          <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                            padding: '10px 12px', background: 'var(--color-bg)', borderRadius: '10px', fontSize: '0.8rem'
                          }}>
                            <div>
                              <span style={{ color: 'var(--color-text-muted)' }}>Thời gian:</span>
                              <strong style={{ color: 'var(--color-text)', marginLeft: '5px' }}>{apt.appointment_time}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--color-text-muted)' }}>Ngày khám:</span>
                              <strong style={{ color: 'var(--color-text)', marginLeft: '5px' }}>{apt.appointment_date}</strong>
                            </div>
                          </div>

                          {/* Diagnosis/Notes */}
                          {isPast && apt.status === 'confirmed' && (
                            <div style={{
                              padding: '8px 12px', background: 'rgba(13,148,136,0.05)',
                              borderLeft: '3px solid #0d9488', borderRadius: '4px', fontSize: '0.8rem', marginTop: '4px'
                            }}>
                              <span style={{ fontWeight: 700, color: '#0d9488' }}>Chẩn đoán sơ bộ: </span>
                              <span style={{ color: 'var(--color-text)' }}>Sức khỏe bình thường. Cần theo dõi thêm và tái khám định kỳ.</span>
                            </div>
                          )}

                          {/* Rating review action */}
                          {isPast && apt.status === 'confirmed' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                              <Link
                                to={`/reviews/${apt.doctor_id}?name=${encodeURIComponent(apt.doctor_name || 'Bác sĩ')}`}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px', display: 'flex', alignItems: 'center' }}
                              >
                                <Star size={12} fill="#fbbf24" color="#fbbf24" /> Đánh giá bác sĩ
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      <style>{`
        @media (min-width: 600px) {
          .hero-3d-wrapper { display: block !important; }
        }
        @media (max-width: 800px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
