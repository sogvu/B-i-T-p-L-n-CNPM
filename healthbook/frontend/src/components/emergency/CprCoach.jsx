import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Volume2, VolumeX, Mic, MicOff, Heart, Info, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CprCoach() {
  const [isActive, setIsActive] = useState(false);
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [mode, setMode] = useState('compress'); // 'compress' or 'breath'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [pulse, setPulse] = useState(false);
  
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  const BPM = 110;
  const intervalMs = (60 * 1000) / BPM; // ~545.45 ms per beat

  // Web Audio Context initialization
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Play metronome beep using Web Audio API
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // High pitch beep for compression beat
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.log('Beep audio error:', e);
    }
  };

  // Text-To-Speech Voice Coach
  const speak = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.2;
      utterance.volume = 1.0;
      
      // Try to find a Vietnamese voice if available
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
      if (viVoice) utterance.voice = viVoice;
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.log('Speech synthesis error:', e);
    }
  };

  // Pre-load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Handle metronome core loop
  useEffect(() => {
    if (isActive) {
      if (mode === 'compress') {
        // Voice reminder at start of cycle
        if (count === 0) {
          speak(`Bắt đầu nhấn ngực chu kỳ ${cycle}. 30 lần.`);
        }

        timerRef.current = setInterval(() => {
          setCount(prevCount => {
            const nextCount = prevCount + 1;
            setPulse(p => !p);
            playBeep();

            // Speak progress at key markers
            if (nextCount === 10) speak('mười');
            if (nextCount === 20) speak('hai mươi');
            
            if (nextCount >= 30) {
              clearInterval(timerRef.current);
              setMode('breath');
              setCount(0);
              return 30;
            }
            return nextCount;
          });
        }, intervalMs);
      } else if (mode === 'breath') {
        speak('Hà hơi thổi ngạt 2 lần');
        
        let seconds = 5;
        setCount(seconds);
        
        timerRef.current = setInterval(() => {
          seconds -= 1;
          if (seconds <= 0) {
            clearInterval(timerRef.current);
            setMode('compress');
            setCount(0);
            setCycle(c => c + 1);
          } else {
            setCount(seconds);
          }
        }, 1000);
      }
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, mode, cycle, soundEnabled, voiceEnabled]);

  const handleStart = () => {
    initAudio();
    setIsActive(true);
    setMode('compress');
    setCount(0);
    setCycle(1);
    toast.success('Đã kích hoạt Trợ Lý Sơ Cứu CPR!');
  };

  const handleStop = () => {
    setIsActive(false);
    setCount(0);
    setCycle(1);
    setMode('compress');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '2px solid rgba(239, 68, 68, 0.25)',
      borderRadius: '24px',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative pulse background */}
      {isActive && mode === 'compress' && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: intervalMs / 1000, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 60%)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{
              background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
              padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800,
              display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem'
            }}>
              <Heart size={12} className={isActive ? 'animate-pulse' : ''} style={{ fill: '#ef4444' }} />
              Độc quyền HealthBook
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Trợ Lý Nhịp Điệu Hồi Sức Tim Phổi (CPR Coach)
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px', maxWidth: '600px' }}>
              Trợ lý âm thanh và hình ảnh hướng dẫn ép tim ngoài lồng ngực với tần số chuẩn khoa học **110 nhịp/phút**. 
              Giúp bạn giữ đúng nhịp hồi sức tim phổi khi cấp cứu thực tế.
            </p>
          </div>

          {/* Settings Toggles */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Audio metronome toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                width: 38, height: 38, borderRadius: '10px',
                border: '1.5px solid var(--color-border)',
                background: soundEnabled ? 'rgba(59,130,246,0.1)' : 'var(--color-bg)',
                color: soundEnabled ? '#3b82f6' : 'var(--color-text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title={soundEnabled ? 'Tắt âm báo tích tắc' : 'Bật âm báo tích tắc'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Voice Assistant toggle */}
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                toast.success(voiceEnabled ? 'Đã tắt giọng nói hướng dẫn' : 'Đã bật giọng nói hướng dẫn');
              }}
              style={{
                width: 38, height: 38, borderRadius: '10px',
                border: '1.5px solid var(--color-border)',
                background: voiceEnabled ? 'rgba(16,185,129,0.1)' : 'var(--color-bg)',
                color: voiceEnabled ? '#10b981' : 'var(--color-text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title={voiceEnabled ? 'Tắt giọng nói hướng dẫn' : 'Bật giọng nói hướng dẫn'}
            >
              {voiceEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
          </div>
        </div>

        {/* Coach Console Area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          background: 'var(--color-bg)',
          padding: '1.5rem',
          borderRadius: '18px',
          border: '1px solid var(--color-border)'
        }}>
          
          {/* Visual Beat Circle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
            <AnimatePresence mode="wait">
              {isActive ? (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  {mode === 'compress' ? (
                    <>
                      {/* Compass Circle */}
                      <motion.div
                        animate={{ scale: pulse ? 1.08 : 0.98 }}
                        transition={{ duration: 0.1, ease: 'easeOut' }}
                        style={{
                          width: 130, height: 130, borderRadius: '50%',
                          background: 'radial-gradient(circle, #ef4444 0%, #dc2626 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 8px 30px rgba(239, 68, 68, 0.4)',
                          color: 'white', fontSize: '2.5rem', fontWeight: 900,
                          border: '6px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        {count}
                      </motion.div>
                      
                      {/* Beat Text Prompts */}
                      <motion.span
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: intervalMs / 1000, repeat: Infinity }}
                        style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444', marginTop: '1.25rem' }}
                      >
                        NHẤN NGỰC!
                      </motion.span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Tốc độ: 110 lần/phút | Nhấn sâu 5-6 cm
                      </span>
                    </>
                  ) : (
                    <>
                      {/* Breath countdown circle */}
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                          width: 130, height: 130, borderRadius: '50%',
                          background: 'radial-gradient(circle, #3b82f6 0%, #2563eb 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)',
                          color: 'white', fontSize: '2.5rem', fontWeight: 900,
                          border: '6px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        {count}s
                      </motion.div>
                      
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#3b82f6', marginTop: '1.25rem' }}>
                        HÀ HƠI THỔI NGẠT 2 LẦN!
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Thổi ngạt trong 1 giây, quan sát ngực phồng lên
                      </span>
                    </>
                  )}
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'var(--color-bg)', border: '3px dashed var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-muted)', marginBottom: '1rem'
                  }}>
                    <Heart size={36} style={{ opacity: 0.5 }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    Trợ lý đang ở chế độ chờ
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Text Instructions / Controls */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', background: 'var(--color-card)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                Chu kỳ: <strong>{cycle}</strong>
              </span>
              <span style={{ fontSize: '0.8rem', background: 'var(--color-card)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                Trạng thái: <strong>{mode === 'compress' ? 'Ép tim (30)' : 'Thổi ngạt (2)'}</strong>
              </span>
            </div>

            {/* CPR Steps Text */}
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0, marginTop: 2 }}>1</span>
                <span>Đặt 2 tay chồng lên nhau ở giữa ngực nạn nhân.</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0, marginTop: 2 }}>2</span>
                <span>Ép ngực thẳng đứng xuống dưới ít nhất 5cm theo nhịp gõ tích tắc.</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0, marginTop: 2 }}>3</span>
                <span>Sau mỗi 30 lần ép ngực, ngừng lại và tiến hành thổi ngạt 2 lần.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {!isActive ? (
                <button
                  onClick={handleStart}
                  className="btn-primary"
                  style={{
                    flex: 1, padding: '12px', justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none', color: 'white', fontWeight: 700, fontSize: '0.9rem'
                  }}
                >
                  <Play size={16} fill="white" /> Bắt đầu Hướng dẫn
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="btn-secondary"
                  style={{
                    flex: 1, padding: '12px', justifyContent: 'center',
                    border: '1.5px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444', fontWeight: 700, fontSize: '0.9rem',
                    background: 'rgba(239,68,68,0.05)'
                  }}
                >
                  <Square size={16} fill="#ef4444" stroke="none" /> Dừng Hướng dẫn
                </button>
              )}

              <button
                onClick={() => {
                  setCycle(1);
                  setCount(0);
                  setMode('compress');
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  toast.success('Đã thiết lập lại bộ đếm');
                }}
                disabled={!isActive}
                style={{
                  width: 44, height: 44, borderRadius: '12px',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                  cursor: isActive ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isActive ? 1 : 0.5
                }}
                title="Reset bộ đếm"
              >
                <RotateCcw size={16} />
              </button>
            </div>

          </div>

        </div>

        {/* Browser compatibility warning for AudioContext */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '1rem', padding: '10px 14px', borderRadius: '10px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
          <Info size={14} color="#3b82f6" />
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            <strong>Mẹo:</strong> Để trợ lý hoạt động tốt nhất, hãy mở âm lượng loa điện thoại/máy tính của bạn. Giọng nói hướng dẫn sử dụng tính năng Text-to-Speech có sẵn trong trình duyệt của bạn.
          </span>
        </div>
      </div>
    </div>
  );
}
