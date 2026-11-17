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

    const reviewLink = `${window.location.origin}/rate/${businessId}`;
    const displayName = businessName || "our place";

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
    // 🌟 FIX: w-full aur dark glass theme match kiya taaki mobile par overflow na ho
    <div className="w-full min-w-0 bg-gray-900/50 border border-gray-800 p-5 sm:p-6 rounded-3xl shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 bg-[#25D366]/15 rounded-full flex items-center justify-center shrink-0">
          <MessageCircle className="w-6 h-6 text-[#25D366]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-white truncate">Request Review</h2>
          <p className="text-xs text-gray-400 truncate">Send link directly via WhatsApp</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Customer Name</label>
          <input 
            type="text" 
            placeholder="e.g. Rahul" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/40 border border-gray-700/60 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#25D366] transition-all"
            required
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">WhatsApp Number</label>
          <input 
            type="tel" 
            placeholder="e.g. 9876543210" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-black/40 border border-gray-700/60 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#25D366] transition-all"
            required
            maxLength="12"
          />
        </div>

        <button 
          type="submit"
          className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
            isRedirecting ? 'bg-[#1da851]' : 'bg-[#25D366] hover:bg-[#20bd5a] shadow-[#25D366]/20'
          }`}
        >
          {isRedirecting ? (
            <>
              <ExternalLink className="w-4 h-4 animate-pulse" /> Opening WhatsApp...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Send Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}