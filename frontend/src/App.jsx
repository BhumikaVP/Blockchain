import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IssueCertificate from './pages/IssueCertificate';
import VerifyCertificate from './pages/VerifyCertificate';
import CertificateList from './pages/CertificateList';
import { FileCheck, Shield, PlusCircle, LayoutDashboard, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { connectWallet } from './services/contract';

function App() {
  const [wallet, setWallet] = useState(null);

  const handleConnect = async () => {
    try {
      const data = await connectWallet();
      setWallet(data);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        setWallet(null); // Force reconnect to check role
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Shield className="w-8 h-8" />
              <Link to="/" className="font-bold text-xl tracking-tight">BlockCert</Link>
            </div>
            
            <nav className="flex space-x-6">
              <Link to="/verify" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">
                <FileCheck className="w-4 h-4 mr-1" />
                Verify
              </Link>
              {wallet?.isIssuer && (
                <>
                  <Link to="/" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                  <Link to="/issue" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Issue
                  </Link>
                  <Link to="/certificates" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium">
                    <List className="w-4 h-4 mr-1" />
                    History
                  </Link>
                </>
              )}
            </nav>

            <div>
              {wallet ? (
                <div className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium border text-gray-700">
                  {wallet.address.substring(0, 6)}...{wallet.address.substring(38)}
                  {wallet.isIssuer && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">Issuer</span>}
                </div>
              ) : (
                <button 
                  onClick={handleConnect}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Routes>
            <Route path="/" element={<Dashboard wallet={wallet} connectWallet={handleConnect} />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/issue" element={<IssueCertificate wallet={wallet} />} />
            <Route path="/certificates" element={<CertificateList wallet={wallet} />} />
          </Routes>
        </main>

        <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
          <p>Blockchain Certificate Verifier &copy; 2026. Academic Mini-Project.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
