import { useState, useEffect } from 'react';
import { getContract } from '../services/contract';
import { ShieldAlert } from 'lucide-react';

export default function CertificateList({ wallet }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (wallet?.isIssuer) {
      loadCertificates();
    }
  }, [wallet]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const contract = await getContract(wallet.signer);
      
      // Query past Issued events
      const issuedFilter = contract.filters.Issued(null, null, wallet.address);
      const issuedEvents = await contract.queryFilter(issuedFilter, 0, "latest");
      
      const certs = await Promise.all(issuedEvents.map(async (event) => {
        const hash = event.args.certHash;
        const student = event.args.student;
        const date = new Date(Number(event.args.timestamp) * 1000).toLocaleString();
        
        // check current status to see if revoked
        const [exists, revoked] = await contract.isValid(hash);
        
        return {
          hash,
          student,
          date,
          revoked,
          txHash: event.transactionHash
        };
      }));
      
      // Sort by newest first
      setCertificates(certs.reverse());
    } catch (err) {
      console.error(err);
      setError("Failed to load certificates history.");
    }
    setLoading(false);
  };

  const handleRevoke = async (hash) => {
    if (!window.confirm("Are you sure you want to revoke this certificate? This action cannot be undone.")) return;
    
    try {
      const contract = await getContract(wallet.signer);
      const tx = await contract.revokeCertificate(hash);
      alert("Please wait for transaction confirmation...");
      await tx.wait();
      alert("Certificate revoked successfully!");
      loadCertificates();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to revoke certificate.");
    }
  };

  if (!wallet || !wallet.isIssuer) {
    return <div className="text-center mt-20 text-gray-500">Access Denied. Issuer only.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="border-b px-6 py-4 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Issued Certificates History</h2>
          <button onClick={loadCertificates} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh</button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading blockchain history...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No certificates issued yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Student Address</th>
                    <th className="pb-3 font-medium">Certificate Hash</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {certificates.map((cert) => (
                    <tr key={cert.hash} className="border-b hover:bg-gray-50">
                      <td className="py-4 text-gray-600">{cert.date}</td>
                      <td className="py-4 font-mono text-gray-800">{cert.student.substring(0,6)}...{cert.student.substring(38)}</td>
                      <td className="py-4 font-mono text-gray-800">
                        {cert.hash.substring(0,10)}...{cert.hash.substring(60)}
                      </td>
                      <td className="py-4">
                        {cert.revoked ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {!cert.revoked && (
                          <button 
                            onClick={() => handleRevoke(cert.hash)}
                            className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4 mr-1" />
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
