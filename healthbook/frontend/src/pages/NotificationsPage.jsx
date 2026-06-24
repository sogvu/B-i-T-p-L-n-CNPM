import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Calendar, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import notification3d from '../assets/3d_notification.png';

const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'system',
    title: 'Chào mừng đến với HealthBook!',
    content: 'Hãy cập nhật các chỉ số sinh học (chiều cao, cân nặng, huyết áp) trong trang cá nhân để hệ thống có thể theo dõi sức khỏe của bạn tốt nhất.',
    date: '2026-06-24',
    read: false
  },
  {
    id: 'notif-2',
    type: 'health_tip',
    title: 'Mẹo sức khỏe: Uống đủ 2L nước mỗi ngày',
    content: 'Uống đủ nước giúp duy trì lưu lượng máu ổn định, lọc sạch thận và giữ làn da tươi trẻ. Hãy đặt lời nhắc uống nước ngay hôm nay!',
    date: '2026-06-23',
    read: true
  },
  {
    id: 'notif-3',
    type: 'reminder',
    title: 'Kiểm tra sức khỏe tổng quát định kỳ',
    content: 'Bác sĩ khuyên bạn nên khám tổng quát định kỳ 6 tháng một lần để sớm phát hiện và ngăn ngừa các vấn đề sức khỏe.',
    date: '2026-06-22',
    read: true
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('hb_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        setNotifications(SEED_NOTIFICATIONS);
      }
    } else {
      setNotifications(SEED_NOTIFICATIONS);
      localStorage.setItem('hb_notifications', JSON.stringify(SEED_NOTIFICATIONS));
    }
  }, []);

  const saveNotifications = (updated) => {
    setNotifications(updated);
    localStorage.setItem('hb_notifications', JSON.stringify(updated));
  };

  const handleMarkAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
    // Dispatches custom event to update navbar badge count immediately
    window.dispatchEvent(new Event('hb_notification_change'));
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    window.dispatchEvent(new Event('hb_notification_change'));
    toast.success('Đã đánh dấu đọc tất cả thông báo');
  };

  const handleDelete = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
    window.dispatchEvent(new Event('hb_notification_change'));
    toast.success('Đã xóa thông báo');
  };

  const handleDeleteAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo?')) {
      saveNotifications([]);
      window.dispatchEvent(new Event('hb_notification_change'));
    }
  };

  return (
    <div style={{ padding: '2rem 1.5rem', minHeight: '85vh', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
          borderRadius: '24px', padding: '2.5rem', color: 'white',
          position: 'relative', overflow: 'hidden', marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)'
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
                Hộp Thư Thông Báo
              </span>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Trung Tâm Thông Báo
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Xem thông tin nhắc lịch khám, cập nhật hệ thống và những bí quyết duy trì sức khỏe hữu ích của bạn.
              </p>
            </div>
            
            <div style={{ display: 'none' }} className="hero-3d-wrapper">
              <img src={notification3d} alt="Notification 3D" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        {notifications.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
            >
              <Check size={14} /> Đánh dấu đọc hết
            </button>
            
            <button
              onClick={handleDeleteAll}
              style={{
                background: 'none', border: 'none', color: '#ef4444',
                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <Trash2 size={14} /> Xóa tất cả
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-card)',
                  border: '1px dashed var(--color-border)', borderRadius: '20px', color: 'var(--color-text-muted)'
                }}
              >
                <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>Bạn không có thông báo nào</h3>
                <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Tất cả thông tin cập nhật sẽ xuất hiện tại đây.</p>
              </motion.div>
            ) : (
              notifications.map((notif) => {
                let NotifIcon = Bell;
                let notifColor = '#3b82f6';
                let notifBg = 'rgba(59,130,246,0.1)';

                if (notif.type === 'health_tip') {
                  NotifIcon = MessageCircle;
                  notifColor = '#10b981';
                  notifBg = 'rgba(16,185,129,0.1)';
                } else if (notif.type === 'reminder') {
                  NotifIcon = Calendar;
                  notifColor = '#f59e0b';
                  notifBg = 'rgba(245,158,11,0.1)';
                } else if (notif.type === 'system') {
                  NotifIcon = AlertCircle;
                  notifColor = '#ef4444';
                  notifBg = 'rgba(239,68,68,0.1)';
                }

                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    style={{
                      background: notif.read ? 'var(--color-card)' : 'rgba(37,99,235,0.04)',
                      border: notif.read ? '1.5px solid var(--color-border)' : '1.5px solid rgba(37,99,235,0.2)',
                      borderRadius: '20px', padding: '1.25rem', display: 'flex', gap: '1.25rem',
                      alignItems: 'flex-start', position: 'relative', transition: 'all 0.2s',
                      boxShadow: notif.read ? 'none' : '0 4px 15px rgba(37,99,235,0.03)'
                    }}
                  >
                    {/* Unread indicator dot */}
                    {!notif.read && (
                      <div style={{
                        position: 'absolute', top: 12, right: 12, width: 8, height: 8,
                        borderRadius: '50%', background: '#3b82f6'
                      }} />
                    )}

                    {/* Left Icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: '14px', background: notifBg,
                      color: notifColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <NotifIcon size={22} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                          {notif.title}
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '5px', lineHeight: 1.5 }}>
                        {notif.content}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          {notif.date}
                        </span>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!notif.read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.7rem', gap: '4px' }}
                            >
                              <Check size={12} /> Đọc
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notif.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

      </div>

      <style>{`
        @media (min-width: 600px) {
          .hero-3d-wrapper { display: block !important; }
        }
      `}</style>
    </div>
  );
}
