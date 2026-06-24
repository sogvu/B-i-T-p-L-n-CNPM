import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Mail, Calendar, Award, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { doctorsApi } from '../services/api';
import toast from 'react-hot-toast';
import { getDoctorAvatar } from '../utils/avatarHelper';

const COLORS = ['#2563EB', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9'];

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadDoctor();
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem('hb_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReviews(parsed.filter(r => r.doctor_id === id));
      } catch (e) {}
    }
  }, [id]);

  async function loadDoctor() {
    try {
      const res = await doctorsApi.getById(id);
      if (res.success) setDoctor(res.data);
      else toast.error('Không tìm thấy bác sĩ');
    } catch {
      toast.error('Lỗi khi tải thông tin bác sĩ');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSkeleton />;
  if (!doctor) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <h2>Không tìm thấy bác sĩ</h2>
      <Link to="/doctors" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
        Quay lại danh sách
      </Link>
    </div>
  );

  const stars = parseFloat(doctor.rating) || 4.5;
  const color = COLORS[parseInt(id?.replace('D', '') || '0') % COLORS.length];
  const initial = doctor.doctor_name?.charAt(doctor.doctor_name.lastIndexOf(' ') + 1) || 'B';

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #2563EB)',
        padding: '2rem 0 5rem',
      }}>
        <div className="container">
          <button onClick={() => navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1.5rem',
          }}>
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 1, padding: '0 1.5rem' }}>
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{
                width: 120, height: 120, borderRadius: '24px', flexShrink: 0,
                background: `linear-gradient(135deg, ${color}30, ${color}60)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `3px solid ${color}40`,
                boxShadow: `0 8px 30px ${color}30`,
                overflow: 'hidden'
              }}>
                <img src={getDoctorAvatar(id)} alt={doctor.doctor_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
                  {doctor.doctor_name}
                </h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span className="badge badge-blue" style={{ fontSize: '0.8rem' }}>{doctor.specialty}</span>
                  <span className="badge badge-green">
                    <CheckCircle size={12} /> Đã xác minh
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18}
                      fill={i < Math.floor(stars) ? '#fbbf24' : 'none'}
                      color={i < Math.floor(stars) ? '#fbbf24' : '#cbd5e1'}
                    />
                  ))}
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stars}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    ({reviews.length + 15} đánh giá)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  {[
                    { icon: Award, label: 'Kinh nghiệm', value: `${doctor.experience} năm` },
                    { icon: Calendar, label: 'Lịch hẹn', value: `${doctor.appointments?.length || 0} ca` },
                    { icon: Clock, label: 'Lịch khám', value: 'Thứ 2 - Thứ 7' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 14px', borderRadius: '12px',
                      background: 'var(--color-bg)',
                    }}>
                      <Icon size={16} color="#2563EB" />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{label}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'flex-start' }}>
                <Link to={`/booking/${doctor.doctor_id}`} className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                  <Calendar size={18} />
                  Đặt lịch khám
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Bio */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>Giới thiệu</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                {doctor.bio || 'Bác sĩ chuyên khoa với nhiều năm kinh nghiệm trong lĩnh vực y tế. Cam kết mang lại dịch vụ chăm sóc sức khỏe tốt nhất cho bệnh nhân.'}
              </p>
              <div style={{ marginTop: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Chuyên môn</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    `Chuyên khoa ${doctor.specialty}`,
                    'Khám và tư vấn sức khỏe tổng quát',
                    'Điều trị các bệnh lý chuyên khoa',
                    'Theo dõi và quản lý bệnh mãn tính',
                  ].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Clinic & Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {doctor.clinic && (
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>Phòng khám</h2>
                <Link to={`/clinics/${doctor.clinic.clinic_id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '1rem', borderRadius: '12px',
                    background: 'rgba(37,99,235,0.05)',
                    border: '1px solid rgba(37,99,235,0.1)',
                    transition: 'all 0.2s',
                  }}>
                    <h3 style={{ fontWeight: 700, color: '#2563EB', marginBottom: '6px' }}>{doctor.clinic.clinic_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} color="#2563EB" />
                      {doctor.clinic.address}, {doctor.clinic.district}, {doctor.clinic.city}
                    </div>
                    {doctor.clinic.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                        <Phone size={14} color="#2563EB" />
                        {doctor.clinic.phone}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            )}

            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>Liên hệ</h2>
              {doctor.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <Mail size={16} color="#2563EB" />
                  {doctor.email}
                </div>
              )}
              {doctor.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <Phone size={16} color="#2563EB" />
                  {doctor.phone}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Patient Reviews */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginTop: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 800, marginBottom: '1.25rem', fontSize: '1.1rem' }}>
              Đánh giá thực tế từ bệnh nhân ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Chưa có đánh giá nào của bệnh nhân cho bác sĩ này. Bệnh nhân có thể đăng nhập hồ sơ cá nhân để viết đánh giá sau khi hoàn thành cuộc hẹn.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map(rev => (
                  <div key={rev.review_id} style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{rev.patient_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{rev.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? '#fbbf24' : 'none'} color={i < rev.rating ? '#fbbf24' : '#cbd5e1'} />
                      ))}
                    </div>
                    {rev.tags && rev.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {rev.tags.map(t => (
                          <span key={t} style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', marginTop: '4px', lineHeight: 1.5 }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563EB)', padding: '2rem 0 5rem' }} />
      <div className="container" style={{ marginTop: '-4rem', padding: '0 1.5rem' }}>
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="skeleton" style={{ width: 120, height: 120, borderRadius: '24px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 28, width: '60%', borderRadius: 8, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 20, width: '40%', borderRadius: 8, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 20, width: '30%', borderRadius: 8 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
