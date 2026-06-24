import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import ClinicsPage from './pages/ClinicsPage';
import ClinicDetailPage from './pages/ClinicDetailPage';
import BookingPage from './pages/BookingPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import AdminPage from './pages/AdminPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import PatientProfilePage from './pages/PatientProfilePage';
import EmergencyPage from './pages/EmergencyPage';
import DoctorReviewPage from './pages/DoctorReviewPage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatbotWidget from './components/common/ChatbotWidget';
import IntroScreen from './components/common/IntroScreen';

function App() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Chỉ hiển thị intro một lần duy nhất mỗi phiên duyệt web (session)
    const hasShownIntro = sessionStorage.getItem('hb_intro_shown');
    if (!hasShownIntro) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('hb_intro_shown', 'true');
    setShowIntro(false);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <AnimatePresence>
          {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
        </AnimatePresence>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
            <Navbar />
            <main style={{ paddingTop: '70px' }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/doctors/:id" element={<DoctorDetailPage />} />
                <Route path="/clinics" element={<ClinicsPage />} />
                <Route path="/clinics/:id" element={<ClinicDetailPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/booking/:doctorId" element={<BookingPage />} />
                <Route path="/my-appointments" element={<MyAppointmentsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
                <Route path="/profile" element={<PatientProfilePage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/reviews/:doctorId" element={<DoctorReviewPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </main>
            <Footer />
            <ChatbotWidget />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-card)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
