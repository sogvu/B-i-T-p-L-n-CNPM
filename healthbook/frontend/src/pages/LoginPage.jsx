import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient'); // 'patient' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password, role);
      if (res.success) {
        toast.success(`Đăng nhập thành công với vai trò ${role === 'admin' ? 'Admin' : 'Bệnh nhân'}!`);
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem', background: 'var(--color-bg)'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Back Link */}
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--color-text-muted)', textDecoration: 'none',
          fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem'
        }}>
          <ArrowLeft size={16} /> Quay lại trang chủ
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Đăng Nhập Hệ Thống</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Chọn vai trò của bạn để tiếp tục sử dụng dịch vụ</p>
          </div>

          {/* Role Tabs */}
          <div style={{
            display: 'flex', background: 'var(--color-bg)', padding: '4px',
            borderRadius: '12px', border: '1.5px solid var(--color-border)',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => { setRole('patient'); setEmail(''); setPassword(''); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: '8px',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: role === 'patient' ? 'var(--color-card)' : 'transparent',
                color: role === 'patient' ? '#2563EB' : 'var(--color-text-muted)',
                boxShadow: role === 'patient' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <User size={16} /> Bệnh nhân
            </button>
            
            <button
              onClick={() => { setRole('admin'); setEmail('admin@healthbook.vn'); setPassword(''); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: '8px',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: role === 'admin' ? 'var(--color-card)' : 'transparent',
                color: role === 'admin' ? '#ef4444' : 'var(--color-text-muted)',
                boxShadow: role === 'admin' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Shield size={16} /> Quản trị viên
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Email field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                ĐỊA CHỈ EMAIL
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="email"
                  className="input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                MẬT KHẨU
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            {role === 'admin' && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'rgba(239,68,68,0.06)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.1)' }}>
                Tài khoản dùng thử Admin:<br />
                Email: <strong style={{ color: '#ef4444' }}>admin@healthbook.vn</strong><br />
                Mật khẩu: <strong style={{ color: '#ef4444' }}>admin123</strong>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%', padding: '12px', justifyContent: 'center', gap: '8px', marginTop: '0.5rem',
                background: role === 'admin' ? '#ef4444' : '#2563EB',
                borderColor: role === 'admin' ? '#ef4444' : '#2563EB'
              }}
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
              <LogIn size={16} />
            </button>

            {role === 'patient' && (
              <div style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Chưa có tài khoản? </span>
                <Link to="/register" style={{ color: '#2563EB', fontWeight: 800, textDecoration: 'none' }}>
                  Đăng ký ngay
                </Link>
              </div>
            )}

          </form>

        </motion.div>

      </div>
    </div>
  );
}
