// Update App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
// import Waitlist from './components/Waitlist';
import Onboarding from './components/Onboarding';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/waitlist" element={<Waitlist />} /> */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Login />} /> {/* Default to waitlist */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;