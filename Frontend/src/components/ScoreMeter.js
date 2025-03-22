import React, { useState } from 'react';
import { Award, User, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScoreMeter = ({ score, sections }) => {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const getScoreColor = (value) => {
    if (value >= 80) return 'from-yellow-500 to-green-500';
    if (value <= 80) return 'from-red-500 to-yellow-500';
    return 'from-red-500 to-red-600';
  };

  const lowestScore = Math.min(...sections.map(s => s.score));
  const highestScore = Math.max(...sections.map(s => s.score));

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="bg-blue- rounded-xl shadow-lg p-3 mb-4 w-3x1">
      {/* Score Meter Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Main Score */}
        <div className="flex items-center space-x-8">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-blue-600 transition-all duration-1000"
                strokeWidth="10"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <Award className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <span className="text-xl text-gray-800">{score}%</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Overall Score</h2>
            <p className="text-xl text-gray-600 mt-2">Resume Performance</p>
          </div>
        </div>

        {/* Score Range Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-5 w-42 h-32">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-xl font-medium text-gray-600">Highest</span>
            </div>
            <p className="text-xl font-bold text-gray-800 mt-2">{highestScore}%</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-5 w-42 h-32">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2 transform rotate-180" />
              <span className="text-xl font-medium text-gray-600">Lowest</span>
            </div>
            <p className="text-xl font-bold text-gray-800 mt-2">{lowestScore}%</p>
          </div>
        </div>



        {/* Score Range Bar */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-medium text-gray-600">Score Range</span>
            <span className="text-xl font-bold text-gray-800">
              {lowestScore}% - {highestScore}%
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Profile Button */}
      <div className="absolute top-0 right-0 py-3">
        <button
          className="flex items-center px-3 py-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 focus:outline-none  ml-9"
          onClick={() => setShowLogout(!showLogout)}
        >
          <User className="h-6 w-6 " />
  
        </button>

        {/* Logout Button with Transition */}
        <div
          className={`transition-all duration-300 ease-in-out mr-1 transform ${
            showLogout
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <button
            className="mt-5 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none text-lg w-full "
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreMeter;