import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <svg className="w-10 h-10 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 19L12 4L21 19H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Monthly Subscriptions Tracker
      </span>
    </div>
  );
};

export default Logo;