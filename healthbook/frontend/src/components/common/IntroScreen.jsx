import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function IntroScreen({ onComplete }) {
  const [loadingText, setLoadingText] = useState('Đang kết nối hệ thống y tế...');

  useEffect(() => {
    const textTimer1 = setTimeout(() => {
      setLoadingText('Đang tải danh sách bác sĩ chuyên khoa...');
    }, 800);

    const textTimer2 = setTimeout(() => {
      setLoadingText('Sẵn sàng cho đặt lịch khám!');
    }, 1700);

    const finishTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2400);

    return () => {
      clearTimeout(textTimer1);
      clearTimeout(textTimer2);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  // Heartbeat path animation properties
  const ecgPath = "M10,50 L35,50 L40,40 L45,60 L50,15 L55,85 L60,45 L65,55 L70,50 L100,50";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #0c1524 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      {/* Decorative Glowing Background Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.25), transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)',
          filter: 'blur(30px)',
          transform: 'translate(100px, -100px)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Pulsating Logo Container */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
            delay: 0.2,
          }}
          style={{
            position: 'relative',
            width: 90,
            height: 90,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(37,99,235,0.3)',
            marginBottom: '2rem',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield size={40} color="white" />
          </motion.div>
          {/* Pulsing Outer Rings */}
          <div style={{
            position: 'absolute',
            inset: -8,
            border: '2px solid rgba(37,99,235,0.2)',
            borderRadius: '28px',
            animation: 'pulse-ring 2s infinite ease-out'
          }} />
        </motion.div>

        {/* Text Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            fontSize: '2.25rem',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(to right, #ffffff, #93c5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          HealthBook <span style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            padding: '2px 8px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 800,
            color: 'white',
            WebkitTextFillColor: 'white',
            boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
          }}>PLUS</span>
        </motion.h1>

        {/* Subtitle / Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.7 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            margin: '0 0 2rem 0',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
          }}
        >
          Nền tảng đặt lịch khám thông minh
        </motion.p>

        {/* ECG Heartbeat SVG Animation */}
        <div style={{ width: 220, height: 60, overflow: 'hidden', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <svg width="100%" height="100%" viewBox="0 0 110 100" preserveAspectRatio="none">
            {/* Background static line */}
            <path
              d={ecgPath}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2.5"
            />
            {/* Animated pulsating line */}
            <motion.path
              d={ecgPath}
              fill="none"
              stroke="#2563EB"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, strokeDashoffset: 0 }}
              animate={{ 
                pathLength: [0, 1, 1],
                strokeDashoffset: [0, 0, -100]
              }}
              transition={{
                duration: 2.2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.2
              }}
              style={{
                filter: 'drop-shadow(0px 0px 5px rgba(37,99,235,0.8))'
              }}
            />
          </svg>
        </div>

        {/* Progress Loading Bar */}
        <div style={{
          width: 240,
          height: 4,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '1rem',
          position: 'relative'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(to right, #2563EB, #10b981)',
              borderRadius: '9999px',
              boxShadow: '0 0 8px rgba(37,99,235,0.5)',
            }}
          />
        </div>

        {/* Conditional Loading Text */}
        <AnimatePresence mode="wait">
          <motion.span
            key={loadingText}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 0.6 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              fontSize: '0.8rem',
              fontWeight: 500,
              color: '#cbd5e1',
            }}
          >
            {loadingText}
          </motion.span>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
