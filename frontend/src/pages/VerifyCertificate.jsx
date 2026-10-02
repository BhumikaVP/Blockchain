import { useState } from 'react';
import { calculateHash } from '../utils/hash';
import { getReadOnlyContract } from '../services/contract';
import { FileCheck, UploadCloud, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function VerifyCertificate() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchParams] = useSearchParams();
  const prefillHash = searchParams.get('hash');

  const verifyByHash = async (certHash) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const contract = await getReadOnlyContract();
      const [exists, revoked, issuer, issuedAt] = await contract.isValid(certHash);
      
      if (!exists) {
        setResult({ status: 'NOT_FOUND', hash: certHash });
      } else if (revoked) {
        setResult({ status: 'REVOKED', hash: certHash, issuer, issuedAt: Number(issuedAt) });
      } else {
        setResult({ status: 'VALID', hash: certHash, issuer, issuedAt: Number(issuedAt) });
      }
    } catch (err) {
      setError(err.message || "Failed to verify on blockchain.");
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    try {
      const calculatedHash = await calculateHash(uploadedFile);
      setHash(calculatedHash);
      await verifyByHash(calculatedHash);
    } catch (err) {
      setError("Failed to process file.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <FileCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify a Certificate</h1>
          <p className="text-gray-500 mt-2">Upload a certificate document to verify its authenticity on the blockchain.</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
            <span className="text-sm font-medium text-gray-900">Click to upload or drag and drop</span>
            <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</span>
          </label>
        </div>
        
        {file && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            File: <strong>{file.name}</strong>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center space-x-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">OR ENTER HASH</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="mt-6 flex space-x-3">
          <input 
            type="text" 
            placeholder="0x..." 
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
          />
          <button 
            onClick={() => verifyByHash(hash)}
            disabled={!hash || loading}
            className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Verify Hash"}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start text-red-700">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {result && (
          <div className={`mt-8 p-6 rounded-lg border ${
            result.status === 'VALID' ? 'bg-green-50 border-green-200' :
            result.status === 'REVOKED' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center mb-4">
              {result.status === 'VALID' && <CheckCircle className="w-8 h-8 text-green-600 mr-3" />}
              {result.status === 'REVOKED' && <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />}
              {result.status === 'NOT_FOUND' && <XCircle className="w-8 h-8 text-red-600 mr-3" />}
              
              <h3 className={`text-xl font-bold ${
                result.status === 'VALID' ? 'text-green-800' :
                result.status === 'REVOKED' ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                {result.status === 'VALID' && '✓ CERTIFICATE VALID'}
                {result.status === 'REVOKED' && '⚠ CERTIFICATE REVOKED'}
                {result.status === 'NOT_FOUND' && '✕ CERTIFICATE NOT FOUND / INVALID'}
              </h3>
            </div>

            {result.status !== 'NOT_FOUND' ? (
              <div className="space-y-3 mt-4 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Issuer Address</span>
                  <span className="font-mono text-gray-800 break-all">{result.issuer}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-2">
                  <span className="text-gray-500 font-medium">Issue Date</span>
                  <span className="text-gray-800">{new Date(result.issuedAt * 1000).toLocaleString()}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between pt-2">
                  <span className="text-gray-500 font-medium">Certificate Fingerprint (SHA-256)</span>
                  <span className="font-mono text-gray-800 break-all text-xs max-w-[60%] text-right">{result.hash}</span>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-red-700">
                The certificate fingerprint does not match any certificate recorded on the blockchain. It may have been tampered with or was never issued.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
