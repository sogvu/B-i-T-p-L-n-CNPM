import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Phone, Users, Navigation, Search, Clock, ArrowRight, X } from 'lucide-react';
import { clinicsApi } from '../services/api';
import toast from 'react-hot-toast';

// Import ảnh thực tế
import clinic1 from '../assets/clinic1.png';
import hospital2 from '../assets/hospital2.png';
import hospital3 from '../assets/hospital3.png';
import clinic4 from '../assets/clinic4.png';
import hospital5 from '../assets/hospital5.png';
import clinic6 from '../assets/clinic6.png';

const CLINIC_IMAGES = [hospital3, clinic1, hospital2, clinic4, hospital5, clinic6, hospital3, clinic1, hospital2, clinic4];

const LOCATION_PRESETS = [
  { label: 'Hoàn Kiếm, HN', lat: 21.0289, lng: 105.8471 },
  { label: 'Cầu Giấy, HN', lat: 21.032, lng: 105.790 },
  { label: 'Quận 1, HCM', lat: 10.776, lng: 106.700 },
  { label: 'Quận 5, HCM', lat: 10.754, lng: 106.660 },
  { label: 'Hà Đông, HN', lat: 20.972, lng: 105.779 },
];

export default function ClinicsPage() {
  const [searchParams] = useSearchParams();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userLat, setUserLat] = useState('');
  const [userLng, setUserLng] = useState('');
  const [nearbyMode, setNearbyMode] = useState(searchParams.get('nearby') === '1');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [cityFilter, setCityFilter] = useState('all');

  useEffect(() => {
    if (nearbyMode && userLat && userLng) {
      loadNearbyClinics();
    } else {
      loadClinics();
    }
  }, [nearbyMode, userLat, userLng]);

  async function loadClinics() {
    setLoading(true);
    try {
      const res = await clinicsApi.getAll();
      if (res.success) setClinics(res.data);
    } catch {
      toast.error('Không thể tải danh sách phòng khám');
    } finally {
      setLoading(false);
    }
  }

  async function loadNearbyClinics() {
    if (!userLat || !userLng) return;
    setLoading(true);
    try {
      const res = await clinicsApi.getNearby(userLat, userLng);
      if (res.success) setClinics(res.data);
    } catch {
      toast.error('Không thể tải phòng khám gần đây');
    } finally {
      setLoading(false);
    }
  }

  function handlePresetSelect(preset) {
    setSelectedPreset(preset.label);
    setUserLat(preset.lat);
    setUserLng(preset.lng);
    setNearbyMode(true);
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị GPS');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setNearbyMode(true);
        setSelectedPreset('Vị trí của bạn');
        setGeoLoading(false);
        toast.success('Đã xác định vị trí của bạn!');
      },
      () => {
        setGeoLoading(false);
        toast.error('Không thể xác định vị trí');
      }
    );
  }

  const filtered = clinics.filter(c => {
    const matchSearch = c.clinic_name.toLowerCase().includes(search.toLowerCase()) ||
      c.district?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === 'all' ||
      (cityFilter === 'hanoi' && c.city?.toLowerCase().includes('hà nội')) ||
      (cityFilter === 'hcm' && (c.city?.toLowerCase().includes('hồ chí minh') || c.city?.toLowerCase().includes('hcm')));
    return matchSearch && matchCity;
  });

  const hanoiCount = clinics.filter(c => c.city?.toLowerCase().includes('hà nội')).length;
  const hcmCount = clinics.filter(c => c.city?.toLowerCase().includes('hồ chí minh')).length;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* ========== HERO HEADER ========== */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
        padding: '3.5rem 0 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        {[...Array(4)].map((_, i) => (
          <motion.div key={i}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.6 }}
            style={{
              position: 'absolute',
              width: `${100 + i * 60}px`, height: `${100 + i * 60}px`,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '50%',
              top: `${5 + i * 12}%`, right: `${3 + i * 7}%`,
            }}
          />
        ))}

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px', paddingBottom: '3rem' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '9999px', padding: '5px 14px', fontSize: '0.78rem',
                  fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: '1rem',
                }}>
                  <MapPin size={12} /> {clinics.length} phòng khám uy tín
                </span>
                <h1 style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900,
                  color: 'white', lineHeight: 1.2, marginBottom: '0.75rem',
                  letterSpacing: '-0.02em',
                }}>
                  Tìm Phòng Khám<br />
                  <span style={{ color: '#a7f3d0' }}>Gần Bạn Nhất</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                  Hệ thống phòng khám uy tín trên toàn quốc. Đặt lịch dễ dàng, khám bệnh nhanh chóng.
                </p>

                {/* Search bar */}
                <div style={{
                  display: 'flex', gap: '8px',
                  background: 'white', borderRadius: '14px', padding: '6px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                }}>
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Tên phòng khám hoặc khu vực..."
                      style={{
                        flex: 1, border: 'none', outline: 'none',
                        padding: '10px 12px 10px 36px',
                        fontSize: '0.9rem', color: '#0f172a', background: 'transparent',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleGeolocate}
                    disabled={geoLoading}
                    style={{
                      padding: '10px 18px', borderRadius: '10px',
                      background: '#059669', color: 'white', border: 'none',
                      cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Navigation size={15} />
                    {geoLoading ? 'Đang định vị...' : 'Gần tôi nhất'}
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex', gap: '1px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px 16px 0 0',
                overflow: 'hidden', alignSelf: 'flex-end',
              }}>
                {[
                  { label: 'Hà Nội', count: hanoiCount, emoji: '🏛️' },
                  { label: 'TP. HCM', count: hcmCount, emoji: '🌆' },
                  { label: 'Bác sĩ', count: '20+', emoji: '👨‍⚕️' },
                ].map(({ label, count, emoji }) => (
                  <div key={label} style={{
                    padding: '1rem 1.75rem', textAlign: 'center',
                    background: 'rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{emoji}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>{count}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Filters Row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
            marginBottom: '1.75rem',
            padding: '1rem 1.25rem',
            background: 'var(--color-card)',
            borderRadius: '14px',
            border: '1px solid var(--color-border)',
          }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { key: false, label: '🏥 Tất cả' },
              { key: true, label: '📍 Gần tôi' },
            ].map(tab => (
              <button key={String(tab.key)} onClick={() => {
                setNearbyMode(tab.key);
                if (!tab.key) { setSelectedPreset(''); setUserLat(''); setUserLng(''); }
              }} style={{
                padding: '7px 16px', borderRadius: '9px', border: 'none',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                transition: 'all 0.2s',
                background: nearbyMode === tab.key ? '#059669' : 'var(--color-bg)',
                color: nearbyMode === tab.key ? 'white' : 'var(--color-text-muted)',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '28px', background: 'var(--color-border)' }} />

          {/* City filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { key: 'all', label: 'Tất cả TP' },
              { key: 'hanoi', label: '🏛️ Hà Nội' },
              { key: 'hcm', label: '🌆 TP. HCM' },
            ].map(c => (
              <button key={c.key} onClick={() => setCityFilter(c.key)} style={{
                padding: '7px 14px', borderRadius: '9px', border: '1.5px solid',
                borderColor: cityFilter === c.key ? '#059669' : 'var(--color-border)',
                background: cityFilter === c.key ? 'rgba(5,150,105,0.08)' : 'transparent',
                color: cityFilter === c.key ? '#059669' : 'var(--color-text-muted)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s',
              }}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '28px', background: 'var(--color-border)' }} />

          {/* Location presets (only in nearby mode) */}
          {nearbyMode && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
              {LOCATION_PRESETS.map(preset => (
                <button key={preset.label} onClick={() => handlePresetSelect(preset)} style={{
                  padding: '6px 12px', borderRadius: '8px', border: '1px solid',
                  borderColor: selectedPreset === preset.label ? '#059669' : 'var(--color-border)',
                  background: selectedPreset === preset.label ? 'rgba(5,150,105,0.1)' : 'transparent',
                  color: selectedPreset === preset.label ? '#059669' : 'var(--color-text-muted)',
                  cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
                }}>
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {filtered.length} phòng khám
            {nearbyMode && selectedPreset && <span style={{ color: '#059669', marginLeft: '6px' }}>• Sắp xếp theo khoảng cách</span>}
          </div>
        </motion.div>

        {/* Featured (first 2) - large cards */}
        {!loading && !nearbyMode && filtered.length >= 2 && search === '' && cityFilter === 'all' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {filtered.slice(0, 2).map((clinic, i) => (
              <FeaturedClinicCard key={clinic.clinic_id} clinic={clinic} index={i} />
            ))}
          </div>
        )}

        {/* Main grid */}
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {(search !== '' || nearbyMode || cityFilter !== 'all' ? filtered : filtered.slice(2)).map((clinic, i) => (
              <ClinicCard key={clinic.clinic_id} clinic={clinic} index={i} showDistance={nearbyMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== FEATURED CARD ===================== */
function FeaturedClinicCard({ clinic, index }) {
  const img = CLINIC_IMAGES[index % CLINIC_IMAGES.length];
  const stars = parseFloat(clinic.rating) || 4.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/clinics/${clinic.clinic_id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          borderRadius: '20px', overflow: 'hidden',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 50px rgba(5,150,105,0.15)'; e.currentTarget.style.borderColor = '#10b981'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
        >
          {/* Image */}
          <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
            <img src={img} alt={clinic.clinic_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
            }} />
            {/* Badges */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
              <span style={{
                background: '#059669', color: 'white',
                padding: '4px 10px', borderRadius: '9999px',
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.02em',
              }}>
                ⭐ NỔI BẬT
              </span>
            </div>
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <span style={{
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                color: 'white', padding: '4px 10px', borderRadius: '9999px',
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                {clinic.city}
              </span>
            </div>
            {/* Distance badge */}
            {clinic.distance !== undefined && (
              <span style={{
                position: 'absolute', bottom: '12px', left: '12px',
                background: '#10b981', color: 'white',
                padding: '5px 12px', borderRadius: '9999px',
                fontSize: '0.8rem', fontWeight: 700,
              }}>
                📍 {clinic.distance} km
              </span>
            )}
          </div>

          <div style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px', color: 'var(--color-text)' }}>
              {clinic.clinic_name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14}
                  fill={i < Math.floor(stars) ? '#fbbf24' : 'none'}
                  color={i < Math.floor(stars) ? '#fbbf24' : '#cbd5e1'}
                />
              ))}
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{stars}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              <MapPin size={13} color="#059669" />
              {clinic.address}, {clinic.district}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                padding: '4px 12px', borderRadius: '9999px',
                background: 'rgba(5,150,105,0.1)', color: '#059669',
                fontSize: '0.8rem', fontWeight: 700,
              }}>
                👨‍⚕️ {clinic.doctorCount || 0} bác sĩ
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>
                Xem chi tiết <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ===================== REGULAR CARD ===================== */
function ClinicCard({ clinic, index, showDistance }) {
  const stars = parseFloat(clinic.rating) || 4.5;
  const img = CLINIC_IMAGES[(index + 2) % CLINIC_IMAGES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/clinics/${clinic.clinic_id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          borderRadius: '16px', overflow: 'hidden',
          background: 'var(--color-card)', border: '1px solid var(--color-border)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          transition: 'all 0.25s ease', cursor: 'pointer', height: '100%',
          display: 'flex', flexDirection: 'column',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 35px rgba(5,150,105,0.12)'; e.currentTarget.style.borderColor = '#6ee7b7'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
        >
          {/* Image */}
          <div style={{ position: 'relative', height: '160px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={img} alt={clinic.clinic_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)',
            }} />

            {/* Distance badge */}
            {showDistance && clinic.distance !== undefined && (
              <span style={{
                position: 'absolute', top: '10px', right: '10px',
                background: '#059669', color: 'white',
                padding: '4px 10px', borderRadius: '9999px',
                fontSize: '0.72rem', fontWeight: 800,
              }}>
                📍 {clinic.distance} km
              </span>
            )}
            {showDistance && clinic.travelTime && (
              <span style={{
                position: 'absolute', top: '10px', left: '10px',
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                color: 'white', padding: '4px 10px', borderRadius: '9999px',
                fontSize: '0.72rem', fontWeight: 600,
              }}>
                🚗 ~{clinic.travelTime}
              </span>
            )}

            {/* City bottom-left */}
            <span style={{
              position: 'absolute', bottom: '8px', left: '10px',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
              color: 'white', padding: '3px 10px', borderRadius: '9999px',
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              {clinic.city}
            </span>
          </div>

          {/* Content */}
          <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{
              fontWeight: 700, fontSize: '0.95rem', marginBottom: '5px',
              color: 'var(--color-text)',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {clinic.clinic_name}
            </h3>

            {/* Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '8px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12}
                  fill={i < Math.floor(stars) ? '#fbbf24' : 'none'}
                  color={i < Math.floor(stars) ? '#fbbf24' : '#cbd5e1'}
                />
              ))}
              <span style={{ fontSize: '0.78rem', fontWeight: 700, marginLeft: '3px' }}>{stars}</span>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <MapPin size={12} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {clinic.address}, {clinic.district}
              </span>
            </div>

            {clinic.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                <Clock size={12} color="#059669" />
                07:00 – 17:00 · {clinic.phone}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <span style={{
                padding: '4px 10px', borderRadius: '9999px',
                background: 'rgba(5,150,105,0.09)', color: '#059669',
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                {clinic.doctorCount || 0} bác sĩ
              </span>
              <span style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px',
                color: '#059669', fontWeight: 700, fontSize: '0.8rem',
              }}>
                Đặt lịch <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <div className="skeleton" style={{ height: 160 }} />
          <div style={{ padding: '1rem' }}>
            <div className="skeleton" style={{ height: 18, borderRadius: 6, marginBottom: 8, width: '75%' }} />
            <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, borderRadius: 6, marginBottom: 12, width: '55%' }} />
            <div className="skeleton" style={{ height: 36, borderRadius: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏥</div>
      <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Không tìm thấy phòng khám</h3>
      <p style={{ color: 'var(--color-text-muted)' }}>Thử thay đổi từ khóa hoặc bộ lọc</p>
    </div>
  );
}
