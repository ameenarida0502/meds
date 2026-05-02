import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import { ArrowLeft, User, ShieldOff, Loader2, ExternalLink, FileText, File, Calendar, Mail, MapPin } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

export default function PatientView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const patientDoc = await getDoc(doc(db, 'users', id));
        if (!patientDoc.exists()) {
          setError("Patient not found.");
          setLoading(false);
          return;
        }

        const patientData = patientDoc.data();
        
        // 2. Check Sharing Access
        if (patientData.role !== 'patient') {
          setError("This ID does not belong to a patient.");
          setLoading(false);
          return;
        }

        if (!patientData.isSharingEnabled) {
          setError("access_denied");
          setPatient(patientData);
          setLoading(false);
          return;
        }

        setPatient(patientData);

        // 3. Fetch Records
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', id),
          orderBy('createdAt', 'desc')
        );
        const recordsSnap = await getDocs(q);
        const recordsData = recordsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRecords(recordsData);

      } catch (err: any) {
        console.error("Error fetching patient data:", err);
        if (err.code === 'permission-denied') {
          setError("access_denied");
        } else {
          handleFirestoreError(err, OperationType.GET, `patient/${id}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Fetching medical history...</p>
      </div>
    );
  }

  if (error === "access_denied") {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <button onClick={() => navigate('/doctor/dashboard')} className="flex items-center text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} className="mr-1" />
          Dashboard
        </button>
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-red-50 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldOff size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-500 mt-2">
              Patient <span className="font-bold text-gray-800">{patient?.name}</span> has disabled digital sharing.
            </p>
          </div>
          <button 
            onClick={() => navigate('/doctor/dashboard')}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-8">
        <div className="bg-orange-50 text-orange-600 p-4 rounded-3xl border border-orange-100 mb-6">
          {error === "Patient not found." ? "Invalid Patient ID" : error}
        </div>
        <button onClick={() => navigate('/doctor/dashboard')} className="text-blue-600 font-bold underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <button onClick={() => navigate('/doctor/dashboard')} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={20} className="mr-1" />
        Dashboard
      </button>

      {/* Patient Specs */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-sm text-gray-500">Age: {patient.age} • {patient.gender} • {patient.bloodGroup}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            <Mail size={16} className="mr-2 text-gray-400" />
            {patient.email}
          </div>
          <div className="flex items-start text-sm text-gray-600">
            <MapPin size={16} className="mr-2 text-gray-400 mt-0.5" />
            <span className="flex-1">{patient.address}</span>
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Medical History Timeline</h2>
        
        {records.length === 0 ? (
          <div className="bg-gray-50 p-10 rounded-3xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">No medical records uploaded by this patient.</p>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            {records.map((record) => (
              <div key={record.id} className="relative pl-12">
                <div className={`absolute left-4 top-4 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-2 ${
                  record.type === 'prescription' ? 'bg-blue-600 ring-blue-100' : 'bg-green-600 ring-green-100'
                }`} />
                
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
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
                    <h3 className="font-bold text-gray-900 truncate">
                      {record.fileName}
                    </h3>
                  </div>
                  
                  <a 
                    href={record.fileURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors flex-shrink-0"
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
    </div>
  );
}
