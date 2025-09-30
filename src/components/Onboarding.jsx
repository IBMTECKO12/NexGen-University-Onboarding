import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, message } from 'antd';
import { auth, logout } from '../firebase';
import { WhatsAppOutlined, SendOutlined } from '@ant-design/icons';

// Placeholder image URL - replace with your own
const sideImage = './onboarding.jpg';
const logo = './logo.png'; // <-- replace with your logo file/path

// Replace with your actual group links
const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/KXqYxYvuk1g45maj5caJro?mode=ems_wa_t';
const TELEGRAM_GROUP_LINK = 'https://t.me/+lTmNsF5i6TM5NmQ0';

const Onboarding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState(location.state?.name || auth.currentUser?.displayName || 'Student');
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  const startDate = new Date('2025-09-30T00:00:00');
  const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diffMs = Math.max(0, endDate.getTime() - now.getTime());
      setRemainingSeconds(Math.floor(diffMs / 1000));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const formatDHHMMSS = (totalSeconds) => {
    if (totalSeconds == null) return { days: '--', hrs: '--', mins: '--', secs: '--' };
    const days = Math.floor(totalSeconds / 86400);
    const hrs = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return { days: String(days), hrs: pad(hrs), mins: pad(mins), secs: pad(secs) };
  };

  const totalPeriodSeconds = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / 1000));
  const elapsedSeconds = remainingSeconds == null ? 0 : Math.max(0, totalPeriodSeconds - remainingSeconds);
  const progress = Math.min(1, elapsedSeconds / totalPeriodSeconds);

  useEffect(() => {
    if (!name) {
      message.info('Please join the waitlist or login to access onboarding.');
      navigate('/waitlist');
    }
  }, [name, navigate]);

  const digitVariants = {
    initial: { y: -6, opacity: 0, scale: 0.96 },
    animate: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.26, ease: 'easeOut' } }
  };

  const glowClass = 'shadow-[0_10px_30px_rgba(43,73,84,0.2)]'; // Using tertiary1 for shadow

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      message.success('You have logged out successfully.');
      navigate('/login');
    } catch (error) {
      message.error(error.message || 'Failed to log out.');
    }
  };

  // Handle group link redirects
  const handleJoinWhatsApp = () => {
    window.open(WHATSAPP_GROUP_LINK, '_blank');
  };

  const handleJoinTelegram = () => {
    window.open(TELEGRAM_GROUP_LINK, '_blank');
  };

  return (
    <div className="flex min-h-screen pt-20 bg-tertiary1">
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 h-16 header backdrop-blur z-30 shadow-sm flex items-center px-6">
        <img src={logo} alt="NexGen University" className="h-32 w-auto" />
        <div className="text-lg md:text-xl font-bold header-text">NexGen University</div>
        <nav className="ml-auto hidden md:flex items-center gap-4 text-sm">
          <a href="/onboarding" className="nav-link">Onboarding</a>
          <button 
            onClick={handleLogout} 
            className="nav-link hover:text-red-600"
          >
            Log Out
          </button>
        </nav>
      </header>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center bg-white p-8"
      >
        <div className="w-full max-w-md text-center">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold mb-6 text-primary"
          >
            Welcome to Onboarding, {name}!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-4 text-primary"
          >
            Your journey starts soon. Countdown to launch:
          </motion.p>

          {/* Countdown card */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.45, type: 'spring', stiffness: 140 }}
            className={`mb-6 p-6 rounded-3xl ${glowClass} countdown-card text-white ring-1 ring-secondary-30`}
          >
            <div className="flex items-center justify-center gap-4">
              {(() => {
                const { days, hrs, mins, secs } = formatDHHMMSS(remainingSeconds);
                const unit = (value, label, padClass = '') => (
                  <div className="flex flex-col items-center">
                    <motion.div
                      key={value + label}
                      variants={digitVariants}
                      initial="initial"
                      animate="animate"
                      className="bg-white/10 backdrop-blur-sm border border-[rgba(185,251,194,0.2)] rounded-xl min-w-[32px] flex items-center justify-center"
                    >
                      <span className={`text-4xl md:text-5xl font-bold tracking-tight ${padClass} text-white`}>{value}</span>
                    </motion.div>
                    <div className="text-[11px] mt-2 uppercase text-secondary/75">{label}</div>
                  </div>
                );

                return (
                  <>
                    {unit(days, 'Days', 'text-2xl')}
                    <div className="text-3xl font-bold text-secondary/90">:</div>
                    {unit(hrs, 'Hours')}
                    <div className="text-3xl font-bold text-secondary/90">:</div>
                    {unit(mins, 'Minutes')}
                    <div className="text-3xl font-bold text-secondary/90">:</div>
                    {unit(secs, 'Seconds')}
                  </>
                );
              })()}
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.round(progress * 100))}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="h-2 progress-bar"
                />
              </div>
              <div className="text-xs mt-2 text-secondary/90">{Math.round(progress * 100)}% complete</div>
            </div>
          </motion.div>

          {/* WhatsApp and Telegram Buttons */}
          <div className="flex flex-col space-y-3 mb-6">
            <Button
              size="large"
              onClick={handleJoinWhatsApp}
              style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--tertiary1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              icon={<WhatsAppOutlined />}
            >
              Join WhatsApp Group
            </Button>
            <Button
              size="large"
              onClick={handleJoinTelegram}
              style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--tertiary1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              icon={<SendOutlined />}
            >
              Join Telegram Group
            </Button>
          </div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5, duration: 0.5 }} 
            className="mt-8"
          >
            <p className="text-primary">Useful Links:</p>
            <ul className="list-disc list-inside">
              <li><a href="#" className="text-tertiary2 hover:text-secondary">Orientation Guide</a></li>
              <li><a href="#" className="text-tertiary2 hover:text-secondary">Support Center</a></li>
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Right-side image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hidden md:flex flex-1 bg-tertiary1"
      >
        <img src={sideImage} alt="Onboarding Image" className="object-cover w-full h-full" loading="lazy" />
      </motion.div>
    </div>
  );
};

export default Onboarding;