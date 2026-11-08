import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Business Login</h2>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-gray-900/50 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500"
            value={email} onChange={(e) => setEmail(e.target.value)} required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-gray-900/50 border border-gray-700 p-3 rounded-xl focus:outline-none focus:border-blue-500"
            value={password} onChange={(e) => setPassword(e.target.value)} required 
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-all">
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}