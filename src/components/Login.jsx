import React, { useState } from 'react';
import { Form, Input, Button, message, Modal } from 'antd';
import { motion } from 'framer-motion';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { loginUser, signInWithSocial, googleProvider, sendPasswordReset } from '../firebase';
import { useNavigate } from 'react-router-dom';

// Placeholder image URL - replace with your own
const sideImage = './login.jpg';
const logo = './logo.png'; // <-- replace with your logo file/path

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  // Handle email/password login
  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginUser(values.email, values.password);

      if (!user.emailVerified) {
        message.warning('Email not verified. Please check your inbox.');
        setErrorMessage('Email not verified. Please check your inbox.');
        return;
      }

      message.success('Login successful! Redirecting...');
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => navigate('/onboarding'), 3000);

    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') errorMsg = 'No user found with this email.';
      if (error.code === 'auth/wrong-password') errorMsg = 'Incorrect password. Please try again.';
      if (error.code === 'auth/invalid-email') errorMsg = 'Invalid email address.';
      if (error.code === 'auth/invalid-credential') errorMsg = 'Invalid credentials. Check email and password.';
      message.error(errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInWithSocial(provider);
      message.success(`Welcome ${user.displayName || user.email}`);
      setTimeout(() => navigate('/onboarding'), 3000);
    } catch (error) {
      console.error('Social login error:', error);
      const errorMsg = error.message || 'Social login failed.';
      message.error(errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const showResetModal = () => {
    setIsModalOpen(true);
    setResetEmail('');
    setErrorMessage(null);
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      message.error('Please enter your email address.');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      message.success('Password reset email sent! Please check your inbox.');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMsg = 'Failed to send password reset email. Please try again.';
      if (error.code === 'auth/invalid-email') errorMsg = 'Invalid email address.';
      if (error.code === 'auth/user-not-found') errorMsg = 'No user found with this email.';
      message.error(errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen pt-20 bg-tertiary1">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 header backdrop-blur z-30 shadow-sm flex items-center px-6">
        <img src={logo} alt="NexGen University" className="h-32 w-auto" />
        <div className="text-lg font-bold header-text">NexGen University</div>
        <nav className="ml-auto hidden md:flex items-center gap-4 text-sm">
          <a href="/register" className="nav-link">Register</a>
        </nav>
      </header>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center bg-white p-8"
      >
        <div className="w-full max-w-md">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold mb-6 text-center text-primary"
          >
            Login to NexGen University
          </motion.h2>

          {/* Error Message Display */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 text-red-500 text-center bg-red-50 p-3 rounded-md"
            >
              {errorMessage}
            </motion.div>
          )}
          
          {/* Success Message Display */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }} 
              className="mb-4 text-green-500 text-center bg-green-50 p-3 rounded-md"
            >
              {successMessage}
            </motion.div>
          )}

          <Form name="login" onFinish={onFinish} layout="vertical">
            <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
              <Input prefix={<UserOutlined className="text-primary" />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password prefix={<LockOutlined className="text-primary" />} placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Login with Email
              </Button>
            </Form.Item>
            <Form.Item>
              <a
                href="#"
                className="text-tertiary2 hover:text-secondary text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  showResetModal();
                }}
              >
                Forgot Password?
              </a>
            </Form.Item>
          </Form>

          {/* Social logins */}
          <div className="flex flex-col space-y-2 mt-4">
            <Button 
              onClick={() => handleSocialLogin(googleProvider)} 
              loading={loading} 
              block 
              size="large" 
              icon={<GoogleOutlined />}
              style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--tertiary1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            >
              Login with Google
            </Button>
          </div>

          <motion.p className="text-center mt-4 text-primary">
            Don't have an account? <a href="/register" className="text-tertiary2 hover:text-secondary">Register</a>
          </motion.p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <Modal
        title="Reset Your Password"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={resetLoading} onClick={handleResetPassword}>
            Send Reset Email
          </Button>,
        ]}
      >
        <p className="text-primary">Enter your email address to receive a password reset link.</p>
        <Input
          placeholder="Email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          size="large"
          prefix={<UserOutlined className="text-primary" />}
        />
      </Modal>

      {/* Image Section */}
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex flex-1 bg-tertiary1">
        <img src={sideImage} alt="NexGen University" className="object-cover w-full h-full" />
      </motion.div>
    </div>
  );
};

export default Login;