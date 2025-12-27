export const constants = {
    ANALYZE_HEALTH_REPORT_PROMPT: `First, determine if this document is actually a health or medical report. Look for:
  - Patient information (age, gender, ID, or name)
  - Test results, lab values, vitals, or medical measurements
  - Medical terms, diagnoses, observations, or biomarkers
  - Dates, reference ranges, or clinical remarks
  
  If this is NOT a health report (e.g., resume, invoice, article, contract, manual, etc.), respond with:
  {
    "error": "This document does not appear to be a valid health or medical report. Please upload a proper health report containing medical test results or clinical information."
  }
  
  If this IS a health report, analyze it thoroughly and provide comprehensive feedback in this JSON format:
  {
    "overallHealthScore": "X/10",
    "keyFindings": [
      "finding 1",
      "finding 2",
      "finding 3"
    ],
    "potentialConcerns": [
      "concern 1",
      "concern 2",
      "concern 3"
    ],
    "normalIndicators": [
      "indicator 1",
      "indicator 2",
      "indicator 3"
    ],
    "summary": "Brief overall health assessment written in clear, non-alarming language",
    "healthMetrics": {
      "vitalSigns": X,
      "labResults": X,
      "riskIndicators": X,
      "reportClarity": X,
      "referenceRangeCompliance": X
    },
    "recommendedActions": [
      "specific actionable recommendation 1",
      "specific actionable recommendation 2",
      "specific actionable recommendation 3"
    ],
    "lifestyleSuggestions": [
      "suggestion 1",
      "suggestion 2",
      "suggestion 3"
    ],
    "followUpChecklist": [
      "follow-up item 1",
      "follow-up item 2",
      "follow-up item 3"
    ],
    "disclaimer": "This analysis is for informational purposes only and does not replace professional medical advice."
  }
  
  For healthMetrics, rate each area from 1–10 based on:
  
  - vitalSigns: Blood pressure, heart rate, BMI, temperature, oxygen saturation (if available). Assess whether values fall within standard healthy ranges.
  - labResults: Blood tests, urine tests, cholesterol, glucose, liver/kidney markers. Evaluate deviations from reference ranges.
  - riskIndicators: Signs of potential health risks such as high cholesterol, elevated glucose, abnormal blood pressure, or warning biomarkers.
  - reportClarity: Completeness, readability, structure, presence of reference ranges, and clarity of medical notes.
  - referenceRangeCompliance: How closely values align with standard medical reference ranges and whether abnormal values are clearly identified.
  
  For potentialConcerns, be cautious and non-diagnostic:
  - Highlight abnormal or borderline values
  - Avoid definitive medical diagnoses
  - Use phrases like "may indicate" or "could be associated with"
  
  For recommendedActions:
  - Suggest practical next steps (e.g., consult a physician, repeat tests, lifestyle adjustments)
  - Avoid prescribing medication
  - Keep recommendations general and safe
  
  For lifestyleSuggestions:
  - Provide general wellness advice (diet, hydration, activity, sleep, stress)
  - Keep suggestions non-specific and widely accepted
  
  For followUpChecklist:
  - Include items like additional tests, specialist consultation, or monitoring specific metrics over time
  
  Always maintain a calm, professional, and reassuring tone.
  Do NOT provide medical diagnoses.
  Do NOT prescribe medication.
  
  Document text:
  {{DOCUMENT_TEXT}}`
  };
  


  export const METRIC_CONFIG = [
    {
      key: "vitalSigns",
      label: "Vital Signs",
      defaultValue: 7,
      colorClass: "from-rose-400 to-pink-500",
      shadowClass: "group-hover/item:shadow-rose-500/30",
      icon: "❤️",
    },
    {
      key: "labResults",
      label: "Lab Results",
      defaultValue: 6,
      colorClass: "from-amber-300 to-yellow-400",
      shadowClass: "group-hover/item:shadow-amber-500/30",
      icon: "🧪",
    },
    {
      key: "riskIndicators",
      label: "Risk Indicators",
      defaultValue: 5,
      colorClass: "from-orange-400 to-red-500",
      shadowClass: "group-hover/item:shadow-orange-500/30",
      icon: "⚠️",
    },
    {
      key: "reportClarity",
      label: "Report Clarity",
      defaultValue: 7,
      colorClass: "from-sky-300 to-cyan-400",
      shadowClass: "group-hover/item:shadow-sky-500/30",
      icon: "📄",
    },
    {
      key: "referenceRangeCompliance",
      label: "Reference Range Compliance",
      defaultValue: 6,
      colorClass: "from-indigo-300 to-purple-400",
      shadowClass: "group-hover/item:shadow-indigo-500/30",
      icon: "📊",
    },
  ];


  
  export const buildPresenceChecklist = (text) => {
    const hay = (text || "").toLowerCase();
  
    return [
      {
        label: "Patient Information",
        present:
          /patient|name|age|gender|sex|dob|date of birth|patient id|mrn/.test(
            hay
          ),
      },
      {
        label: "Test Results / Measurements",
        present:
          /test|result|value|level|count|reading|measurement|lab|analysis|panel/.test(
            hay
          ),
      },
      {
        label: "Vital Signs",
        present:
          /blood pressure|bp|heart rate|pulse|bpm|respiratory rate|temperature|temp|oxygen saturation|spo2|weight|height|bmi/.test(
            hay
          ),
      },
      {
        label: "Laboratory Markers",
        present:
          /glucose|cholesterol|hdl|ldl|triglycerides|hemoglobin|hba1c|wbc|rbc|platelet|creatinine|urea|bun|alt|ast|bilirubin|alkaline phosphatase|sodium|potassium|calcium|uric acid|thyroid|tsh|t3|t4/.test(
            hay
          ),
      },
      {
        label: "Reference Ranges",
        present:
          /reference range|normal range|range|min|max|low|high|normal|abnormal/.test(
            hay
          ),
      },
      {
        label: "Abnormal or Flagged Values",
        present:
          /high|low|elevated|decreased|abnormal|borderline|out of range|flagged|critical/.test(
            hay
          ),
      },
      {
        label: "Clinical Notes / Remarks",
        present:
          /remark|comment|note|interpretation|observation|impression|finding|summary/.test(
            hay
          ),
      },
      {
        label: "Report Date",
        present:
          /date|reported on|collection date|sample date|issued on|report generated/.test(
            hay
          ),
      },
      {
        label: "Follow-up or Recommendations",
        present:
          /follow[- ]?up|recommend|advice|consult|repeat test|monitor|recheck|review/.test(
            hay
          ),
      },
    ];
  };
  