import React from 'react';

const MetricsGrid = ({ metrics, config }) => {
  return (
    <div className="file-info-card hover:scale-[1.02]">
      <div className="flex items-center gap-4">
        <div className="icon-container">
          <span className="text-3xl">📊</span>
        </div>
        <span className="text-white text-xl font-bold">
          Health Metrics
        </span>
      </div>

      {config?.map((cfg, i) => {
        const value = metrics?.[cfg.key] ?? cfg.defaultValue;
        return (
          <div key={i} className="space-y-2 my-5">
            <div className="flex items-center justify-between text-white font-medium">
              <div className="flex items-center gap-2">
                <span>{cfg?.icon}</span>
                <span>{cfg?.label}</span>
              </div>
              <span>{value}/10</span>
            </div>
            <div className="progress-bar-small bg-black/20">
              <div
                className={`h-full transition-all duration-1000 w-full rounded-full shadow-sm bg-linear-to-r ${cfg?.colorClass}`}
                style={{ width: `${value * 10}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsGrid;