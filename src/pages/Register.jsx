import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    businessName: '', // Pehle cafeName tha, ab universally businessName hai
    businessCategory: 'cafe', // Naya dropdown logic ke liye
    email: '',
    password: '',
    googleReviewLink: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Backend ko updated formData bhej rahe hain
      const res = await axios.post('https://google-review-saas-backend.onrender.com/api/auth/register', formData);
      
      // Registration success hone par token save karein aur dashboard par bhej dein
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-center text-white">Create Account</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Register your business to get the AI Review QR.</p>
        
        {error && <p className="text-red-400 text-sm mb-4 text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Business Name Field */}
          <div>
            <label className="text-sm text-gray-300 ml-1">Business Name</label>
            <input 
              type="text" 
              name="businessName"
              placeholder="e.g. The Mocha Brew or Style Salon" 
              className="w-full bg-gray-900/50 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500 mt-1 text-white"
              value={formData.businessName} onChange={handleChange} required 
            />
          </div>

          {/* 🌟 NAYA FEATURE: Business Category Dropdown */}
          <div>
            <label className="text-sm text-gray-300 ml-1">Business Category</label>
            <select 
              name="businessCategory"
              value={formData.businessCategory}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500 mt-1 text-white appearance-none"
              required
            >
              <option value="cafe">Cafe & Restaurant</option>
              <option value="salon">Salon, Spa & Beauty</option>
              <option value="clinic">Dental & Medical Clinic</option>
              <option value="hotel">Hotel, Resort & Airbnb</option>
              <option value="auto_repair">Car Wash & Auto Repair</option>
              <option value="gym">Gym & Fitness Studio</option>
              <option value="pets">Pet Grooming & Veterinary</option>
              <option value="tech_repair">Mobile & Laptop Repair</option>
              <option value="retail">Premium Retail Shop</option>
              <option value="print_shop">Print Shop & Cyber Cafe</option>
            </select>
          </div>

          {/* Email Field */}
          <div>
            <label className="text-sm text-gray-300 ml-1">Email Address</label>
            <input 
              type="email" 
              name="email"
              placeholder="admin@business.com" 
              className="w-full bg-gray-900/50 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500 mt-1 text-white"
              value={formData.email} onChange={handleChange} required 
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="text-sm text-gray-300 ml-1">Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="Create a strong password" 
              className="w-full bg-gray-900/50 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500 mt-1 text-white"
              value={formData.password} onChange={handleChange} required 
            />
          </div>

          {/* Google Review Link Field */}
          <div>
            <label className="text-sm text-gray-300 ml-1">Google Review Link</label>
            <input 
              type="url" 
              name="googleReviewLink"
              placeholder="https://g.page/r/..." 
              className="w-full bg-gray-900/50 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500 mt-1 text-white"
              value={formData.googleReviewLink} onChange={handleChange} required 
            />
            <p className="text-xs text-gray-500 mt-1 ml-1">*Paste your exact Google Maps review link here</p>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mt-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Register Business'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline font-medium">Login here</Link>
        </p>
      </div>
    </div>
  );
}