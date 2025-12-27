import React, { useEffect, useState } from "react";
import { puter } from "@heyputer/puter.js";
import * as pdfjslib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";
import { toast } from "react-toastify";
import { buildPresenceChecklist, constants, METRIC_CONFIG } from "../constants";
pdfjslib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const App = () => {
  const [isAiReady, setIsAiReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [reportText, setReportText] = useState("");
  const [presenceCheckList, setPresenceCheckList] = useState([]);

  useEffect(() => {
    const checkAiReady = setInterval(() => {
      if (puter.ai.chat) {
        setIsAiReady(true);
        clearInterval(checkAiReady);
      }
    }, 3000);

    return () => clearInterval(checkAiReady);
  }, []);

  const extractPdf = async (file) => {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjslib.getDocument({ data: fileArrayBuffer }).promise;
    const text = await Promise.all(
      Array.from({ length: pdf.numPages }, async (_, i) => {
        const page = await pdf.getPage(i + 1);
        const pageTextContent = await page.getTextContent();
        const tc = pageTextContent?.items?.map((tc) => tc.str).join(" ");
        return tc;
      })
    );
    return text.join("\n").trim();
  };

  const parseJson = (reply) => {
    const match = reply.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : {};
    try {
      if (!parsed.overallHealthScore && !parsed.error) {
        throw new Error("Invalid AI response");
      }
      return parsed;
    } catch (error) {
      console.log("Error Encountered: ", error.message);
      toast.error(error.message);
    }
  };

  const analyzeReport = async (text) => {
    const prompt = constants.ANALYZE_HEALTH_REPORT_PROMPT.replace(
      "{{DOCUMENT_TEXT}}",
      text
    );
    const response = await puter.ai.chat(
      [
        {
          role: "system",
          content: "You are a professional health report reviewer",
        },
        { role: "user", content: prompt },
      ],
      { model: "gpt-4o" }
    );
    const reply = parseJson(
      typeof response === "string" ? response : response?.message?.content || ""
    );
    if (reply.error) {
      throw new Error(reply.error);
    }
    return reply;
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    try {
      if (!file || file.type !== "application/pdf") {
        throw new Error("Please Upload PDF file");
      }

      // clear up and update states
      setIsLoading(true);
      setUploadedFile(file);
      setReportText("");
      setPresenceCheckList([]);
      setAnalysis("");

      const text = await extractPdf(file);

      // after receiving the text
      setReportText(text);
      setAnalysis(await analyzeReport(text));
      setPresenceCheckList(buildPresenceChecklist(text));
    } catch (error) {
      console.log("Error Encountered: ", error.message);
      toast.error(error.message);
      handleReset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis("");
    setPresenceCheckList([]);
    setReportText("");
    setUploadedFile(null);
  };

  console.log("analysis object", analysis);

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-teal-50 to-slate-100 flex items-center justify-center font-jakarta">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full px-4">
        {/* HEADING  */}
        {!uploadedFile && (
          <div className="text-center space-y-5">
            <h1 className="text-slate-800 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-wide">
              AI Health Report Analyzer
            </h1>
            <p className="text-teal-600 text-sm sm:text-base font-medium uppercase tracking-wide">
              Upload your PDF health report and get instant AI feedback
            </p>
          </div>
        )}
        {/* UPLOAD AREA & ALL CARDS  */}
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-6">
          {/* UPLOAD AREA  */}
          {!uploadedFile && (
            <div className="upload-area">
              <div className="upload-zone">
                <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl drop-shadow-sm">
                  📄
                </span>
                <div className="text-center">
                  <h2 className="text-3xl text-white font-bold drop-shadow-md">
                    Upload your Report
                  </h2>
                  <span className="text-white/90 text-sm sm:text-base font-medium">
                    PDF files only • Get instant analysis
                  </span>
                </div>
                <label
                  htmlFor="upload-file"
                  className={`btn-primary ${
                    !isAiReady ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Choose PDF File
                </label>
                <input
                  type="file"
                  name="upload-file"
                  id="upload-file"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={!isAiReady}
                />
              </div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-4">
              <div className="loading-spinner" />
              <div className="text-center text-slate-600">
                <h3 className="text-lg sm:text-xl font-semibold">
                  Analyzing your Report
                </h3>
                <span className="text-sm sm:text-base">
                  Please wait while AI reviews your report...
                </span>
              </div>
            </div>
          )}

          {uploadedFile && analysis && (
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
              <button className="btn-secondary" onClick={handleReset}>
                New Analysis
              </button>
            </div>
          )}

          {/* ALL CARDS INSIDE THIS  */}
          {analysis && (
            <div className="space-y-6">
              {/* OVERAL HEALTH SCORE CARD  */}
              <div
                className="section-card group bg-white border border-slate-200 space-y-4 text-center
  flex flex-col items-center
  "
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">🏆</span>
                  <p className="text-3xl text-slate-700 font-bold">
                    Overall Health Score
                  </p>
                </div>

                <span className="text-slate-800 text-3xl sm:text-5xl lg:text-8xl font-black">
                  {analysis.overallHealthScore
                    ? analysis.overallHealthScore
                    : "7"}
                </span>
                <div
                  className={`
      inline-flex gap-2 rounded-full px-6 py-2 border
      ${
        parseInt(analysis?.overallHealthScore) >= 8
          ? "health-status-excellent"
          : parseInt(analysis?.overallHealthScore) >= 6
          ? "health-status-good"
          : "health-status-improvement"
      }
      `}
                >
                  <span className="text-xl sm:text-2xl">
                    {parseInt(analysis?.overallHealthScore) >= 8
                      ? "🌟"
                      : parseInt(analysis?.overallHealthScore) >= 6
                      ? "⭐"
                      : "📉"}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold">
                    {parseInt(analysis?.overallHealthScore) >= 8
                      ? "Excellent"
                      : parseInt(analysis?.overallHealthScore) >= 6
                      ? "Good"
                      : "Improvements Needed"}
                  </span>
                </div>
                <div className="progress-bar mt-2">
                  <div
                    className={`
      w-full rounded-full h-full shadow-sm transition-all duartion-1000 ease-out 
      ${
        parseInt(analysis?.overallHealthScore) >= 8
          ? "progress-excellent"
          : parseInt(analysis?.overallHealthScore) >= 6
          ? "progress-good"
          : "progress-improvement"
      }

      `}
                    style={{
                      width: `${parseInt(analysis?.overallHealthScore) * 10}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* KEY FINDINGS AND POTENTIAL CONCERNS  */}

              <div className="grid sm:grid-cols-2 gap-4">
                {/* LEFT  */}
                <div className="section-card green-card group">
                  <div className="icon-container-rounded mx-auto text-emerald-100 bg-white/20 group-hover:bg-white/30 transition-colors">
                    ✓
                  </div>
                  <p className="text-center mt-2 text-white font-semibold text-lg">
                    Key Findings
                  </p>
                  {analysis?.keyFindings?.map((find, i) => (
                    <div
                      key={i}
                      className="text-white rounded-lg p-3 bg-black/10 my-4 flex items-start gap-3 hover:bg-black/20 transition-all duration-300 border border-white/10"
                    >
                      <span className="mt-1">•</span>
                      <span className="text-sm font-medium">{find}</span>
                    </div>
                  ))}
                </div>
                {/* RIGHT  */}
                <div className="section-card orange-card group">
                  <div className="icon-container-rounded mx-auto text-amber-100 bg-white/20 group-hover:bg-white/30 transition-colors">
                    !
                  </div>
                  <p className="text-center mt-2 text-white font-semibold text-lg">
                    Potential Concerns
                  </p>
                  {analysis?.potentialConcerns?.map((concern, i) => (
                    <div
                      key={i}
                      className="text-white rounded-lg p-3 bg-black/10 my-4 flex items-start gap-3 hover:bg-black/20 transition-all duration-300 border border-white/10"
                    >
                      <span className="mt-1">•</span>
                      <span className="text-sm font-medium">{concern}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}

              <div className="file-info-card hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="icon-container">
                    <span className="text-3xl">📋</span>
                  </div>
                  <span className="text-white text-xl font-bold">
                    Executive Summary
                  </span>
                </div>
                <div className="p-4 sm:p-6 rounded-xl bg-white/20 backdrop-blur-md mt-4 border border-white/10">
                  <p className="text-white leading-relaxed font-medium">
                    {analysis?.summary}
                  </p>
                </div>
              </div>

              {/* REPORT METRICS  */}

              <div className="file-info-card hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="icon-container">
                    <span className="text-3xl">📊</span>
                  </div>
                  <span className="text-white text-xl font-bold">
                    Health Metrics
                  </span>
                </div>

                {METRIC_CONFIG?.map((cfg, i) => {
                  const value =
                    analysis?.healthMetrics[cfg.key] ?? cfg.defaultValue;
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
                          className={`h-full transition-all duration-1000 w-full rounded-full shadow-sm
 bg-linear-to-r ${cfg?.colorClass}
  `}
                          style={{ width: `${value * 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LIFESTYLE SUGGESTIONS  */}

              <div className="file-info-card hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="icon-container">
                    <span className="text-3xl">🔑</span>
                  </div>
                  <span className="text-white text-xl font-bold">
                    Lifestyle Suggestions
                  </span>
                </div>
                <div>
                  {analysis?.lifestyleSuggestions?.map((suggestion, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 my-4 p-4 sm:p-5 rounded-xl bg-white/20 backdrop-blur-md mt-4 text-white border border-white/10"
                    >
                      <span>•</span>
                      <span className="font-medium">{suggestion}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 my-4 p-4 sm:p-6 rounded-xl bg-slate-900/30 mt-6 text-white border border-white/5">
                  <span className="text-2xl">💡</span>
                  <p className="text-sm sm:text-base opacity-90">
                    Consider incorporating these health indicators naturally
                    into your routine to better understand your overall wellness
                    and identify areas for improvement.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* ALL CARDS INSIDE THIS DIV  */}
        </div>
      </div>
    </main>
  );
};

export default App;
