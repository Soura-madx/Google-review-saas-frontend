import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:8000/api/business/profile', {
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

  if (!profile) return <div className="text-center mt-20 animate-pulse">Loading Dashboard...</div>;

  // Frontend URL jo customer scan karke kholega
  const customerLink = `${window.location.origin}/rate/${profile._id}`;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Welcome, {profile.cafeName}</h1>
        <button onClick={handleLogout} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-all">
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Code Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold mb-2">Your Review QR Code</h2>
          <p className="text-sm text-gray-400 mb-6">Print this and place it on your tables.</p>
          
          <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
            <QRCodeCanvas 
              id="qr-gen" 
              value={customerLink} 
              size={200} 
              level={"H"}
              includeMargin={true}
            />
          </div>

          <button onClick={downloadQR} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold w-full transition-all">
            Download QR Code
          </button>
        </div>

        {/* Business Info Section */}
        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl flex flex-col justify-center">
          <h3 className="text-lg font-medium text-gray-400 mb-1">Google Review Link Set To:</h3>
          <p className="text-white bg-black/40 p-3 rounded-lg truncate mb-6 text-sm border border-gray-700">
            {profile.googleReviewLink}
          </p>
          
          <h3 className="text-lg font-medium text-gray-400 mb-1">Customer Scan Link:</h3>
          <p className="text-blue-400 text-sm truncate">
            {customerLink}
          </p>
        </div>
      </div>
    </div>
  );
}