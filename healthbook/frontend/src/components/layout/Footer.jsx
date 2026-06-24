import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, MessageCircle, Share2, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-card)',
      borderTop: '1px solid var(--color-border)',
      marginTop: '4rem',
    }}>
      <div className="container" style={{ padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                style={{
                  width: 42, height: 42,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #7c3aed 100%)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.4C10.5 2.2 7.5 2.2 6 3.8C4.5 5.4 4.5 8.6 6 10.2L12 16.5L18 10.2C19.5 8.6 19.5 5.4 18 3.8C16.5 2.2 13.5 2.2 12 4.4Z" fill="white" />
                  <path d="M12 7.5V12.5M9.5 10H14.5" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  fontSize: '1.35rem', fontWeight: 900,
                  color: 'var(--color-text)', letterSpacing: '-0.03em',
                  lineHeight: 1
                }}>
                  Health<span style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    fontWeight: 900
                  }}>Book</span>
                </span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white', borderRadius: '6px', marginLeft: '8px',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                  lineHeight: 1
                }}>
                  Plus
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              Nền tảng đặt lịch khám sức khỏe trực tuyến hàng đầu Việt Nam. Kết nối bệnh nhân với bác sĩ uy tín.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[MessageCircle, Share2, PlayCircle].map((Icon, i) => (
                <button key={i} style={{
                  width: 36, height: 36,
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#2563EB';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.border = '1px solid #2563EB';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                    e.currentTarget.style.border = '1px solid var(--color-border)';
                  }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Dịch vụ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Đặt lịch khám', path: '/booking' },
                { label: 'Tìm bác sĩ', path: '/doctors' },
                { label: 'Phòng khám gần nhất', path: '/clinics' },
                { label: 'Lịch của tôi', path: '/my-appointments' },
              ].map(link => (
                <Link key={link.path} to={link.path} style={{
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Chuyên khoa</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Tim mạch', 'Thần kinh', 'Da liễu', 'Nhi khoa', 'Sản phụ khoa'].map(s => (
                <Link key={s} to={`/doctors?specialty=${encodeURIComponent(s)}`} style={{
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Liên hệ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { Icon: Phone, text: '1900-1234' },
                { Icon: Mail, text: 'support@healthbook.vn' },
                { Icon: MapPin, text: 'Hà Nội & TP. Hồ Chí Minh' },
              ].map(({ Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  <Icon size={16} color="#2563EB" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            © 2024 HealthBook. Bảo lưu mọi quyền.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Được xây dựng với ❤️ cho người Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}
