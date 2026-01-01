import React from "react";
import { useHealthReport } from "./hooks/useHealthReport";
import { METRIC_CONFIG } from "../constants";

import UploadZone from "./components/UploadZone";
import HealthScore from "./components/HealthScore";
import FindingsList from "./components/FindingsList";
import MetricsGrid from "./components/MetricsGrid";
import SummaryCard from "./components/SummaryCard";
import LifestyleSuggestions from "./components/LifestyleSuggestions";

const App = () => {
  const { 
    isAiReady, 
    status, 
    uploadedFile, 
    analysis, 
    processFile, 
    resetState 
  } = useHealthReport();

  const handleUpload = (e) => {
    processFile(e.target.files[0]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 flex items-center justify-center font-jakarta py-10">
      <div className="max-w-5xl w-full px-4 space-y-8">
        {!uploadedFile && (
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-slate-800">
              AI Health Report Analyzer
            </h1>
            <p className="text-teal-600 font-medium">
              Upload your PDF health report and get instant AI feedback
            </p>
          </div>
        )}

        {status === "idle" && (
          <UploadZone 
            onUpload={handleUpload} 
            isReady={isAiReady} 
          />
        )}

        {status === "analyzing" && (
          <div className="text-center py-20">
            <div className="loading-spinner mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">
              Analyzing your Report...
            </h3>
          </div>
        )}

        {status === "success" && analysis && (
          <div className="space-y-8 fade-in-animation">
            <div className="file-info-card flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <div className="flex items-start gap-3">
                  <div className="icon-container">
                    <span className="text-2xl sm:text-4xl">📄</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl text-white font-bold">
                      Analysis Complete
                    </h3>
                    <p className="text-white/80 text-sm">
                      {uploadedFile?.name}
                    </p>
                  </div>
                </div>
              </div>
              <button className="btn-secondary" onClick={resetState}>
                New Analysis
              </button>
            </div>

            <HealthScore score={analysis.overallHealthScore} />

            <div className="grid md:grid-cols-2 gap-6">
              <FindingsList type="findings" items={analysis.keyFindings} />
              <FindingsList type="warning" items={analysis.potentialConcerns} />
            </div>

            <SummaryCard text={analysis.summary} />

            <MetricsGrid 
              metrics={analysis.healthMetrics} 
              config={METRIC_CONFIG} 
            />

            <LifestyleSuggestions items={analysis.lifestyleSuggestions} />
          </div>
        )}
      </div>
    </main>
  );
};

export default App;
