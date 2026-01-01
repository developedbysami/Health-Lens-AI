import React from "react";

const LifestyleSuggestions = ({ items = [] }) => {
  return (
    <div className="file-info-card hover:scale-[1.02] transition-transform duration-300 bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        <div className="icon-container w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-3xl">🔑</span>
        </div>
        <span className="text-white text-xl font-bold">
          Lifestyle Suggestions
        </span>
      </div>

      <div className="space-y-4">
        {items.map((suggestion, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/5 transition-colors hover:bg-white/20"
          >
            <span className="font-bold">•</span>
            <span className="font-medium leading-relaxed">{suggestion}</span>
          </div>
        ))}
        
        {items.length === 0 && (
            <p className="text-white/50 italic">No suggestions generated.</p>
        )}
      </div>

      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 mt-8 text-white border border-white/5">
        <span className="text-2xl">💡</span>
        <p className="text-sm sm:text-base opacity-90">
          Consider incorporating these health indicators naturally
          into your routine to better understand your overall wellness.
        </p>
      </div>
    </div>
  );
};

export default LifestyleSuggestions;