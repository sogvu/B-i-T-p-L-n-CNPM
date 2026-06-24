/**
 * Service gợi ý chuyên khoa từ triệu chứng
 * Map triệu chứng → chuyên khoa y tế
 */

const SYMPTOM_SPECIALTY_MAP = {
  // Tim mạch
  'đau ngực': 'Tim mạch',
  'tức ngực': 'Tim mạch',
  'khó thở': 'Tim mạch',
  'tim đập nhanh': 'Tim mạch',
  'hồi hộp': 'Tim mạch',
  'phù chân': 'Tim mạch',
  'ngất xỉu': 'Tim mạch',

  // Da liễu
  'nổi mẩn': 'Da liễu',
  'nổi mẩn đỏ': 'Da liễu',
  'ngứa da': 'Da liễu',
  'mụn': 'Da liễu',
  'vẩy nến': 'Da liễu',
  'rụng tóc': 'Da liễu',
  'chàm': 'Da liễu',
  'dị ứng da': 'Da liễu',

  // Thần kinh
  'đau đầu': 'Thần kinh',
  'chóng mặt': 'Thần kinh',
  'mất trí nhớ': 'Thần kinh',
  'tê bì': 'Thần kinh',
  'co giật': 'Thần kinh',
  'liệt': 'Thần kinh',
  'run tay': 'Thần kinh',
  'đột quỵ': 'Thần kinh',

  // Tiêu hóa
  'đau bụng': 'Tiêu hóa',
  'đau dạ dày': 'Tiêu hóa',
  'buồn nôn': 'Tiêu hóa',
  'nôn mửa': 'Tiêu hóa',
  'tiêu chảy': 'Tiêu hóa',
  'táo bón': 'Tiêu hóa',
  'đầy hơi': 'Tiêu hóa',
  'ợ chua': 'Tiêu hóa',
  'xuất huyết tiêu hóa': 'Tiêu hóa',

  // Hô hấp
  'ho': 'Hô hấp',
  'ho kéo dài': 'Hô hấp',
  'khò khè': 'Hô hấp',
  'hen suyễn': 'Hô hấp',
  'đờm': 'Hô hấp',
  'viêm phổi': 'Hô hấp',
  'lao phổi': 'Hô hấp',

  // Nội tiết
  'tiểu đường': 'Nội tiết',
  'béo phì': 'Nội tiết',
  'tuyến giáp': 'Nội tiết',
  'rụng tóc nhiều': 'Nội tiết',
  'mệt mỏi': 'Nội tiết',
  'sụt cân': 'Nội tiết',
  'tăng cân': 'Nội tiết',

  // Nhi khoa
  'trẻ sốt': 'Nhi khoa',
  'trẻ ho': 'Nhi khoa',
  'trẻ biếng ăn': 'Nhi khoa',
  'chậm phát triển': 'Nhi khoa',
  'sốt cao co giật': 'Nhi khoa',

  // Sản phụ khoa
  'đau bụng kinh': 'Sản phụ khoa',
  'rối loạn kinh nguyệt': 'Sản phụ khoa',
  'mang thai': 'Sản phụ khoa',
  'khám thai': 'Sản phụ khoa',
  'khí hư': 'Sản phụ khoa',

  // Chỉnh hình
  'đau lưng': 'Chỉnh hình',
  'đau khớp': 'Cơ xương khớp',
  'gãy xương': 'Chỉnh hình',
  'thoát vị đĩa đệm': 'Chỉnh hình',
  'đau cổ': 'Chỉnh hình',
  'cong vẹo cột sống': 'Chỉnh hình',

  // Tai Mũi Họng
  'đau họng': 'Tai Mũi Họng',
  'viêm họng': 'Tai Mũi Họng',
  'nghẹt mũi': 'Tai Mũi Họng',
  'chảy mũi': 'Tai Mũi Họng',
  'ù tai': 'Tai Mũi Họng',
  'nghe kém': 'Tai Mũi Họng',
  'viêm xoang': 'Tai Mũi Họng',
  'amidan': 'Tai Mũi Họng',

  // Mắt
  'mờ mắt': 'Mắt',
  'đỏ mắt': 'Mắt',
  'đau mắt': 'Mắt',
  'chảy nước mắt': 'Mắt',
  'cận thị': 'Mắt',
  'loạn thị': 'Mắt',

  // Tiết niệu
  'tiểu buốt': 'Tiết niệu',
  'tiểu ra máu': 'Tiết niệu',
  'đau thận': 'Tiết niệu',
  'sỏi thận': 'Tiết niệu',
  'tiểu nhiều': 'Tiết niệu',
  'tiểu khó': 'Tiết niệu',

  // Tâm thần
  'lo âu': 'Tâm thần',
  'trầm cảm': 'Tâm thần',
  'mất ngủ': 'Tâm thần',
  'căng thẳng': 'Tâm thần',
  'hoảng loạn': 'Tâm thần',
  'ám ảnh': 'Tâm thần',

  // Ung bướu
  'u cục': 'Ung bướu',
  'sụt cân nhanh': 'Ung bướu',
  'ho ra máu': 'Ung bướu',

  // Chung
  'sốt': 'Nội khoa',
  'sốt cao': 'Nội khoa',
  'mệt': 'Nội khoa',
  'yếu': 'Nội khoa',
};

/**
 * Gợi ý chuyên khoa từ chuỗi triệu chứng
 * @param {string} symptomsText - Chuỗi triệu chứng người dùng nhập
 * @returns {Array} Danh sách chuyên khoa gợi ý kèm điểm phù hợp
 */
function suggestSpecialties(symptomsText) {
  if (!symptomsText || symptomsText.trim() === '') return [];

  const normalized = symptomsText.toLowerCase().trim();
  const scores = {};

  for (const [symptom, specialty] of Object.entries(SYMPTOM_SPECIALTY_MAP)) {
    if (normalized.includes(symptom)) {
      // Cộng điểm nếu triệu chứng dài hơn (phù hợp hơn)
      const score = symptom.length;
      if (!scores[specialty] || scores[specialty] < score) {
        scores[specialty] = score;
      }
    }
  }

  // Chuyển về array, sắp xếp theo điểm giảm dần
  const suggestions = Object.entries(scores)
    .map(([specialty, score]) => ({ specialty, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Chỉ trả về top 3 gợi ý

  return suggestions;
}

/**
 * Lấy danh sách tất cả chuyên khoa có trong hệ thống
 */
const ALL_SPECIALTIES = [
  'Tim mạch',
  'Da liễu',
  'Thần kinh',
  'Tiêu hóa',
  'Hô hấp',
  'Nội tiết',
  'Nhi khoa',
  'Sản phụ khoa',
  'Chỉnh hình',
  'Cơ xương khớp',
  'Tai Mũi Họng',
  'Mắt',
  'Tiết niệu',
  'Tâm thần',
  'Ung bướu',
  'Nội khoa',
  'Dinh dưỡng',
];

module.exports = { suggestSpecialties, ALL_SPECIALTIES, SYMPTOM_SPECIALTY_MAP };
