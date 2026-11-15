import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Sparkles, Send, CheckCircle, Camera, X, Info, ChevronDown } from 'lucide-react';
import { businessCategories } from '../data/businessCategories';

export default function ReviewPage() {
  const { businessId } = useParams();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // FLOW STATES
  const [uiMode, setUiMode] = useState('tag_selection'); 
  const [selectedTags, setSelectedTags] = useState([]);
  
  // POSITIVE FLOW (AI)
  const [generatedReview, setGeneratedReview] = useState('');
  const [isAiWriting, setIsAiWriting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // NEGATIVE FLOW (FAKE UI)
  const [overallRating, setOverallRating] = useState(0);
  const [subRatings, setSubRatings] = useState({});
  const [feedbackText, setFeedbackText] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState({ total: 0, ratings: 0, reviews: 0, photos: 0, answers: 0 });

  const [detailedAnswers, setDetailedAnswers] = useState({});
  const [dropdownTexts, setDropdownTexts] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null); 

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`https://google-review-saas-backend.onrender.com/api/business/public/${businessId}`);
        setBusiness(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (businessId) fetchBusiness();
  }, [businessId]);

  // --- LOGIC: TRAPDOOR ---
  const handleTagSelect = (tagObj) => {
    if (selectedTags.some(t => t.text === tagObj.text)) {
      setSelectedTags(selectedTags.filter(t => t.text !== tagObj.text));
    } else {
      setSelectedTags([...selectedTags, tagObj]);
    }
  };

  const handleContinue = () => {
    if (selectedTags.length === 0) return alert("Please select an option!");
    const hasNegative = selectedTags.some(tag => tag.type === 'negative');
    if (hasNegative) setUiMode('negative_trap');
    else {
      setUiMode('positive_ai');
      generateAIReview();
    }
  };

  const handleDetailedAnswer = (qId, option, isMulti) => {
    if (isMulti) {
      const currentArr = detailedAnswers[qId] || [];
      if (currentArr.includes(option)) {
        setDetailedAnswers({ ...detailedAnswers, [qId]: currentArr.filter(o => o !== option) });
      } else {
        setDetailedAnswers({ ...detailedAnswers, [qId]: [...currentArr, option] });
      }
    } else {
      setDetailedAnswers({ ...detailedAnswers, [qId]: option });
    }
  };

  const calculatePoints = () => {
    let pRatings = 0, pReviews = 0, pPhotos = 0, pAnswers = 0;
    if (overallRating > 0) pRatings += 1;
    pRatings += Object.keys(subRatings).length;
    if (feedbackText.trim().length > 0) pReviews += 10;
    pPhotos += (uploadedPhotos.length * 5);
    Object.values(detailedAnswers).forEach(val => {
      if (Array.isArray(val)) pAnswers += val.length; 
      else pAnswers += 1; 
    });
    pAnswers += Object.values(dropdownTexts).filter(t => t.trim().length > 0).length * 2;
    setEarnedPoints({ total: pRatings + pReviews + pPhotos + pAnswers, ratings: pRatings, reviews: pReviews, photos: pPhotos, answers: pAnswers });
  };

  const handlePostToDashboard = async () => {
    if (overallRating === 0) return alert("Please select a star rating.");
    setIsProcessing(true);
    calculatePoints();
    
    try {
      await axios.post('https://google-review-saas-backend.onrender.com/api/feedback/internal', {
        businessId: business._id, overallRating, subRatings, detailedAnswers, dropdownTexts,
        text: feedbackText, photos: uploadedPhotos, initialTags: selectedTags.map(t => t.text) 
      });
      setIsProcessing(false);
      setUiMode('fake_success');
    } catch (error) {
      setIsProcessing(false);
      setUiMode('fake_success'); 
    }
  };

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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedPhotos([...uploadedPhotos, url]);
  };

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
    setTimeout(() => window.location.href = business.googleReviewLink, 1500);
  };

  if (isLoading) return <div className="min-h-screen bg-[#202124] text-white flex justify-center items-center">Loading...</div>;

  const currentData = businessCategories[business?.businessCategory || 'cafe'];
  const displayName = business?.businessName || business?.cafeName || "Business";

  return (
    <>
      {/* 1. INITIAL TAG SCREEN */}
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
              {currentData.suggestions?.map((tagObj, idx) => {
                const isSelected = selectedTags.some(t => t.text === tagObj.text);
                return (
                  <button key={idx} onClick={() => handleTagSelect(tagObj)}
                    className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      isSelected ? 'bg-blue-600 text-white shadow-md scale-105 border-transparent' : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'
                    }`}>{tagObj.text}</button>
                )
              })}
            </div>
            <button onClick={handleContinue} disabled={selectedTags.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all ${
                selectedTags.length > 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'bg-gray-300 cursor-not-allowed'
              }`}>Continue ➔</button>
          </div>
        </div>
      )}

      {/* 2. POSITIVE AI SCREEN */}
      {uiMode === 'positive_ai' && (
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

      {/* 3. EXACT GOOGLE MOBILE UI (NEGATIVE TRAP) */}
      {uiMode === 'negative_trap' && (
        <div className="min-h-screen bg-[#202124] text-gray-200 p-4 font-sans flex justify-center relative">
          <div className="max-w-md w-full mb-20 overflow-hidden relative">
            
            {/* 🌟 NAYA: Header (Left Aligned for Mobile) */}
            <div className="flex items-center pt-2 pb-4">
              <h1 className="text-lg font-medium text-white flex-1 text-left">{displayName}</h1>
              <X className="w-6 h-6 text-gray-300 cursor-pointer" onClick={() => window.location.reload()} />
            </div>

            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-[#E8710A] rounded-full flex items-center justify-center font-bold text-white text-lg">G</div>
                <div>
                  <p className="font-medium text-[15px] text-white">Google User</p>
                  <p className="text-[13px] text-gray-400 flex items-center gap-1">Posting publicly across Google <Info className="w-3.5 h-3.5" /></p>
                </div>
              </div>

              {/* Main Stars */}
              <div className="text-center mb-6">
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} onClick={() => setOverallRating(star)}
                      className={`w-10 h-10 cursor-pointer ${overallRating >= star ? 'text-[#FBBC04] fill-[#FBBC04]' : 'text-[#80868b]'}`} />
                  ))}
                </div>
                {/* 🌟 NAYA: Star label text color is now white */}
                {overallRating > 0 && <p className="text-white text-[14px] mt-2 font-medium">{getStarLabel(overallRating)}</p>}
              </div>

              {/* Sub Ratings */}
              {currentData.ratingCategories?.map((cat) => (
                <div key={cat} className="flex justify-between items-center mb-4">
                  <span className="text-[15px] text-white">{cat}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} onClick={() => setSubRatings({ ...subRatings, [cat]: star })}
                        className={`w-7 h-7 cursor-pointer ${subRatings[cat] >= star ? 'text-[#FBBC04] fill-[#FBBC04]' : 'text-[#80868b]'}`} />
                    ))}
                  </div>
                </div>
              ))}

              <textarea 
                value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share details of your own experience at this place"
                className="w-full bg-transparent border border-[#5f6368] rounded-md p-3 text-[14px] min-h-[100px] focus:outline-none focus:border-[#8AB4F8] mt-4 mb-6 text-white"
              />

              {/* 🌟 NAYA: Full Width Photo Button (White Bg, Black Text) */}
              <label className="w-full bg-[#f1f3f4] text-[#202124] border-0 rounded-full py-3 px-4 flex items-center justify-center gap-2 text-[15px] font-medium cursor-pointer mb-6 shadow-sm">
                <Camera className="w-5 h-5 text-[#202124]" /> Add photos and videos
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handlePhotoUpload} />
              </label>

              {uploadedPhotos.length > 0 && (
                <div className="flex gap-3 mb-6 flex-wrap">
                  {uploadedPhotos.map((url, i) => (
                    <div key={i} className="relative"><img src={url} className="w-16 h-16 object-cover rounded-lg border border-gray-600" /><button onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1"><X className="w-3 h-3 text-gray-300" /></button></div>
                  ))}
                </div>
              )}

              {/* DIRECT QUESTIONS */}
              <div className="space-y-6 mb-8">
                {currentData.directQuestions?.map((q) => (
                  <div key={q.id}>
                    <p className="text-[15px] text-white font-medium mb-1">{q.question}</p>
                    {q.subtext && <p className="text-[13px] text-gray-400 mb-3">{q.subtext}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* 🌟 NAYA: Options with White BG, Black Text, No Border */}
                      {q.options.map((opt) => {
                        const isSelected = q.multiSelect ? detailedAnswers[q.id]?.includes(opt) : detailedAnswers[q.id] === opt;
                        return (
                          <button key={opt} onClick={() => handleDetailedAnswer(q.id, opt, q.multiSelect)}
                            className={`px-4 py-2 rounded-lg text-[14px] font-medium border-0 transition-colors ${
                              isSelected ? 'bg-[#8AB4F8] text-[#202124]' : 'bg-white text-black'
                            }`}>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-[16px] font-medium text-white mb-4 border-t border-gray-700 pt-6">Add more details to help others</h2>
              
              {/* 🌟 NAYA: Accordion List */}
              <div className="rounded-lg overflow-hidden border border-[#5f6368]">
                {currentData.accordionSections?.map((section, idx) => (
                  <div key={section.id} className={idx !== 0 ? 'border-t border-[#5f6368]' : ''}>
                    
                    <div onClick={() => setOpenDropdown(openDropdown === section.id ? null : section.id)}
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#3c4043] transition-colors bg-transparent">
                      <span className="text-[14px] text-white font-medium">{section.title}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown === section.id ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {openDropdown === section.id && (
                      // 🌟 NAYA: Accordion Content Background
                      <div className="p-4 pt-0 bg-[#303134]">
                        {section.questions.map((q) => (
                          <div key={q.id} className="mb-6 mt-4">
                            <p className="text-[15px] text-white font-medium mb-1">{q.question}</p>
                            {q.subtext && <p className="text-[13px] text-gray-400 mb-2">{q.subtext}</p>}
                            <div className="flex flex-wrap gap-2">
                              {/* 🌟 NAYA: Options with White BG, Black Text, No Border */}
                              {q.options.map((opt) => {
                                const isSelected = q.multiSelect ? detailedAnswers[q.id]?.includes(opt) : detailedAnswers[q.id] === opt;
                                return (
                                  <button key={opt} onClick={() => handleDetailedAnswer(q.id, opt, q.multiSelect)}
                                    className={`px-4 py-2 rounded-lg text-[14px] font-medium border-0 transition-colors ${
                                      isSelected ? 'bg-[#8AB4F8] text-[#202124]' : 'bg-white text-black'
                                    }`}>
                                    {opt}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                        {section.textAreaPlaceholder && (
                           <div className="mt-4">
                             <textarea 
                               placeholder={section.textAreaPlaceholder}
                               value={dropdownTexts[section.id] || ""}
                               onChange={(e) => setDropdownTexts({ ...dropdownTexts, [section.id]: e.target.value })}
                               className="w-full bg-transparent border border-[#5f6368] rounded-md p-3 text-[14px] min-h-[60px] focus:outline-none focus:border-[#8AB4F8] text-white placeholder-gray-400"
                             />
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 🌟 NAYA: Only "Post" Button in Bottom Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-[#202124] border-t border-[#3c4043] p-3 px-4 flex justify-end z-50">
              <button onClick={handlePostToDashboard} disabled={isProcessing} 
                className="px-6 py-2 rounded-full text-[14px] font-medium bg-[#1a73e8] text-white hover:bg-blue-600 transition-colors">
                {isProcessing ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. POINTS SUCCESS MODAL */}
      {uiMode === 'fake_success' && (
        <div className="min-h-screen bg-[#202124] bg-opacity-90 flex items-center justify-center p-4 fixed inset-0 z-50">
          <div className="bg-[#2D2E30] rounded-xl p-8 w-full max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#E8710A] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">G</div>
            <h2 className="text-3xl font-normal text-white mb-1">+{earnedPoints.total} points</h2>
            <p className="text-gray-400 text-[14px] mb-6">You've earned points for helping others</p>
            
            <div className="text-left mb-8">
              {earnedPoints.ratings > 0 && <div className="flex justify-between py-2 text-[14px] border-b border-gray-700"><span className="text-gray-300">Ratings</span><span className="text-white">+{earnedPoints.ratings}</span></div>}
              {earnedPoints.reviews > 0 && <div className="flex justify-between py-2 text-[14px] border-b border-gray-700"><span className="text-gray-300">Review</span><span className="text-white">+{earnedPoints.reviews}</span></div>}
              {earnedPoints.photos > 0 && <div className="flex justify-between py-2 text-[14px] border-b border-gray-700"><span className="text-gray-300">Photos</span><span className="text-white">+{earnedPoints.photos}</span></div>}
              {earnedPoints.answers > 0 && <div className="flex justify-between py-2 text-[14px]"><span className="text-gray-300">Answers</span><span className="text-white">+{earnedPoints.answers}</span></div>}
            </div>

            <div className="flex justify-end gap-2">
              <button className="text-[#8AB4F8] px-4 py-2 font-medium">Contribute more</button>
              <button onClick={() => window.location.reload()} className="bg-[#8AB4F8] text-[#202124] px-6 py-2 rounded-full font-medium">Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}