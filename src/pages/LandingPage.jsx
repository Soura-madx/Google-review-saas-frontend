import { Link } from 'react-router-dom';
import { Star, QrCode, Zap, TrendingUp, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-extrabold tracking-tighter flex items-center gap-2">
          <Star className="text-yellow-400 fill-yellow-400" size={28} />
          <span>ReviewBoost<span className="text-blue-500">.ai</span></span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 text-sm font-medium hover:text-blue-400 transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold">
          🚀 Built for Cafes & Restaurants
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          Get 5-Star Google Reviews <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            On Autopilot.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Don't lose customers to bad ratings. Use our AI-powered QR codes to generate SEO-friendly Google reviews in just 5 seconds. No typing required by your customers!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register" className="px-8 py-4 text-lg font-bold bg-white text-black hover:bg-gray-200 rounded-xl transition-all">
            Create Your QR Code Now
          </Link>
          <a href="#how-it-works" className="px-8 py-4 text-lg font-bold bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-xl transition-all">
            See How It Works
          </a>
        </div>
      </main>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-gray-900/50 border-y border-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">3 Simple Steps to Top Rated</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gray-950 border border-gray-800 p-8 rounded-3xl text-center relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <QrCode className="text-blue-400" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Customer Scans QR</h3>
              <p className="text-gray-400 text-sm">Place our custom QR standees on your tables. Customer scans it after their meal.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-950 border border-gray-800 p-8 rounded-3xl text-center relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">2. AI Writes Review</h3>
              <p className="text-gray-400 text-sm">Customer taps a simple tag (e.g. "Great Food"). Our AI instantly generates an SEO-friendly Hinglish review.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-950 border border-gray-800 p-8 rounded-3xl text-center relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-yellow-400" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">3. 1-Click Post</h3>
              <p className="text-gray-400 text-sm">Customer clicks copy, gets redirected to your Google page, and pastes the 5-star review effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Benefits */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-gray-800 p-10 md:p-16 rounded-[2rem] flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6">Why local businesses love us?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-blue-400 shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Overcome the "typing friction" – customers hate writing long reviews.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-blue-400 shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Automatically inject SEO keywords like "Best cafe" to rank higher on Maps.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-blue-400 shrink-0 mt-1" size={20} />
                <span className="text-gray-300">Set up takes less than 2 minutes. Generate your QR and start instantly.</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full relative">
            {/* Mockup of Review Box */}
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-sm text-gray-300 italic mb-4">"The Mocha Brew ka vibe ekdum amazing hai. Yeh definitely city ka best cafe hai! ☕✨"</p>
              <div className="bg-blue-600 text-center py-2 rounded-lg text-sm font-bold text-white">Copy & Post on Google</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 ReviewBoost.ai - Built for Local Businesses to Grow.</p>
      </footer>
    </div>
  );
}