"use client";

import { useState } from 'react';

interface ShareResultsProps {
  score?: number;
  company?: string;
  role?: string;
  onShare?: () => void;
}

export function ShareResults({ score = 8.5, company = "Google", role = "Software Engineer", onShare }: ShareResultsProps) {
  const [isShared, setIsShared] = useState(false);

  const handleShare = () => {
    // Simulate sharing
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
    onShare?.();
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Share Your Success</h3>
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">🎉 Interview Complete!</div>
          <div className="text-xl text-purple-300 mb-1">Score: {score}/10</div>
          <div className="text-gray-300">{company} - {role}</div>
          <div className="text-sm text-gray-400 mt-2">Practiced with InterviewPro</div>
        </div>
      </div>
      <button
        onClick={handleShare}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
      >
        <span>{isShared ? '✅ Shared!' : '📤 Share on Social Media'}</span>
      </button>
      <p className="text-xs text-gray-400 text-center mt-2">
        Showcase your progress and inspire others!
      </p>
    </div>
  );
}