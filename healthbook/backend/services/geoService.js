/**
 * Tính khoảng cách giữa 2 điểm tọa độ sử dụng công thức Haversine
 * @param {number} lat1 - Vĩ độ điểm 1
 * @param {number} lon1 - Kinh độ điểm 1
 * @param {number} lat2 - Vĩ độ điểm 2
 * @param {number} lon2 - Kinh độ điểm 2
 * @returns {number} Khoảng cách tính bằng km
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

/**
 * Tính thời gian di chuyển giả lập
 * @param {number} distanceKm - Khoảng cách tính bằng km
 * @returns {string} Thời gian di chuyển ước tính
 */
function estimateTravelTime(distanceKm) {
  // Giả lập tốc độ đô thị: 25 km/h
  const minutes = Math.round((distanceKm / 25) * 60);

  if (minutes < 60) {
    return `${minutes} phút`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes} phút` : `${hours} giờ`;
  }
}

/**
 * Sắp xếp danh sách phòng khám theo khoảng cách từ vị trí người dùng
 * @param {Array} clinics - Danh sách phòng khám
 * @param {number} userLat - Vĩ độ người dùng
 * @param {number} userLon - Kinh độ người dùng
 * @returns {Array} Danh sách phòng khám đã sắp xếp kèm khoảng cách
 */
function sortClinicsByDistance(clinics, userLat, userLon) {
  return clinics
    .map((clinic) => {
      const distance = haversineDistance(
        userLat,
        userLon,
        parseFloat(clinic.latitude),
        parseFloat(clinic.longitude)
      );
      return {
        ...clinic,
        distance: Math.round(distance * 10) / 10, // Làm tròn 1 chữ số thập phân
        travelTime: estimateTravelTime(distance),
      };
    })
    .sort((a, b) => a.distance - b.distance);
}

module.exports = { haversineDistance, estimateTravelTime, sortClinicsByDistance };
