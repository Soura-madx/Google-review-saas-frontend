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

    // 1. Phone Number Formatting (India ka +91 add karna agar nahi hai)
    let formattedPhone = phone.replace(/\D/g, ''); // Sirf numbers rakhega
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    }

    // 2. Apne SaaS ka Review Link
    // TODO: Production me 'localhost' ki jagah apni actual domain daalein
    const reviewLink = `https://your-starify-domain.com/rate/${businessId}`;
    const displayName = businessName || "our place";

    // 3. Message Text banayein
    const messageText = `Hi ${name}, \n\nThank you for choosing ${displayName}! We hope you had a great experience.\n\nCould you please take 10 seconds to share your quick feedback? It means a lot to us! 👇\n${reviewLink}\n\nThanks,\nTeam ${displayName}`;

    // 4. Text ko URL safe banayein (spaces ko %20 me convert karne ke liye)
    const encodedMessage = encodeURIComponent(messageText);

    // 5. WhatsApp API Link (Works on both PC Web & Mobile App)
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // 6. Naye tab me WhatsApp open karein
    window.open(whatsappUrl, '_blank');

    // 7. Form ko wapas reset kar dein
    setTimeout(() => {
      setName('');
      setPhone('');
      setIsRedirecting(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 bg-[#25D366] bg-opacity-10 rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-[#25D366]" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">Request Review</h2>
          <p className="text-[13px] text-gray-500">Send link via WhatsApp</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="text-[13px] font-medium text-gray-700 mb-1 block">Customer Name</label>
          <input 
            type="text" 
            placeholder="e.g. Rahul" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-[14px] focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
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
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-[14px] focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
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