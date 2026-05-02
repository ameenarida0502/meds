import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package2, LogOut, User, Stethoscope } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, userData, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Package2 size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">MedVault</span>
        </Link>

        {user && userData && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              {role === 'patient' ? <User size={16} /> : <Stethoscope size={16} />}
              <span className="font-medium hidden sm:inline">{userData.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
