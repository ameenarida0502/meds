import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, ExternalLink, FileText, File, Calendar, Loader2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

export default function PatientTimeline() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'records'),
      where('patientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecords(recordsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'records');
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <button 
        onClick={() => navigate('/patient/dashboard')}
        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} className="mr-1" />
        Dashboard
      </button>

      <h1 className="text-2xl font-bold text-gray-900">Medical Timeline</h1>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
          <p className="text-gray-500">Loading your history...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-dashed border-gray-200 text-center space-y-4">
          <div className="bg-gray-100 text-gray-400 p-4 rounded-full inline-block">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No records found</h3>
          <p className="text-gray-500 text-sm">You haven't uploaded any medical records yet.</p>
          <button 
            onClick={() => navigate('/patient/upload')}
            className="text-blue-600 font-bold hover:underline"
          >
            Upload your first record
          </button>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
          {records.map((record) => (
            <div key={record.id} className="relative pl-12">
              <div className={`absolute left-4 top-4 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-2 ${
                record.type === 'prescription' ? 'bg-blue-600 ring-blue-100' : 'bg-green-600 ring-green-100'
              }`} />
              
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {record.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {record.createdAt?.toDate ? format(record.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 truncate max-w-[200px]">
                    {record.fileName}
                  </h3>
                </div>
                
                <a 
                  href={record.fileURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  <span>View</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
