import React, { useState } from 'react';
import { MessageCircle, Send, ExternalLink } from 'lucide-react';

export default function WhatsAppSender({ businessId, businessName }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!name || !phone) return alert("Please enter name and phone number.");

    setIsRedirecting(true);

    let formattedPhone = phone.replace(/\D/g, ''); 
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    }

    // TODO: Production me 'localhost' ki jagah apni actual domain daalein
    const reviewLink = `https://google-review-saas-frontend.vercel.app/rate/${businessId}`;
    const displayName = businessName || "our place";

    // 🌟 NAYA SMART WHATSAPP MESSAGE (With Bold text & Emojis)
    const messageText = `Hi *${name}*, 👋\n\nThank you for visiting *${displayName}* today! ✨\n\nWe'd love to know how we did. Could you please take just 10 seconds to rate your experience? ⭐\n\n*Tap here to leave a quick review:* 👇\n${reviewLink}\n\nThank you for your support! 🙏\nTeam *${displayName}*`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
      setName('');
      setPhone('');
      setIsRedirecting(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 bg-[#25D366] bg-opacity-10 rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-[#25D366]" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">Request Review</h2>
          <p className="text-[13px] text-gray-500">Send link via WhatsApp</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="text-[13px] font-medium text-gray-700 mb-1 block">Customer Name</label>
          <input 
            type="text" 
            placeholder="e.g. Rahul" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-black rounded-xl p-3 text-[14px] focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
            required
          />
        </div>
        
        <div>
          <label className="text-[13px] font-medium text-gray-700 mb-1 block">WhatsApp Number</label>
          <input 
            type="tel" 
            placeholder="e.g. 9876543210" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-black rounded-xl p-3 text-[14px] focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
            required
            maxLength="12"
          />
        </div>

        <button 
          type="submit"
          className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all mt-2 ${
            isRedirecting ? 'bg-[#1da851]' : 'bg-[#25D366] hover:bg-[#20bd5a]'
          }`}
        >
          {isRedirecting ? (
            <>
              <ExternalLink className="w-5 h-5 animate-pulse" /> Opening WhatsApp...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> Send Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}