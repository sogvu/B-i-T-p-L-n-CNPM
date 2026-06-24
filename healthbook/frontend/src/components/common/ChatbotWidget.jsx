import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, AlertCircle, Phone, Calendar, Building, HelpCircle, Activity } from 'lucide-react';
import { doctorsApi, clinicsApi, chatbotApi } from '../../services/api';
import { getDoctorAvatar } from '../../utils/avatarHelper';
import { Link } from 'react-router-dom';

const SYMPTOM_SPECIALTY_MAP = {
  // Tim mạch
  'đau ngực': 'Tim mạch', 'tức ngực': 'Tim mạch', 'khó thở': 'Tim mạch', 'tim đập nhanh': 'Tim mạch', 'hồi hộp': 'Tim mạch', 'phù chân': 'Tim mạch', 'ngất': 'Tim mạch',
  // Da liễu
  'nổi mẩn': 'Da liễu', 'nổi mẩn đỏ': 'Da liễu', 'ngứa da': 'Da liễu', 'mụn': 'Da liễu', 'vẩy nến': 'Da liễu', 'rụng tóc': 'Da liễu', 'chàm': 'Da liễu', 'dị ứng da': 'Da liễu',
  // Thần kinh
  'đau đầu': 'Thần kinh', 'chóng mặt': 'Thần kinh', 'mất trí nhớ': 'Thần kinh', 'tê bì': 'Thần kinh', 'co giật': 'Thần kinh', 'liệt': 'Thần kinh', 'run tay': 'Thần kinh',
  // Tiêu hóa
  'đau bụng': 'Tiêu hóa', 'đau dạ dày': 'Tiêu hóa', 'buồn nôn': 'Tiêu hóa', 'nôn mửa': 'Tiêu hóa', 'tiêu chảy': 'Tiêu hóa', 'táo bón': 'Tiêu hóa', 'đầy hơi': 'Tiêu hóa', 'ợ chua': 'Tiêu hóa',
  // Hô hấp
  'ho': 'Hô hấp', 'ho kéo dài': 'Hô hấp', 'khò khè': 'Hô hấp', 'hen suyễn': 'Hô hấp', 'đờm': 'Hô hấp', 'viêm phổi': 'Hô hấp', 'lao phổi': 'Hô hấp',
  // Nội tiết
  'tiểu đường': 'Nội tiết', 'béo phì': 'Nội tiết', 'tuyến giáp': 'Nội tiết', 'mệt mỏi': 'Nội tiết', 'sụt cân': 'Nội tiết', 'tăng cân': 'Nội tiết',
  // Nhi khoa
  'trẻ sốt': 'Nhi khoa', 'trẻ ho': 'Nhi khoa', 'trẻ biếng ăn': 'Nhi khoa', 'chậm phát triển': 'Nhi khoa', 'em bé': 'Nhi khoa',
  // Sản phụ khoa
  'đau bụng kinh': 'Sản phụ khoa', 'rối loạn kinh nguyệt': 'Sản phụ khoa', 'mang thai': 'Sản phụ khoa', 'khám thai': 'Sản phụ khoa', 'khí hư': 'Sản phụ khoa', 'bầu bí': 'Sản phụ khoa',
  // Chỉnh hình / Cơ xương khớp
  'đau lưng': 'Chỉnh hình', 'đau khớp': 'Cơ xương khớp', 'gãy xương': 'Chỉnh hình', 'thoát vị đĩa đệm': 'Chỉnh hình', 'đau cổ': 'Chỉnh hình', 'viêm khớp': 'Cơ xương khớp',
  // Tai Mũi Họng
  'đau họng': 'Tai Mũi Họng', 'viêm họng': 'Tai Mũi Họng', 'nghẹt mũi': 'Tai Mũi Họng', 'chảy mũi': 'Tai Mũi Họng', 'ù tai': 'Tai Mũi Họng', 'nghe kém': 'Tai Mũi Họng', 'viêm xoang': 'Tai Mũi Họng',
  // Mắt
  'mờ mắt': 'Mắt', 'đỏ mắt': 'Mắt', 'đau mắt': 'Mắt', 'cận thị': 'Mắt', 'loạn thị': 'Mắt',
  // Tiết niệu
  'tiểu buốt': 'Tiết niệu', 'tiểu ra máu': 'Tiết niệu', 'sỏi thận': 'Tiết niệu', 'tiểu khó': 'Tiết niệu',
  // Tâm thần
  'lo âu': 'Tâm thần', 'trầm cảm': 'Tâm thần', 'mất ngủ': 'Tâm thần', 'căng thẳng': 'Tâm thần',
  // Ung bướu
  'u cục': 'Ung bướu', 'ung thư': 'Ung bướu', 'ho ra máu': 'Ung bướu',
  // Chung
  'sốt': 'Nội khoa', 'sốt cao': 'Nội khoa', 'mệt': 'Nội khoa', 'yếu': 'Nội khoa'
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào! Tôi là **Dr. Healthie** 🩺 - Trợ lý y tế ảo của HealthBook. Tôi có thể hỗ trợ bạn tư vấn triệu chứng, gợi ý bác sĩ và hướng dẫn quy trình đặt lịch khám. Hôm nay bạn cần hỗ trợ gì?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);

  const messagesEndRef = useRef(null);

  // Load bác sĩ và phòng khám để gợi ý khi cần
  useEffect(() => {
    async function loadData() {
      try {
        const [docRes, clinicRes] = await Promise.all([
          doctorsApi.getAll(),
          clinicsApi.getAll()
        ]);
        if (docRes.success) setDoctors(docRes.data);
        if (clinicRes.success) setClinics(clinicRes.data);
      } catch (e) {
        console.error('Lỗi tải dữ liệu chatbot:', e);
      }
    }
    loadData();
  }, []);

  // Tự động cuộn xuống dưới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInputText('');

    // Trigger bot response after delay
    setIsTyping(true);
    try {
      const res = await chatbotApi.chat(text, updatedMessages);
      if (res.success) {
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.text,
          isEmergency: res.isEmergency,
          suggestedSpecialty: res.suggestedSpecialty,
          suggestedDoctors: res.suggestedDoctors,
          suggestedClinics: res.suggestedClinics,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Lỗi phản hồi API');
      }
    } catch (e) {
      console.warn('Chatbot API error, using local fallback:', e);
      const responseText = generateBotResponse(text);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        ...responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Logic phân tích từ khóa và tạo câu trả lời
  const generateBotResponse = (userInput) => {
    const inputLower = userInput.toLowerCase().trim();

    // 1. Kiểm tra khẩn cấp / cấp cứu
    if (inputLower.includes('cấp cứu') || inputLower.includes('nguy kịch') || inputLower.includes('đột quỵ') || inputLower.includes('nhồi máu') || inputLower.includes('khó thở dữ dội')) {
      return {
        text: '🚨 **CẢNH BÁO KHẨN CẤP:** Nếu bạn hoặc người thân đang gặp tình trạng nguy kịch hoặc đe dọa tính mạng, vui lòng gọi ngay **115** hoặc di chuyển ngay đến cơ sở y tế gần nhất. \n\nBạn có thể tra cứu nhanh cẩm nang hướng dẫn sơ cứu đột quỵ hoặc ngừng tuần hoàn tại trang: [Cấp cứu & Sơ cứu 24/7](/emergency).',
        isEmergency: true
      };
    }

    // 2. Khớp triệu chứng -> Gợi ý chuyên khoa & Bác sĩ
    let matchedSpecialty = null;
    let matchedSymptom = '';
    for (const [symptom, specialty] of Object.entries(SYMPTOM_SPECIALTY_MAP)) {
      if (inputLower.includes(symptom)) {
        if (symptom.length > matchedSymptom.length) {
          matchedSymptom = symptom;
          matchedSpecialty = specialty;
        }
      }
    }

    if (matchedSpecialty) {
      // Tìm bác sĩ thuộc chuyên khoa này
      const suggestedDocs = doctors
        .filter(d => d.specialty.toLowerCase() === matchedSpecialty.toLowerCase())
        .slice(0, 2);

      let text = `Tôi nhận thấy triệu chứng **"${matchedSymptom}"** của bạn có thể liên quan đến chuyên khoa **${matchedSpecialty}**.\n\nHệ thống gợi ý bạn nên tham khảo ý kiến chuyên môn của các bác sĩ chuyên khoa này để được chẩn đoán chính xác nhất.`;
      
      return {
        text,
        suggestedSpecialty: matchedSpecialty,
        suggestedDoctors: suggestedDocs
      };
    }

    // 3. Khớp hỏi về phòng khám / bệnh viện
    if (inputLower.includes('phòng khám') || inputLower.includes('bệnh viện') || inputLower.includes('địa chỉ') || inputLower.includes('ở đâu') || inputLower.includes('gần đây')) {
      const topClinics = clinics.slice(0, 2);
      let text = 'HealthBook liên kết với nhiều bệnh viện và phòng khám uy tín trên toàn quốc. Bạn có thể sử dụng định vị GPS để tìm cơ sở y tế gần bạn nhất tại trang: [Tìm phòng khám](/clinics).\n\nMột số bệnh viện nổi bật:';
      return {
        text,
        suggestedClinics: topClinics
      };
    }

    // 4. Khớp hỏi cách đặt lịch khám
    if (inputLower.includes('đặt lịch') || inputLower.includes('đặt khám') || inputLower.includes('lịch hẹn') || inputLower.includes('hướng dẫn')) {
      return {
        text: 'Quy trình đặt lịch trên HealthBook cực kỳ đơn giản:\n\n1️⃣ Truy cập trang **[Đặt lịch khám](/booking)**.\n2️⃣ Tìm kiếm bác sĩ hoặc chuyên khoa, chọn ngày khám và khung giờ còn trống.\n3️⃣ Điền thông tin cá nhân và triệu chứng hiện tại, sau đó xác nhận.\n\nSau khi đặt thành công, hệ thống sẽ gửi email xác nhận tự động và gửi nhắc nhở lịch khám trong **[Trung tâm Thông báo](/notifications)** của bạn.'
      };
    }

    // 5. Khớp chào hỏi
    if (inputLower.includes('xin chào') || inputLower.includes('chào') || inputLower.includes('hello') || inputLower.includes('hi')) {
      return {
        text: 'Xin chào! Tôi có thể hỗ trợ gì cho sức khỏe của bạn hôm nay? Bạn có thể mô tả triệu chứng của mình (vd: "tôi bị đau bụng", "tôi bị đau đầu") để tôi gợi ý bác sĩ chuyên khoa nhé!'
      };
    }

    // 6. Fallback mặc định
    return {
      text: 'Tôi đã ghi nhận câu hỏi của bạn. Vì tôi là trợ lý ảo hỗ trợ thông tin y tế, tôi khuyên bạn nên mô tả cụ thể triệu chứng cơ thể (ví dụ: đau bụng, sốt, nổi mẩn...) để được gợi ý chuyên khoa phù hợp. \n\nNgoài ra bạn có thể tra cứu thông tin đặt lịch, tìm bệnh viện hoặc vào **[Hồ sơ cá nhân](/profile)** để theo dõi chỉ số BMI của mình.'
    };
  };

  // Định dạng text hỗ trợ in đậm markdown nhẹ (**text**)
  const formatText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('[') && part.includes('](')) {
        const label = part.slice(1, part.indexOf(']'));
        const url = part.slice(part.indexOf('](') + 2, -1);
        return <Link key={index} to={url} style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'underline' }} onClick={() => setIsOpen(false)}>{label}</Link>;
      }
      return part;
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, fontFamily: 'inherit' }}>
      
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563EB 0%, #7c3aed 100%)',
          color: 'white', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(37,99,235,0.4)',
          position: 'relative'
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={26} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <MessageCircle size={26} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse effect when closed */}
        {!isOpen && (
          <span style={{
            position: 'absolute', top: 0, right: 0, width: '14px', height: '14px',
            background: '#10b981', border: '2px solid white', borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
        )}
      </motion.button>

      {/* CSS keyframe cho hiệu ứng nhấp nháy bóng tròn */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

      {/* Chat Window Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: '75px', right: 0,
              width: '380px', height: '520px',
              borderRadius: '24px', overflow: 'hidden',
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 50%, #4f46e5 100%)',
              padding: '16px 20px', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  🩺
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Dr. Healthie <Sparkles size={12} fill="white" />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                    Hỗ trợ y tế trực tuyến
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
                <X size={18} />
              </button>
            </div>

            {/* Disclaimer Alert */}
            <div style={{
              background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.15)',
              padding: '8px 14px', fontSize: '0.68rem', color: 'var(--color-text-muted)',
              display: 'flex', gap: '6px', alignItems: 'flex-start'
            }}>
              <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>Trợ lý ảo hỗ trợ tìm kiếm thông tin chuyên khoa, không thay thế chẩn đoán bác sĩ chuyên môn.</span>
            </div>

            {/* Chat Messages Panel */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--color-bg)' }}>
              
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: '16px',
                    fontSize: '0.82rem', lineHeight: 1.5,
                    borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                    borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                    background: msg.sender === 'user' ? '#2563EB' : 'var(--color-card)',
                    color: msg.sender === 'user' ? 'white' : 'var(--color-text)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    border: msg.sender === 'bot' ? '1px solid var(--color-border)' : 'none',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {formatText(msg.text)}

                    {/* Khớp gợi ý bác sĩ */}
                    {msg.suggestedDoctors && msg.suggestedDoctors.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', paddingBottom: '3px' }}>
                          Bác sĩ {msg.suggestedSpecialty} gợi ý:
                        </div>
                        {msg.suggestedDoctors.map(doc => {
                          const avt = getDoctorAvatar(doc.doctor_id);
                          return (
                            <Link key={doc.doctor_id} to={`/booking/${doc.doctor_id}`} onClick={() => setIsOpen(false)}
                              style={{
                                display: 'flex', gap: '8px', alignItems: 'center', textDecoration: 'none',
                                background: 'var(--color-bg)', padding: '6px', borderRadius: '10px',
                                border: '1px solid var(--color-border)', transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = '#2563EB'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                            >
                              <img src={avt} alt={doc.doctor_name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {doc.doctor_name}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                                  Kinh nghiệm: {doc.experience} năm
                                </div>
                              </div>
                              <span style={{ fontSize: '0.65rem', color: '#2563EB', fontWeight: 700, whiteSpace: 'nowrap' }}>Đặt khám →</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {/* Khớp gợi ý phòng khám */}
                    {msg.suggestedClinics && msg.suggestedClinics.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {msg.suggestedClinics.map(clinic => (
                          <Link key={clinic.clinic_id} to={`/clinics/${clinic.clinic_id}`} onClick={() => setIsOpen(false)}
                            style={{
                              display: 'flex', flexDirection: 'column', gap: '2px', textDecoration: 'none',
                              background: 'var(--color-bg)', padding: '8px', borderRadius: '10px',
                              border: '1px solid var(--color-border)', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#2563EB'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                          >
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
                              {clinic.clinic_name}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                              📍 {clinic.address}, {clinic.city}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Tag Cảnh báo khẩn cấp */}
                    {msg.isEmergency && (
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                        <Link to="/emergency" onClick={() => setIsOpen(false)} style={{
                          fontSize: '0.72rem', background: '#ef4444', color: 'white', padding: '4px 10px',
                          borderRadius: '6px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <Phone size={12} /> Gọi khẩn cấp ngay
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Bot typing indicator */}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: '16px', borderTopLeftRadius: '4px',
                    background: 'var(--color-card)', border: '1px solid var(--color-border)',
                    display: 'flex', gap: '4px', alignItems: 'center'
                  }}>
                    <span style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite' }}></span>
                    <span style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s' }}></span>
                    <span style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s' }}></span>
                  </div>
                </div>
              )}

              {/* Typing animation styling */}
              <style>{`
                @keyframes bounce {
                  0%, 80%, 100% { transform: scale(0); }
                  40% { transform: scale(1.0); }
                }
              `}</style>

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Panel */}
            {messages.length === 1 && (
              <div style={{
                padding: '10px 14px', background: 'var(--color-bg)',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px',
                borderTop: '1px solid var(--color-border)'
              }}>
                {[
                  { label: '🔍 Tư vấn triệu chứng', text: 'Tôi bị đau ngực và khó thở' },
                  { label: '🏥 Tìm phòng khám', text: 'Tôi muốn tìm phòng khám gần nhất' },
                  { label: '📅 Cách đặt lịch khám', text: 'Hướng dẫn tôi cách đặt lịch khám' },
                  { label: '🚨 Liên hệ cấp cứu', text: 'Tôi cần hỗ trợ cấp cứu khẩn cấp' }
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleSendMessage(item.text)}
                    style={{
                      padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--color-border)',
                      background: 'var(--color-card)', color: 'var(--color-text)', cursor: 'pointer',
                      fontSize: '0.72rem', fontWeight: 600, textAlign: 'left',
                      transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = 'rgba(37,99,235,0.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-card)'; }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Footer Input Bar */}
            <div style={{ padding: '12px 16px', background: 'var(--color-card)', borderTop: '1px solid var(--color-border)' }}>
              <form onSubmit={e => { e.preventDefault(); handleSendMessage(); }} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '12px',
                    border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                    color: 'var(--color-text)', fontSize: '0.82rem', outline: 'none'
                  }}
                />
                <button type="submit" disabled={!inputText.trim()}
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: inputText.trim() ? 'linear-gradient(135deg, #2563EB 0%, #7c3aed 100%)' : 'var(--color-border)',
                    color: 'white', border: 'none', cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow: inputText.trim() ? '0 4px 12px rgba(37,99,235,0.2)' : 'none'
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
