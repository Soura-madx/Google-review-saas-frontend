import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Sparkles, Send, CheckCircle, Camera, X, Info } from 'lucide-react';
import { businessCategories } from '../data/businessCategories';

export default function ReviewPage() {
  const { businessId } = useParams();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // 🌟 THE FLOW STATE: 'tag_selection' -> 'positive_ai' OR 'negative_trap' -> 'fake_success'
  const [uiMode, setUiMode] = useState('tag_selection'); 
  const [selectedTags, setSelectedTags] = useState([]);

  // Positive Flow States (Starify UI)
  const [generatedReview, setGeneratedReview] = useState('');
  const [isAiWriting, setIsAiWriting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Negative Flow States (Fake Google UI)
  const [overallRating, setOverallRating] = useState(0);
  const [subRatings, setSubRatings] = useState({});
  const [detailedAnswers, setDetailedAnswers] = useState({});
  const [dropdownTexts, setDropdownTexts] = useState({}); // Naya state text dropdowns ke liye
  const [feedbackText, setFeedbackText] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Points System State
  const [earnedPoints, setEarnedPoints] = useState({ total: 0, ratings: 0, reviews: 0, photos: 0, answers: 0 });

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`https://google-review-saas-backend.onrender.com/api/business/public/${businessId}`);
        setBusiness(res.data);
      } catch (err) {
        setPageError("Invalid QR Code or Business not found.");
      } finally {
        setIsLoading(false);
      }
    };
    if (businessId) fetchBusiness();
  }, [businessId]);


  // --- 1. INITIAL TAG SELECTION LOGIC ---
  const handleTagSelect = (tagObj) => {
    if (selectedTags.some(t => t.text === tagObj.text)) {
      setSelectedTags(selectedTags.filter(t => t.text !== tagObj.text));
    } else {
      setSelectedTags([...selectedTags, tagObj]);
    }
  };

  const handleContinue = () => {
    if (selectedTags.length === 0) return alert("Please select at least one option!");
    const hasNegative = selectedTags.some(tag => tag.type === 'negative');
    
    if (hasNegative) {
      setUiMode('negative_trap');
    } else {
      setUiMode('positive_ai');
      generateAIReview();
    }
  };

  // --- 2. POSITIVE FLOW (Real Google Maps) ---
  const generateAIReview = async () => {
    setIsAiWriting(true);
    setGeneratedReview("✨ Starify AI is writing your perfect review...");

    try {
      const tagsToSend = selectedTags.map(t => t.text);
      const res = await axios.post('https://google-review-saas-backend.onrender.com/api/reviews/generate', {
        businessName: business.businessName || business.cafeName,
        category: business.businessCategory || 'cafe',
        tags: tagsToSend,
        rating: 5
      });
      setGeneratedReview(res.data.reviewText);
    } catch (error) {
      setGeneratedReview("I had an amazing experience! Highly recommended!");
    } finally {
      setIsAiWriting(false);
    }
  };

  const handlePostToRealGoogle = async () => {
    await navigator.clipboard.writeText(generatedReview);
    setIsCopied(true);
    setTimeout(() => {
      window.location.href = business.googleReviewLink;
    }, 1500);
  };

  // --- 3. NEGATIVE FLOW (Fake Google UI) ---
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Cloudinary upload logic here...
    const url = URL.createObjectURL(file); // Temporary for demo
    setUploadedPhotos([...uploadedPhotos, url]);
  };

  // Star Labels Logic
  const getStarLabel = (rating) => {
    switch(rating) {
      case 1: return "Far from great";
      case 2: return "Not great";
      case 3: return "Good";
      case 4: return "Great";
      case 5: return "Exceptional";
      default: return "";
    }
  };

  // Points Calculation Logic
  const calculatePoints = () => {
    let pRatings = 0;
    let pReviews = 0;
    let pPhotos = 0;
    let pAnswers = 0;

    // Base Rating = +1
    if (overallRating > 0) pRatings += 1;
    // Sub-ratings (Food, Atmosphere, Service) = +1 each
    pRatings += Object.keys(subRatings).length;

    // Feedback Text = +10
    if (feedbackText.trim().length > 0) pReviews += 10;

    // Photos = +5 per photo
    pPhotos += (uploadedPhotos.length * 5);

    // Button Options = +1 each
    pAnswers += Object.keys(detailedAnswers).length * 1;
    // Dropdown Text Feedback = +2 each
    pAnswers += Object.values(dropdownTexts).filter(text => text.trim().length > 0).length * 2;

    const total = pRatings + pReviews + pPhotos + pAnswers;
    setEarnedPoints({ total, ratings: pRatings, reviews: pReviews, photos: pPhotos, answers: pAnswers });
  };

  const handlePostToDashboard = async () => {
    if (overallRating === 0) return alert("Please select a star rating first.");
    setIsProcessing(true);
    
    try {
      calculatePoints(); // Google jaisa points calculate karein
      
      await axios.post('https://google-review-saas-backend.onrender.com/api/feedback/internal', {
        businessId: business._id,
        overallRating,
        subRatings,
        detailedAnswers,
        dropdownTexts,
        text: feedbackText,
        photos: uploadedPhotos,
        initialTags: selectedTags.map(t => t.text) 
      });
      setIsProcessing(false);
      setUiMode('fake_success');
    } catch (error) {
      calculatePoints(); 
      setIsProcessing(false);
      setUiMode('fake_success'); // Owner ko pata nahi chalega error ka
    }
  };


  if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-400">Loading...</div>;
  if (pageError) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">{pageError}</div>;

  const currentCategoryData = businessCategories[business.businessCategory || 'cafe'];
  const displayName = business.businessName || business.cafeName;

  return (
    <>
      {/* ========================================= */}
      {/* UI MODE 1: INITIAL TAG SELECTION (No Stars) */}
      {/* ========================================= */}
      {uiMode === 'tag_selection' && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-[2rem] p-6 sm:p-8 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">{displayName.charAt(0)}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-500 mt-2 font-medium">How was your visit?</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {currentCategoryData.suggestions?.map((tagObj, index) => {
                const isSelected = selectedTags.some(t => t.text === tagObj.text);
                return (
                  <button key={index} onClick={() => handleTagSelect(tagObj)}
                    className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      isSelected ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'
                    }`}>
                    {tagObj.text}
                  </button>
                )
              })}
            </div>

            <button onClick={handleContinue} disabled={selectedTags.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all ${
                selectedTags.length > 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'bg-gray-300 cursor-not-allowed'
              }`}>
              Continue ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* UI MODE 2: POSITIVE FLOW (Real Google Maps) */}
      {/* ========================================= */}
      {uiMode === 'positive_ai' && (
         // ... (Same as previous Positive UI code, generating AI review & redirecting) ...
         <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-[2rem] p-6 sm:p-8 shadow-xl border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-green-500 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">We wrote a review for you!</h2>
            </div>
            {isAiWriting ? (
              <div className="h-32 flex items-center justify-center text-blue-500 font-medium animate-pulse">Writing Magic Review... ✨</div>
            ) : (
              <>
                <textarea value={generatedReview} onChange={(e) => setGeneratedReview(e.target.value)}
                  className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 text-gray-800 h-32 outline-none mb-6 leading-relaxed" />
                <button onClick={handlePostToRealGoogle}
                  className="w-full bg-[#34A853] text-white font-bold py-4 rounded-xl hover:bg-green-600 flex justify-center items-center gap-2 shadow-lg">
                  {isCopied ? <CheckCircle /> : <Send />} {isCopied ? 'Copied! Redirecting to Google...' : 'Copy & Post on Google'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* UI MODE 3: NEGATIVE TRAP (Fake Google Maps) */}
      {/* ========================================= */}
      {uiMode === 'negative_trap' && (
        <div className="min-h-screen bg-[#202124] text-gray-200 p-4 sm:p-6 font-sans">
          <div className="max-w-md mx-auto animate-fade-in">
            <div className="text-center mb-6 pt-4"><h1 className="text-xl font-medium">{displayName}</h1></div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#E8710A] rounded-full flex items-center justify-center font-bold text-white">G</div>
              <div>
                <p className="font-medium text-[15px]">Google User</p>
                <p className="text-[12px] text-gray-400">Posting publicly across Google</p>
              </div>
            </div>

            {/* 🌟 MAIN RATING & DYNAMIC LABEL */}
            <div className="text-center mb-8">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} onClick={() => setOverallRating(star)}
                    className={`w-11 h-11 cursor-pointer transition-colors ${overallRating >= star ? 'text-[#FBBC04] fill-[#FBBC04]' : 'text-gray-600'}`} />
                ))}
              </div>
              {/* This is the exact spelling label you requested */}
              {overallRating > 0 && (
                <p className="text-[#FBBC04] text-sm mt-3 font-medium transition-all">
                  {getStarLabel(overallRating)}
                </p>
              )}
            </div>

            {/* Sub Ratings (Food, Service, Atmosphere) */}
            {currentCategoryData.ratingCategories?.map((cat) => (
              <div key={cat} className="flex justify-between items-center mb-5">
                <span className="text-[15px]">{cat}</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} onClick={() => setSubRatings({ ...subRatings, [cat]: star })}
                      className={`w-7 h-7 cursor-pointer transition-colors ${(subRatings[cat] || 0) >= star ? 'text-[#FBBC04] fill-[#FBBC04]' : 'text-gray-600'}`} />
                  ))}
                </div>
              </div>
            ))}

            <textarea 
              value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share details of your own experience at this place"
              className="w-full bg-transparent border border-gray-600 rounded-xl p-4 text-[15px] min-h-[120px] focus:outline-none focus:border-[#8AB4F8] mt-4 mb-4"
            />

            <label className="border border-gray-600 rounded-full py-2 px-4 flex items-center justify-center gap-2 text-[#8AB4F8] text-[14px] cursor-pointer hover:bg-[#303134] w-full">
              <Camera className="w-5 h-5" /> Add photos and videos
              <input type="file" className="hidden" accept="image/*,video/*" onChange={handlePhotoUpload} />
            </label>
            
            {uploadedPhotos.length > 0 && (
              <div className="flex gap-3 mt-4">
                {uploadedPhotos.map((url, i) => (
                  <div key={i} className="relative"><img src={url} className="w-16 h-16 object-cover rounded-lg border border-gray-600" /><button onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1"><X className="w-3 h-3 text-gray-300" /></button></div>
                ))}
              </div>
            )}

            {/* Detailed Questions & Text Feedbacks */}
            <div className="mt-8 space-y-6 pb-20">
              {currentCategoryData.detailedQuestions?.map((q) => (
                <div key={q.id} className="bg-[#303134] p-5 rounded-2xl">
                  <p className="text-[15px] font-medium mb-4">{q.question}</p>
                  
                  {/* Button Options */}
                  <div className="flex flex-wrap gap-2.5 mb-4">
                    {q.options?.map((opt) => (
                      <button key={opt} onClick={() => setDetailedAnswers({ ...detailedAnswers, [q.id]: opt })}
                        className={`px-4 py-2 rounded-lg text-[14px] border ${detailedAnswers[q.id] === opt ? 'bg-[#8AB4F8] text-[#202124] border-[#8AB4F8]' : 'bg-transparent border-gray-500 text-gray-200'}`}>{opt}</button>
                    ))}
                  </div>

                  {/* 🌟 NAYA: Dropdown Text Feedback (For 2 Points) */}
                  <textarea 
                    placeholder={`Tell others about ${q.question.toLowerCase()}...`}
                    value={dropdownTexts[q.id] || ""}
                    onChange={(e) => setDropdownTexts({ ...dropdownTexts, [q.id]: e.target.value })}
                    className="w-full bg-[#202124] border border-gray-600 rounded-lg p-3 text-[14px] min-h-[60px] focus:outline-none focus:border-[#8AB4F8] mt-2"
                  />
                </div>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-[#202124] border-t border-gray-700 p-3 flex justify-end gap-4 z-50">
              <button className="text-[#8AB4F8] text-[14px] font-medium px-4 py-2">Cancel</button>
              <button onClick={handlePostToDashboard} disabled={isProcessing} className="px-6 py-2 rounded-full text-[14px] font-medium bg-[#8AB4F8] text-[#202124]">{isProcessing ? 'Posting...' : 'Post'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* UI MODE 4: GAMIFIED SUCCESS MODAL */}
      {/* ========================================= */}
      {uiMode === 'fake_success' && (
        <div className="min-h-screen bg-[#202124] text-white flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#2D2E30] rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative">
            
            <div className="w-16 h-16 bg-[#E8710A] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              G
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">+{earnedPoints.total} points</h2>
            <p className="text-gray-400 text-[14px] mb-6">You've earned points for helping others</p>

            <div className="bg-[#202124] rounded-2xl p-4 text-left">
              {earnedPoints.ratings > 0 && (
                <div className="flex justify-between items-center py-2.5 border-b border-gray-700 text-[14px]">
                  <span className="text-gray-300">Ratings</span>
                  <span className="text-white font-medium">+{earnedPoints.ratings}</span>
                </div>
              )}
              {earnedPoints.reviews > 0 && (
                <div className="flex justify-between items-center py-2.5 border-b border-gray-700 text-[14px]">
                  <span className="text-gray-300">Review</span>
                  <span className="text-white font-medium">+{earnedPoints.reviews}</span>
                </div>
              )}
              {earnedPoints.photos > 0 && (
                <div className="flex justify-between items-center py-2.5 border-b border-gray-700 text-[14px]">
                  <span className="text-gray-300">Photos</span>
                  <span className="text-white font-medium">+{earnedPoints.photos}</span>
                </div>
              )}
              {earnedPoints.answers > 0 && (
                <div className="flex justify-between items-center py-2.5 text-[14px]">
                  <span className="text-gray-300">Answers</span>
                  <span className="text-white font-medium">+{earnedPoints.answers}</span>
                </div>
              )}
            </div>

            <button onClick={() => window.location.reload()} className="w-full bg-[#8AB4F8] text-[#202124] font-bold py-3 rounded-full mt-6">
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}