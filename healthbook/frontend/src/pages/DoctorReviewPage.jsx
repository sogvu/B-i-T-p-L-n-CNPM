import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, CheckCircle, ArrowLeft, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorsApi } from '../services/api';
import booking3d from '../assets/3d_booking.png';

const REVIEW_TAGS = ['Tận tâm', 'Chuyên nghiệp', 'Giải thích chi tiết', 'Đúng giờ', 'Nhẹ nhàng', 'Phòng khám sạch sẽ'];

export default function DoctorReviewPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorNameParam = searchParams.get('name') || '';

  const [doctor, setDoctor] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [patientName, setPatientName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load doctor detail if available
    doctorsApi.getById(doctorId)
      .then(res => {
        if (res.success) setDoctor(res.data);
      })
      .catch(() => {
        // Fallback doctor object
        setDoctor({
          doctor_name: doctorNameParam || 'Bác sĩ chuyên khoa',
          specialty: 'Y tế'
        });
      });

    // Populate patient name from profile
    const savedProfile = localStorage.getItem('hb_patient_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setPatientName(parsed.fullName || '');
      } catch (e) {}
    }
  }, [doctorId, doctorNameParam]);

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nhận xét chi tiết.');
      return;
    }

    setSubmitting(true);
    const newReview = {
      review_id: 'REV-' + Math.floor(Math.random() * 10000),
      doctor_id: doctorId,
      rating,
      comment,
      tags: selectedTags,
      patient_name: patientName.trim() || 'Bệnh nhân ẩn danh',
      date: new Date().toISOString().split('T')[0]
    };

    // Save to LocalStorage
    const existing = localStorage.getItem('hb_reviews');
    let reviewsList = [];
    if (existing) {
      try {
        reviewsList = JSON.parse(existing);
      } catch (e) {}
    }
    reviewsList.unshift(newReview);
    localStorage.setItem('hb_reviews', JSON.stringify(reviewsList));

    setTimeout(() => {
      setSubmitting(false);
      toast.success('Gửi đánh giá thành công! Cảm ơn ý kiến của bạn.');
      navigate('/profile');
    }, 800);
  };

  return (
    <div style={{ padding: '2rem 1.5rem', minHeight: '85vh', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', color: 'var(--color-text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '1.5rem', fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* Form panel */}
        <div style={{
          background: 'var(--color-card)', border: '1px solid var(--color-border)',
          borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.5rem', fontWeight: 900
            }}>
              {doctor?.doctor_name?.split(' ').pop().charAt(0) || 'D'}
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>ĐÁNH GIÁ CHẤT LƯỢNG</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', marginTop: '2px' }}>
                {doctor?.doctor_name}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Chuyên khoa: {doctor?.specialty}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Stars selection */}
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                Bạn đánh giá bác sĩ bao nhiêu sao?
              </label>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isGold = starVal <= (hoverRating || rating);
                  return (
                    <motion.button
                      key={starVal}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starVal)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                    >
                      <Star
                        size={36}
                        fill={isGold ? '#fbbf24' : 'none'}
                        color={isGold ? '#fbbf24' : '#cbd5e1'}
                        style={{ transition: 'color 0.15s, fill 0.15s' }}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Patient Name */}
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Tên hiển thị của bạn:
              </label>
              <input
                className="input"
                placeholder="Nhập tên của bạn hoặc để trống để ẩn danh"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
              />
            </div>

            {/* Review Tags */}
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                Chọn các nhận xét phù hợp (không bắt buộc):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {REVIEW_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      style={{
                        padding: '6px 12px', borderRadius: '20px',
                        border: isSelected ? '1.5px solid #2563EB' : '1.5px solid var(--color-border)',
                        background: isSelected ? 'rgba(37,99,235,0.08)' : 'var(--color-bg)',
                        color: isSelected ? '#2563EB' : 'var(--color-text-muted)',
                        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                Nhận xét chi tiết về quá trình thăm khám:
              </label>
              <textarea
                className="input"
                style={{ minHeight: '120px', resize: 'vertical', lineHeight: 1.5 }}
                placeholder="Bác sĩ có tư vấn kỹ lưỡng không? Bạn có hài lòng với phác đồ điều trị không?..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}
            >
              {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
              <Send size={16} />
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}
