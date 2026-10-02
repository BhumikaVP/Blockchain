import { Link } from 'react-router-dom';
import { Shield, PlusCircle, FileCheck, List } from 'lucide-react';

export default function Dashboard({ wallet, connectWallet }) {
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden text-center p-12">
        <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Blockchain-Based Certificate Verifier</h1>
        <p className="text-gray-500 max-w-xl mx-auto mb-10 text-lg">
          A decentralized platform to issue, manage, and cryptographically verify academic certificates ensuring authenticity and preventing forgery.
        </p>
        
        {!wallet ? (
          <button 
            onClick={connectWallet}
            className="px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            Connect MetaMask to Start
          </button>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Link to="/verify" className="flex flex-col items-center justify-center p-6 border-2 border-transparent bg-gray-50 hover:bg-white hover:border-indigo-100 hover:shadow-md rounded-xl transition-all group">
              <FileCheck className="w-10 h-10 text-gray-400 group-hover:text-indigo-600 mb-3 transition-colors" />
              <h3 className="font-semibold text-gray-900">Verify</h3>
              <p className="text-sm text-gray-500 mt-1">Check certificate validity</p>
            </Link>
            
            {wallet.isIssuer && (
              <>
                <Link to="/issue" className="flex flex-col items-center justify-center p-6 border-2 border-transparent bg-indigo-50 hover:bg-white hover:border-indigo-100 hover:shadow-md rounded-xl transition-all group">
                  <PlusCircle className="w-10 h-10 text-indigo-400 group-hover:text-indigo-600 mb-3 transition-colors" />
                  <h3 className="font-semibold text-gray-900">Issue New</h3>
                  <p className="text-sm text-gray-500 mt-1">Create blockchain record</p>
                </Link>
                <Link to="/certificates" className="flex flex-col items-center justify-center p-6 border-2 border-transparent bg-gray-50 hover:bg-white hover:border-indigo-100 hover:shadow-md rounded-xl transition-all group">
                  <List className="w-10 h-10 text-gray-400 group-hover:text-indigo-600 mb-3 transition-colors" />
                  <h3 className="font-semibold text-gray-900">History</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage issued certificates</p>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
