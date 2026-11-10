import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import { Copy, CheckCircle } from 'lucide-react'; // Icons import kiye hain

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [isCopied, setIsCopied] = useState(false); // Link copy ka state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('https://google-review-saas-backend.onrender.com/api/business/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-gen");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${profile.cafeName}-QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Naya function: Customer URL copy karne ke liye
  const handleCopyLink = async () => {
    try {
      const customerLink = `${window.location.origin}/rate/${profile._id}`;
      await navigator.clipboard.writeText(customerLink);
      setIsCopied(true);
      
      // 2 second baad wapas normal copy icon show karega
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  if (!profile) return <div className="text-center mt-20 animate-pulse text-blue-400">Loading Dashboard...</div>;

  // Frontend URL jo customer scan karke kholega
  const customerLink = `${window.location.origin}/rate/${profile._id}`;

  return (
    // Mobile ke liye padding aur margin adjust (p-4 md:p-6, mt-6 md:mt-10)
    <div className="max-w-4xl mx-auto p-4 md:p-6 mt-6 md:mt-10 font-sans">
      
      {/* Header section - Mobile par stack hoga, bade screen par row me rahega */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {profile.cafeName}</h1>
        <button onClick={handleLogout} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-5 py-2 rounded-lg transition-all text-sm font-medium w-full sm:w-auto">
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        
        {/* QR Code Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 p-6 md:p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-white">Your Review QR Code</h2>
          <p className="text-sm text-gray-400 mb-6">Print this and place it on your tables.</p>
          
          <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-6">
            <QRCodeCanvas 
              id="qr-gen" 
              value={customerLink.trim()} 
              size={180} 
              level={"H"}
              includeMargin={true}
            />
          </div>

          <button onClick={downloadQR} className="bg-blue-600 hover:bg-blue-700 px-6 py-3.5 rounded-xl font-bold w-full transition-all text-white shadow-lg shadow-blue-500/20">
            Download QR Code
          </button>
        </div>

        {/* Business Info Section */}
        <div className="bg-gray-900/50 border border-gray-800 p-6 md:p-8 rounded-3xl flex flex-col justify-center shadow-xl">
          
          <h3 className="text-sm font-medium text-gray-400 mb-2">Google Review Link Set To:</h3>
          <p className="text-gray-300 bg-black/40 p-4 rounded-xl truncate mb-8 text-sm border border-gray-700/50">
            {profile.googleReviewLink}
          </p>
          
          <h3 className="text-sm font-medium text-gray-400 mb-2">Customer Scan Link:</h3>
          
          {/* Naya Copy Link Container */}
          <div className="flex items-center justify-between bg-black/40 border border-gray-700/50 rounded-xl p-2 mb-2 transition-all">
            <p className="text-blue-400 text-sm truncate px-3 py-2 select-all w-[80%]">
              {customerLink}
            </p>
            
            <button 
              onClick={handleCopyLink}
              className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${isCopied ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
              title="Copy Link"
            >
              {isCopied ? <CheckCircle size={20} /> : <Copy size={20} />}
            </button>
          </div>
          
          {/* Copy hone par chota sa message */}
          {isCopied && (
            <p className="text-green-400 text-xs text-right animate-pulse mr-1">
              Copied to clipboard! ✔️
            </p>
          )}

        </div>
      </div>
    </div>
  );
}