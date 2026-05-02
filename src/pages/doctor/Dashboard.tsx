import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Stethoscope, User, HelpCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function DoctorDashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) return;
    navigate(`/doctor/patient/${patientId.trim()}`);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, Dr. {userData?.name}</h1>
          <p className="text-gray-500 mt-1">{userData?.degree}</p>
        </div>
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <Stethoscope size={32} />
        </div>
      </div>

      {/* Access Form */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Access Patient Records</h2>
          <p className="text-gray-500 text-sm mt-2">Enter the Patient ID provided by the patient or scan their QR code to view medical history.</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter Patient ID (e.g. x8Y2v...)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-2"
          >
            <span>Access History</span>
            <ArrowRight size={20} />
          </button>
        </form>
      </div>

      {/* Helpful Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex gap-4">
          <HelpCircle className="text-green-600 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-green-900">Scan QR Code</h4>
            <p className="text-green-700 text-xs mt-1">Patients can show you a QR code on their dashboard for instant access without manual ID entry.</p>
          </div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100 flex gap-4">
          <HelpCircle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-yellow-900">Privacy First</h4>
            <p className="text-yellow-700 text-xs mt-1">You can only access records if the patient has "Digital Sharing" enabled in their settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
