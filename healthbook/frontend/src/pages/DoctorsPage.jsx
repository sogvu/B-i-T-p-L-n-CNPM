import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, MapPin, Calendar, Stethoscope, ChevronDown, X } from 'lucide-react';
import { doctorsApi } from '../services/api';
import toast from 'react-hot-toast';
import { getDoctorAvatar } from '../utils/avatarHelper';

const COLORS = ['#2563EB', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#f97316', '#8b5cf6'];
const SPECIALTIES = [
  'Tim mạch', 'Da liễu', 'Thần kinh', 'Tiêu hóa', 'Hô hấp',
  'Nội tiết', 'Nhi khoa', 'Sản phụ khoa', 'Chỉnh hình', 'Cơ xương khớp',
  'Tai Mũi Họng', 'Mắt', 'Tiết niệu', 'Tâm thần', 'Ung bướu', 'Nội khoa',
];

export default function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [symptomsQuery, setSymptomsQuery] = useState(searchParams.get('symptoms') || '');
  const [symptomInput, setSymptomInput] = useState(searchParams.get('symptoms') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get('symptoms') ? 'symptom' : searchParams.get('tab') || 'all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (activeTab === 'symptom' && symptomsQuery) {
      loadBySymptoms(symptomsQuery);
    } else {
      loadDoctors();
    }
  }, [search, specialty, symptomsQuery, activeTab]);

  async function loadDoctors() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (specialty) params.specialty = specialty;
      const res = await doctorsApi.getAll(params);
      if (res.success) setDoctors(res.data);
    } catch (err) {
      toast.error('Không thể tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  }

  async function loadBySymptoms(symptoms) {
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await doctorsApi.suggest(symptoms);
      if (res.success) {
        setDoctors(res.doctors || []);
        setSuggestions(res.suggestions || []);
      }
    } catch {
      toast.error('Không thể phân tích triệu chứng');
    } finally {
      setLoading(false);
    }
  }

  function handleSymptomSearch(e) {
    e.preventDefault();
    setSymptomsQuery(symptomInput);
    setActiveTab('symptom');
  }

  function handleSpecialtySelect(s) {
    setSpecialty(s === specialty ? '' : s);
    setActiveTab('all');
  }

  function clearFilters() {
    setSearch('');
    setSpecialty('');
    setSymptomsQuery('');
    setSymptomInput('');
    setActiveTab('all');
    setSuggestions([]);
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #2563EB)',
        padding: '3rem 0 4rem',
      }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
              Tìm Bác Sĩ
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
              {doctors.length} bác sĩ phù hợp với tìm kiếm của bạn
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
              {[
                { key: 'all', label: 'Tất cả bác sĩ' },
                { key: 'symptom', label: 'Tìm theo triệu chứng' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  background: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.15)',
                  color: activeTab === tab.key ? '#2563EB' : 'white',
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            {activeTab === 'all' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm bác sĩ theo tên..."
                    style={{
                      width: '100%', padding: '11px 12px 11px 38px',
                      borderRadius: '12px', border: 'none', fontSize: '0.9rem',
                      outline: 'none', background: 'white', color: '#0f172a',
                    }}
                  />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} style={{
                  padding: '11px 18px',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  background: showFilters ? 'white' : 'rgba(255,255,255,0.15)',
                  color: showFilters ? '#2563EB' : 'white',
                  cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Filter size={16} /> Lọc
                </button>
              </div>
            ) : (
              <form onSubmit={handleSymptomSearch} style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Stethoscope size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    value={symptomInput}
                    onChange={e => setSymptomInput(e.target.value)}
                    placeholder="Nhập triệu chứng (vd: đau đầu, sốt, ho...)"
                    style={{
                      width: '100%', padding: '11px 12px 11px 38px',
                      borderRadius: '12px', border: 'none', fontSize: '0.9rem',
                      outline: 'none', background: 'white', color: '#0f172a',
                    }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ borderRadius: '12px' }}>
                  Phân tích
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Specialty filters */}
        {(showFilters || specialty) && activeTab === 'all' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            style={{ marginBottom: '1.5rem' }}
          >
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Lọc theo chuyên khoa</h3>
                {specialty && (
                  <button onClick={clearFilters} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  }}>
                    <X size={14} /> Xóa bộ lọc
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SPECIALTIES.map(s => (
                  <button key={s} onClick={() => handleSpecialtySelect(s)} style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '1.5px solid',
                    borderColor: specialty === s ? '#2563EB' : 'var(--color-border)',
                    background: specialty === s ? 'rgba(37,99,235,0.1)' : 'transparent',
                    color: specialty === s ? '#2563EB' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Symptom suggestions */}
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <div className="card" style={{ padding: '1.25rem', background: 'rgba(37,99,235,0.04)', borderColor: '#2563EB30' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#2563EB' }}>
                🩺 Chuyên khoa được gợi ý cho triệu chứng: "{symptomsQuery}"
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {suggestions.map(s => (
                  <span key={s.specialty} style={{
                    background: '#2563EB',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}>
                    {s.specialty}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Active filter badge */}
        {specialty && (
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Đang lọc:</span>
            <span className="badge badge-blue">
              {specialty}
              <button onClick={() => setSpecialty('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', padding: '0 0 0 4px', display: 'flex' }}>
                <X size={12} />
              </button>
            </span>
          </div>
        )}

        {/* Doctors Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : doctors.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {doctors.map((doctor, i) => (
              <DoctorCard key={doctor.doctor_id} doctor={doctor} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorCard({ doctor, index }) {
  const color = COLORS[index % COLORS.length];
  const stars = parseFloat(doctor.rating) || 4.5;
  const initial = doctor.doctor_name?.charAt(doctor.doctor_name.lastIndexOf(' ') + 1) || 'B';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <div className="card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '18px', flexShrink: 0,
            background: `linear-gradient(135deg, ${color}20, ${color}40)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${color}30`,
            overflow: 'hidden'
          }}>
            <img src={getDoctorAvatar(doctor.doctor_id)} alt={doctor.doctor_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px', color: 'var(--color-text)' }}>
              {doctor.doctor_name}
            </h3>
            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{doctor.specialty}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12}
                  fill={i < Math.floor(stars) ? '#fbbf24' : 'none'}
                  color={i < Math.floor(stars) ? '#fbbf24' : '#cbd5e1'}
                />
              ))}
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginLeft: '3px' }}>{stars}</span>
            </div>
          </div>
        </div>

        {doctor.clinic && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 12px', borderRadius: '10px',
            background: 'var(--color-bg)',
            marginBottom: '0.75rem',
          }}>
            <MapPin size={14} color="#2563EB" />
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>{doctor.experience}</span> năm KN
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <Link to={`/doctors/${doctor.doctor_id}`} className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '0.85rem' }}>
            Xem hồ sơ
          </Link>
          <Link to={`/booking/${doctor.doctor_id}`} className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '0.85rem' }}>
            <Calendar size={14} /> Đặt lịch
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="skeleton" style={{ width: 72, height: 72, borderRadius: '18px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 18, borderRadius: 6, marginBottom: 8, width: '80%' }} />
              <div className="skeleton" style={{ height: 14, borderRadius: 6, width: '50%' }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 36, borderRadius: 10, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 40, borderRadius: 10 }} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ activeTab }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
      <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Không tìm thấy kết quả</h3>
      <p style={{ color: 'var(--color-text-muted)' }}>
        {activeTab === 'symptom'
          ? 'Thử nhập triệu chứng khác hoặc mô tả chi tiết hơn'
          : 'Thử tìm kiếm với từ khóa khác'}
      </p>
    </div>
  );
}
