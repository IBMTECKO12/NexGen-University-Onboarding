import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, message } from 'antd';
import { auth, logout } from '../firebase'; // ✅ import logout helper

// Placeholder image URL - replace with your own
const sideImage = './onboarding.jpg';
const logo = './NEXGENU.png'; // <-- replace with your logo file/path

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

  const glowClass = 'shadow-[0_10px_30px_rgba(59,130,246,0.16)]';

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      message.success('You have logged out successfully.');
      navigate('/login');
    } catch (error) {
      message.error(error.message || 'Failed to log out.');
    }
  };

  return (
    <div className="flex min-h-screen pt-20">
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur z-30 shadow-sm flex items-center px-6">
        <img src={logo} alt="NexGen University" className="h-10 w-auto mr-3" />
        <div className="text-lg md:text-xl font-semibold text-slate-900">NexGen University</div>
        <nav className="ml-auto hidden md:flex items-center gap-4 text-sm">
          <a href="/onboarding" className="text-slate-700 hover:text-blue-600">Onboarding</a>
          <button 
            onClick={handleLogout} 
            className="text-slate-700 hover:text-red-600 transition-colors"
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
            className="text-3xl font-bold mb-6 text-gray-800"
          >
            Welcome to Onboarding, {name}!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-4 text-gray-600"
          >
            Your journey starts soon. Countdown to launch:
          </motion.p>

          {/* Countdown card */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.45, type: 'spring', stiffness: 140 }}
            className={`mb-6 p-6 rounded-3xl ${glowClass} bg-gradient-to-br from-slate-900 via-blue-900 to-blue-600 text-white ring-1 ring-white/6`}
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
                      className="bg-white/6 backdrop-blur-sm border border-white/8 rounded-xl min-w-[32px] flex items-center justify-center"
                    >
                      <span className={`text-4xl md:text-5xl font-mono font-semibold tracking-tight ${padClass}`}>{value}</span>
                    </motion.div>
                    <div className="text-[11px] mt-2 uppercase opacity-75">{label}</div>
                  </div>
                );

                return (
                  <>
                    {unit(days, 'Days', 'text-2xl')}
                    <div className="text-3xl font-mono font-semibold opacity-90">:</div>
                    {unit(hrs, 'Hours')}
                    <div className="text-3xl font-mono font-semibold opacity-90">:</div>
                    {unit(mins, 'Minutes')}
                    <div className="text-3xl font-mono font-semibold opacity-90">:</div>
                    {unit(secs, 'Seconds')}
                  </>
                );
              })()}
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.round(progress * 100))}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="h-2 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500"
                />
              </div>
              <div className="text-xs mt-2 opacity-80 text-white/90">{Math.round(progress * 100)}% complete</div>
            </div>
          </motion.div>

          <Button type="primary" size="large" onClick={() => navigate('/login')}>
            Proceed to Dashboard
          </Button>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5, duration: 0.5 }} 
            className="mt-8"
          >
            <p className="text-gray-600">Useful Links:</p>
            <ul className="list-disc list-inside">
              <li><a href="#" className="text-blue-500">Orientation Guide</a></li>
              <li><a href="#" className="text-blue-500">Course Catalog</a></li>
              <li><a href="#" className="text-blue-500">Support Center</a></li>
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Right-side image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hidden md:flex flex-1"
      >
        <img src={sideImage} alt="Onboarding Image" className="object-cover w-full h-full" loading="lazy" />
      </motion.div>
    </div>
  );
};

export default Onboarding;
