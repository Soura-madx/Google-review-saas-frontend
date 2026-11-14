import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Sparkles } from 'lucide-react';
import { businessCategories } from '../data/businessCategories'; // 👈 Data import kiya

export default function ReviewPage() {
  const { businessId } = useParams();
  const [business, setBusiness] = useState(null);
  
  const [rating, setRating] = useState(0); // Naya: Star Rating
  const [selectedTags, setSelectedTags] = useState([]); // Naya: Multiple Tags
  const [generatedReview, setGeneratedReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [pageError, setPageError] = useState('');

  // 1. Fetch Business Details
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`https://google-review-saas-backend.onrender.com/api/business/public/${businessId}`);
        setBusiness(res.data); 
      } catch (err) {
        setPageError("Invalid QR Code or Business not found.");
      }
    };
    if (businessId) fetchBusiness();
  }, [businessId]);

  // 2. Handle Tag Selection
  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 3. AI Review Generate karna
  const handleGenerateAI = async () => {
    if (rating === 0) return alert("Please give a star rating first! ⭐");
    if (selectedTags.length === 0) return alert("Please select at least one tag!");

    setIsLoading(true);
    setGeneratedReview('');
    setIsCopied(false);

    try {
      // Backend ko multiple tags array bhej rahe hain
      const res = await axios.post('https://google-review-saas-backend.onrender.com/api/reviews/generate', {
        businessName: business.businessName || business.cafeName,
        category: business.businessCategory || 'cafe',
        tags: selectedTags,
        rating: rating
      });
      setGeneratedReview(res.data.reviewText);
    } catch (error) {
      console.error("AI Error:", error);
      setGeneratedReview("Oops! Kuch error aa gaya. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Copy aur Google Maps par bhejna (Aapka exact solid logic)
  const handleCopyAndPost = async () => {
    try {
      await navigator.clipboard.writeText(generatedReview);
      setIsCopied(true);
    } catch (err) {
      console.error("Copy failed", err);
    }
    if (business && business.googleReviewLink) {
      window.location.href = business.googleReviewLink;
    }
  };

  // Loading & Error States
  if (pageError) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400 font-bold text-xl">{pageError}</div>;
  if (!business) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-400 animate-pulse">Loading Details...</div>;

  // DB se category nikalna (agar purana data hai toh default 'cafe' dikhayega)
  const currentCategoryData = businessCategories[business.businessCategory || 'cafe'];
  const displayName = business.businessName || business.cafeName;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        
        {/* Header */}
        <h1 className="text-2xl font-bold mb-1">Rate {displayName}</h1>
        <p className="text-gray-400 text-sm mb-6">{currentCategoryData.label}</p>

        {/* Step 1: Star Rating */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-300 mb-3">Step 1: Rate your experience</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                onClick={() => setRating(star)}
                className={`w-10 h-10 cursor-pointer transition-all ${
                  rating >= star ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-gray-700 fill-gray-800'
                }`} 
              />
            ))}
          </div>
        </div>
        
        {/* Step 2: Dynamic Tags (Only show if rated) */}
        <div className={`transition-all duration-500 ${rating > 0 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <p className="text-sm font-semibold text-gray-300 mb-3">Step 2: What did you like?</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {currentCategoryData.suggestions.map((tag, index) => (
              <button 
                key={index}
                onClick={() => handleTagSelect(tag)}
                className={`px-4 py-2.5 rounded-full border transition-all duration-300 text-sm font-medium
                  ${selectedTags.includes(tag) 
                    ? 'bg-blue-600 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white scale-105' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* AI Generate Button */}
          {!generatedReview && (
            <button 
              onClick={handleGenerateAI}
              disabled={selectedTags.length === 0 || isLoading}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2
                ${selectedTags.length > 0 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}`}
            >
              <Sparkles className="w-5 h-5" />
              {isLoading ? 'Writing Magic Review... ✨' : 'Write Review with AI'}
            </button>
          )}
        </div>

        {/* Step 3: Result & Post Button */}
        {generatedReview && !isLoading && (
          <div className="mt-4 animate-fade-in">
            <div className="bg-black/50 p-4 rounded-xl text-left text-gray-200 text-sm mb-5 border border-gray-700 relative">
              <p className="leading-relaxed">"{generatedReview}"</p>
            </div>
            
            <button 
              onClick={handleCopyAndPost}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-lg flex justify-center items-center gap-2
                ${isCopied 
                  ? 'bg-green-500 hover:bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.4)] text-white' 
                  : 'bg-white text-black hover:bg-gray-200'}`}
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