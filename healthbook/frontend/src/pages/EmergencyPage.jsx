import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, AlertOctagon, Heart, Zap, MapPin, Search, ArrowRight,
  Shield, Info, Check, MessageSquare, Star, Clock
} from 'lucide-react';
import emergency3d from '../assets/3d_emergency.png';

const EMERGENCY_INCIDENTS = [
  {
    id: 'stroke',
    title: 'Nghi ngờ Đột quỵ (FAST)',
    symptoms: 'Mặt lệch một bên, Yếu tay chân, Nói ngọng/khó nói, Cần gọi cấp cứu gấp.',
    instructions: [
      'Ghi lại thời điểm bắt đầu xuất hiện triệu chứng (rất quan trọng).',
      'Đỡ bệnh nhân nằm nghiêng an toàn, đầu cao nhẹ khoảng 30 độ.',
      'KHÔNG cho bệnh nhân ăn uống, KHÔNG uống thuốc hạ huyết áp hay châm cứu.',
      'Gọi cấp cứu 115 ngay lập tức.'
    ],
    color: '#ef4444'
  },
  {
    id: 'heart_attack',
    title: 'Cơn Đau tim cấp',
    symptoms: 'Đau thắt ngực lan ra vai/tay trái, vã mồ hôi hột, khó thở, lo lắng dữ dội.',
    instructions: [
      'Để người bệnh ngồi hoặc nằm nửa nằm nửa ngồi nghỉ ngơi hoàn toàn.',
      'Nới lỏng quần áo, cổ áo và thắt lưng.',
      'Giúp người bệnh bình tĩnh, thở sâu đều đặn.',
      'Nhanh chóng gọi 115 hoặc đưa tới phòng cấp cứu gần nhất.'
    ],
    color: '#f97316'
  },
  {
    id: 'accident',
    title: 'Chấn thương / Tai nạn',
    symptoms: 'Chảy máu nhiều, biến dạng xương nghi gãy, đau buốt dữ dội sau va đập.',
    instructions: [
      'Dùng gạc sạch ép chặt vết thương đang chảy máu để cầm máu.',
      'Cố định vùng xương nghi bị gãy bằng nẹp tự chế (sách, thanh gỗ).',
      'Hạn chế tối đa di chuyển nạn nhân nếu nghi ngờ chấn thương cột sống cổ/lưng.',
      'Giữ ấm cơ thể nạn nhân.'
    ],
    color: '#ef4444'
  },
  {
    id: 'poisoning',
    title: 'Ngộ độc / Hóc dị vật',
    symptoms: 'Nôn mửa liên tục, co giật, khó thở dữ dội, tím tái môi miệng.',
    instructions: [
      'Nếu hóc dị vật ở người lớn: Thực hiện nghiệm pháp Heimlich ngay lập tức.',
      'Nếu uống nhầm hóa chất: KHÔNG tự ý gây nôn nếu nạn nhân bất tỉnh hoặc hóa chất là acid/kiềm.',
      'Giữ lại mẫu hóa chất/thực phẩm nghi ngờ để bác sĩ kiểm tra.',
      'Đưa nạn nhân cùng mẫu chất độc đến bệnh viện gần nhất.'
    ],
    color: '#ef4444'
  }
];

const HOSPITALS = [
  { name: 'Bệnh viện Bạch Mai (Trung tâm Cấp cứu A9)', lat: 21.0028, lng: 105.8436, address: '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội', phone: '024-3869-3731' },
  { name: 'Bệnh viện Việt Đức (Chuyên khoa Ngoại chấn thương)', lat: 21.0289, lng: 105.8465, address: '40 Tràng Thi, Hàng Bông, Hoàn Kiếm, Hà Nội', phone: '024-3825-3531' },
  { name: 'Bệnh viện Trung ương Quân đội 108', lat: 21.0183, lng: 105.8601, address: '1 Trần Hưng Đạo, Bạch Đằng, Hai Bà Trưng, Hà Nội', phone: '024-6278-4108' },
  { name: 'Bệnh viện Đại học Y Hà Nội', lat: 21.0039, lng: 105.8291, address: '1 Tôn Thất Tùng, Kim Liên, Đống Đa, Hà Nội', phone: '024-3574-7788' },
  { name: 'Bệnh viện Đa khoa Quốc tế Vinmec Times City', lat: 21.0006, lng: 105.8679, address: '458 Minh Khai, Vĩnh Tuy, Hai Bà Trưng, Hà Nội', phone: '024-3974-3556' }
];

export default function EmergencyPage() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hospitalsWithDistance, setHospitalsWithDistance] = useState(HOSPITALS);
  const [locating, setLocating] = useState(false);

  // Haversine Formula for distance
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  }

  // Get User GPS
  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Calculate distances
        const updated = HOSPITALS.map(hosp => {
          const dist = getDistance(latitude, longitude, hosp.lat, hosp.lng);
          return { ...hosp, distance: dist.toFixed(2) };
        }).sort((a, b) => Number(a.distance) - Number(b.distance));
        
        setHospitalsWithDistance(updated);
        setLocating(false);
      },
      (error) => {
        console.error(error);
        alert('Không thể lấy vị trí của bạn. Vui lòng cho phép quyền truy cập GPS.');
        setLocating(false);
      }
    );
  };

  return (
    <div style={{ padding: '2rem 1.5rem', minHeight: '85vh', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Banner khẩn cấp */}
        <div style={{
          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
          borderRadius: '24px', padding: '2.5rem', color: 'white',
          position: 'relative', overflow: 'hidden', marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(220, 38, 38, 0.3)'
        }}>
          <div style={{
            position: 'absolute', width: '200px', height: '200px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
            bottom: '-60px', right: '-40px', filter: 'blur(25px)'
          }} />

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)', padding: '5px 12px',
                borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                display: 'inline-block', marginBottom: '0.75rem'
              }}>
                Hỗ Trợ Khẩn Cấp 24/7
              </span>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Hỗ Trợ Cấp Cứu Y Tế
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '500px' }}>
                Trong trường hợp khẩn cấp, vui lòng giữ bình tĩnh, thực hiện sơ cứu cơ bản và gọi ngay cho đường dây nóng y tế cấp cứu.
              </p>
            </div>
            
            <div style={{ display: 'none' }} className="hero-3d-wrapper">
              <img src={emergency3d} alt="Emergency 3D" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

        {/* Hotlines Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          
          {/* Cấp cứu 115 */}
          <a href="tel:115" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#ef4444', color: 'white', padding: '1.5rem', borderRadius: '18px',
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)', cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Phone size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 700 }}>ĐƯỜNG DÂY NÓNG QUỐC GIA</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>Gọi Cấp Cứu 115</div>
              </div>
            </div>
          </a>

          {/* HealthBook Hotline */}
          <a href="tel:19001234" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--color-card)', border: '1.5px solid var(--color-border)',
              color: 'var(--color-text)', padding: '1.5rem', borderRadius: '18px',
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: 'rgba(59,130,246,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
              }}>
                <Phone size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>HOTLINE HEALTHBOOK</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#3b82f6' }}>1900-1234</div>
              </div>
            </div>
          </a>

        </div>

        {/* First Aid & Incidents */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }} className="emergency-body-grid">
          
          {/* LEFT: Incident Select & Guidelines */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--color-text)' }}>
              Hướng dẫn Sơ cứu nhanh
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {EMERGENCY_INCIDENTS.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  style={{
                    padding: '1.25rem', borderRadius: '16px',
                    border: selectedIncident?.id === inc.id ? `2px solid ${inc.color}` : '1.5px solid var(--color-border)',
                    background: selectedIncident?.id === inc.id ? `${inc.color}08` : 'var(--color-card)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedIncident?.id === inc.id ? inc.color : 'var(--color-text)' }}>
                    {inc.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                    {inc.symptoms}
                  </p>
                </div>
              ))}
            </div>

            {/* Instruction Details Panel */}
            <AnimatePresence mode="wait">
              {selectedIncident ? (
                <motion.div
                  key={selectedIncident.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    padding: '1.5rem', borderRadius: '20px', background: 'var(--color-card)',
                    border: '1.5px solid var(--color-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: selectedIncident.color }}>
                      CÁC BƯỚC XỬ LÝ KHẨN CẤP
                    </span>
                    <button
                      onClick={() => setSelectedIncident(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Đóng
                    </button>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1rem', color: selectedIncident.color }}>
                    {selectedIncident.title}
                  </h4>

                  <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedIncident.instructions.map((stepStr, idx) => (
                      <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
                        {stepStr}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <div style={{
                  padding: '2rem', borderRadius: '20px', background: 'var(--color-card)',
                  border: '1.5px dashed var(--color-border)', color: 'var(--color-text-muted)',
                  textAlign: 'center', fontSize: '0.85rem'
                }}>
                  <AlertOctagon size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
                  Chọn một triệu chứng khẩn cấp ở trên để xem hướng dẫn sơ cứu từng bước.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Nearest Hospitals */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)' }}>
                Bệnh viện Cấp cứu gần nhất
              </h3>
              <button
                onClick={handleGetLocation}
                disabled={locating}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '4px' }}
              >
                {locating ? 'Đang định vị...' : 'Sử dụng GPS'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {hospitalsWithDistance.map((hosp) => (
                <div
                  key={hosp.name}
                  style={{
                    padding: '1.25rem', borderRadius: '18px', background: 'var(--color-card)',
                    border: '1.5px solid var(--color-border)', display: 'flex', gap: '1rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px', background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <MapPin size={22} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                        {hosp.name}
                      </h4>
                      {hosp.distance && (
                        <span style={{
                          background: 'rgba(16,185,129,0.15)', color: '#10b981',
                          padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800
                        }}>
                          Cách {hosp.distance} km
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                      {hosp.address}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <a href={`tel:${hosp.phone}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Phone size={12} /> Cấp cứu: {hosp.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (min-width: 600px) {
          .hero-3d-wrapper { display: block !important; }
        }
        @media (max-width: 800px) {
          .emergency-body-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
