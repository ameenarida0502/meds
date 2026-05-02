import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PatientDashboard from './pages/patient/Dashboard';
import PatientUpload from './pages/patient/Upload';
import PatientTimeline from './pages/patient/Timeline';
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientView from './pages/doctor/PatientView';
import Navbar from './components/Navbar';

function PrivateRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'patient' | 'doctor' }) {
  const { user, userData, loading, role } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (!userData) return <Navigate to="/onboarding" />;

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} />;
  }

  return <>{children}</>;
}

export default function App() {
  const { user, loading, userData } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-md md:max-w-xl lg:max-w-4xl">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/onboarding" /> : <Login />} />
          <Route path="/onboarding" element={
            user ? (userData ? <Navigate to={userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} /> : <Onboarding />) : <Navigate to="/login" />
          } />
          
          <Route path="/patient/dashboard" element={<PrivateRoute allowedRole="patient"><PatientDashboard /></PrivateRoute>} />
          <Route path="/patient/upload" element={<PrivateRoute allowedRole="patient"><PatientUpload /></PrivateRoute>} />
          <Route path="/patient/timeline" element={<PrivateRoute allowedRole="patient"><PatientTimeline /></PrivateRoute>} />
          
          <Route path="/doctor/dashboard" element={<PrivateRoute allowedRole="doctor"><DoctorDashboard /></PrivateRoute>} />
          <Route path="/doctor/patient/:id" element={<PrivateRoute allowedRole="doctor"><PatientView /></PrivateRoute>} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}
