import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, ArrowRight, ArrowLeft, Heart, Brain, Eye, Baby, 
  Stethoscope, Bone, Wind, AlertTriangle, Calendar, Star, CheckCircle
} from 'lucide-react';
import { doctorsApi } from '../services/api';
import symptom3d from '../assets/3d_symptom.png';
import { getDoctorAvatar } from '../utils/avatarHelper';

const SYMPTOMS = [
  { id: 'dau_nguc', label: 'Đau tức ngực / Khó thở', specialty: 'Tim mạch', icon: Heart, color: '#ef4444' },
  { id: 'dau_dau', label: 'Đau đầu dữ dội / Chóng mặt', specialty: 'Thần kinh', icon: Brain, color: '#8b5cf6' },
  { id: 'nhin_mo', label: 'Nhìn mờ / Đau mắt / Đỏ mắt', specialty: 'Mắt', icon: Eye, color: '#06b6d4' },
  { id: 'tre_sot', label: 'Trẻ em sốt / Biếng ăn / Quấy khóc', specialty: 'Nhi khoa', icon: Baby, color: '#f59e0b' },
  { id: 'dau_bung', label: 'Đau bụng / Buồn nôn / Tiêu chảy', specialty: 'Tiêu hóa', icon: Activity, color: '#f97316' },
  { id: 'dau_khop', label: 'Đau cơ xương khớp / Chấn thương', specialty: 'Chỉnh hình', icon: Bone, color: '#10b981' },
  { id: 'ho_kho_tho', label: 'Ho kéo dài / Khó thở / Đau họng', specialty: 'Hô hấp', icon: Wind, color: '#0ea5e9' },
  { id: 'met_moi', label: 'Mệt mỏi kéo dài / Sụt cân nhanh', specialty: 'Nội khoa', icon: Stethoscope, color: '#2563EB' }
];

export default function SymptomCheckerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [severity, setSeverity] = useState('moderate'); // mild, moderate, severe
  const [duration, setDuration] = useState('1-3days'); // <24h, 1-3days, >1week
  const [recommendation, setRecommendation] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Toggle symptom selection
  const handleToggleSymptom = (id) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && selectedSymptoms.length === 0) {
      alert('Vui lòng chọn ít nhất một triệu chứng.');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  // Analyze symptoms to produce diagnosis and fetch matching doctors
  useEffect(() => {
    if (step === 3 && selectedSymptoms.length > 0) {
      // Find the main specialty based on selected symptoms (majority vote or first choice)
      const primarySymptom = SYMPTOMS.find(s => selectedSymptoms.includes(s.id));
      const targetSpecialty = primarySymptom ? primarySymptom.specialty : 'Nội khoa';
      
      let urgency = 'medium'; // low, medium, high
      let warningText = 'Bạn nên đặt lịch hẹn khám trong vài ngày tới.';
      let badgeColor = '#f59e0b'; // orange

      if (severity === 'severe' || selectedSymptoms.includes('dau_nguc') || selectedSymptoms.includes('dau_dau')) {
        urgency = 'high';
        warningText = 'Chú ý: Triệu chứng có dấu hiệu nghiêm trọng. Nếu có biểu hiện đau thắt dữ dội, khó thở tăng dần hoặc liệt nửa người, vui lòng đến ngay cơ sở y tế gần nhất hoặc gọi cấp cứu 115.';
        badgeColor = '#ef4444'; // red
      } else if (severity === 'mild' && duration === '<24h') {
        urgency = 'low';
        warningText = 'Các triệu chứng nhẹ và mới xuất hiện. Hãy theo dõi thêm tại nhà, uống nhiều nước và nghỉ ngơi.';
        badgeColor = '#10b981'; // green
      }

      setRecommendation({
        specialty: targetSpecialty,
        urgency,
        warningText,
        badgeColor,
        primarySymptom: primarySymptom.label
      });

      // Fetch matching doctors
      setLoadingDocs(true);
      doctorsApi.getAll({ specialty: targetSpecialty })
        .then(res => {
          if (res.success) {
            setDoctors(res.data);
          }
        })
        .catch(err => console.error('Error fetching suggested doctors:', err))
        .finally(() => setLoadingDocs(false));
    }
  }, [step, selectedSymptoms, severity, duration]);

  const handleReset = () => {
    setSelectedSymptoms([]);
    setSeverity('moderate');
    setDuration('1-3days');
    setRecommendation(null);
    setDoctors([]);
    setStep(1);
  };

  return (
    <div style={{ padding: '2rem 1.5rem', minHeight: '85vh', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          borderRadius: '24px', padding: '2.5rem', color: 'white',
          position: 'relative', overflow: 'hidden', marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)'
        }}>
          {/* Blobs */}
          <div style={{
            position: 'absolute', width: '200px', height: '200px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
            top: '-50px', right: '-50px', filter: 'blur(30px)'
          }} />
          
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)', padding: '5px 12px',
                borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                display: 'inline-block', marginBottom: '0.75rem'
              }}>
                Chẩn Đoán Triệu Chứng Thông Minh
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.2 }}>
                Kiểm Tra Sức Khỏe Trực Tuyến
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Chọn các dấu hiệu cơ thể của bạn để nhận khuyến nghị chuyên khoa y tế và bác sĩ phù hợp nhất.
              </p>
            </div>
            
            <div style={{ display: 'none' }} className="hero-3d-wrapper">
              <img src={symptom3d} alt="Symptom 3D" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              flex: 1, height: '6px', borderRadius: '3px',
              background: s <= step ? 'linear-gradient(90deg, #2563EB, #3b82f6)' : 'var(--color-border)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {/* Form Wizard */}
        <div style={{
          background: 'var(--color-card)', border: '1px solid var(--color-border)',
          borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SELECT SYMPTOMS */}
            {step === 1 && (
              <motion.div
                key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                  Bước 1: Chọn (các) triệu chứng bạn đang gặp phải
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {SYMPTOMS.map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym.id);
                    const Icon = sym.icon;
                    return (
                      <div
                        key={sym.id}
                        onClick={() => handleToggleSymptom(sym.id)}
                        style={{
                          padding: '1.25rem', borderRadius: '16px',
                          border: isSelected ? `2.5px solid ${sym.color}` : '1.5px solid var(--color-border)',
                          background: isSelected ? `${sym.color}08` : 'var(--color-bg)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: '12px',
                          background: `${sym.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: sym.color
                        }}>
                          <Icon size={22} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                            {sym.label}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Chuyên khoa gợi ý: {sym.specialty}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ accentColor: sym.color, width: '18px', height: '18px' }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleNextStep}
                    disabled={selectedSymptoms.length === 0}
                    className="btn-primary"
                    style={{ padding: '12px 24px', gap: '8px', opacity: selectedSymptoms.length === 0 ? 0.6 : 1 }}
                  >
                    Tiếp tục <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <motion.div
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                  Bước 2: Chi tiết thêm về triệu chứng của bạn
                </h3>

                {/* Severity */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                    Mức độ nghiêm trọng của triệu chứng:
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'mild', label: 'Nhẹ (Không cản trở sinh hoạt hàng ngày)', color: '#10b981' },
                      { id: 'moderate', label: 'Trung bình (Hơi khó chịu, ảnh hưởng nhẹ)', color: '#f59e0b' },
                      { id: 'severe', label: 'Nặng (Rất mệt, đau đớn, khó chịu nhiều)', color: '#ef4444' }
                    ].map((sev) => (
                      <button
                        key={sev.id}
                        type="button"
                        onClick={() => setSeverity(sev.id)}
                        style={{
                          flex: 1, minWidth: '200px', padding: '1rem', borderRadius: '12px',
                          border: severity === sev.id ? `2px solid ${sev.color}` : '1.5px solid var(--color-border)',
                          background: severity === sev.id ? `${sev.color}10` : 'var(--color-bg)',
                          color: 'var(--color-text)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                    Thời gian triệu chứng kéo dài bao lâu?
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {[
                      { id: '<24h', label: 'Dưới 24 giờ' },
                      { id: '1-3days', label: 'Từ 1 đến 3 ngày' },
                      { id: '>1week', label: 'Trên 1 tuần' }
                    ].map((dur) => (
                      <button
                        key={dur.id}
                        type="button"
                        onClick={() => setDuration(dur.id)}
                        style={{
                          flex: 1, minWidth: '150px', padding: '1rem', borderRadius: '12px',
                          border: duration === dur.id ? '2px solid #2563EB' : '1.5px solid var(--color-border)',
                          background: duration === dur.id ? 'rgba(37,99,235,0.08)' : 'var(--color-bg)',
                          color: 'var(--color-text)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
                  <button
                    onClick={handlePrevStep}
                    className="btn-secondary"
                    style={{ padding: '12px 24px', gap: '8px' }}
                  >
                    <ArrowLeft size={18} /> Quay lại
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="btn-primary"
                    style={{ padding: '12px 24px', gap: '8px' }}
                  >
                    Xem chẩn đoán <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: RESULTS & DOCTORS */}
            {step === 3 && recommendation && (
              <motion.div
                key="step3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: '50%',
                    background: `${recommendation.badgeColor}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem', color: recommendation.badgeColor
                  }}>
                    <CheckCircle size={38} />
                  </div>
                  
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Kết Quả Phân Tích Triệu Chứng</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    Dựa trên triệu chứng: <strong>{recommendation.primarySymptom}</strong>
                  </p>
                </div>

                {/* Urgency Alert Panel */}
                <div style={{
                  padding: '1.25rem 1.5rem', borderRadius: '16px',
                  background: `${recommendation.badgeColor}10`,
                  border: `1.5px solid ${recommendation.badgeColor}30`,
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  marginBottom: '2rem'
                }}>
                  <AlertTriangle size={24} color={recommendation.badgeColor} style={{ flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '4px' }}>
                      {recommendation.urgency === 'high' ? 'Khuyến nghị khẩn cấp!' : 'Mức độ cảnh báo'}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
                      {recommendation.warningText}
                    </p>
                  </div>
                </div>

                {/* Specialty Recommendation */}
                <div style={{
                  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
                  marginBottom: '2.5rem'
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '14px',
                    background: 'rgba(37,99,235,0.1)', color: '#2563EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Activity size={30} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Chuyên khoa được đề xuất
                    </span>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563EB', marginTop: '2px' }}>
                      {recommendation.specialty}
                    </h4>
                  </div>
                </div>

                {/* Matching Doctors */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>
                    Đội ngũ bác sĩ chuyên khoa {recommendation.specialty} đề xuất:
                  </h4>

                  {loadingDocs ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[1, 2].map(i => (
                        <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
                      ))}
                    </div>
                  ) : doctors.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', background: 'var(--color-bg)', borderRadius: '12px' }}>
                      Không tìm thấy bác sĩ nào thuộc chuyên khoa này trong hệ thống hiện tại.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {doctors.map(doc => (
                        <div
                          key={doc.doctor_id}
                          style={{
                            background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                            borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center',
                            gap: '1rem', flexWrap: 'wrap'
                          }}
                        >
                          <div style={{
                            width: 50, height: 50, borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563EB)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden'
                          }}>
                            <img src={getDoctorAvatar(doc.doctor_id)} alt={doc.doctor_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <h5 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                              {doc.doctor_name}
                            </h5>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                                <Star size={12} fill="#fbbf24" color="#fbbf24" /> {doc.rating || '4.8'}
                              </span>
                              <span>•</span>
                              <span>{doc.experience} năm kinh nghiệm</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link to={`/doctors/${doc.doctor_id}`} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                              Chi tiết
                            </Link>
                            <Link to={`/booking/${doc.doctor_id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}>
                              <Calendar size={14} /> Đặt lịch ngay
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '2rem' }}>
                  <button onClick={handleReset} className="btn-secondary" style={{ padding: '12px 24px' }}>
                    Kiểm tra lại triệu chứng
                  </button>
                  <Link to="/doctors" className="btn-primary" style={{ padding: '12px 24px' }}>
                    Xem toàn bộ bác sĩ
                  </Link>
                </div>
              </motion.div>
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
