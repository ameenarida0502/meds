import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, FileText, CheckCircle, Loader2, ArrowLeft, Image as ImageIcon, File } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

export default function PatientUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('prescription');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `records/${user.uid}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const recordRef = doc(collection(db, 'records'));
      await setDoc(recordRef, {
        id: recordRef.id,
        patientId: user.uid,
        fileURL: downloadURL,
        fileName: file.name,
        type,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 1500);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Medical Record</h1>

        {success ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={48} />
            </div>
            <p className="text-xl font-bold text-gray-900">Upload Successful!</p>
            <p className="text-gray-500">Redirecting to your timeline...</p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('prescription')}
                    className={`py-3 rounded-xl border-2 transition-all flex items-center justify-center space-x-2 ${
                      type === 'prescription' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600' 
                        : 'border-gray-100 bg-gray-50 text-gray-500'
                    }`}
                  >
                    <FileText size={18} />
                    <span className="font-semibold">Prescription</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('report')}
                    className={`py-3 rounded-xl border-2 transition-all flex items-center justify-center space-x-2 ${
                      type === 'report' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600' 
                        : 'border-gray-100 bg-gray-50 text-gray-500'
                    }`}
                  >
                    <File size={18} />
                    <span className="font-semibold">Report</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose File (PDF/Image)</label>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all relative overflow-hidden group">
                  {file ? (
                    <div className="text-center p-4">
                      <div className="bg-blue-100 text-blue-600 p-3 rounded-full inline-block mb-2">
                        {file.type.startsWith('image/') ? <ImageIcon size={24} /> : <FileText size={24} />}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-200 text-gray-400 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Tap to upload</p>
                      <p className="text-xs text-gray-400 mt-1">Images or PDF up to 5MB</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/*,application/pdf"
                    required
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Record</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
