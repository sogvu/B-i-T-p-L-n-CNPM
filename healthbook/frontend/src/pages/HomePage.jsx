import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Calendar, Star, Users, Building2, ChevronRight,
  Heart, Brain, Eye, Baby, Stethoscope, Bone, Activity, Wind,
  Shield, Clock, CheckCircle, ArrowRight, Zap, Phone
} from 'lucide-react';
import { adminApi, doctorsApi } from '../services/api';
import toast from 'react-hot-toast';
import { getDoctorAvatar } from '../utils/avatarHelper';

// Import images
import heroDoctorImg from '../assets/hero_doctor.png';
import hospital2 from '../assets/hospital2.png';
import hospital3 from '../assets/hospital3.png';
import hospital5 from '../assets/hospital5.png';
import clinic1 from '../assets/clinic1.png';
import doctorTeam from '../assets/doctor_team.png';

// Import 3D Assets
import booking3d from '../assets/3d_booking.png';
import symptom3d from '../assets/3d_symptom.png';
import profile3d from '../assets/3d_profile.png';
import emergency3d from '../assets/3d_emergency.png';


const SPECIALTIES = [
  { name: 'Tim mạch', icon: Heart, color: '#ef4444', bg: '#fef2f2', darkBg: '#3b1111' },
  { name: 'Thần kinh', icon: Brain, color: '#8b5cf6', bg: '#f5f3ff', darkBg: '#2e1b4e' },
  { name: 'Mắt', icon: Eye, color: '#06b6d4', bg: '#ecfeff', darkBg: '#0c2b32' },
  { name: 'Nhi khoa', icon: Baby, color: '#f59e0b', bg: '#fffbeb', darkBg: '#2d2006' },
  { name: 'Nội khoa', icon: Stethoscope, color: '#2563EB', bg: '#eff6ff', darkBg: '#0d2346' },
  { name: 'Chỉnh hình', icon: Bone, color: '#10b981', bg: '#ecfdf5', darkBg: '#0a2b1f' },
  { name: 'Hô hấp', icon: Wind, color: '#0ea5e9', bg: '#f0f9ff', darkBg: '#0c2638' },
  { name: 'Tiêu hóa', icon: Activity, color: '#f97316', bg: '#fff7ed', darkBg: '#2d1a06' },
];

const SYMPTOMS_EXAMPLES = ['Đau ngực', 'Sốt cao', 'Ho kéo dài', 'Đau đầu', 'Nổi mẩn đỏ', 'Đau bụng'];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalDoctors: 20, totalClinics: 10, totalAppointments: 500 });
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [statsRes, doctorsRes] = await Promise.all([
        adminApi.getStats(),
        doctorsApi.getAll(),
      ]);
      if (statsRes.success) setStats(s => ({ ...s, ...statsRes.data }));
      if (doctorsRes.success) setFeaturedDoctors(doctorsRes.data.slice(0, 6));
    } catch {}
    finally { setLoading(false); }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
  }

  return (
    <div>
      {/* ==================== HERO ==================== */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)',
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* BG Pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Floating blobs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{
            position: 'absolute', width: '500px', height: '500px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)',
            top: '-100px', right: '-100px', filter: 'blur(40px)',
          }}
        />
        <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          style={{
            position: 'absolute', width: '400px', height: '400px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.3), transparent 70%)',
            bottom: '-80px', left: '10%', filter: 'blur(50px)',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '4rem 1.5rem', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3rem', alignItems: 'center' }}>
            {/* Left text */}
            <div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '9999px', padding: '6px 16px',
                    fontSize: '0.8rem', fontWeight: 700, color: '#6ee7b7',
                  }}>
                    <Zap size={13} /> Nền tảng y tế số #1 Việt Nam
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '9999px', padding: '6px 16px',
                    fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)',
                  }}>
                    ✓ Được tin dùng bởi 10,000+ bệnh nhân
                  </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', fontWeight: 900,
                  color: 'white', lineHeight: 1.12, marginBottom: '1.25rem',
                  letterSpacing: '-0.03em',
                }}
              >
                Đặt lịch khám<br />
                <span style={{
                  background: 'linear-gradient(90deg, #34d399, #60a5fa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  sức khỏe nhanh chóng
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', marginBottom: '2.5rem', lineHeight: 1.75, maxWidth: '540px' }}
              >
                Tìm bác sĩ phù hợp và đặt lịch khám chỉ trong vài phút. 
                Hơn <strong style={{ color: '#34d399' }}>{stats.totalDoctors}+</strong> bác sĩ uy tín tại <strong style={{ color: '#60a5fa' }}>{stats.totalClinics}</strong> phòng khám trên cả nước.
              </motion.p>

              {/* Search */}
              <motion.form onSubmit={handleSearch}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  display: 'flex', gap: '0',
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px', padding: '6px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                  marginBottom: '1.25rem',
                  maxWidth: '560px',
                }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Search size={18} color="#94a3b8" style={{ marginLeft: '12px', flexShrink: 0 }} />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Bác sĩ, chuyên khoa hoặc triệu chứng..."
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      padding: '12px 14px', fontSize: '0.95rem',
                      color: '#0f172a', background: 'transparent',
                    }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ borderRadius: '12px', padding: '12px 22px' }}>
                  Tìm kiếm
                </button>
              </motion.form>

              {/* Symptom chips */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '560px' }}
              >
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', alignSelf: 'center', fontWeight: 500 }}>Triệu chứng:</span>
                {SYMPTOMS_EXAMPLES.map(s => (
                  <button key={s} onClick={() => navigate(`/doctors?symptoms=${encodeURIComponent(s)}`)}
                    style={{
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '9999px', padding: '5px 14px', fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                style={{ display: 'flex', gap: '12px', marginTop: '2rem', flexWrap: 'wrap' }}
              >
                <Link to="/booking" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', padding: '14px 28px', borderRadius: '14px',
                  textDecoration: 'none', fontWeight: 800, fontSize: '1rem',
                  boxShadow: '0 8px 30px rgba(16,185,129,0.4)',
                  transition: 'all 0.2s',
                }}>
                  <Calendar size={18} /> Đặt lịch ngay
                </Link>
                <Link to="/clinics?nearby=1" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  color: 'white', padding: '14px 28px', borderRadius: '14px',
                  textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
                  backdropFilter: 'blur(10px)',
                }}>
                  <MapPin size={18} /> Phòng khám gần nhất
                </Link>
              </motion.div>
            </div>

            {/* Right: Doctor Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{ display: 'none' }}
              className="hero-image-col"
            >
              <div style={{
                position: 'relative', width: '360px',
              }}>
                {/* Glow ring */}
                <div style={{
                  position: 'absolute', inset: '-20px',
                  background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)',
                  borderRadius: '50%',
                  filter: 'blur(20px)',
                }} />
                <div style={{
                  borderRadius: '24px', overflow: 'hidden',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                  border: '3px solid rgba(255,255,255,0.15)',
                  position: 'relative',
                }}>
                  <img src={heroDoctorImg} alt="Bác sĩ"
                    style={{ width: '100%', display: 'block', objectFit: 'cover', height: '440px' }}
                  />
                  {/* Badge overlay */}
                  <div style={{
                    position: 'absolute', bottom: '16px', left: '16px', right: '16px',
                    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '14px', padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle size={22} color="white" />
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>20+ Bác sĩ chuyên khoa</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Được xác minh & chứng nhận</div>
                    </div>
                  </div>
                </div>

                {/* Floating stat cards */}
                {[
                  { icon: '⭐', value: '4.9', label: 'Đánh giá TB', top: '20px', right: '-60px', bg: '#ffffff' },
                  { icon: '📅', value: '500+', label: 'Lịch đã đặt', bottom: '80px', right: '-50px', bg: '#f0fdf4' },
                ].map(({ icon, value, label, top, bottom, right, bg }) => (
                  <motion.div key={label}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: Math.random() }}
                    style={{
                      position: 'absolute', top, bottom, right,
                      background: bg, borderRadius: '14px',
                      padding: '10px 14px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      minWidth: '120px',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>{value}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              display: 'flex', gap: '1px', marginTop: '4rem',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '16px', overflow: 'hidden',
              width: 'fit-content',
            }}
          >
            {[
              { value: `${stats.totalDoctors}+`, label: 'Bác sĩ chuyên khoa', emoji: '👨‍⚕️' },
              { value: `${stats.totalClinics}+`, label: 'Phòng khám', emoji: '🏥' },
              { value: `${stats.totalAppointments || 500}+`, label: 'Lịch hẹn thành công', emoji: '📅' },
              { value: '4.9★', label: 'Điểm đánh giá TB', emoji: '⭐' },
            ].map(({ value, label, emoji }) => (
              <div key={label} style={{
                padding: '1.25rem 2rem', textAlign: 'center',
                background: 'rgba(255,255,255,0.06)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{emoji}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <style>{`
          @media (min-width: 900px) {
            .hero-image-col { display: block !important; }
          }
        `}</style>
      </section>

      {/* ==================== QUICK ACTIONS ==================== */}
      <section style={{ padding: '3.5rem 0', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
            {[
              { img3d: booking3d, label: 'Đặt lịch khám', desc: 'Chọn bác sĩ & giờ khám trực tuyến tức thì.', path: '/booking', color: '#2563EB' },
              { img3d: symptom3d, label: 'Kiểm tra triệu chứng', desc: 'Chuẩn đoán & gợi ý chuyên khoa tự động.', path: '/symptom-checker', color: '#7c3aed' },
              { img3d: profile3d, label: 'Hồ sơ sức khỏe', desc: 'BMI, huyết áp & lịch sử hồ sơ bệnh án.', path: '/profile', color: '#0d9488' },
              { img3d: emergency3d, label: 'Cấp cứu 24/7', desc: 'Sơ cứu nhanh & liên hệ cứu hộ khẩn cấp.', path: '/emergency', color: '#ef4444' },
            ].map(({ img3d, label, desc, path, color }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }} whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link to={path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '1.5rem', borderRadius: '24px',
                    background: 'var(--color-card)', border: '1px solid var(--color-border)',
                    cursor: 'pointer', transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    display: 'flex', flexDirection: 'column', height: '100%',
                    alignItems: 'center', textAlign: 'center'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 15px 45px ${color}15`; e.currentTarget.style.borderColor = `${color}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  >
                    <div style={{
                      width: 90, height: 90, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1rem',
                    }}>
                      <img src={img3d} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h3 style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '8px', color: 'var(--color-text)' }}>{label}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{desc}</p>
                    
                    <span style={{
                      marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '0.78rem', fontWeight: 800, color
                    }}>
                      Trải nghiệm ngay <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CLINICS PREVIEW ==================== */}
      <section style={{ padding: '0 0 3rem', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {[
              { img: hospital3, name: 'Bệnh viện Đại Nam', district: 'Hà Đông, Hà Nội', rating: '4.5', docs: '2', id: 'C001' },
              { img: clinic1, name: 'Phòng khám Medlatec', district: 'Ba Đình, Hà Nội', rating: '4.7', docs: '2', id: 'C002' },
              { img: hospital5, name: 'Phòng khám Vinmec', district: 'Hai Bà Trưng, HN', rating: '4.8', docs: '2', id: 'C010' },
            ].map((c, i) => (
              <motion.div key={c.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/clinics/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    borderRadius: '16px', overflow: 'hidden',
                    background: 'var(--color-card)', border: '1px solid var(--color-border)',
                    transition: 'all 0.25s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                      <img src={c.img} alt={c.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent 50%)' }} />
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{c.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} color="#10b981" />{c.district}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', fontWeight: 700 }}>
                          <Star size={12} fill="#fbbf24" color="#fbbf24" /> {c.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/clinics" className="btn-secondary">
              Xem tất cả phòng khám <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== SPECIALTIES ==================== */}
      <section className="section" style={{ background: 'var(--color-card)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(37,99,235,0.08)', color: '#2563EB',
              border: '1px solid rgba(37,99,235,0.15)',
              borderRadius: '9999px', padding: '5px 14px',
              fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem',
            }}>
              <Stethoscope size={13} /> 17 Chuyên khoa y tế
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Chuyên khoa y tế
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              Tìm bác sĩ đúng chuyên khoa phù hợp với nhu cầu của bạn
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {SPECIALTIES.map(({ name, icon: Icon, color, bg }, i) => (
              <motion.div key={name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5, scale: 1.03 }}
              >
                <Link to={`/doctors?specialty=${encodeURIComponent(name)}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
                    borderRadius: '18px', padding: '1.5rem 1rem', textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.25s ease',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = color;
                      e.currentTarget.style.boxShadow = `0 8px 30px ${color}25`;
                      e.currentTarget.style.background = bg;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'var(--color-bg)';
                    }}
                  >
                    <div style={{
                      width: 56, height: 56, borderRadius: '16px',
                      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 0.75rem',
                      boxShadow: `0 4px 14px ${color}30`,
                    }}>
                      <Icon size={28} color={color} />
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>{name}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/doctors" className="btn-secondary" style={{ gap: '8px' }}>
              Xem tất cả chuyên khoa <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FEATURED DOCTORS ==================== */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}
          >
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(124,58,237,0.08)', color: '#7c3aed',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '9999px', padding: '5px 14px',
                fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px',
              }}>
                <Users size={13} /> Đội ngũ bác sĩ
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.02em' }}>Bác sĩ nổi bật</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Đội ngũ chuyên gia y tế uy tín, giàu kinh nghiệm</p>
            </div>
            <Link to="/doctors" className="btn-secondary">
              Xem tất cả <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {loading
              ? [...Array(6)].map((_, i) => <DoctorSkeleton key={i} />)
              : featuredDoctors.map((doctor, i) => <DoctorCard key={doctor.doctor_id} doctor={doctor} index={i} />)
            }
          </div>
        </div>
      </section>

      {/* ==================== TEAM PHOTO BANNER ==================== */}
      <section style={{ background: 'var(--color-bg)', padding: '0 0 4rem' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div style={{
              borderRadius: '24px', overflow: 'hidden',
              position: 'relative', height: '280px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            }}>
              <img src={doctorTeam} alt="Đội ngũ bác sĩ HealthBook"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, rgba(37,99,235,0.85) 0%, rgba(37,99,235,0.4) 60%, transparent 100%)',
                display: 'flex', alignItems: 'center', padding: '3rem',
              }}>
                <div>
                  <h3 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                    Đội ngũ y bác sĩ<br />tận tâm & chuyên nghiệp
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
                    Hơn 20 bác sĩ chuyên khoa với kinh nghiệm trung bình 12 năm sẵn sàng chăm sóc sức khỏe cho bạn
                  </p>
                  <Link to="/doctors" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'white', color: '#2563EB',
                    padding: '12px 24px', borderRadius: '12px',
                    textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s',
                  }}>
                    Gặp đội ngũ bác sĩ <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== WHY US ==================== */}
      <section className="section" style={{ background: 'var(--color-card)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Tại sao chọn <span className="gradient-text">HealthBook</span>?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
              Chúng tôi mang đến trải nghiệm y tế số tốt nhất tại Việt Nam
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: Shield, color: '#2563EB', title: 'Bác sĩ được xác minh', desc: '100% bác sĩ có chứng chỉ hành nghề và qua kiểm duyệt nghiêm ngặt', emoji: '🛡️' },
              { icon: Clock, color: '#10b981', title: 'Đặt lịch 24/7', desc: 'Đặt lịch bất kỳ lúc nào, hệ thống xác nhận tức thì qua email', emoji: '⏰' },
              { icon: CheckCircle, color: '#8b5cf6', title: 'Nhắc lịch tự động', desc: 'Email nhắc trước 24h và 1h để bạn không bao giờ bỏ lỡ cuộc hẹn', emoji: '📧' },
              { icon: MapPin, color: '#f59e0b', title: 'Phòng khám gần nhất', desc: 'Công nghệ Haversine tìm phòng khám gần bạn nhất trong vài giây', emoji: '📍' },
            ].map(({ icon: Icon, color, title, desc, emoji }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div style={{
                  padding: '1.75rem',
                  background: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
                  borderRadius: '20px', textAlign: 'center', height: '100%',
                  transition: 'all 0.25s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 8px 30px ${color}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{emoji}</div>
                  <div style={{
                    width: 56, height: 56, borderRadius: '16px',
                    background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}>
                    <Icon size={28} color={color} />
                  </div>
                  <h3 style={{ fontWeight: 800, marginBottom: '0.5rem', fontSize: '1rem' }}>{title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '5rem 0' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #4f46e5 100%)',
        }} />
        <motion.div style={{
          position: 'absolute', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)',
          top: '-200px', left: '-100px', filter: 'blur(60px)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Sẵn sàng đặt lịch khám?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2.5rem', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
              Chỉ cần vài phút để tìm bác sĩ phù hợp và đặt lịch ngay hôm nay
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/booking" style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', padding: '15px 34px', borderRadius: '14px',
                textDecoration: 'none', fontWeight: 800, fontSize: '1rem',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 8px 30px rgba(16,185,129,0.4)',
                transition: 'all 0.2s',
              }}>
                <Calendar size={20} /> Đặt lịch ngay
              </Link>
              <Link to="/clinics" style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white', padding: '15px 34px', borderRadius: '14px',
                textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '1.5px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
              }}>
                <MapPin size={20} /> Tìm phòng khám
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Doctor Card Component
function DoctorCard({ doctor, index }) {
  const COLORS = ['#2563EB', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9'];
  const color = COLORS[index % COLORS.length];
  const stars = parseFloat(doctor.rating) || 4.5;
  const initial = doctor.doctor_name?.charAt(doctor.doctor_name.lastIndexOf(' ') + 1) || 'B';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.07 }}
      whileHover={{ y: -5 }}
    >
      <div style={{
        padding: '1.5rem', borderRadius: '18px',
        background: 'var(--color-card)', border: '1.5px solid var(--color-border)',
        transition: 'all 0.25s', height: '100%', display: 'flex', flexDirection: 'column',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 40px ${color}20`; e.currentTarget.style.borderColor = `${color}50`; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
      >
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '18px', flexShrink: 0,
            background: `linear-gradient(135deg, ${color}20, ${color}50)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${color}30`,
            boxShadow: `0 4px 16px ${color}20`,
            overflow: 'hidden'
          }}>
            <img src={getDoctorAvatar(doctor.doctor_id)} alt={doctor.doctor_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '5px', color: 'var(--color-text)' }}>
              {doctor.doctor_name}
            </h3>
            <span style={{
              display: 'inline-block', background: `${color}15`, color,
              padding: '3px 10px', borderRadius: '9999px',
              fontSize: '0.7rem', fontWeight: 800, marginBottom: '6px',
            }}>
              {doctor.specialty}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12}
                  fill={i < Math.floor(stars) ? '#fbbf24' : 'none'}
                  color={i < Math.floor(stars) ? '#fbbf24' : '#cbd5e1'}
                />
              ))}
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginLeft: '3px' }}>
                {stars}
              </span>
            </div>
          </div>
        </div>

        {doctor.clinic && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 12px', borderRadius: '10px',
            background: 'var(--color-bg)', marginBottom: '0.75rem',
          }}>
            <MapPin size={13} color={color} />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', flex: 1 }}>
              {doctor.clinic.clinic_name}
            </span>
          </div>
        )}

        {doctor.bio && (
          <p style={{
            fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6,
            marginBottom: '1rem', flex: 1,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {doctor.bio}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <Clock size={13} color={color} />
          <span><strong style={{ color: 'var(--color-text)' }}>{doctor.experience}</strong> năm kinh nghiệm</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <Link to={`/doctors/${doctor.doctor_id}`} className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', padding: '9px 10px', fontSize: '0.82rem' }}>
            Xem hồ sơ
          </Link>
          <Link to={`/booking/${doctor.doctor_id}`} className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '9px 10px', fontSize: '0.82rem' }}>
            <Calendar size={14} /> Đặt lịch
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function DoctorSkeleton() {
  return (
    <div style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div className="skeleton" style={{ width: 72, height: 72, borderRadius: '18px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 18, borderRadius: 6, marginBottom: 8, width: '80%' }} />
          <div className="skeleton" style={{ height: 14, borderRadius: 6, width: '50%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 36, borderRadius: 10, marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 38, borderRadius: 10 }} />
    </div>
  );
}
