import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { Copy, CheckCircle } from "lucide-react"; 
import WhatsAppSender from '../components/WhatsAppSender'; 

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "https://google-review-saas-backend.onrender.com/api/business/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setProfile(res.data);
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-gen");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${profile.cafeName || 'Business'}-QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleCopyLink = async () => {
    try {
      const customerLink = `${window.location.origin}/rate/${profile._id}`;
      await navigator.clipboard.writeText(customerLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleToggleTrapdoor = async () => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !profile.enableTrapdoor;
      
      const res = await axios.put(
        "https://google-review-saas-backend.onrender.com/api/business/toggle-trapdoor",
        { enableTrapdoor: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile({ ...profile, enableTrapdoor: res.data.enableTrapdoor });
    } catch (err) {
      console.error("Failed to update trapdoor setting", err);
    }
  };

  if (!profile)
    return (
      <div className="text-center mt-20 animate-pulse text-blue-400 font-sans">
        Loading Dashboard...
      </div>
    );

  const customerLink = `${window.location.origin}/rate/${profile._id}`;
  const displayName = profile.businessName || profile.cafeName;

  return (
    // 🌟 FIX: overflow-x-hidden aur w-full add kiya taaki screen horizontal scroll na kare
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:p-6 md:mt-6 font-sans text-gray-200 overflow-x-hidden">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white break-words w-full sm:w-auto">
          Welcome, {displayName}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-5 py-2.5 rounded-xl transition-all text-sm font-medium w-full sm:w-auto text-center"
        >
          Logout
        </button>
      </div>

      {/* Main Grid Layout: grid-cols-1 mobile par strict width rakhega */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full">
        
        {/* QR Code Section - 🌟 FIX: w-full, min-w-0 aur overflow-hidden */}
        <div className="w-full min-w-0 bg-gray-800/50 backdrop-blur-lg border border-gray-700 p-5 sm:p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl overflow-hidden">
          <h2 className="text-lg sm:text-xl font-semibold mb-1.5 text-white">Your Review QR Code</h2>
          <p className="text-xs sm:text-sm text-gray-400 mb-5">Print this and place it on your tables.</p>

          {/* QR Container - Mobile ke liye max-w-full */}
          <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-6 flex items-center justify-center max-w-full">
            <QRCodeCanvas
              id="qr-gen"
              value={customerLink.trim()}
              size={165} // Mobile par perfect fit size
              level={"H"}
              includeMargin={true}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>

          <button
            onClick={downloadQR}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3.5 rounded-xl font-bold w-full transition-all text-white text-sm sm:text-base shadow-lg shadow-blue-500/20"
          >
            Download QR Code
          </button>
        </div>

        {/* Right Side Stack: min-w-0 zaroori hai grid overflow rokne ke liye */}
        <div className="w-full min-w-0 flex flex-col gap-6">
          
          {/* Business Info Section */}
          <div className="w-full min-w-0 bg-gray-900/50 border border-gray-800 p-5 sm:p-8 rounded-3xl flex flex-col justify-center shadow-xl overflow-hidden">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">Google Review Link Set To:</h3>
            <div className="w-full bg-black/40 p-3.5 rounded-xl mb-5 border border-gray-700/50 overflow-hidden">
              <p className="text-gray-300 truncate text-xs sm:text-sm">
                {profile.googleReviewLink}
              </p>
            </div>

            <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">Customer Scan Link:</h3>
            <div className="w-full flex items-center justify-between gap-2 bg-black/40 border border-gray-700/50 rounded-xl p-2 transition-all overflow-hidden">
              <p className="text-blue-400 text-xs sm:text-sm truncate pl-2 select-all flex-1 min-w-0">
                {customerLink}
              </p>
              <button
                onClick={handleCopyLink}
                className={`p-2.5 rounded-lg shrink-0 transition-all flex items-center justify-center ${
                  isCopied ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
                title="Copy Link"
              >
                {isCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
            </div>
            {isCopied && <p className="text-green-400 text-xs text-right animate-pulse mt-1.5 mr-1">Copied to clipboard! ✔️</p>}
          </div>

          {/* WhatsApp Sender Box */}
          <WhatsAppSender 
            businessId={profile._id} 
            businessName={displayName} 
          />
          
        </div>
      </div>

      {/* Trapdoor Settings Toggle Card */}
      <div className="w-full bg-gray-900/50 border border-gray-800 p-5 sm:p-6 rounded-3xl flex items-center justify-between gap-4 shadow-xl">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-white">Negative Review Interception (Trapdoor)</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            When disabled, bad reviews will also bypass the internal form and redirect directly to Google.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input 
            type="checkbox" 
            checked={profile.enableTrapdoor ?? true}
            onChange={handleToggleTrapdoor}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

    </div>
  );
}