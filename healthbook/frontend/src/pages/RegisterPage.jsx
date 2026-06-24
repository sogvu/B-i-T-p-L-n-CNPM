import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Calendar, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: 'Nam'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, phone, password, confirmPassword, dob, gender } = form;

    if (!fullName || !email || !phone || !password || !confirmPassword || !dob) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải dài ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName,
        email,
        phone,
        password,
        dob,
        gender
      });

      if (res.success) {
        toast.success('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi đăng ký tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem', background: 'var(--color-bg)'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* Back Link */}
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--color-text-muted)', textDecoration: 'none',
          fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem'
        }}>
          <ArrowLeft size={16} /> Quay lại trang đăng nhập
        </Link>

        {/* Auth Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--color-card)', border: '1px solid var(--color-border)',
            borderRadius: '24px', padding: '2.25rem', boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Đăng Ký Tài Khoản</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Tạo tài khoản bệnh nhân để quản lý hồ sơ và đặt lịch khám dễ dàng.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            {/* Họ tên */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '5px' }}>
                HỌ VÀ TÊN BỆNH NHÂN *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="text"
                  className="input"
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            {/* Email & Phone grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="form-grid-split">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '5px' }}>
                  EMAIL *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="email"
                    className="input"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '5px' }}>
                  SỐ ĐIỆN THOẠI *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="tel"
                    className="input"
                    placeholder="0987654321"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* DOB & Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="form-grid-split">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '5px' }}>
                  NGÀY SINH *
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="date"
                    className="input"
                    value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '5px' }}>
                  GIỚI TÍNH *
                </label>
                <select
                  className="input"
                  value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value })}
                >
                  <option>Nam</option>
                  <option>Nữ</option>
                  <option>Khác</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '5px' }}>
                MẬT KHẨU * (tối thiểu 6 ký tự)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '5px' }}>
                XÁC NHẬN MẬT KHẨU *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', gap: '8px', marginTop: '0.75rem' }}
            >
              {loading ? 'Đang khởi tạo tài khoản...' : 'Đăng ký tài khoản'}
              <UserPlus size={16} />
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '8px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Đã có tài khoản? </span>
              <Link to="/login" style={{ color: '#2563EB', fontWeight: 800, textDecoration: 'none' }}>
                Đăng nhập
              </Link>
            </div>

          </form>

        </motion.div>

      </div>

      <style>{`
        @media (max-width: 480px) {
          .form-grid-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
