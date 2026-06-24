import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, Sun, Moon, Calendar, User, ChevronDown, Bell, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Bác sĩ', path: '/doctors' },
  { label: 'Phòng khám', path: '/clinics' },
  { label: 'Kiểm tra triệu chứng', path: '/symptom-checker' },
  { label: 'Lịch của tôi', path: '/my-appointments' },
  { label: 'Cấp cứu 24/7', path: '/emergency', isEmergency: true },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Notifications listener
  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('hb_notifications');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          setUnreadCount(list.filter(n => !n.read).length);
        } catch (e) {}
      } else {
        setUnreadCount(1); // Default unread from seed
      }
    };
    updateCount();
    window.addEventListener('hb_notification_change', updateCount);
    const interval = setInterval(updateCount, 5000);
    return () => {
      window.removeEventListener('hb_notification_change', updateCount);
      clearInterval(interval);
    };
  }, []);

  // Filter links based on role
  const visibleLinks = navLinks.filter(link => {
    if (user?.role === 'admin') {
      // Admins don't need symptom checker or personal appointments in the main bar
      return link.path === '/' || link.path === '/doctors' || link.path === '/clinics' || link.path === '/emergency';
    }
    return true;
  });

  const userInitial = user?.fullName ? user.fullName.split(' ').pop().charAt(0) : 'U';

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      style={{
        position: 'fixed',
        top: scrolled ? '15px' : '0px',
        left: scrolled ? '3%' : '0px',
        right: scrolled ? '3%' : '0px',
        margin: '0 auto',
        width: scrolled ? '94%' : '100%',
        maxWidth: scrolled ? '1440px' : '100%',
        borderRadius: scrolled ? '20px' : '0px',
        zIndex: 100,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: scrolled ? '1.5px solid var(--color-border)' : 'none',
        borderTop: scrolled ? '1.5px solid var(--color-border)' : 'none',
      }}
      className={scrolled ? 'glass shadow-lg' : ''}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: scrolled ? '0 2rem' : '0 3.5rem',
        transition: 'padding 0.3s ease',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center' }}
          className="desktop-nav">
          {visibleLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="nav-item"
              style={{
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.2s',
                color: link.isEmergency 
                  ? '#ef4444' 
                  : location.pathname === link.path ? '#2563EB' : 'var(--color-text-muted)',
                background: link.isEmergency
                  ? 'rgba(239,68,68,0.08)'
                  : location.pathname === link.path ? 'rgba(37,99,235,0.1)' : 'transparent',
                border: link.isEmergency ? '1px solid rgba(239,68,68,0.2)' : 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            style={{
              width: 38, height: 38,
              borderRadius: '10px',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-card)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </motion.button>

          {/* Notifications Bell (Patients & Guests only) */}
          {user?.role !== 'admin' && (
            <Link to="/notifications" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  width: 38, height: 38,
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  position: 'relative'
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-5px',
                    background: '#ef4444', color: 'white', fontSize: '0.65rem',
                    fontWeight: 900, width: '16px', height: '16px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </motion.div>
            </Link>
          )}

          {/* Book CTA (Patients & Guests only) */}
          {user?.role !== 'admin' && (
            <Link
              to="/booking"
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <Calendar size={16} />
              <span className="nav-book-text">Đặt lịch</span>
            </Link>
          )}

          {/* Login or User Menu Dropdown */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  height: 38,
                  padding: '0 10px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-card)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: user.role === 'admin' ? '#ef4444' : '#2563EB',
                  color: 'white', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900
                }}>
                  {userInitial}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', display: 'none' }} className="nav-username">
                  {user.fullName}
                </span>
                <ChevronDown size={14} style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute', right: 0, top: '48px',
                      width: '180px', background: 'var(--color-card)',
                      border: '1.5px solid var(--color-border)', borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 110
                    }}
                  >
                    {user.role === 'admin' ? (
                      <>
                        <Link to="/admin" style={{ display: 'block', padding: '10px 16px', color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                          onClick={() => setUserMenuOpen(false)}>
                          Trang Quản trị
                        </Link>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          style={{
                            width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 16px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left'
                          }}
                        >
                          <LogOut size={14} /> Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/profile" style={{ display: 'block', padding: '10px 16px', color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                          onClick={() => setUserMenuOpen(false)}>
                          Hồ sơ cá nhân
                        </Link>
                        <Link to="/my-appointments" style={{ display: 'block', padding: '10px 16px', color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                          onClick={() => setUserMenuOpen(false)}>
                          Lịch của tôi
                        </Link>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          style={{
                            width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 16px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left'
                          }}
                        >
                          <LogOut size={14} /> Đăng xuất
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-secondary nav-login-btn"
              style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 700 }}
            >
              Đăng nhập
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'none',
              width: 38, height: 38,
              borderRadius: '10px',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-card)',
              cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text)',
            }}
            className="mobile-menu-btn"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-card)',
              padding: '12px 24px 20px',
            }}
          >
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  color: link.isEmergency 
                    ? '#ef4444' 
                    : location.pathname === link.path ? '#2563EB' : 'var(--color-text)',
                  background: link.isEmergency
                    ? 'rgba(239,68,68,0.06)'
                    : location.pathname === link.path ? 'rgba(37,99,235,0.08)' : 'transparent',
                  marginBottom: '4px',
                  border: link.isEmergency ? '1px solid rgba(239,68,68,0.15)' : 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                to="/login"
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  background: 'rgba(0,0,0,0.04)',
                  textAlign: 'center',
                  marginTop: '8px',
                  border: '1.5px solid var(--color-border)'
                }}
              >
                Đăng nhập
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .nav-item {
          padding: 8px 16px;
          font-size: 0.88rem;
        }
        .desktop-nav {
          gap: 20px;
        }
        @media (max-width: 1300px) {
          .nav-item {
            padding: 8px 10px !important;
            font-size: 0.8rem !important;
          }
          .desktop-nav {
            gap: 8px !important;
          }
        }
        @media (min-width: 1100px) {
          .nav-username { display: inline !important; }
        }
        @media (max-width: 1200px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 500px) {
          .nav-book-text { display: none !important; }
        }
        @media (max-width: 600px) {
          .nav-login-btn { display: none !important; }
        }
      `}</style>
    </motion.nav>
  );
}
