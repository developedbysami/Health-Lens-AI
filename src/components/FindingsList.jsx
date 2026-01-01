import React from 'react';

const FindingList = ({ type, items }) => {
 
  const isFindings = type === 'findings';
  
  const cardClass = isFindings 
    ? "section-card green-card group" 
    : "section-card orange-card group";
    
  const iconClass = isFindings
    ? "icon-container-rounded mx-auto text-emerald-100 bg-white/20 group-hover:bg-white/30 transition-colors"
    : "icon-container-rounded mx-auto text-amber-100 bg-white/20 group-hover:bg-white/30 transition-colors";
    
  const icon = isFindings ? "✓" : "!";
  const title = isFindings ? "Key Findings" : "Potential Concerns";

  return (
    <div className={cardClass}>
      <div className={iconClass}>
        {icon}
      </div>
      <p className="text-center mt-2 text-white font-semibold text-lg">
        {title}
      </p>
      {items?.map((item, i) => (
        <div
          key={i}
          className="text-white rounded-lg p-4 bg-black/10 my-4 flex items-center gap-3 hover:bg-black/20 transition-all duration-300 border border-white/10"
        >
          <span>•</span>
          <span className="text-sm font-medium">{item}</span>
        </div>
      ))}
    </div>
  );
};

export default FindingList;