import React from "react";

const SummaryCard = ({ text }) => {
  return (
    <div className="file-info-card hover:scale-[1.02] transition-transform duration-300 bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="icon-container w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-3xl">📋</span>
        </div>
        <span className="text-white text-xl font-bold">
          Executive Summary
        </span>
      </div>
      
      <div className="p-4 sm:p-6 rounded-xl bg-white/10 backdrop-blur-md mt-6 border border-white/10">
        <p className="text-white leading-relaxed font-medium">
          {text || "No summary available."}
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;