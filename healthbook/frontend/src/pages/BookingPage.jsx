import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, User, Mail, Phone, FileText, CheckCircle,
  AlertTriangle, ArrowLeft, Star, MapPin, ChevronLeft, ChevronRight
} from 'lucide-react';
import { doctorsApi, appointmentsApi } from '../services/api';
import toast from 'react-hot-toast';
import { format, addDays, startOfToday, isToday, isBefore } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_TIMES = [
  { slot: '08:00', label: '08:00 SA' }, { slot: '08:30', label: '08:30 SA' },
  { slot: '09:00', label: '09:00 SA' }, { slot: '09:30', label: '09:30 SA' },
  { slot: '10:00', label: '10:00 SA' }, { slot: '10:30', label: '10:30 SA' },
  { slot: '11:00', label: '11:00 SA' }, { slot: '14:00', label: '02:00 CH' },
  { slot: '14:30', label: '02:30 CH' }, { slot: '15:00', label: '03:00 CH' },
  { slot: '15:30', label: '03:30 CH' }, { slot: '16:00', label: '04:00 CH' },
  { slot: '16:30', label: '04:30 CH' },
];

const STEPS = ['Chọn bác sĩ', 'Chọn ngày & giờ', 'Thông tin bệnh nhân', 'Xác nhận'];

export default function BookingPage() {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [form, setForm] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    symptoms: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [conflict, setConflict] = useState(null);

  // Generate calendar days (14 days from today)
  const today = startOfToday();
  const calendarDays = [...Array(7)].map((_, i) => addDays(today, calendarOffset * 7 + i));

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (user && user.role === 'patient') {
      setForm(prev => ({
        ...prev,
        patient_name: user.fullName || '',
        patient_email: user.email || '',
        patient_phone: user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (doctorId && doctors.length > 0) {
      const doc = doctors.find(d => d.doctor_id === doctorId);
      if (doc) {
        setSelectedDoctor(doc);
        setStep(2);
      }
    }
  }, [doctorId, doctors]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadSlots();
    }
  }, [selectedDoctor, selectedDate]);

  // Tự động lướt lên đầu trang khi chuyển bước (bao gồm khi đặt lịch xong sang bước 5)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  async function loadDoctors() {
    try {
      const res = await doctorsApi.getAll();
      if (res.success) setDoctors(res.data);
    } catch {
      toast.error('Không thể tải danh sách bác sĩ');
    }
  }

  async function loadSlots() {
    setSlotsLoading(true);
    setSlots([]);
    try {
      const res = await appointmentsApi.getSlots(selectedDoctor.doctor_id, selectedDate);
      if (res.success) setSlots(res.data);
    } catch {
      // default: all available
      setSlots(AVAILABLE_TIMES.map(t => ({ time: t.slot, available: true })));
    } finally {
      setSlotsLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.patient_name || !form.patient_email) {
      toast.error('Vui lòng điền đầy đủ họ tên và email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.patient_email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setSubmitting(true);
    setConflict(null);
    try {
      const res = await appointmentsApi.create({
        ...form,
        doctor_id: selectedDoctor.doctor_id,
        clinic_id: selectedDoctor.clinic_id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
      });
      if (res.success) {
        setSuccess(res.data);
        setStep(5); // success step
        toast.success('Đặt lịch thành công!');
        
        // Push notification on successful booking
        const newNotif = {
          id: 'notif-' + Math.floor(Math.random() * 100000),
          type: 'reminder',
          title: 'Đặt lịch khám thành công!',
          content: `Lịch khám với ${selectedDoctor.doctor_name} lúc ${selectedTime} ngày ${selectedDate} đã được xác nhận. Mã lịch hẹn: ${res.data.appointment_id}.`,
          date: new Date().toISOString().split('T')[0],
          read: false
        };
        const existingNotifs = localStorage.getItem('hb_notifications');
        let list = [];
        if (existingNotifs) {
          try { list = JSON.parse(existingNotifs); } catch (e) {}
        }
        list.unshift(newNotif);
        localStorage.setItem('hb_notifications', JSON.stringify(list));
        window.dispatchEvent(new Event('hb_notification_change'));
      }
    } catch (err) {
      if (err.status === 409) {
        setConflict({ message: err.message, suggestedTimes: err.suggestedTimes || [] });
        toast.error('Khung giờ đã được đặt!');
      } else {
        toast.error(err.message || 'Có lỗi xảy ra');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function selectConflictTime(time) {
    setSelectedTime(time);
    setConflict(null);
    setStep(4);
  }

  const DOCTOR_COLORS = ['#2563EB', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9'];

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #2563EB)',
        padding: '2.5rem 0',
      }}>
        <div className="container">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1.25rem',
          }}>
            <ArrowLeft size={18} /> {step > 1 ? 'Bước trước' : 'Quay lại'}
          </button>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem' }}>
            Đặt Lịch Khám
          </h1>

          {/* Step Indicator */}
          {step < 5 && (
            <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
              {STEPS.map((label, i) => {
                const stepNum = i + 1;
                const isActive = step === stepNum;
                const isDone = step > stepNum;
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: isDone ? '#10b981' : isActive ? 'white' : 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.85rem',
                        color: isDone ? 'white' : isActive ? '#2563EB' : 'rgba(255,255,255,0.6)',
                        transition: 'all 0.3s',
                      }}>
                        {isDone ? <CheckCircle size={16} /> : stepNum}
                      </div>
                      <span style={{
                        fontSize: '0.65rem', marginTop: '4px', fontWeight: 600,
                        color: isActive || isDone ? 'white' : 'rgba(255,255,255,0.5)',
                        whiteSpace: 'nowrap',
                      }}>
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{
                        flex: 1, height: 2,
                        background: step > stepNum ? '#10b981' : 'rgba(255,255,255,0.2)',
                        margin: '0 8px',
                        marginBottom: '18px',
                        transition: 'all 0.3s',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ maxWidth: 900, padding: '2rem 1.5rem' }}>
        <AnimatePresence mode="wait">
          {/* STEP 1: Select Doctor */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem' }}>Chọn bác sĩ</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {doctors.map((doc, i) => {
                  const color = DOCTOR_COLORS[i % DOCTOR_COLORS.length];
                  const initial = doc.doctor_name?.charAt(doc.doctor_name.lastIndexOf(' ') + 1) || 'B';
                  const stars = parseFloat(doc.rating) || 4.5;
                  const isSelected = selectedDoctor?.doctor_id === doc.doctor_id;

                  return (
                    <motion.div key={doc.doctor_id} whileHover={{ y: -2 }}>
                      <div
                        onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                        style={{
                          padding: '1.25rem', borderRadius: '16px', cursor: 'pointer',
                          border: `2px solid ${isSelected ? '#2563EB' : 'var(--color-border)'}`,
                          background: isSelected ? 'rgba(37,99,235,0.05)' : 'var(--color-card)',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => !isSelected && (e.currentTarget.style.borderColor = '#2563EB40')}
                        onMouseLeave={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--color-border)')}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: '14px', flexShrink: 0,
                            background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.4rem', fontWeight: 800, color,
                          }}>
                            {initial}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                              {doc.doctor_name}
                            </h3>
                            <span className="badge badge-blue" style={{ fontSize: '0.68rem', marginBottom: '5px' }}>
                              {doc.specialty}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={11}
                                  fill={i < Math.floor(stars) ? '#fbbf24' : 'none'}
                                  color={i < Math.floor(stars) ? '#fbbf24' : '#cbd5e1'}
                                />
                              ))}
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                                {doc.experience} năm KN
                              </span>
                            </div>
                            {doc.clinic && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <MapPin size={11} />
                                {doc.clinic.clinic_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Date & Time */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem' }}>Chọn ngày & giờ khám</h2>

              {/* Calendar */}
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 700 }}>Chọn ngày khám</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 1))}
                      disabled={calendarOffset === 0}
                      style={{
                        width: 32, height: 32, borderRadius: '8px', border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        opacity: calendarOffset === 0 ? 0.4 : 1,
                      }}>
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setCalendarOffset(calendarOffset + 1)}
                      style={{
                        width: 32, height: 32, borderRadius: '8px', border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', padding: '4px 0' }}>
                      {d}
                    </div>
                  ))}
                  {calendarDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isSelected = selectedDate === dateStr;
                    const isPast = isBefore(day, today);
                    const isTodayDate = isToday(day);

                    return (
                      <button key={dateStr}
                        disabled={isPast}
                        onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); setConflict(null); }}
                        style={{
                          padding: '10px 4px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #2563EB' : '2px solid transparent',
                          background: isSelected ? '#2563EB' : isTodayDate ? 'rgba(37,99,235,0.1)' : 'var(--color-bg)',
                          color: isSelected ? 'white' : isPast ? 'var(--color-border)' : 'var(--color-text)',
                          cursor: isPast ? 'not-allowed' : 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s',
                          opacity: isPast ? 0.4 : 1,
                        }}
                      >
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{format(day, 'd')}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                          {format(day, 'MMM', { locale: vi })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>
                    Giờ khám - {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, dd/MM/yyyy', { locale: vi })}
                  </h3>

                  {conflict && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '1rem', borderRadius: '12px',
                        background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
                        marginBottom: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 700, marginBottom: '8px' }}>
                        <AlertTriangle size={16} />
                        {conflict.message}
                      </div>
                      {conflict.suggestedTimes?.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Các giờ trống gần nhất:</p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {conflict.suggestedTimes.map(t => (
                              <button key={t} onClick={() => selectConflictTime(t)} style={{
                                padding: '6px 14px', borderRadius: '9999px',
                                background: '#10b981', color: 'white',
                                border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.85rem',
                              }}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {slotsLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                      {[...Array(13)].map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: 44, borderRadius: 10 }} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                      {AVAILABLE_TIMES.map(({ slot, label }) => {
                        const slotData = slots.find(s => s.time === slot);
                        const available = slotData ? slotData.available : true;
                        const isSelected = selectedTime === slot;

                        return (
                          <button key={slot}
                            disabled={!available}
                            onClick={() => { setSelectedTime(slot); setConflict(null); }}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '10px',
                              border: '2px solid',
                              borderColor: isSelected ? '#2563EB' : available ? 'var(--color-border)' : 'transparent',
                              background: isSelected ? '#2563EB' : available ? 'var(--color-bg)' : 'rgba(0,0,0,0.04)',
                              color: isSelected ? 'white' : available ? 'var(--color-text)' : 'var(--color-text-muted)',
                              cursor: available ? 'pointer' : 'not-allowed',
                              fontSize: '0.875rem', fontWeight: 600,
                              transition: 'all 0.15s',
                              textDecoration: !available ? 'line-through' : 'none',
                              opacity: !available ? 0.5 : 1,
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '4px', background: '#2563EB' }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>Đã chọn</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '4px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>Còn trống</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '4px', background: 'rgba(0,0,0,0.06)' }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>Đã đặt</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', opacity: (!selectedDate || !selectedTime) ? 0.5 : 1 }}
              >
                Tiếp theo <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 3: Patient Info */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem' }}>Thông tin bệnh nhân</h2>
              <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>
                      <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Họ và tên *
                    </label>
                    <input
                      className="input"
                      placeholder="Nguyễn Văn A"
                      value={form.patient_name}
                      onChange={e => setForm({ ...form, patient_name: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>
                        <Mail size={14} style={{ display: 'inline', marginRight: '6px' }} />
                        Email *
                      </label>
                      <input
                        className="input"
                        type="email"
                        placeholder="email@example.com"
                        value={form.patient_email}
                        onChange={e => setForm({ ...form, patient_email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>
                        <Phone size={14} style={{ display: 'inline', marginRight: '6px' }} />
                        Số điện thoại
                      </label>
                      <input
                        className="input"
                        placeholder="0912 345 678"
                        value={form.patient_phone}
                        onChange={e => setForm({ ...form, patient_phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>
                      <FileText size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Triệu chứng / Ghi chú
                    </label>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="Mô tả triệu chứng bệnh hoặc lý do khám..."
                      value={form.symptoms}
                      onChange={e => setForm({ ...form, symptoms: e.target.value })}
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(4)}
                disabled={!form.patient_name || !form.patient_email}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', opacity: (!form.patient_name || !form.patient_email) ? 0.5 : 1 }}
              >
                Xem lại & Xác nhận <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 4: Confirm */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem' }}>Xác nhận lịch hẹn</h2>

              {conflict && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: '1.25rem', borderRadius: '16px',
                    background: 'rgba(239,68,68,0.05)', border: '2px solid rgba(239,68,68,0.3)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontWeight: 700, marginBottom: '10px' }}>
                    <AlertTriangle size={20} />
                    Khung giờ đã được đặt trước!
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '12px' }}>
                    {conflict.message}. Vui lòng chọn giờ khác:
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {conflict.suggestedTimes?.map(t => (
                      <button key={t} onClick={() => selectConflictTime(t)} style={{
                        padding: '8px 16px', borderRadius: '10px',
                        background: '#10b981', color: 'white',
                        border: 'none', cursor: 'pointer',
                        fontWeight: 700, fontSize: '0.9rem',
                      }}>
                        ✓ {t}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  Thông tin lịch hẹn
                </h3>

                {/* Doctor Info */}
                {selectedDoctor && (
                  <div style={{
                    display: 'flex', gap: '1rem', alignItems: 'center',
                    padding: '1rem', borderRadius: '12px', background: 'rgba(37,99,235,0.04)',
                    border: '1px solid rgba(37,99,235,0.1)', marginBottom: '1.25rem',
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '14px',
                      background: 'linear-gradient(135deg, #2563EB20, #2563EB40)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem', fontWeight: 800, color: '#2563EB', flexShrink: 0,
                    }}>
                      {selectedDoctor.doctor_name?.charAt(selectedDoctor.doctor_name.lastIndexOf(' ') + 1)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{selectedDoctor.doctor_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{selectedDoctor.specialty}</div>
                      {selectedDoctor.clinic && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                          <MapPin size={11} /> {selectedDoctor.clinic.clinic_name}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { label: 'Ngày khám', value: selectedDate ? format(new Date(selectedDate + 'T00:00:00'), 'EEEE, dd/MM/yyyy', { locale: vi }) : '', icon: Calendar, color: '#2563EB' },
                    { label: 'Giờ khám', value: selectedTime, icon: Clock, color: '#8b5cf6' },
                    { label: 'Bệnh nhân', value: form.patient_name, icon: User, color: '#10b981' },
                    { label: 'Email', value: form.patient_email, icon: Mail, color: '#f59e0b' },
                    { label: 'Điện thoại', value: form.patient_phone || '—', icon: Phone, color: '#ef4444' },
                    { label: 'Ghi chú', value: form.symptoms || '—', icon: FileText, color: '#64748b' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--color-border)',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: `${color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon size={16} color={color} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>{label}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary"
                style={{
                  width: '100%', justifyContent: 'center', padding: '16px',
                  fontSize: '1.05rem', fontWeight: 700,
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
                }}
              >
                {submitting ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 8 }}>⏳</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Xác nhận đặt lịch
                  </>
                )}
              </button>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </motion.div>
          )}

          {/* STEP 5: Success */}
          {step === 5 && success && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '3rem 1rem' }}
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: '0 10px 40px rgba(16,185,129,0.4)',
                }}
              >
                <CheckCircle size={50} color="white" />
              </motion.div>

              <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem', color: '#10b981' }}>
                Đặt lịch thành công! 🎉
              </h1>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Email xác nhận đã được gửi tới <strong>{form.patient_email}</strong>
              </p>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Chúng tôi sẽ nhắc lịch trước 24h và 1h qua email
              </p>

              <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', textAlign: 'left', maxWidth: '500px', margin: '0 auto 2rem' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{
                    background: '#10b981', color: 'white',
                    padding: '4px 12px', borderRadius: '9999px',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    #{success.appointment_id}
                  </span>
                  <span className="badge badge-green">Đã xác nhận</span>
                </div>
                <div style={{ display: 'grid', gap: '8px', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Calendar size={14} color="#2563EB" style={{ marginTop: 1 }} />
                    <span><strong>{selectedDate}</strong> lúc <strong>{success.appointment_time}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <User size={14} color="#2563EB" style={{ marginTop: 1 }} />
                    <span>BS. {selectedDoctor?.doctor_name}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/my-appointments" className="btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                  <Calendar size={18} /> Xem lịch của tôi
                </Link>
                <button onClick={() => { setStep(1); setSelectedDoctor(null); setSelectedDate(''); setSelectedTime(''); setSuccess(null); setConflict(null); setForm({ patient_name: '', patient_email: '', patient_phone: '', symptoms: '' }); }}
                  className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                  Đặt lịch mới
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
