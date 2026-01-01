import { useState, useEffect } from "react";
import { puter } from "@heyputer/puter.js";
import { toast } from "react-toastify";
import { extractTextFromPdf } from "../services/pdfService";
import { analyzeHealthText } from "../aiService";


export const useHealthReport = () => {
  const [isAiReady, setIsAiReady] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | analyzing | success | error
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Check AI Readiness
  useEffect(() => {
    const checkAi = setInterval(() => {
      if (puter.ai.chat) {
        setIsAiReady(true);
        clearInterval(checkAi);
      }
    }, 1000);
    return () => clearInterval(checkAi);
  }, []);

  const processFile = async (file) => {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please Upload PDF file");
      return;
    }

    try {
      setStatus("analyzing");
      setUploadedFile(file);
      
      const text = await extractTextFromPdf(file);
      const result = await analyzeHealthText(text);
      
      if (result.error) throw new Error(result.error);
      
      setAnalysis(result);
      setStatus("success");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      resetState();
    }
  };

  const resetState = () => {
    setAnalysis(null);
    setUploadedFile(null);
    setStatus("idle");
  };

  return {
    isAiReady,
    status,
    uploadedFile,
    analysis,
    processFile,
    resetState
  };
};