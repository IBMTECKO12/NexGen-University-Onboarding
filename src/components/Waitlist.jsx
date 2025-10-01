import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { MailOutlined } from '@ant-design/icons';
import { db, getLongPollingDb } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Placeholder image URL - replace with your own
const sideImage = './waitlist.jpg';

const Waitlist = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Try to determine whether an error is the WebChannel/transport/400 problem
  const looksLikeTransportError = (err) => {
    const msg = String(err?.message || err);
    const code = err?.code || '';
    return /WebChannelConnection|transport errored|Bad Request|400/.test(msg) || /internal|unavailable/.test(code);
  };

  // small helper that retries writes to Firestore, with fallback to long-polling instance
  const writeWithRetries = async (data, retries = 1) => {
    let lastError;
    // first attempt using primary db
    try {
      return await addDoc(collection(db, 'waitlists'), data);
    } catch (err) {
      lastError = err;
      console.warn('[waitlist] primary Firestore write failed:', err);
      // if this looks like the WebChannel/transport 400 problem, try the long-polling fallback once
      if (looksLikeTransportError(err)) {
        try {
          console.info('[waitlist] attempting write with long-polling fallback Firestore instance...');
          const altDb = getLongPollingDb();
          return await addDoc(collection(altDb, 'waitlists'), data);
        } catch (err2) {
          lastError = err2;
          console.error('[waitlist] long-polling fallback also failed:', err2);
        }
      }
    }

    // additional generic retry attempts (exponential backoff)
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 500));
        return await addDoc(collection(db, 'waitlists'), data);
      } catch (err) {
        lastError = err;
        console.warn(`[waitlist] retry attempt ${attempt + 1} failed`, err);
      }
    }

    throw lastError;
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await writeWithRetries({
        name: values.name,
        email: values.email,
        joinedAt: serverTimestamp(),
      });
      message.success('Successfully joined the waitlist!');
      // Redirect to onboarding and pass the name so Onboarding can display it
      navigate('/onboarding', { state: { name: values.name } });
      // Note: For sending email, set up a Firebase Cloud Function triggered on document create.
      // Example Cloud Function (in functions/index.js):
      // const functions = require('firebase-functions');
      // const admin = require('firebase-admin');
      // admin.initializeApp();
      // exports.sendWaitlistEmail = functions.firestore.document('waitlists/{docId}').onCreate((snap) => {
      //   const data = snap.data();
      //   // Use nodemailer or SendGrid to send email to data.email
      //   console.log(`Send email to ${data.email}`);
      //   return null;
      // });
    } catch (error) {
      console.error('[waitlist] Firestore write error:', error);
      // show clearer error to the user (include code when available) and actionable advice
      message.error(`${error?.code || 'error'}: ${error?.message || String(error)} — Check firebaseConfig.projectId, ensure Firestore is enabled in the console, and if you're behind a corporate proxy try enabling long-polling.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center bg-white p-8"
      >
        <div className="w-full max-w-md">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold mb-6 text-center text-gray-800"
          >
            Join NexGen University Waitlist
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-8 text-gray-600"
          >
            Be the first to know about new onboarding opportunities!
          </motion.p>
          <Form name="waitlist" onFinish={onFinish} layout="vertical">
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
              <Input placeholder="Full Name" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Join Waitlist
              </Button>
            </Form.Item>
          </Form>
          {/* <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="text-center mt-4">
            Already registered? <a href="/login" className="text-blue-500">Login</a> or <a href="/register" className="text-blue-500">Register</a>
          </motion.p> */}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hidden md:flex flex-1"
      >
        <img src={sideImage} alt="Waitlist Image" className="object-cover w-full h-full" loading="lazy" />
      </motion.div>
    </div>
  );
};

export default Waitlist;