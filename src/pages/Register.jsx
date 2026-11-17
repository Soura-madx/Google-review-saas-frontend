import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessCategory: 'cafe',
    email: '',
    password: '',
    googleReviewLink: '',
    enableTrapdoor: true // 🌟 Naya toggle state
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('https://google-review-saas-backend.onrender.com/api/auth/register', formData);
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
      <div className="bg-white/15 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md text-gray-100">
        <h2 className="text-3xl font-bold mb-2 text-center text-white">Create Account</h2>
        <p className="text-gray-300 text-sm text-center mb-6">Register your business to get the AI Review QR.</p>
        
        {error && <p className="text-red-400 text-sm mb-4 text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          
          <div>
            <label className="text-sm text-gray-200 ml-1">Business Name</label>
            <input 
              type="text" 
              name="businessName"
              placeholder="e.g. The Mocha Brew or Style Salon" 
              className="w-full bg-gray-900/60 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500 mt-1 text-white"
              value={formData.businessName} onChange={handleChange} required 
            />
          </div>

          <div>
            <label className="text-sm text-gray-200 ml-1">Business Category</label>
            <select 
              name="businessCategory"
              value={formData.businessCategory}
              onChange={handleChange}
              className="w-full bg-gray-900/60 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500 mt-1 text-white"
              required
            >
              <option value="cafe" className="bg-gray-900">Cafe & Restaurant</option>
              <option value="hotel" className="bg-gray-900">Hotel, Resort & Airbnb</option>
              <option value="salon" className="bg-gray-900">Salon, Spa & Beauty</option>
              <option value="clinic" className="bg-gray-900">Dental & Medical Clinic</option>
              <option value="gym" className="bg-gray-900">Gym & Fitness Studio</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-200 ml-1">Email Address</label>
            <input 
              type="email" 
              name="email"
              placeholder="admin@business.com" 
              className="w-full bg-gray-900/60 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500 mt-1 text-white"
              value={formData.email} onChange={handleChange} required 
            />
          </div>

          <div>
            <label className="text-sm text-gray-200 ml-1">Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="Create a strong password" 
              className="w-full bg-gray-900/60 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500 mt-1 text-white"
              value={formData.password} onChange={handleChange} required 
            />
          </div>

          <div>
            <label className="text-sm text-gray-200 ml-1">Google Review Link</label>
            <input 
              type="url" 
              name="googleReviewLink"
              placeholder="https://g.page/r/..." 
              className="w-full bg-gray-900/60 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500 mt-1 text-white"
              value={formData.googleReviewLink} onChange={handleChange} required 
            />
          </div>

          {/* 🌟 NAYA TOGGLE SWITCH: Negative Review Interception (Trapdoor) */}
          <div className="bg-gray-900/40 border border-gray-700/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Negative Review Filter (Trapdoor)</p>
              <p className="text-xs text-gray-400">Intercept bad reviews internally before they hit Google.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="enableTrapdoor"
                checked={formData.enableTrapdoor}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mt-4 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Register Business'}
          </button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline font-medium">Login here</Link>
        </p>
      </div>
    </div>
  );
}