import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pizza, Home, Menu, Calendar, MessageSquare, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Pizza className="w-8 h-8 text-pizza-red" />
            <span className="text-2xl font-bold text-pizza-yellow">Shakey's Pizza</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-300 hover:text-pizza-yellow transition">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link to="/menu" className="flex items-center space-x-1 text-gray-300 hover:text-pizza-yellow transition">
              <Menu className="w-5 h-5" />
              <span>Menu</span>
            </Link>
            {user && (
              <>
                {user.role !== 'admin' && (
                  <>
                    <Link to="/reservation" className="flex items-center space-x-1 text-gray-300 hover:text-pizza-yellow transition">
                      <Calendar className="w-5 h-5" />
                      <span>Reservation</span>
                    </Link>
                    <Link to="/feedback" className="flex items-center space-x-1 text-gray-300 hover:text-pizza-yellow transition">
                      <MessageSquare className="w-5 h-5" />
                      <span>Feedback</span>
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center space-x-1 text-pizza-red hover:text-pizza-darkred transition">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-pizza-yellow">
                  <User className="w-5 h-5" />
                  <span>{user.firstName}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-gray-300 hover:text-pizza-red transition">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
