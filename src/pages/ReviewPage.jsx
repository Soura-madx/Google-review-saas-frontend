import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ReviewPage() {
  const { businessId } = useParams(); // URL se cafe ki ID nikalna
  const [business, setBusiness] = useState(null);
  
  const [selectedTag, setSelectedTag] = useState('');
  const [generatedReview, setGeneratedReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [pageError, setPageError] = useState('');

  const tags = [
    "Delicious Food 😋", 
    "Great Vibe & Aesthetic ✨", 
    "Best Coffee in Town ☕", 
    "Amazing Service 🤝"
  ];

  // 1. URL me mile ID se public business info fetch karna
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`https://google-review-saas-backend.onrender.com/api/business/public/${businessId}`);
        setBusiness(res.data); // isme cafeName aur googleReviewLink aayega
      } catch (err) {
        setPageError("Invalid QR Code or Cafe not found.");
      }
    };
    if (businessId) fetchBusiness();
  }, [businessId]);

  // 2. AI Review Generate karna
  const handleTagSelect = async (tag) => {
    setSelectedTag(tag);
    setIsLoading(true);
    setGeneratedReview('');
    setIsCopied(false);

    try {
      const res = await axios.post('https://google-review-saas-backend.onrender.com/api/reviews/generate', {
        cafeName: business.cafeName,
        selectedTag: tag
      });
      setGeneratedReview(res.data.reviewText);
    } catch (error) {
      console.error("AI Error:", error);
      setGeneratedReview("Oops! Kuch error aa gaya. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Copy aur Google Maps par bhejna
  const handleCopyAndPost = async () => {
    try {
      // 1. Pehle text ko clipboard par copy karo
      await navigator.clipboard.writeText(generatedReview);
      setIsCopied(true);
    } catch (err) {
      console.error("Copy failed", err);
    }

    // 2. Timeout hata kar direct page redirect karo. 
    // Safari aur Chrome dono isko bina kisi popup blocker ke allow karenge.
    if (business && business.googleReviewLink) {
      window.location.href = business.googleReviewLink;
    }
  };

  // UI States (Loading or Error)
  if (pageError) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400 font-bold text-xl">{pageError}</div>;
  }
  if (!business) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-400 animate-pulse">Loading Cafe Details...</div>;
  }

  // Main UI
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Rate {business.cafeName}</h1>
        <p className="text-gray-400 mb-6 text-sm">Aapko yahan sabse accha kya laga? Ek tag chunein:</p>
        
        <div className="grid grid-cols-2 gap-3 mb-8">
          {tags.map((tag, index) => (
            <button 
              key={index}
              onClick={() => handleTagSelect(tag)}
              className={`p-3 rounded-xl border transition-all duration-300 text-sm font-medium
                ${selectedTag === tag 
                  ? 'bg-blue-600 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
            >
              {tag}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="animate-pulse text-blue-400 font-medium my-4">
            Writing a smart review for you... ✨
          </div>
        )}

        {generatedReview && !isLoading && (
          <div className="mt-4 animate-fade-in">
            <div className="bg-black/50 p-4 rounded-xl text-left text-gray-200 text-sm mb-5 border border-gray-700 relative">
              <p>"{generatedReview}"</p>
            </div>
            
            <button 
              onClick={handleCopyAndPost}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-lg
                ${isCopied 
                  ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' 
                  : 'bg-white text-black hover:bg-gray-200 shadow-white/10'}`}
            >
              {isCopied ? 'Copied! Redirecting... ✔️' : 'Copy & Post on Google 🚀'}
            </button>
            <p className="text-xs text-gray-500 mt-4">
              *Next screen par bas long-press karke 'Paste' karein aur 5-stars select karein!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}