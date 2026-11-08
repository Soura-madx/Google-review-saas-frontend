import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage'; // <-- 1. Import karein
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReviewPage from './pages/ReviewPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white font-sans">
        <Routes>
          {/* Default Route ab Landing Page hai */}
          <Route path="/" element={<LandingPage />} /> 
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/rate/:businessId" element={<ReviewPage />} />
          <Route path="*" element={<Navigate to="/" />} /> {/* Fallback to landing */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;