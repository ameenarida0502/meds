import React, { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, User, Phone, MapPin, Calendar, Droplets, BookOpen } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Onboarding() {
  const { user } = useAuth();
  const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Common fields
  const [name, setName] = useState(user?.displayName || '');
  
  // Patient fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [address, setAddress] = useState('');
  
  // Doctor fields
  const [degree, setDegree] = useState('');

  useEffect(() => {
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
    const savedRole = sessionStorage.getItem('pendingRole') as 'patient' | 'doctor';
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;
    
    setLoading(true);
    const commonData = {
      id: user.uid,
      role,
      name,
      email: user.email,
      createdAt: new Date().toISOString(),
    };

    let fullData = {};
    if (role === 'patient') {
      fullData = {
        ...commonData,
        age: parseInt(age),
        gender,
        bloodGroup,
        address,
        isSharingEnabled: true,
      };
    } else {
      fullData = {
        ...commonData,
        degree,
        address,
      };
    }

    try {
      await setDoc(doc(db, 'users', user.uid), fullData);
      window.location.reload(); // To refresh AuthContext
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-6">Choose your role</h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setRole('patient')}
            className="flex flex-col items-center p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <User className="text-blue-600 mb-2" size={32} />
            <span className="font-bold">Patient</span>
          </button>
          <button 
            onClick={() => setRole('doctor')}
            className="flex flex-col items-center p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <BookOpen className="text-blue-600 mb-2" size={32} />
            <span className="font-bold">Doctor</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          {role === 'patient' ? <User className="text-blue-600" /> : <BookOpen className="text-blue-600" />}
          Complete Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          {role === 'patient' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Degree / Specialization</label>
              <input
                type="text"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="MBBS, MD Cardiology"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="Your full address here..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Finish Setup</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
