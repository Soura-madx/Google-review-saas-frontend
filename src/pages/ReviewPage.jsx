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
  const [showPasteGuide, setShowPasteGuide] = useState(false); // 🌟 NAYA: Popup Guide State

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

  // 🌟 NAYA: Copy, Speak, and Redirect Logic
  const handlePostToRealGoogle = async () => {
    // 1. Text Copy karo
    await navigator.clipboard.writeText(generatedReview);
    setIsCopied(true);
    setShowPasteGuide(true); // Popup dikhao

    // 2. Hindi/English mixed Voice Message Play karo
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = "Review copied! Please paste it in the box on the next screen.";
      // Aksar Indian English set karne par jyada natural lagta hai
      msg.lang = 'en-IN'; 
      msg.rate = 1; // Normal speed
      window.speechSynthesis.speak(msg);
    }

    // 3. 3.5 Seconds ke baad Google Maps par redirect karo (taaki aawaz poori sun le aur popup padh le)
    setTimeout(() => {
      window.location.href = business.googleReviewLink;
    }, 3500); 
  };

  if (isLoading) return <div className="min-h-screen bg-white text-gray-800 flex justify-center items-center">Loading...</div>;

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
                      isSelected ? 'bg-[#006a60] text-white shadow-md scale-105 border-transparent' : 'bg-white text-gray-700 border border-gray-300 hover:border-[#006a60]'
                    }`}>{tagObj.text}</button>
                )
              })}
            </div>
            <button onClick={handleContinue} disabled={selectedTags.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all ${
                selectedTags.length > 0 ? 'bg-[#006a60] shadow-lg hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'
              }`}>Continue ➔</button>
          </div>
        </div>
      )}

      {/* 2. POSITIVE AI SCREEN */}
      {uiMode === 'positive_ai' && (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans animate-fade-in relative">
          
          <div className="bg-white max-w-md w-full rounded-[2rem] p-6 sm:p-8 shadow-xl border border-gray-100 relative z-10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#e4f2f2] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-[#006a60] w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">We wrote a review for you!</h2>
            </div>
            
            {isAiWriting ? (
              <div className="h-32 flex items-center justify-center text-[#006a60] font-medium animate-pulse">Writing Magic Review... ✨</div>
            ) : (
              <>
                <textarea value={generatedReview} onChange={(e) => setGeneratedReview(e.target.value)}
                  className="w-full bg-[#f0f4f9] border border-gray-200 rounded-xl p-4 text-gray-800 h-32 outline-none mb-6 leading-relaxed focus:border-[#006a60]" />
                
                <button 
                  onClick={handlePostToRealGoogle}
                  disabled={isCopied} // Prevent multiple clicks
                  className={`w-full text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg transition-all ${isCopied ? 'bg-gray-400 cursor-wait' : 'bg-[#006a60] hover:opacity-90'}`}>
                  {isCopied ? <CheckCircle className="animate-bounce" /> : <Send />} 
                  {isCopied ? 'Copied! Opening Google...' : 'Copy & Post on Google'}
                </button>
              </>
            )}
          </div>

          {/* 🌟 NAYA: Guide Overlay Popup */}
          {showPasteGuide && (
            <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in">
               <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl animate-slide-up">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Copied!</h2>
                 <div className="bg-gray-100 p-4 rounded-xl text-left border border-gray-200">
                    <p className="text-gray-700 font-medium mb-2">Next Steps on Google:</p>
                    <ol className="list-decimal pl-4 space-y-2 text-sm text-gray-600">
                      <li>Tap 5 Stars ⭐</li>
                      <li><strong>Long Press</strong> on the empty box 👆</li>
                      <li>Select <strong>"Paste"</strong> 📋</li>
                      <li>Tap Post! 🚀</li>
                    </ol>
                 </div>
                 <p className="text-gray-400 text-xs mt-6 animate-pulse">Redirecting you to Google...</p>
               </div>
            </div>
          )}

        </div>
      )}

      {/* 3. EXACT GOOGLE MOBILE LIGHT UI (NEGATIVE TRAP) */}
      {uiMode === 'negative_trap' && (
        <div className="min-h-screen bg-white text-[#1f1f1f] p-4 font-sans flex justify-center relative">
          <div className="max-w-md w-full pb-28 overflow-hidden relative">
            
            <div className="flex justify-between items-center pt-2 pb-4">
              <h1 className="text-2xl font-normal text-[#1f1f1f] flex-1 text-left">{displayName}</h1>
              <button className="bg-[#f1f3f4] p-2 rounded-full cursor-pointer hover:bg-gray-200" onClick={() => window.location.reload()}>
                <X className="w-5 h-5 text-[#5f6368]" />
              </button>
            </div>

            <div className="py-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#188038] rounded-full flex items-center justify-center font-normal text-white text-lg uppercase">S</div>
                <div>
                  <p className="font-medium text-[14px] text-[#1f1f1f] uppercase tracking-tight">Google User</p>
                  <p className="text-[12px] text-[#5f6368] flex items-center gap-1">Posting publicly across Google <Info className="w-3.5 h-3.5" /></p>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} onClick={() => setOverallRating(star)}
                      className={`w-11 h-11 cursor-pointer transition-colors ${
                        overallRating >= star 
                        ? 'text-[#FBBC04] fill-[#FBBC04]' 
                        : 'text-[#70757a] fill-transparent'
                      }`} 
                    />
                  ))}
                </div>
                {overallRating > 0 && <p className="text-[#3c4043] text-[14px] mt-2 font-medium">{getStarLabel(overallRating)}</p>}
              </div>

              <div className="mb-6 space-y-3">
                {currentData.ratingCategories?.map((cat) => (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-[14px] text-[#3c4043]">{cat}</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} onClick={() => setSubRatings({ ...subRatings, [cat]: star })}
                          className={`w-7 h-7 cursor-pointer ${
                            (subRatings[cat] || 0) >= star 
                            ? 'text-[#FBBC04] fill-[#FBBC04]' 
                            : 'text-[#70757a] fill-transparent'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <textarea 
                value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell others about your experience"
                className="w-full bg-white border border-[#dadce0] rounded-xl p-4 text-[14px] min-h-[120px] focus:outline-none focus:border-[#006a60] mb-6 text-[#1f1f1f] placeholder-[#70757a]"
              />

              <label className="w-full bg-[#C2E7FF] text-[#001D35] border-0 rounded-full py-3 px-4 flex items-center justify-center gap-2 text-[15px] font-medium cursor-pointer mb-6 hover:bg-[#a8d3f3] transition-colors">
                <Camera className="w-5 h-5 text-[#001D35]" /> Add photos and videos
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handlePhotoUpload} />
              </label>

              {uploadedPhotos.length > 0 && (
                <div className="flex gap-3 mb-6 flex-wrap">
                  {uploadedPhotos.map((url, i) => (
                    <div key={i} className="relative"><img src={url} className="w-16 h-16 object-cover rounded-lg border border-gray-200" /><button onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1 shadow-sm"><X className="w-3 h-3 text-gray-700" /></button></div>
                  ))}
                </div>
              )}

              <div className="space-y-4 mb-8">
                {currentData.directQuestions?.map((q) => (
                  <div key={q.id} className="bg-[#F0F4F9] p-5 rounded-2xl">
                    <p className="text-[15px] text-[#1f1f1f] font-medium mb-1">{q.question}</p>
                    {q.subtext && <p className="text-[13px] text-[#5f6368] mb-3">{q.subtext}</p>}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {q.options.map((opt) => {
                        const isSelected = q.multiSelect ? detailedAnswers[q.id]?.includes(opt) : detailedAnswers[q.id] === opt;
                        return (
                          <button key={opt} onClick={() => handleDetailedAnswer(q.id, opt, q.multiSelect)}
                            className={`px-4 py-2 rounded-lg text-[14px] font-medium border-0 transition-colors shadow-sm ${
                              isSelected ? 'bg-[#D3E3FD] text-[#041E49]' : 'bg-white text-[#3c4043] hover:bg-gray-50'
                            }`}>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-[16px] font-medium text-[#1f1f1f] mb-4">Add more details to help others</h2>
              
              <div className="rounded-2xl overflow-hidden border border-[#dadce0]">
                {currentData.accordionSections?.map((section, idx) => (
                  <div key={section.id} className={idx !== 0 ? 'border-t border-[#dadce0]' : ''}>
                    
                    <div onClick={() => setOpenDropdown(openDropdown === section.id ? null : section.id)}
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                      <span className="text-[14px] text-[#1f1f1f] font-medium">{section.title}</span>
                      <ChevronDown className={`w-5 h-5 text-[#5f6368] transition-transform ${openDropdown === section.id ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {openDropdown === section.id && (
                      <div className="px-4 pb-4 bg-[#F0F4F9]">
                        <div className="space-y-4 pt-4">
                          {section.questions.map((q) => (
                            <div key={q.id}>
                              <p className="text-[15px] text-[#1f1f1f] font-medium mb-1">{q.question}</p>
                              {q.subtext && <p className="text-[13px] text-[#5f6368] mb-2">{q.subtext}</p>}
                              <div className="flex flex-wrap gap-2">
                                {q.options.map((opt) => {
                                  const isSelected = q.multiSelect ? detailedAnswers[q.id]?.includes(opt) : detailedAnswers[q.id] === opt;
                                  return (
                                    <button key={opt} onClick={() => handleDetailedAnswer(q.id, opt, q.multiSelect)}
                                      className={`px-4 py-2 rounded-lg text-[14px] font-medium border-0 transition-colors shadow-sm ${
                                        isSelected ? 'bg-[#D3E3FD] text-[#041E49]' : 'bg-white text-[#3c4043] hover:bg-gray-50'
                                      }`}>
                                      {opt}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                          {section.textAreaPlaceholder && (
                             <textarea 
                               placeholder={section.textAreaPlaceholder}
                               value={dropdownTexts[section.id] || ""}
                               onChange={(e) => setDropdownTexts({ ...dropdownTexts, [section.id]: e.target.value })}
                               className="w-full bg-white border border-[#dadce0] rounded-xl p-3 text-[14px] min-h-[60px] focus:outline-none focus:border-[#006a60] text-[#1f1f1f] placeholder-[#70757a]"
                             />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="fixed bottom-0 left-0 w-full bg-white p-3 px-4 flex justify-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <button onClick={handlePostToDashboard} disabled={isProcessing} 
                className="w-full py-3 rounded-full text-[15px] font-medium bg-[#006a60] text-white hover:opacity-90 transition-opacity">
                {isProcessing ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. POINTS SUCCESS MODAL */}
      {uiMode === 'fake_success' && (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 fixed inset-0 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl border border-gray-100">
            <div className="w-16 h-16 bg-[#F0F4F9] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">G</div>
            <h2 className="text-3xl font-normal text-[#1f1f1f] mb-1">+{earnedPoints.total} points</h2>
            <p className="text-[#5f6368] text-[14px] mb-6">You've earned points for helping others</p>
            
            <div className="text-left mb-8 bg-[#F0F4F9] p-4 rounded-xl">
              {earnedPoints.ratings > 0 && <div className="flex justify-between py-2 text-[14px] border-b border-gray-200"><span className="text-[#3c4043]">Ratings</span><span className="text-[#1f1f1f] font-medium">+{earnedPoints.ratings}</span></div>}
              {earnedPoints.reviews > 0 && <div className="flex justify-between py-2 text-[14px] border-b border-gray-200"><span className="text-[#3c4043]">Review</span><span className="text-[#1f1f1f] font-medium">+{earnedPoints.reviews}</span></div>}
              {earnedPoints.photos > 0 && <div className="flex justify-between py-2 text-[14px] border-b border-gray-200"><span className="text-[#3c4043]">Photos</span><span className="text-[#1f1f1f] font-medium">+{earnedPoints.photos}</span></div>}
              {earnedPoints.answers > 0 && <div className="flex justify-between py-2 text-[14px]"><span className="text-[#3c4043]">Answers</span><span className="text-[#1f1f1f] font-medium">+{earnedPoints.answers}</span></div>}
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => window.location.reload()} className="bg-[#0b57d0] text-white px-6 py-3 rounded-full font-medium w-full">Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}