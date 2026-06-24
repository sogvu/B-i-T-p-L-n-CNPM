import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Star, Users, Calendar, ArrowLeft, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { clinicsApi } from '../services/api';
import toast from 'react-hot-toast';

import clinic1 from '../assets/clinic1.png';
import hospital2 from '../assets/hospital2.png';
import hospital3 from '../assets/hospital3.png';
import clinic4 from '../assets/clinic4.png';
import hospital5 from '../assets/hospital5.png';
import clinic6 from '../assets/clinic6.png';
import doctorTeam from '../assets/doctor_team.png';

const CLINIC_IMAGES = [hospital3, clinic1, hospital2, clinic4, hospital5, clinic6];
const DOCTOR_COLORS = ['#2563EB', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9'];

export default function ClinicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClinic();
  }, [id]);

  async function loadClinic() {
    try {
      const res = await clinicsApi.getById(id);
      if (res.success) setClinic(res.data);
      else toast.error('Không tìm thấy phòng khám');
    } catch {
      toast.error('Lỗi khi tải thông tin phòng khám');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSkeleton />;
  if (!clinic) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
      <h2 style={{ fontWeight: 700 }}>Không tìm thấy phòng khám</h2>
      <Link to="/clinics" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
        Quay lại danh sách
      </Link>
    </div>
  );

  const stars = parseFloat(clinic.rating) || 4.5;
  const clinicIdx = parseInt(id?.replace('C', '') || '0') - 1;
  const clinicImg = CLINIC_IMAGES[clinicIdx % CLINIC_IMAGES.length];

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Hero Image Banner */}
      <div style={{ position: 'relative', height: '380px', overflow: 'hidden' }}>
        <img src={clinicImg} alt={clinic.clinic_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
        }} />

        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: '1.5rem', left: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white', cursor: 'pointer', fontSize: '0.875rem',
          fontWeight: 600, padding: '8px 16px', borderRadius: '10px',
          zIndex: 10,
        }}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* Clinic name overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '2rem',
        }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#059669', color: 'white',
                  padding: '4px 12px', borderRadius: '9999px',
                  fontSize: '0.75rem', fontWeight: 700,
                }}>
                  ✓ Đã xác minh
                </span>
                <span style={{
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white', padding: '4px 12px', borderRadius: '9999px',
                  fontSize: '0.75rem', fontWeight: 600,
                }}>
                  {clinic.city}
                </span>
              </div>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 900,
                color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                marginBottom: '8px',
              }}>
                {clinic.clinic_name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18}
                    fill={i < Math.floor(stars) ? '#fbbf24' : 'none'}
                    color={i < Math.floor(stars) ? '#fbbf24' : 'rgba(255,255,255,0.4)'}
                  />
                ))}
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{stars}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                  ({Math.floor(Math.random() * 500) + 100} đánh giá)
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 360px)', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column */}
          <div>
            {/* Info Cards Row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { icon: Users, label: 'Bác sĩ', value: `${clinic.doctors?.length || 0} chuyên gia`, color: '#059669', bg: '#ecfdf5' },
                  { icon: Clock, label: 'Giờ làm việc', value: '07:00 – 17:00', color: '#2563EB', bg: '#eff6ff' },
                  { icon: Calendar, label: 'Lịch khám', value: 'Thứ 2 – Thứ 7', color: '#8b5cf6', bg: '#f5f3ff' },
                  { icon: Star, label: 'Đánh giá', value: `${stars}/5.0`, color: '#f59e0b', bg: '#fffbeb' },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} style={{
                    padding: '1rem', borderRadius: '14px',
                    background: 'var(--color-card)', border: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '12px',
                      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={20} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* About */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)',
                borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem',
              }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '1rem' }}>Giới thiệu</h2>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {clinic.clinic_name} là một trong những cơ sở y tế uy tín hàng đầu tại {clinic.city}.
                  Với đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm và hệ thống trang thiết bị y tế hiện đại,
                  phòng khám cam kết mang lại dịch vụ chăm sóc sức khỏe chất lượng cao cho người dân.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    'Bác sĩ được chứng nhận quốc tế',
                    'Trang thiết bị y tế hiện đại',
                    'Quy trình khám chuẩn y tế',
                    'Hỗ trợ bảo hiểm y tế',
                    'Phòng khám sạch sẽ, vô trùng',
                    'Nhân viên tận tình, chu đáo',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      <CheckCircle size={14} color="#059669" style={{ flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Doctor team banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div style={{
                borderRadius: '16px', overflow: 'hidden',
                marginBottom: '1.5rem', position: 'relative', height: '180px',
              }}>
                <img src={doctorTeam} alt="Đội ngũ bác sĩ"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, rgba(5,150,105,0.85) 0%, rgba(5,150,105,0.3) 100%)',
                  display: 'flex', alignItems: 'center', padding: '2rem',
                }}>
                  <div>
                    <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', marginBottom: '6px' }}>
                      Đội ngũ chuyên gia
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>
                      {clinic.doctors?.length || 0} bác sĩ chuyên khoa sẵn sàng phục vụ
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Doctors Grid */}
            {clinic.doctors && clinic.doctors.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                  Bác sĩ tại {clinic.clinic_name}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {clinic.doctors.map((doctor, i) => {
                    const color = DOCTOR_COLORS[i % DOCTOR_COLORS.length];
                    const initial = doctor.doctor_name?.charAt(doctor.doctor_name.lastIndexOf(' ') + 1) || 'B';
                    const docStars = parseFloat(doctor.rating) || 4.5;
                    return (
                      <motion.div key={doctor.doctor_id} whileHover={{ y: -3 }}>
                        <div style={{
                          padding: '1.25rem', borderRadius: '14px',
                          background: 'var(--color-card)', border: '1px solid var(--color-border)',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 6px 20px ${color}20`; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{
                              width: 56, height: 56, borderRadius: '14px', flexShrink: 0,
                              background: `linear-gradient(135deg, ${color}25, ${color}50)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.5rem', fontWeight: 900, color,
                              border: `2px solid ${color}30`,
                            }}>
                              {initial}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                                {doctor.doctor_name}
                              </h3>
                              <span style={{
                                background: `${color}15`, color,
                                padding: '3px 10px', borderRadius: '9999px',
                                fontSize: '0.72rem', fontWeight: 700,
                                display: 'inline-block', marginBottom: '6px',
                              }}>
                                {doctor.specialty}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={11}
                                    fill={i < Math.floor(docStars) ? '#fbbf24' : 'none'}
                                    color={i < Math.floor(docStars) ? '#fbbf24' : '#cbd5e1'}
                                  />
                                ))}
                                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: '3px' }}>
                                  {doctor.experience} năm KN
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Link to={`/doctors/${doctor.doctor_id}`} className="btn-secondary"
                              style={{ flex: 1, justifyContent: 'center', padding: '7px', fontSize: '0.78rem' }}>
                              Hồ sơ
                            </Link>
                            <Link to={`/booking/${doctor.doctor_id}`} className="btn-primary"
                              style={{ flex: 1, justifyContent: 'center', padding: '7px', fontSize: '0.78rem' }}>
                              Đặt lịch
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              {/* Quick Info Card */}
              <div style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)',
                borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                  Thông tin liên hệ
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                      background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MapPin size={16} color="#059669" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '2px' }}>Địa chỉ</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {clinic.address}, {clinic.district}, {clinic.city}
                      </div>
                    </div>
                  </div>

                  {clinic.phone && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                        background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Phone size={16} color="#2563EB" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '2px' }}>Điện thoại</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563EB' }}>{clinic.phone}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                      background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Clock size={16} color="#8b5cf6" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '2px' }}>Giờ làm việc</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Thứ 2 – Thứ 7 | 07:00 – 17:00</div>
                    </div>
                  </div>
                </div>

                <Link to={`/doctors?clinic_id=${clinic.clinic_id}`}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '1.25rem', fontSize: '0.9rem' }}>
                  <Calendar size={16} /> Đặt lịch tại đây
                </Link>
              </div>

              {/* Rating breakdown */}
              <div style={{
                background: 'var(--color-card)', border: '1px solid var(--color-border)',
                borderRadius: '16px', padding: '1.5rem',
              }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem' }}>Đánh giá</h3>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1 }}>{stars}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '6px 0' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18}
                        fill={i < Math.floor(stars) ? '#fbbf24' : 'none'}
                        color={i < Math.floor(stars) ? '#fbbf24' : '#cbd5e1'}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>dựa trên 200+ đánh giá</div>
                </div>
                {[5, 4, 3, 2, 1].map(s => {
                  const pct = s === 5 ? 62 : s === 4 ? 24 : s === 3 ? 10 : s === 2 ? 3 : 1;
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--color-text-muted)', width: '12px', textAlign: 'right' }}>{s}</span>
                      <Star size={11} fill="#fbbf24" color="#fbbf24" />
                      <div style={{ flex: 1, height: '6px', borderRadius: '9999px', background: 'var(--color-bg)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: (5 - s) * 0.1 }}
                          style={{ height: '100%', borderRadius: '9999px', background: '#fbbf24' }}
                        />
                      </div>
                      <span style={{ color: 'var(--color-text-muted)', width: '28px' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <div className="skeleton" style={{ height: 380 }} />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="skeleton" style={{ height: 28, width: '40%', borderRadius: 8, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 20, width: '60%', borderRadius: 8, marginBottom: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
