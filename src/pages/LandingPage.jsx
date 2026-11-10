import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  PlayCircle, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  Phone, 
  Mail,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {

  // WhatsApp Redirect Logic
  const handleWhatsAppBooking = (planName, amount) => {
    const phoneNumber = "919981436647"; 
    const message = `Hi Sourabh! 👋\n\nI saw your Google Review SaaS platform and I am interested in the *${planName}* (${amount}).\n\nI would like to start my 3-Day Free Trial. Let's discuss the setup!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
  };

  const scrollToPricing = () => {
    document.getElementById('pricing-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0">
      
      {/* 1. HERO SECTION (Mobile Optimized) */}
      <section className="bg-white pt-12 pb-16 px-5 sm:px-6 lg:px-8 text-center border-b-4 border-[#4285F4]">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-1.5 mb-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <Star key={i} className="text-[#FBBC05] w-6 h-6 md:w-8 md:h-8 fill-current" />
            ))}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Get <span className="text-[#4285F4]">5x More Google Reviews</span> Before Your Customer Leaves.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A smart QR-based system that uses AI to write reviews for your customers. No typing effort required. Boost your cafe's local ranking instantly.
          </p>

          {/* New: Hero Section CTA */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
            <button 
              onClick={() => handleWhatsAppBooking('3-Day Free Trial', 'Free')}
              className="w-full sm:w-auto bg-[#4285F4] text-white font-bold py-4 px-8 rounded-full hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2 text-lg"
            >
              Start 3-Day Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={scrollToPricing}
              className="w-full sm:w-auto bg-gray-100 text-gray-700 font-bold py-4 px-8 rounded-full hover:bg-gray-200 transition flex justify-center items-center text-lg"
            >
              View Pricing
            </button>
          </div>

          {/* Video Placeholder (Adjusted for mobile aspect ratio) */}
          <div className="relative w-full max-w-3xl mx-auto bg-gray-900 rounded-2xl overflow-hidden shadow-2xl aspect-video flex flex-col items-center justify-center border-4 border-gray-100 group cursor-pointer">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            <PlayCircle className="w-16 h-16 md:w-20 md:h-20 text-white z-10 opacity-90 group-hover:scale-110 transition-transform" />
            <p className="text-white font-medium mt-3 md:mt-4 z-10 text-sm md:text-base">Watch How It Works (1 Min)</p>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM VS SOLUTION (Stacked for Mobile) */}
      <section className="py-12 md:py-16 px-5 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why Normal QR Codes Fail?</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* The Problem */}
          <div className="bg-red-50 rounded-2xl p-6 md:p-8 border border-red-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <AlertCircle className="w-7 h-7 text-[#EA4335]" />
              <h3 className="text-xl md:text-2xl font-bold text-[#EA4335]">The Problem</h3>
            </div>
            <ul className="space-y-4 text-base md:text-lg text-gray-700">
              <li className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-[#EA4335] shrink-0 mt-0.5" />
                <span>Happy customers <b>forget to review</b> once they leave the cafe.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-[#EA4335] shrink-0 mt-0.5" />
                <span>Normal QR codes force users to type, making them lazy and drop off.</span>
              </li>
            </ul>
          </div>

          {/* The Solution */}
          <div className="bg-green-50 rounded-2xl p-6 md:p-8 border border-green-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="w-7 h-7 text-[#34A853]" />
              <h3 className="text-xl md:text-2xl font-bold text-[#34A853]">Our Smart Solution</h3>
            </div>
            <ul className="space-y-4 text-base md:text-lg text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#34A853] shrink-0 mt-0.5" />
                <span>Scan a beautiful <b>premium QR Stand</b> right on their table.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#34A853] shrink-0 mt-0.5" />
                <span><b>AI writes the review</b> for them. They just click "Post".</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. PRICING SECTION */}
      <section id="pricing-section" className="bg-gray-100 py-12 md:py-16 px-5 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Simple & Transparent Pricing</h2>
            <p className="text-sm md:text-base text-gray-700 bg-white inline-block px-4 py-2 rounded-full shadow-sm font-medium border border-gray-200">
              🎁 Every plan includes a <span className="text-[#4285F4] font-bold">3-Day Free Trial</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            
            {/* Monthly Plan */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Monthly Plan</h3>
              <div className="text-3xl md:text-4xl font-extrabold text-[#4285F4] mb-6">₹300<span className="text-base text-gray-500 font-medium"> /month</span></div>
              
              <ul className="space-y-3 mb-8 flex-1 text-gray-600 text-sm md:text-base">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#34A853] mt-0.5 shrink-0" />
                  <span>Full access to AI Review System</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#34A853] mt-0.5 shrink-0" />
                  <span>Unlimited scans & reviews</span>
                </li>
                <li className="flex items-start gap-2 bg-red-50 p-3 rounded-md mt-2">
                  <AlertCircle className="w-5 h-5 text-[#EA4335] mt-0.5 shrink-0" />
                  <span className="text-gray-800">
                    <b>₹200 Setup Fee per Table QR Stand</b> (One-time asset cost).
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-blue-50 p-3 rounded-md">
                  <CheckCircle className="w-5 h-5 text-[#4285F4] mt-0.5 shrink-0" />
                  <span className="text-gray-800">
                    Pay only *after* completing your free trial.
                  </span>
                </li>
              </ul>
              
              <button 
                onClick={() => handleWhatsAppBooking('Monthly Plan', '₹300/month')}
                className="w-full bg-white text-[#4285F4] border-2 border-[#4285F4] font-bold py-3 px-4 rounded-xl hover:bg-blue-50 transition flex justify-center items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> Select Monthly Plan
              </button>
            </div>

            {/* Yearly Plan (Best Value) */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border-2 border-[#FBBC05] relative flex flex-col md:-translate-y-2 mt-4 md:mt-0">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FBBC05] text-gray-900 font-bold px-4 py-1 rounded-full text-xs md:text-sm shadow-md whitespace-nowrap">
                BEST VALUE
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Yearly Plan</h3>
              <div className="text-3xl md:text-4xl font-extrabold text-[#4285F4] mb-2">₹2500<span className="text-base text-gray-500 font-medium"> /year</span></div>
              <div className="text-sm font-bold text-[#34A853] mb-6 bg-green-50 inline-block px-3 py-1 rounded w-fit">
                Save ₹1100 per year!
              </div>
              
              <ul className="space-y-3 mb-8 flex-1 text-gray-600 text-sm md:text-base">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#34A853] mt-0.5 shrink-0" />
                  <span>Everything in Monthly Plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#34A853] mt-0.5 shrink-0" />
                  <span className="font-bold text-gray-900">ZERO Setup Fee for QR Stands</span>
                </li>
                <li className="flex items-start gap-2 bg-yellow-50 p-3 rounded-md border border-yellow-100 mt-4">
                  <Star className="w-5 h-5 text-[#FBBC05] mt-0.5 shrink-0" />
                  <span className="text-gray-800">
                    <b>Flexible Payment:</b> Pay ₹1500 advance to start. Pay remaining after 3 months.
                  </span>
                </li>
              </ul>
              
              <button 
                onClick={() => handleWhatsAppBooking('Yearly Plan', '₹2500/year')}
                className="w-full bg-[#4285F4] text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> Grab Yearly Deal
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-gray-900 text-white pt-12 pb-24 md:pb-12 px-5 text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-6">Have questions? Let's talk!</h3>
        <div className="flex flex-col md:flex-row justify-center items-center gap-5 md:gap-12">
          <a href="tel:9981436647" className="flex items-center gap-3 hover:text-[#FBBC05] transition">
            <div className="bg-gray-800 p-3 rounded-full">
              <Phone className="w-5 h-5 text-[#4285F4]" />
            </div>
            <span className="text-base md:text-lg font-medium">+91 9981436647</span>
          </a>
          <a href="mailto:korisourabh783@gmail.com" className="flex items-center gap-3 hover:text-[#FBBC05] transition">
            <div className="bg-gray-800 p-3 rounded-full">
              <Mail className="w-5 h-5 text-[#EA4335]" />
            </div>
            <span className="text-base md:text-lg font-medium">korisourabh783@gmail.com</span>
          </a>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM CTA (Only visible on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <button 
          onClick={() => handleWhatsAppBooking('3-Day Free Trial', 'Free Mobile Request')}
          className="w-full bg-[#34A853] text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition flex justify-center items-center gap-2 text-lg shadow-md"
        >
          <MessageCircle className="w-6 h-6" /> Start Free Trial Now
        </button>
      </div>

    </div>
  );
};

export default LandingPage;