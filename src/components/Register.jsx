import React, { useState } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import { motion } from 'framer-motion';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { auth, db, signInWithSocial, googleProvider, facebookProvider } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, AuthErrorCodes } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Placeholder image URL - replace with your own
const sideImage = './register.jpg';
const logo = './NEXGENU.png'; // <-- replace with your logo

const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });
      await sendEmailVerification(user);

      // Store additional info in Firestore with separate error handling
      try {
        await setDoc(doc(db, 'users', user.uid), {
          name: values.name,
          email: values.email,
          program: values.program,
          createdAt: serverTimestamp(),
        });
      } catch (firestoreError) {
        console.error('Firestore write error:', firestoreError);
        message.error('Failed to save user data to database. Please contact support.');
        // Continue registration even if Firestore fails (optional)
      }

      message.success('Registration successful! Verification email sent.');
      navigate('/login'); // direct redirect

    } catch (error) {
      console.error('Registration error:', error);
      let errorMsg = "Registration failed. Please try again.";
      if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
        errorMsg = "This email is already registered!";
      } else if (error.code === AuthErrorCodes.WEAK_PASSWORD) {
        errorMsg = "Password should be at least 6 characters.";
      } else if (error.code === AuthErrorCodes.INVALID_EMAIL) {
        errorMsg = "Invalid email format.";
      }
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider) => {
    setLoading(true);
    try {
      const user = await signInWithSocial(provider);

      try {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || "Anonymous",
          email: user.email,
          program: "N/A", // default since social signup skips program field
          createdAt: serverTimestamp(),
        }, { merge: true });
      } catch (firestoreError) {
        console.error('Firestore write error for social:', firestoreError);
        message.error('Failed to save social user data to database. Please contact support.');
      }

      message.success(`Registered as ${user.displayName || user.email}`);
      navigate('/onboarding');
    } catch (error) {
      console.error('Social registration error:', error);
      message.error("Social login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen pt-20 bg-tertiary1 font-nohemi">
      {/* Top header - brand logo + name */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary/90 backdrop-blur z-30 shadow-sm flex items-center px-6">
        <img src={logo} alt="NexGen University" className="h-10 w-auto mr-3" />
        <div className="text-lg font-bold text-secondary">NexGen University</div>
        <nav className="ml-auto hidden md:flex items-center gap-4 text-sm">
          <a href="/login" className="text-secondary hover:text-tertiary2">Login</a>
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
            className="text-3xl font-bold mb-6 text-center text-primary"
          >
            Register for NexGen University
          </motion.h2>

          <Form name="register" onFinish={onFinish} layout="vertical">
            <Form.Item name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
              <Input prefix={<UserOutlined className="text-primary" />} placeholder="Full Name" size="large" />
            </Form.Item>
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}>
              <Input prefix={<MailOutlined className="text-primary" />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password prefix={<LockOutlined className="text-primary" />} placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item name="program" rules={[{ required: true, message: 'Please select a program!' }]}>
              <Select placeholder="Select Program" size="large" className="text-primary">
                <Option value="computer-science">Computer Science</Option>
                <Option value="business">Business Administration</Option>
                <Option value="engineering">Engineering</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large" className="bg-primary hover:bg-tertiary1">
                Register with Email
              </Button>
            </Form.Item>
          </Form>

          <div className="flex flex-col space-y-2 mt-4">
            <Button 
              onClick={() => handleSocialRegister(googleProvider)} 
              loading={loading} 
              block 
              size="large" 
              icon={<UserOutlined />}
              className="bg-primary hover:bg-tertiary1 text-white border-none"
            >
              Register with Google
            </Button>
            {/* Uncomment if Facebook is ready */}
            {/* <Button 
              onClick={() => handleSocialRegister(facebookProvider)} 
              loading={loading} 
              block 
              size="large" 
              icon={<UserOutlined />}
              className="bg-primary hover:bg-tertiary1 text-white border-none"
            >
              Register with Facebook
            </Button> */}
          </div>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4, duration: 0.5 }} 
            className="text-center mt-4 text-primary"
          >
            Already have an account? <a href="/login" className="text-tertiary2 hover:text-secondary">Login</a>
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hidden md:flex flex-1 bg-tertiary1"
      >
        <img src={sideImage} alt="NexGen University Register" className="object-cover w-full h-full" loading="lazy" />
      </motion.div>
    </div>
  );
};

export default Register;