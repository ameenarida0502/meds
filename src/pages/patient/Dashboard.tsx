import React from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Upload, Clock, Share2, User, Shield, Info } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

export default function PatientDashboard() {
  const { user, userData } = useAuth();

  const toggleSharing = async () => {
    if (!user || !userData) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isSharingEnabled: !userData.isSharingEnabled
      });
      // Context will update automatically if we force reload or wait for next signal, 
      // but let's assume it updates via the onAuthStateChanged or a separate snapshot if needed.
      // Actually my AuthContext only fetches once on auth change. Let's fix that later or just reload.
      window.location.reload();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  if (!userData) return null;

  return (
    <div className="space-y-6 pb-10">
      {/* Profile Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
          <User size={32} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
            <span>{userData.age} years</span>
            <span>•</span>
            <span>{userData.gender}</span>
            <span>•</span>
            <span className="font-semibold text-blue-600">{userData.bloodGroup}</span>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 text-center space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <h3 className="text-lg font-bold text-gray-800">Your Health QR</h3>
          <p className="text-sm text-gray-500">Share this with your doctor for instant access</p>
        </div>
        
        <div className="inline-block p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <QRCodeSVG 
            value={`${window.location.origin}/doctor/patient/${user?.uid}`} 
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="pt-2">
          <p className="text-xs font-mono text-gray-400 bg-gray-50 py-2 rounded-lg break-all">
            ID: {user?.uid}
          </p>
        </div>
      </div>

      {/* Sharing Toggle */}
      <div className={`p-5 rounded-3xl border transition-all flex items-center justify-between ${
        userData.isSharingEnabled ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${userData.isSharingEnabled ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'}`}>
            <Shield size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Patient Sharing</p>
            <p className="text-xs text-gray-500">{userData.isSharingEnabled ? 'Doctors can access your records' : 'Digital records are private'}</p>
          </div>
        </div>
        
        <button
          onClick={toggleSharing}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
            userData.isSharingEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`${
              userData.isSharingEnabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
          />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/patient/upload"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all flex flex-col items-center text-center space-y-3"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Upload size={24} />
          </div>
          <span className="font-bold text-gray-800">Upload Record</span>
        </Link>
        <Link 
          to="/patient/timeline"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all flex flex-col items-center text-center space-y-3"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <Clock size={24} />
          </div>
          <span className="font-bold text-gray-800">View Timeline</span>
        </Link>
      </div>

      {/* Info Card */}
      <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-200 flex items-start gap-4">
        <Info className="flex-shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-lg mb-1">How it works?</h4>
          <p className="text-blue-100 text-sm leading-relaxed">
            Your QR code allows doctors to see your medical history instantly. Toggle sharing OFF when you're done with a consultation to keep your data private.
          </p>
        </div>
      </div>
    </div>
  );
}
