import React, { useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b-4 border-teal-600 transform transition-all duration-300 hover:shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-transform duration-300 hover:scale-105"
            >
              <img
                src="/logo_btk.png"
                alt="BTK Cards Logo"
                className="w-10 h-10 rounded-lg object-contain shadow-lg transform transition-all duration-300 hover:rotate-12 hover:shadow-xl"
              />
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-teal-700 dark:text-teal-400 bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-400 dark:to-teal-300 bg-clip-text text-transparent">
                  BTK CARDS
                </div>
                <div className="text-xs font-semibold text-teal-600 dark:text-teal-300 animate-pulse">
                  ITACOSPECIALTY
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 ${
                isActiveRoute('/') 
                  ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
              }`}
            >
              Home
              {isActiveRoute('/') && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse"></span>
              )}
            </Link>
            
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    isActiveRoute('/dashboard') 
                      ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 shadow-md' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
                  }`}
                >
                  Dashboard
                  {isActiveRoute('/dashboard') && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse"></span>
                  )}
                </Link>
                
                <Link 
                  to="/create" 
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    isActiveRoute('/create') 
                      ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 shadow-md' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
                  }`}
                >
                  Create
                  {isActiveRoute('/create') && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400 rounded-full animate-pulse"></span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:rotate-45 hover:scale-110 shadow-sm"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              <span className="text-lg transition-transform duration-300">
                {isDark ? '☀️' : '🌙'}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span className={`block h-0.5 w-6 bg-teal-600 dark:bg-teal-400 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-teal-600 dark:bg-teal-400 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block h-0.5 w-6 bg-teal-600 dark:bg-teal-400 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>

            {/* User Section */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-teal-300 dark:border-teal-600 rounded-full px-3 py-1.5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:border-teal-500 dark:hover:border-teal-400 group"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=1b5e4f&color=fff`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-teal-200 dark:border-teal-600 group-hover:border-teal-400 transition-all duration-300"
                  />
                  <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-200 font-medium">
                    {user.username}
                  </span>
                  <span className={`transform transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-700 rounded-xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-5 duration-300">
                    <div className="px-4 py-2 border-b border-teal-100 dark:border-teal-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/50 transition-all duration-200 group"
                    >
                      <span className="mr-2">👤</span>
                      Profile
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/50 transition-all duration-200 group"
                      >
                        <span className="mr-2">⚙️</span>
                        Admin Panel
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                    >
                      <span className="mr-2">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-300 transform hover:scale-105"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-pulse hover:animate-none"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-t border-teal-200 dark:border-teal-700 shadow-2xl animate-in slide-in-from-top duration-300"
          >
            <nav className="px-4 py-4 space-y-2">
              <Link 
                to="/" 
                className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActiveRoute('/') 
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-l-4 border-teal-600' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Home
              </Link>
              
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActiveRoute('/dashboard') 
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-l-4 border-teal-600' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Dashboard
                  </Link>
                  
                  <Link 
                    to="/create" 
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActiveRoute('/create') 
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-l-4 border-teal-600' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Create
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;