import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Sparkles, Send, CheckCircle, MessageSquareWarning } from 'lucide-react';
import { businessCategories } from '../data/businessCategories';

export default function ReviewPage() {
  const { businessId } = useParams();
  const [business, setBusiness] = useState(null);
  
  // Naye States Flow Control ke liye
  const [selectedTags, setSelectedTags] = useState([]); 
  const [step, setStep] = useState('selection'); // 'selection' | 'positive_ai' | 'negative_feedback' | 'thank_you'
  
  // Positive Flow States
  const [generatedReview, setGeneratedReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Negative Flow States (For Private Dashboard)
  const [internalRating, setInternalRating] = useState(0);
  const [internalFeedback, setInternalFeedback] = useState('');

  // 1. Fetch Business Info
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`https://google-review-saas-backend.onrender.com/api/business/public/${businessId}`);
        setBusiness(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (businessId) fetchBusiness();
  }, [businessId]);

  // 2. Handle Tag Selection
  const handleTagSelect = (tagObj) => {
    if (selectedTags.some(t => t.text === tagObj.text)) {
      setSelectedTags(selectedTags.filter(t => t.text !== tagObj.text));
    } else {
      setSelectedTags([...selectedTags, tagObj]);
    }
  };

  // 3. SMART ROUTING LOGIC (The Magic)
  const handleNextStep = async () => {
    if (selectedTags.length === 0) return alert("Please select at least one tag!");

    // Check karo kya ek bhi negative tag select hua hai?
    const hasNegative = selectedTags.some(tag => tag.type === 'negative');

    if (hasNegative) {
      // Agar negative hai, toh usko Private Feedback wale page par bhej do (No Google Link)
      const negativeTexts = selectedTags.map(t => t.text).join(', ');
      setInternalFeedback(`I was disappointed because of: ${negativeTexts}. `);
      setStep('negative_feedback');
    } else {
      // Agar sab positive hai, toh AI se review likhwa kar Google par bhejo
      setStep('positive_ai');
      generateAIReview();
    }
  };

  // 4. Positive Flow - Generate AI
  const generateAIReview = async () => {
    setIsLoading(true);
    try {
      const tagTexts = selectedTags.map(t => t.text);
      const res = await axios.post('https://google-review-saas-backend.onrender.com/api/reviews/generate', {
        businessName: business.businessName || business.cafeName,
        category: business.businessCategory || 'cafe',
        tags: tagTexts,
        rating: 5 // Default 5 stars for positive tags
      });
      setGeneratedReview(res.data.reviewText);
    } catch (error) {
      setGeneratedReview("Had a great time here. Highly recommended!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAndPost = async () => {
    await navigator.clipboard.writeText(generatedReview);
    setIsCopied(true);
    setTimeout(() => {
      window.location.href = business.googleReviewLink;
    }, 1500);
  };

  // 5. Negative Flow - Submit to Dashboard
  const submitInternalFeedback = async () => {
    if (internalRating === 0) return alert("Please select a star rating");
    if (!internalFeedback) return alert("Please write your feedback");

    try {
      // Yahan aap backend me naya API banaoge jo is feedback ko Owner ke DB me save karega
      await axios.post('https://google-review-saas-backend.onrender.com/api/feedback/internal', {
        businessId: business._id,
        rating: internalRating,
        feedback: internalFeedback
      });
      setStep('thank_you'); // Google par redirect NAHI karna hai
    } catch (error) {
      console.error(error);
      setStep('thank_you'); // Error aaye tab bhi Google par mat bhejo
    }
  };

  // UI rendering
  if (!business) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-400">Loading...</div>;

  const currentCategoryData = businessCategories[business.businessCategory || 'cafe'];
  const displayName = business.businessName || business.cafeName;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        
        {/* STEP 1: INITIAL SELECTION (No Stars, Just Tags) */}
        {step === 'selection' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-1">Rate {displayName}</h1>
            <p className="text-gray-400 text-sm mb-6">What did you notice during your visit?</p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {currentCategoryData.suggestions.map((tagObj, index) => (
                <button 
                  key={index}
                  onClick={() => handleTagSelect(tagObj)}
                  className={`px-4 py-2.5 rounded-full border transition-all duration-300 text-sm font-medium
                    ${selectedTags.some(t => t.text === tagObj.text)
                      ? 'bg-blue-600 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white scale-105' 
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
                >
                  {tagObj.text}
                </button>
              ))}
            </div>

            <button 
              onClick={handleNextStep}
              disabled={selectedTags.length === 0}
              className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2
                ${selectedTags.length > 0 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}`}
            >
              Continue ➔
            </button>
          </div>
        )}


        {/* STEP 2A: POSITIVE FLOW (Google Maps Redirect) */}
        {step === 'positive_ai' && (
          <div className="animate-fade-in">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <Sparkles className="text-green-400 w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-4">We wrote a review for you!</h2>
            
            {isLoading ? (
              <p className="text-blue-400 animate-pulse my-8">Writing Magic Review... ✨</p>
            ) : (
              <>
                <textarea 
                  value={generatedReview} 
                  onChange={(e) => setGeneratedReview(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-gray-200 h-32 focus:outline-none focus:border-blue-500 mb-4" 
                />
                <button 
                  onClick={handleCopyAndPost}
                  className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2
                    ${isCopied ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {isCopied ? 'Copied! Redirecting... ✔️' : 'Copy & Post on Google 🚀'}
                </button>
                <p className="text-xs text-gray-500 mt-4">*Next screen par long-press karke 'Paste' karein!</p>
              </>
            )}
          </div>
        )}


        {/* STEP 2B: NEGATIVE FLOW (Internal Dashboard / No Google) */}
        {step === 'negative_feedback' && (
          <div className="animate-fade-in">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <MessageSquareWarning className="text-red-400 w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-red-400 mb-2">We're sorry!</h2>
            <p className="text-gray-400 text-sm mb-6">Please tell us what went wrong so management can fix it.</p>

            {/* Manual Star Rating for internal use */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  onClick={() => setInternalRating(star)}
                  className={`w-10 h-10 cursor-pointer transition-all ${
                    internalRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700 fill-gray-800'
                  }`} 
                />
              ))}
            </div>

            <textarea 
              value={internalFeedback} 
              onChange={(e) => setInternalFeedback(e.target.value)}
              placeholder="Tell us more about your bad experience..."
              className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-gray-200 h-32 focus:outline-none focus:border-red-500 mb-4" 
            />

            <button 
              onClick={submitInternalFeedback}
              className="w-full py-4 rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              Submit to Management
            </button>
            <p className="text-xs text-gray-500 mt-4">This feedback is strictly private.</p>
          </div>
        )}

        {/* STEP 3B: THANK YOU SCREEN (For Negative Flow) */}
        {step === 'thank_you' && (
          <div className="animate-fade-in text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You</h2>
            <p className="text-gray-400">Your feedback has been sent directly to the owner. We will work on improving this!</p>
          </div>
        )}

      </div>
    </div>
  );
}