import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">TermsPage</h1>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsPage;
