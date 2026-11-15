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

  // 🌟 NAYA: Data structures for complex answers
  const [detailedAnswers, setDetailedAnswers] = useState({}); // Stores both Strings (single) and Arrays (multi-select)
  const [dropdownTexts, setDropdownTexts] = useState({}); // Text areas inside accordions
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

  // --- LOGIC: FAKE UI CHIPS (Single & Multi Select) ---
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

  // --- LOGIC: EXACT POINTS CALCULATION ---
  const calculatePoints = () => {
    let pRatings = 0, pReviews = 0, pPhotos = 0, pAnswers = 0;
    
    // 1. Ratings (+1 overall, +1 per sub-rating)
    if (overallRating > 0) pRatings += 1;
    pRatings += Object.keys(subRatings).length;

    // 2. Feedback (+10)
    if (feedbackText.trim().length > 0) pReviews += 10;

    // 3. Photos (+5 per photo)
    pPhotos += (uploadedPhotos.length * 5);

    // 4. Answers (+1 per chip selected)
    Object.values(detailedAnswers).forEach(val => {
      if (Array.isArray(val)) pAnswers += val.length; // Count multi-selects
      else pAnswers += 1; // Count single selects
    });

    // 5. Dropdown Texts (+2 per text)
    pAnswers += Object.values(dropdownTexts).filter(t => t.trim().length > 0).length * 2;

    setEarnedPoints({ 
      total: pRatings + pReviews + pPhotos + pAnswers, 
      ratings: pRatings, reviews: pReviews, photos: pPhotos, answers: pAnswers 
    });
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

  // UI Helpers
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

  if (isLoading) return <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center">Loading...</div>;

  const currentData = businessCategories[business?.businessCategory || 'cafe'];
  const displayName = business?.businessName || business?.cafeName || "Business";

  return (
    <>
      {/* 1. INITIAL TAG SCREEN (Omitted for brevity - Same as previous) */}
      {uiMode === 'tag_selection' && (
        <div className="min-h-screen bg-[#202124] flex items-center justify-center p-4">
           <div className="bg-[#303134] max-w-md w-full rounded-3xl p-8 text-center text-white">
              <h1 className="text-2xl font-bold mb-6">How was your visit to {displayName}?</h1>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {currentData.suggestions?.map((tagObj, idx) => (
                  <button key={idx} onClick={() => handleTagSelect(tagObj)}
                    className={`px-4 py-2 rounded-full border ${selectedTags.some(t => t.text === tagObj.text) ? 'bg-[#8AB4F8] text-black border-[#8AB4F8]' : 'border-gray-500 text-gray-200'}`}>
                    {tagObj.text}
                  </button>
                ))}
              </div>
              <button onClick={handleContinue} className="w-full py-3 bg-[#8AB4F8] text-black font-bold rounded-full">Continue</button>
           </div>
        </div>
      )}

      {/* 2. POSITIVE AI SCREEN (Omitted for brevity - Same as previous) */}
      {uiMode === 'positive_ai' && ( <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Generating AI Review...</div> )}

      {/* 3. EXACT GOOGLE DESKTOP UI (NEGATIVE TRAP) */}
      {uiMode === 'negative_trap' && (
        <div className="min-h-screen bg-[#202124] text-gray-200 p-4 font-sans flex justify-center">
          {/* Modal Container to look like Desktop Maps */}
          <div className="max-w-2xl w-full bg-[#202124] lg:border lg:border-gray-700 lg:rounded-xl lg:shadow-2xl lg:mt-8 mb-24 lg:mb-8 overflow-hidden relative">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h1 className="text-lg font-medium text-white text-center w-full">{displayName}</h1>
              <X className="w-6 h-6 text-gray-400 cursor-pointer absolute right-4" onClick={() => window.location.reload()} />
            </div>

            <div className="p-6">
              {/* Profile Header */}
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
                {overallRating > 0 && <p className="text-[#FBBC04] text-[14px] mt-2 font-medium">{getStarLabel(overallRating)}</p>}
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

              {/* Text Area */}
              <textarea 
                value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share details of your own experience at this place"
                className="w-full bg-transparent border border-[#5f6368] rounded-md p-3 text-[14px] min-h-[100px] focus:outline-none focus:border-[#8AB4F8] mt-4 mb-4 text-white"
              />

              {/* Photo Upload */}
              <label className="border border-[#5f6368] rounded-full py-2 px-4 flex items-center justify-center gap-2 text-[#8AB4F8] text-[14px] font-medium cursor-pointer hover:bg-[#303134] w-max mb-6">
                <Camera className="w-5 h-5" /> Add photos and videos
                <input type="file" className="hidden" accept="image/*,video/*" onChange={() => setUploadedPhotos([...uploadedPhotos, "fake_url"])} />
              </label>

              {/* 🌟 NAYA: DIRECT QUESTIONS (No Accordion) */}
              <div className="space-y-6 mb-8">
                {currentData.directQuestions?.map((q) => (
                  <div key={q.id}>
                    <p className="text-[15px] text-white font-medium mb-1">{q.question}</p>
                    {q.subtext && <p className="text-[13px] text-gray-400 mb-3">{q.subtext}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {q.options.map((opt) => {
                        const isSelected = q.multiSelect 
                          ? detailedAnswers[q.id]?.includes(opt) 
                          : detailedAnswers[q.id] === opt;
                        
                        return (
                          <button key={opt} onClick={() => handleDetailedAnswer(q.id, opt, q.multiSelect)}
                            className={`px-4 py-1.5 rounded-lg text-[14px] border ${isSelected ? 'bg-[#8AB4F8] text-[#202124] border-[#8AB4F8] font-medium' : 'bg-transparent border-[#5f6368] text-[#e8eaed] hover:bg-[#303134]'}`}>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 🌟 NAYA: ADD MORE DETAILS (Accordion Dropdowns) */}
              <h2 className="text-[16px] font-medium text-white mb-4 border-t border-gray-700 pt-6">Add more details to help others</h2>
              <div className="border border-[#5f6368] rounded-lg overflow-hidden">
                {currentData.accordionSections?.map((section, idx) => (
                  <div key={section.id} className={idx !== 0 ? 'border-t border-[#5f6368]' : ''}>
                    
                    {/* Header */}
                    <div onClick={() => setOpenDropdown(openDropdown === section.id ? null : section.id)}
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#303134] transition-colors">
                      <span className="text-[14px] text-[#e8eaed] font-medium">{section.title}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown === section.id ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {/* Content */}
                    {openDropdown === section.id && (
                      <div className="p-4 pt-0 bg-[#28292c]">
                        {/* Questions inside accordion */}
                        {section.questions.map((q) => (
                          <div key={q.id} className="mb-6 mt-4">
                            <p className="text-[15px] text-white font-medium mb-1">{q.question}</p>
                            {q.subtext && <p className="text-[13px] text-gray-400 mb-2">{q.subtext}</p>}
                            <div className="flex flex-wrap gap-2">
                              {q.options.map((opt) => {
                                const isSelected = q.multiSelect ? detailedAnswers[q.id]?.includes(opt) : detailedAnswers[q.id] === opt;
                                return (
                                  <button key={opt} onClick={() => handleDetailedAnswer(q.id, opt, q.multiSelect)}
                                    className={`px-4 py-1.5 rounded-lg text-[14px] border ${isSelected ? 'bg-[#8AB4F8] text-[#202124] border-[#8AB4F8] font-medium' : 'bg-transparent border-[#5f6368] text-[#e8eaed] hover:bg-[#3c4043]'}`}>
                                    {opt}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                        
                        {/* Text Area inside accordion */}
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
            
            {/* Sticky Footer */}
            <div className="sticky bottom-0 left-0 w-full bg-[#202124] border-t border-gray-700 p-4 flex justify-end gap-4">
              <button className="text-[#8AB4F8] text-[14px] font-medium px-4 py-2 hover:bg-[#303134] rounded-md">Cancel</button>
              <button onClick={handlePostToDashboard} disabled={isProcessing} 
                className="px-6 py-2 rounded-full text-[14px] font-medium bg-[#8AB4F8] text-[#202124] hover:bg-[#9cbbf1]">
                {isProcessing ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. POINTS SUCCESS MODAL (Exact match) */}
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