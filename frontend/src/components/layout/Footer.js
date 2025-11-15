import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-green-500" />
              <span className="text-xl font-bold text-white">Padho Aur Badho</span>
            </div>
            <p className="text-sm mb-4">
              Empowering learners worldwide with quality education and innovative learning experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-green-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/courses" className="text-sm hover:text-green-500 transition-colors">Courses</Link></li>
              <li><Link to="/study-materials" className="text-sm hover:text-green-500 transition-colors">Study Materials</Link></li>
              <li><Link to="/quizzes" className="text-sm hover:text-green-500 transition-colors">Quizzes</Link></li>
              <li><Link to="/blog" className="text-sm hover:text-green-500 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm hover:text-green-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-green-500 transition-colors">Contact</Link></li>
              <li><Link to="/pricing" className="text-sm hover:text-green-500 transition-colors">Pricing</Link></li>
              <li><Link to="/privacy" className="text-sm hover:text-green-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-green-500 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm mb-4">Subscribe to our newsletter for latest updates</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-500 text-sm"
              />
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-r-lg transition-colors">
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Padho Aur Badho. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;