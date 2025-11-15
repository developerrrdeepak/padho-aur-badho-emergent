import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { BookOpen, Video, FileText, Trophy, Users, Star, TrendingUp, Sparkles } from 'lucide-react';
import LoginModal from '../components/auth/LoginModal';
import RegisterModal from '../components/auth/RegisterModal';

const HomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses`);
      setCourses(response.data.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch courses', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section data-testid="hero-section" className="hero-gradient py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-slide-in">
              Transform Your Future with
              <span className="block gradient-text mt-2">Quality Education</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Access thousands of courses, study materials, and interactive quizzes. Learn at your own pace with AI-powered recommendations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                data-testid="hero-get-started-btn"
                size="lg"
                className="bg-green-600 hover:bg-green-700 btn-primary"
                onClick={() => setShowRegister(true)}
              >
                Get Started Free
              </Button>
              <Button
                data-testid="hero-explore-courses-btn"
                size="lg"
                variant="outline"
                onClick={() => navigate('/courses')}
              >
                Explore Courses
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">100+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Instructors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform offers comprehensive learning tools designed to help you succeed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-hover p-6 rounded-xl glass-effect">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert-Led Courses</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn from industry professionals with real-world experience
              </p>
            </div>

            <div className="card-hover p-6 rounded-xl glass-effect">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">HD Video Lectures</h3>
              <p className="text-gray-600 dark:text-gray-400">
                High-quality video content with subtitles and playback controls
              </p>
            </div>

            <div className="card-hover p-6 rounded-xl glass-effect">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Quizzes</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Test your knowledge with auto-graded quizzes and instant feedback
              </p>
            </div>

            <div className="card-hover p-6 rounded-xl glass-effect">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Study Materials</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Downloadable PDFs, notes, and resources for offline learning
              </p>
            </div>

            <div className="card-hover p-6 rounded-xl glass-effect">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get personalized recommendations and AI tutor assistance
              </p>
            </div>

            <div className="card-hover p-6 rounded-xl glass-effect">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certificates</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Earn certificates upon course completion to boost your career
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Popular Courses</h2>
            <p className="text-gray-600 dark:text-gray-400">Start learning with our most popular courses</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? courses.map((course) => (
              <div key={course.id} className="card-hover glass-effect rounded-xl overflow-hidden">
                <img
                  src={course.thumbnail || `https://source.unsplash.com/400x250/?education,${course.category}`}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      {course.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({course.total_ratings})</span>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/courses/${course.id}`)}>
                      View Course
                    </Button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No courses available yet</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/courses')}
            >
              View All Courses
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of students already learning on our platform
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-green-600 hover:bg-gray-100"
            onClick={() => setShowRegister(true)}
          >
            Get Started Today
          </Button>
        </div>
      </section>

      <Footer />

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
    </div>
  );
};

export default HomePage;
