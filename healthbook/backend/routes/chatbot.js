const express = require('express');
const router = express.Router();
const { readCSV } = require('../services/csvService');
const { suggestSpecialties, SYMPTOM_SPECIALTY_MAP } = require('../services/symptomService');

// POST /api/chatbot/chat - Chat với trợ lý ảo (Gemini AI hoặc Fallback)
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isMock = !apiKey || apiKey === 'your_gemini_api_key_here';

    let reply = '';
    let isEmergency = false;
    let matchedSpecialty = null;

    const doctors = await readCSV('doctors.csv');
    const clinics = await readCSV('clinics.csv');

    if (isMock) {
      // ===== CHẾ ĐỘ MOCK (Phân tích từ khóa cục bộ) =====
      const inputLower = message.toLowerCase().trim();

      // Kiểm tra khẩn cấp
      if (inputLower.includes('cấp cứu') || inputLower.includes('nguy kịch') || inputLower.includes('đột quỵ') || inputLower.includes('nhồi máu') || inputLower.includes('khó thở dữ dội')) {
        isEmergency = true;
        reply = '🚨 **CẢNH BÁO KHẨN CẤP:** Nếu bạn đang gặp tình trạng nguy kịch, hãy gọi ngay **115** hoặc di chuyển đến cơ sở y tế gần nhất. Xem hướng dẫn sơ cứu nhanh tại đây: [Cấp cứu & Sơ cứu 24/7](/emergency).';
      } else {
        // Kiểm tra triệu chứng
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
          reply = `Dựa trên triệu chứng **"${matchedSymptom}"**, tôi khuyên bạn nên thăm khám chuyên khoa **${matchedSpecialty}** để được kiểm tra kỹ lưỡng. Dưới đây là các bác sĩ đề xuất:`;
        } else if (inputLower.includes('phòng khám') || inputLower.includes('bệnh viện') || inputLower.includes('địa chỉ') || inputLower.includes('gần đây')) {
          reply = 'HealthBook liên kết với nhiều bệnh viện và phòng khám uy tín trên cả nước. Bạn có thể tra cứu nhanh vị trí và hotline tại: [Tìm phòng khám](/clinics).';
        } else if (inputLower.includes('đặt lịch') || inputLower.includes('đặt khám') || inputLower.includes('hướng dẫn')) {
          reply = 'Để đặt lịch khám, bạn vui lòng truy cập trang **[Đặt lịch khám](/booking)**, tìm bác sĩ, chọn ngày/giờ khám còn trống và điền thông tin triệu chứng.';
        } else if (inputLower.includes('chào') || inputLower.includes('hello') || inputLower.includes('hi')) {
          reply = 'Xin chào! Tôi là Dr. Healthie. Bạn đang có triệu chứng gì khó chịu hoặc cần hỗ trợ đặt lịch khám không?';
        } else {
          reply = 'Tôi là trợ lý tư vấn sức khỏe của HealthBook. Bạn có thể mô tả rõ triệu chứng cơ thể (vd: bị đau đầu, đau dạ dày, sốt...) để tôi hỗ trợ gợi ý chuyên khoa phù hợp nhé.';
        }
      }
    } else {
      // ===== CHẾ ĐỘ THỰC TẾ (Gọi Gemini API) =====
      const systemInstruction = `Bạn là Dr. Healthie, một trợ lý y tế ảo thân thiện và chuyên nghiệp của nền tảng đặt lịch khám HealthBook Việt Nam.
Nhiệm vụ của bạn là hỗ trợ tư vấn sức khỏe ban đầu cho bệnh nhân, giải đáp các thắc mắc thường gặp và hướng dẫn đặt lịch khám. Luôn lịch sự, ân cần, nói tiếng Việt tự nhiên.

HƯỚNG DẪN QUAN TRỌNG:
1. Bạn KHÔNG được tự chẩn đoán bệnh chắc chắn hoặc kê đơn thuốc. Hãy luôn khuyên bệnh nhân khám trực tiếp với bác sĩ chuyên khoa.
2. Nếu phát hiện các triệu chứng khẩn cấp đe dọa tính mạng (đau ngực dữ dội, khó thở cấp tính, đột quỵ như méo miệng, yếu nửa người, nói ngọng), bạn PHẢI khuyên bệnh nhân gọi ngay cấp cứu 115 và di chuyển đến bệnh viện.
3. Khi tư vấn triệu chứng, hãy cố gắng phân tích xem thuộc chuyên khoa nào trong các chuyên khoa sau: Tim mạch, Da liễu, Thần kinh, Tiêu hóa, Hô hấp, Nội tiết, Nhi khoa, Sản phụ khoa, Chỉnh hình, Cơ xương khớp, Tai Mũi Họng, Mắt, Tiết niệu, Tâm thần, Ung bướu, Nội khoa, Dinh dưỡng.
4. Câu trả lời phải ngắn gọn, súc tích, dễ hiểu cho người bệnh (dưới 150 từ).`;

      // Cấu hình lịch sử chat gửi lên Gemini
      let formattedPrompt = '';
      if (history && history.length > 0) {
        // Chỉ gửi 8 tin nhắn gần nhất để tránh tràn token
        const recentHistory = history.slice(-8);
        formattedPrompt = recentHistory.map(h => `${h.sender === 'user' ? 'Bệnh nhân' : 'Dr. Healthie'}: ${h.text}`).join('\n') + '\n';
      }
      formattedPrompt += `Bệnh nhân: ${message}\nDr. Healthie:`;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: formattedPrompt }]
              }
            ],
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            }
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          reply = data.candidates[0].content.parts[0].text;
          
          // Trích xuất chuyên khoa từ phản hồi của Gemini
          const replyLower = reply.toLowerCase();
          const specialties = [
            'Tim mạch', 'Da liễu', 'Thần kinh', 'Tiêu hóa', 'Hô hấp', 'Nội tiết',
            'Nhi khoa', 'Sản phụ khoa', 'Chỉnh hình', 'Cơ xương khớp', 'Tai Mũi Họng',
            'Mắt', 'Tiết niệu', 'Tâm thần', 'Ung bướu', 'Nội khoa', 'Dinh dưỡng'
          ];
          for (const spec of specialties) {
            if (replyLower.includes(spec.toLowerCase())) {
              matchedSpecialty = spec;
              break;
            }
          }

          // Kiểm tra xem Gemini có khuyên gọi cấp cứu 115 không
          if (replyLower.includes('115') || replyLower.includes('cấp cứu')) {
            isEmergency = true;
          }
        } else {
          throw new Error('Không nhận được câu trả lời từ Gemini');
        }
      } catch (err) {
        console.error('Lỗi gọi Gemini API:', err);
        // Fallback sang mock nội bộ
        return res.redirect(307, '/api/chatbot/chat');
      }
    }

    // Lấy thông tin Bác sĩ thuộc chuyên khoa tương ứng
    let suggestedDocs = [];
    if (matchedSpecialty) {
      suggestedDocs = doctors
        .filter(d => d.specialty.toLowerCase() === matchedSpecialty.toLowerCase())
        .slice(0, 2)
        .map(doc => {
          const clinic = clinics.find(c => c.clinic_id === doc.clinic_id);
          return { ...doc, clinic };
        });
    }

    // Lấy thông tin Phòng khám gợi ý nếu cần
    let suggestedClinics = [];
    if (message.toLowerCase().includes('phòng khám') || message.toLowerCase().includes('bệnh viện')) {
      suggestedClinics = clinics.slice(0, 2);
    }

    res.json({
      success: true,
      text: reply,
      isEmergency,
      suggestedSpecialty: matchedSpecialty,
      suggestedDoctors: suggestedDocs,
      suggestedClinics
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
