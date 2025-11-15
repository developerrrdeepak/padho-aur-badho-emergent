import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, BookOpen, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/dashboard/admin';
    if (user?.role === 'instructor') return '/dashboard/instructor';
    return '/dashboard/student';
  };

  return (
    <>
      <nav data-testid="main-navbar" className="sticky top-0 z-50 glass-effect border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" data-testid="nav-logo" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <BookOpen className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold gradient-text">Padho Aur Badho</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/courses" data-testid="nav-courses" className="text-sm font-medium hover:text-green-600 transition-colors">
                Courses
              </Link>
              <Link to="/study-materials" data-testid="nav-study-materials" className="text-sm font-medium hover:text-green-600 transition-colors">
                Study Materials
              </Link>
              <Link to="/video-lectures" data-testid="nav-video-lectures" className="text-sm font-medium hover:text-green-600 transition-colors">
                Videos
              </Link>
              <Link to="/quizzes" data-testid="nav-quizzes" className="text-sm font-medium hover:text-green-600 transition-colors">
                Quizzes
              </Link>
              <Link to="/blog" data-testid="nav-blog" className="text-sm font-medium hover:text-green-600 transition-colors">
                Blog
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                data-testid="theme-toggle"
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button data-testid="user-menu-trigger" variant="ghost" className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span className="hidden md:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(getDashboardPath())} data-testid="nav-dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} data-testid="nav-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button
                    data-testid="nav-login-btn"
                    variant="ghost"
                    onClick={() => setShowLogin(true)}
                  >
                    Login
                  </Button>
                  <Button
                    data-testid="nav-register-btn"
                    onClick={() => setShowRegister(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                data-testid="mobile-menu-toggle"
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2" data-testid="mobile-menu">
              <Link to="/courses" className="block py-2 text-sm hover:text-green-600">
                Courses
              </Link>
              <Link to="/study-materials" className="block py-2 text-sm hover:text-green-600">
                Study Materials
              </Link>
              <Link to="/video-lectures" className="block py-2 text-sm hover:text-green-600">
                Videos
              </Link>
              <Link to="/quizzes" className="block py-2 text-sm hover:text-green-600">
                Quizzes
              </Link>
              <Link to="/blog" className="block py-2 text-sm hover:text-green-600">
                Blog
              </Link>
              {!user && (
                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowLogin(true)}
                  >
                    Login
                  </Button>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setShowRegister(true)}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
    </>
  );
};

export default Navbar;