// components/Login.js 
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { auth, signInWithSocial, googleProvider, facebookProvider } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// Placeholder image URL - replace with your own
const sideImage = './login.jpg';
const logo = './NEXGENU.png'; // <-- replace with your logo

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        message.warning({
          content: 'Email not verified. Please check your inbox.',
          duration: 5,
        });
        return;
      }

      message.success({
        content: 'Login successful!',
        duration: 5,
      });

      // Redirect after 5s
      setTimeout(() => {
        navigate('/onboarding');
      }, 5000);

    } catch (error) {
      // Handle specific errors
      let errorMsg = 'Login failed. Please try again.';

      if (error.code === 'auth/user-not-found') {
        errorMsg = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      }

      message.error({
        content: errorMsg,
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      const user = await signInWithSocial(provider);
      message.success({
        content: `Logged in as ${user.displayName}`,
        duration: 5,
      });

      setTimeout(() => {
        navigate('/onboarding');
      }, 5000);

    } catch (error) {
      message.error({
        content: error.message,
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen pt-20">
      {/* Top header - brand logo + name */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur z-30 shadow-sm flex items-center px-6">
        <img src={logo} alt="NexGen University" className="h-10 w-auto mr-3" />
        <div className="text-lg font-semibold text-slate-900">NexGen University</div>
        <nav className="ml-auto hidden md:flex items-center gap-4 text-sm">
          <a href="/register" className="text-slate-700 hover:text-blue-600">Register</a>
        </nav>
      </header>
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
            Login to NexGen University
          </motion.h2>
          <Form name="login" onFinish={onFinish} layout="vertical">
            <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
              <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Login with Email
              </Button>
            </Form.Item>
          </Form>
          <div className="flex flex-col space-y-2 mt-4">
            <Button onClick={() => handleSocialLogin(googleProvider)} loading={loading} block size="large" icon={<UserOutlined />}>
              Login with Google
            </Button>
            {/* <Button onClick={() => handleSocialLogin(facebookProvider)} loading={loading} block size="large" icon={<UserOutlined />}>
              Login with Facebook
            </Button> */}
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="text-center mt-4">
            Don't have an account? <a href="/register" className="text-blue-500">Register</a>
          </motion.p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hidden md:flex flex-1"
      >
        <img src={sideImage} alt="NexGen University" className="object-cover w-full h-full" loading="lazy" />
      </motion.div>
    </div>
  );
};

export default Login;
