import { useState } from 'react';
import { calculateHash } from '../utils/hash';
import { uploadCertificate } from '../services/ipfs';
import { getContract } from '../services/contract';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function IssueCertificate({ wallet }) {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    program: '',
    course: '',
    grade: '',
    studentWallet: ''
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [issuedData, setIssuedData] = useState(null);

  if (!wallet || !wallet.isIssuer) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
        <p className="text-gray-500 mt-2">You must connect a wallet with Issuer privileges to access this page.</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a certificate file.");
      return;
    }
    
    setLoading(true);
    setStatus('Calculating file hash...');
    
    try {
      const hash = await calculateHash(file);
      
      setStatus('Uploading to IPFS...');
      const cid = await uploadCertificate(file, formData);
      
      setStatus('Please confirm transaction in MetaMask...');
      const contract = await getContract(wallet.signer);
      const tx = await contract.issueCertificate(hash, formData.studentWallet);
      
      setStatus('Waiting for transaction confirmation...');
      await tx.wait();
      
      setIssuedData({
        hash,
        cid,
        txHash: tx.hash,
        studentWallet: formData.studentWallet,
        date: new Date().toISOString()
      });
      setStatus('');
    } catch (error) {
      console.error(error);
      alert(error.message || "An error occurred during issuance.");
      setStatus('');
    }
    setLoading(false);
  };

  if (issuedData) {
    const verifyUrl = `${window.location.origin}/verify?hash=${issuedData.hash}`;
    return (
      <div className="max-w-3xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-sm border border-green-100">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Certificate Issued Successfully!</h2>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border mb-8 space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Certificate Hash</span>
            <span className="font-mono text-xs text-gray-800 break-all max-w-[60%] text-right">{issuedData.hash}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">IPFS CID</span>
            <span className="font-mono text-sm text-gray-800">{issuedData.cid}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Transaction Hash</span>
            <span className="font-mono text-xs text-gray-800 break-all max-w-[60%] text-right">{issuedData.txHash}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h3 className="font-medium text-gray-800 mb-4">Verification QR Code</h3>
          <div className="p-4 bg-white border rounded-xl shadow-sm inline-block">
            <QRCodeSVG value={verifyUrl} size={200} />
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center max-w-sm">
            Scan this QR code or share the URL to instantly verify this certificate.
          </p>
          <button 
            onClick={() => setIssuedData(null)}
            className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Issue Another Certificate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-4">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="border-b px-8 py-6 bg-gray-50 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Issue New Certificate</h1>
            <p className="text-sm text-gray-500 mt-1">Record a new academic credential on the blockchain.</p>
          </div>
          <FileText className="text-indigo-200 w-12 h-12" />
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
              <input required type="text" name="studentName" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Ananya S" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
              <input required type="text" name="rollNo" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g., CSE19-047" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
              <input required type="text" name="program" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g., B.E. CSE" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
              <input required type="text" name="course" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Blockchain Fundamentals" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <input required type="text" name="grade" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g., A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Wallet Address</label>
              <input required type="text" name="studentWallet" onChange={handleInputChange} className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500" placeholder="0x..." />
            </div>
          </div>

          <div className="mb-8 border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">Upload Certificate Document</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                required
                type="file"
                id="cert-upload"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                {file ? (
                  <span className="text-sm font-medium text-indigo-600">{file.name}</span>
                ) : (
                  <span className="text-sm text-gray-600">Select file to upload</span>
                )}
              </label>
            </div>
          </div>

          {status && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 text-sm rounded-md flex items-center">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              {status}
            </div>
          )}

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              Issue Certificate on Blockchain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
