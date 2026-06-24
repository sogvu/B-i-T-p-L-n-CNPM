import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, User, Search, Filter, X, CheckCircle,
  XCircle, AlertCircle, Edit3, Trash2, ChevronDown, RefreshCw
} from 'lucide-react';
import { appointmentsApi } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  confirmed: { label: 'Đã xác nhận', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle },
  pending: { label: 'Chờ xác nhận', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertCircle },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
};

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
    if (user && user.role === 'patient' && user.email) {
      setEmail(user.email);
      setEmailInput(user.email);
      setSearched(true);
      loadAppointments(user.email);
    }
  }, [user]);

  async function loadAppointments(emailToSearch) {
    setLoading(true);
    try {
      const res = await appointmentsApi.getAll({ email: emailToSearch });
      if (res.success) setAppointments(res.data);
    } catch {
      toast.error('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmail(emailInput.trim());
    setSearched(true);
    loadAppointments(emailInput.trim());
  }

  async function handleCancel(id) {
    setCancellingId(id);
    try {
      const res = await appointmentsApi.cancel(id);
      if (res.success) {
        toast.success('Hủy lịch hẹn thành công');
        setAppointments(prev => prev.map(a =>
          a.appointment_id === id ? { ...a, status: 'cancelled' } : a
        ));
      }
    } catch {
      toast.error('Không thể hủy lịch hẹn');
    } finally {
      setCancellingId(null);
      setConfirmCancel(null);
    }
  }

  const filtered = appointments.filter(a => {
    const matchStatus = filter === 'all' || a.status === filter;
    const matchSearch = !search ||
      a.appointment_id?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.clinic?.clinic_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', padding: '3rem 0 4rem' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
              Lịch Khám Của Tôi
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
              Xem và quản lý lịch hẹn khám bệnh
            </p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', maxWidth: '500px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  type="email"
                  placeholder="Nhập email đã đặt lịch..."
                  style={{
                    width: '100%', padding: '11px 12px 11px 38px',
                    borderRadius: '12px', border: 'none', fontSize: '0.9rem',
                    outline: 'none', background: 'white', color: '#0f172a',
                  }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ borderRadius: '12px', whiteSpace: 'nowrap' }}>
                Tìm lịch hẹn
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {!searched ? (
          <EmptyStart />
        ) : loading ? (
          <SkeletonList />
        ) : appointments.length === 0 ? (
          <NoAppointments email={email} />
        ) : (
          <>
            {/* Stats Bar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1.5rem' }}
            >
              {[
                { key: 'all', label: 'Tất cả', count: appointments.length },
                { key: 'confirmed', label: 'Xác nhận', count: appointments.filter(a => a.status === 'confirmed').length },
                { key: 'pending', label: 'Chờ xử lý', count: appointments.filter(a => a.status === 'pending').length },
                { key: 'cancelled', label: 'Đã hủy', count: appointments.filter(a => a.status === 'cancelled').length },
              ].map(({ key, label, count }) => (
                <button key={key} onClick={() => setFilter(key)} style={{
                  padding: '8px 16px', borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: filter === key ? '#7c3aed' : 'var(--color-border)',
                  background: filter === key ? 'rgba(124,58,237,0.1)' : 'var(--color-card)',
                  color: filter === key ? '#7c3aed' : 'var(--color-text-muted)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  {label}
                  <span style={{
                    background: filter === key ? '#7c3aed' : 'var(--color-bg)',
                    color: filter === key ? 'white' : 'var(--color-text-muted)',
                    borderRadius: '9999px', padding: '2px 8px', fontSize: '0.75rem',
                  }}>
                    {count}
                  </span>
                </button>
              ))}

              {/* Search */}
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm theo mã, bác sĩ..."
                  style={{
                    width: '100%', padding: '8px 10px 8px 30px',
                    borderRadius: '10px', border: '1.5px solid var(--color-border)',
                    background: 'var(--color-card)', color: 'var(--color-text)',
                    fontSize: '0.85rem', outline: 'none',
                  }}
                />
              </div>

              <button onClick={() => loadAppointments(email)} style={{
                padding: '8px 14px', borderRadius: '10px',
                border: '1.5px solid var(--color-border)',
                background: 'var(--color-card)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.85rem', fontWeight: 600,
              }}>
                <RefreshCw size={14} /> Làm mới
              </button>
            </motion.div>

            {/* Appointments List */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                Không có lịch hẹn nào trong danh mục này
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filtered.map((apt, i) => (
                  <AppointmentCard
                    key={apt.appointment_id}
                    apt={apt}
                    index={i}
                    today={today}
                    cancellingId={cancellingId}
                    confirmCancel={confirmCancel}
                    setConfirmCancel={setConfirmCancel}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Link to booking */}
      {searched && appointments.length > 0 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Link to="/booking" className="btn-primary" style={{ display: 'inline-flex' }}>
            <Calendar size={16} /> Đặt lịch mới
          </Link>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ apt, index, today, cancellingId, confirmCancel, setConfirmCancel, onCancel }) {
  const statusCfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const isPast = apt.appointment_date < today;
  const isCancelled = apt.status === 'cancelled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="card" style={{
        padding: '1.5rem',
        opacity: isCancelled ? 0.7 : 1,
        borderLeft: `4px solid ${statusCfg.color}`,
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Left: Info */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700,
                background: 'var(--color-bg)', padding: '3px 10px', borderRadius: '6px',
                color: 'var(--color-text-muted)',
              }}>
                #{apt.appointment_id}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '9999px',
                background: statusCfg.bg, color: statusCfg.color,
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                <StatusIcon size={12} />
                {statusCfg.label}
              </span>
              {isPast && !isCancelled && (
                <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>Đã qua</span>
              )}
            </div>

            {/* Doctor */}
            {apt.doctor && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '12px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #2563EB20, #2563EB40)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 800, color: '#2563EB',
                }}>
                  {apt.doctor.doctor_name?.charAt(apt.doctor.doctor_name.lastIndexOf(' ') + 1) || 'B'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{apt.doctor.doctor_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{apt.doctor.specialty}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                <Calendar size={14} color="#2563EB" />
                {apt.appointment_date}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                <Clock size={14} color="#8b5cf6" />
                {apt.appointment_time}
              </div>
              {apt.clinic && (
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  🏥 {apt.clinic.clinic_name}
                </div>
              )}
            </div>

            {apt.symptoms && (
              <div style={{
                marginTop: '8px', padding: '8px 12px', borderRadius: '8px',
                background: 'var(--color-bg)', fontSize: '0.8rem', color: 'var(--color-text-muted)',
                borderLeft: '3px solid var(--color-border)',
              }}>
                📋 {apt.symptoms}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          {!isCancelled && !isPast && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'flex-start' }}>
              <AnimatePresence>
                {confirmCancel === apt.appointment_id ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '12px', borderRadius: '12px',
                      background: 'rgba(239,68,68,0.05)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                      Bạn chắc chắn muốn hủy?
                    </p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => onCancel(apt.appointment_id)}
                        disabled={cancellingId === apt.appointment_id}
                        style={{
                          flex: 1, padding: '6px', borderRadius: '8px',
                          background: '#ef4444', color: 'white',
                          border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                        }}
                      >
                        {cancellingId === apt.appointment_id ? '...' : 'Hủy lịch'}
                      </button>
                      <button onClick={() => setConfirmCancel(null)} style={{
                        flex: 1, padding: '6px', borderRadius: '8px',
                        background: 'var(--color-bg)', color: 'var(--color-text)',
                        border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '0.8rem',
                      }}>
                        Giữ lại
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setConfirmCancel(apt.appointment_id)}
                    style={{
                      padding: '8px 14px', borderRadius: '10px',
                      border: '1.5px solid rgba(239,68,68,0.3)',
                      background: 'transparent', color: '#ef4444',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <XCircle size={14} /> Hủy lịch
                  </button>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyStart() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '5rem 2rem' }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
      <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Tra cứu lịch hẹn</h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
        Nhập email bạn đã sử dụng khi đặt lịch để xem và quản lý các lịch hẹn
      </p>
      <Link to="/booking" className="btn-primary" style={{ display: 'inline-flex' }}>
        <Calendar size={16} /> Đặt lịch ngay
      </Link>
    </motion.div>
  );
}

function NoAppointments({ email }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '4rem 2rem' }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
      <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Không tìm thấy lịch hẹn</h3>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Không có lịch hẹn nào với email <strong>{email}</strong>
      </p>
      <Link to="/booking" className="btn-primary" style={{ display: 'inline-flex' }}>
        <Calendar size={16} /> Đặt lịch mới
      </Link>
    </motion.div>
  );
}

function SkeletonList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card" style={{ padding: '1.5rem' }}>
          <div className="skeleton" style={{ height: 24, width: '30%', borderRadius: 6, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: '1rem', marginBottom: 12 }}>
            <div className="skeleton" style={{ width: 46, height: 46, borderRadius: '12px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 18, width: '50%', borderRadius: 6, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '30%', borderRadius: 6 }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );
}
