import React from 'react';

const HealthScore = ({ score }) => {
  const safeScore = score ? parseInt(score) : 7;
  
  return (
    <div className="section-card group bg-white border border-slate-200 space-y-4 text-center flex flex-col items-center">
      <div className="flex items-center justify-center gap-2">
        <span className="text-3xl">🏆</span>
        <p className="text-3xl text-slate-700 font-bold">
          Overall Health Score
        </p>
      </div>

      <span className="text-slate-800 text-3xl sm:text-5xl lg:text-8xl font-black">
        {score ? score : "7"}
      </span>
      
      <div
        className={`
          inline-flex gap-2 rounded-full px-6 py-2 border
          ${
            safeScore >= 8
              ? "health-status-excellent"
              : safeScore >= 6
              ? "health-status-good"
              : "health-status-improvement"
          }
        `}
      >
        <span className="text-xl sm:text-2xl">
          {safeScore >= 8 ? "🌟" : safeScore >= 6 ? "⭐" : "📉"}
        </span>
        <span className="text-xl sm:text-2xl font-bold">
          {safeScore >= 8
            ? "Excellent"
            : safeScore >= 6
            ? "Good"
            : "Improvements Needed"}
        </span>
      </div>
      
      <div className="progress-bar mt-2">
        <div
          className={`
            w-full rounded-full h-full shadow-sm transition-all duartion-1000 ease-out 
            ${
              safeScore >= 8
                ? "progress-excellent"
                : safeScore >= 6
                ? "progress-good"
                : "progress-improvement"
            }
          `}
          style={{
            width: `${safeScore * 10}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default HealthScore;