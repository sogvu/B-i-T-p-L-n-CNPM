import docMale1 from '../assets/doc_male_1.png';
import docMale2 from '../assets/doc_male_2.png';
import docMale3 from '../assets/doc_male_3.png';
import docFemale1 from '../assets/hero_doctor.png';

export function getDoctorAvatar(doctorId) {
  const num = parseInt(doctorId?.replace(/\D/g, '') || '1', 10);
  const isEven = num % 2 === 0;

  if (isEven) {
    // Female
    return docFemale1;
  } else {
    // Male
    const index = (Math.floor(num / 2)) % 3;
    if (index === 0) return docMale1;
    if (index === 1) return docMale2;
    return docMale3;
  }
}
