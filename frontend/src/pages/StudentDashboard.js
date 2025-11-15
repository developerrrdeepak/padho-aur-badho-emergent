import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { BookOpen, Trophy, Award, TrendingUp } from 'lucide-react';
import { Progress } from '../components/ui/progress';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/student`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="dashboard-welcome">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600 dark:text-gray-400">Continue your learning journey</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</p>
                  <p className="text-2xl font-bold">{dashboard?.total_courses || 0}</p>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold">{dashboard?.completed_courses || 0}</p>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</p>
                  <p className="text-2xl font-bold">{dashboard?.quiz_results?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
                  <p className="text-2xl font-bold">{dashboard?.certificates?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* My Courses */}
          <div className="glass-effect rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">My Courses</h2>
            {dashboard?.courses && dashboard.courses.length > 0 ? (
              <div className="space-y-4">
                {dashboard.courses.map((course) => {
                  const enrollment = dashboard.enrollments?.find(e => e.course_id === course.id);
                  return (
                    <div key={course.id} className="border dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{course.category}</p>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {enrollment?.progress || 0}% Complete
                        </span>
                      </div>
                      <Progress value={enrollment?.progress || 0} className="mb-2" />
                      <Button size="sm" variant="outline">
                        Continue Learning
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
                <Button onClick={() => window.location.href = '/courses'}>
                  Browse Courses
                </Button>
              </div>
            )}
          </div>

          {/* Certificates */}
          {dashboard?.certificates && dashboard.certificates.length > 0 && (
            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">My Certificates</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {dashboard.certificates.map((cert) => (
                  <div key={cert.id} className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold">{cert.course_title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Issued: {new Date(cert.issued_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
