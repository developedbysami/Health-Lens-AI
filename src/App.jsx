import React, { useEffect, useState } from 'react'
import { puter } from "@heyputer/puter.js";
import * as pdfjslib from 'pdfjs-dist'
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url"
import { toast } from 'react-toastify';
import { buildPresenceChecklist, constants } from '../constants';
pdfjslib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const App = () => {

  const [isAiReady, setIsAiReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [analysis, setAnalysis] = useState("")
  const [reportText, setReportText] = useState("")
  const [presenceCheckList, setPresenceCheckList] = useState([])

  useEffect(()=>{
    const checkAiReady = setInterval(() => {
      if(puter.ai.chat){
        setIsAiReady(true)
        clearInterval(checkAiReady)
      }
    }, 3000);

    return () => clearInterval(checkAiReady)
  },[])


  const extractPdf = async (file) =>{
    const fileArrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjslib.getDocument({data: fileArrayBuffer}).promise
     const text = await Promise.all(
      Array.from({length: pdf.numPages}, async (_,i)=>{
        const page = await pdf.getPage(i + 1)
        const pageTextContent = await page.getTextContent()
        const tc = pageTextContent?.items?.map(tc=>tc.str).join(" ")
        return tc
       })
     )
     return text.join("\n").trim()
  }

  const parseJson = (reply) =>{
    const match = reply.match(/\{[\s\S]*\}/)
    const parsed = match ? JSON.parse(match[0]) : {}
    try {
      if(!parsed.overallHealthScore && !parsed.error){
        throw new Error("Invalid AI response")
      }
      return parsed
    } catch (error) {
      console.log("Error Encountered: ", error.message)
      toast.error(error.message)
    }
  }

  const analyzeReport = async (text) =>{
    const prompt = constants.ANALYZE_HEALTH_REPORT_PROMPT.replace('{{DOCUMENT_TEXT}}',text)
    const response = await puter.ai.chat(
      [
        {role:'system', content:"You are a professional health report reviewer"},
        {role:'user', content:prompt},     
      ],
      {model:"gpt-4o"}
    )
    const reply = parseJson(typeof response === 'string' ? response : response?.message?.content || "")
    if(reply.error){
      throw new Error(reply.error)
    }
    return reply
  }


  const handleUpload = async (e) =>{
    const file = e.target.files[0]
    try {
      if(!file || file.type !== 'application/pdf'){
        throw new Error("Please Upload PDF file")
      }

      // clear up and update states
      setIsLoading(true) 
      setUploadedFile(file)
      setReportText("")
      setPresenceCheckList([])
      setAnalysis("")

      const text = await extractPdf(file)
      
      // after receiving the text 
      setReportText(text)
      setAnalysis(await analyzeReport(text))
      setPresenceCheckList(buildPresenceChecklist(text))

    } catch (error) {
      console.log('Error Encountered: ',error.message)
      toast.error(error.message)
      handleReset()
    }finally{
      setIsLoading(false)
    }
  }

  const handleReset = () =>{
    setAnalysis("")
    setPresenceCheckList([])
    setReportText("")
    setUploadedFile(null)
  }


  console.log('analysis object', analysis)


  return (
   <main className='min-h-screen bg-linear-to-b from-[#D2D8DD] to-[#E9E0D7] flex items-center justify-center'>
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
    {/* HEADING  */}
    <div className='text-center space-y-5'>
      <h1 className='text-[#566679] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold'>AI Health Report Analyzer</h1>
      <p className='text-[#7399CB] text-sm sm:text-base font-semibold'>Upload your PDF health report and get instant AI feedback</p>
    </div>
    {/* UPLOAD AREA & ALL CARDS  */}
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      {/* UPLOAD AREA  */}
      {
        !uploadedFile && (
    <div className="upload-area">
    <div className="upload-zone">
      <span className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl'>📄</span>
      <div className='text-center'>
      <h2 className='text-3xl text-[#566679] font-semibold'>Upload your Report</h2>
      <span className='text-[#2f4c72] text-sm sm:text-base'>PDF files only • Get instant analysis</span>
      </div>
      <label htmlFor="upload-file" className={`btn-primary ${!isAiReady 
        ? "opacity-50 cursor-not-allowed" : ""
      }`}>Choose PDF File</label>
      <input type="file" name="upload-file" id="upload-file" className='hidden' onChange={handleUpload} disabled={!isAiReady}/>
    </div>
  </div>
        )
      }

  {
    isLoading && (
      <div className='space-y-4'>
        <div className="loading-spinner"/>
        <div className='text-center'>
        <h3 className='text-lg sm:text-xl font-semibold'>Analyzing your Report</h3>
        <span className='text-sm sm:text-base'>Please wait while AI reviews your report...</span>
        </div>
      </div>
    )
  }

  {
    uploadedFile && analysis && (
      <div className="file-info-card">
        <div>
          <div className='flex items-start gap-2'>
          <div className="icon-container ">
            <span className='text-2xl sm:text-4xl'>📄</span>
          </div>
          <div>
          <h3 className='text-lg sm:text-xl text-white font-semibold'>Analysis Complete</h3>
          <p className='text-white'>{uploadedFile?.name}</p>
          </div>
          </div>
        </div>
        <button className='btn-secondary' onClick={handleReset}>
      New Analysis
        </button>
      </div>
    )
  }


  {/* OVERAL HEALTH SCORE CARD  */}
  
  {
    analysis && (
      <div className="section-card group bg-linear-to-br from-[#D2D8DD] to-blue-300 space-y-4 text-center
  flex flex-col items-center
  ">
    <div className='flex items-center justify-center'>
      <span className='text-3xl'>🏆</span>
      <p className='text-3xl text-white font-bold'>Overall Health Score</p>
    </div>
    <span className='text-blue-500 text-3xl sm:text-5xl lg:text-8xl font-bold'>
      {
        analysis.overallHealthScore ? analysis.overallHealthScore : "7" 
      }
    </span>
    <div className={`
      inline-flex gap-2 rounded-full px-4 py-2 
      ${parseInt(analysis?.overallHealthScore) >= 8 ?
        'health-status-excellent'
        : parseInt(analysis?.overallHealthScore) >= 6 ?
        'health-status-good' : 'health-status-improvement'
      }
      `}>
        <span className='text-xl sm:text-2xl'>
        {parseInt(analysis?.overallHealthScore) >= 8 ?
        '🌟'
        : parseInt(analysis?.overallHealthScore) >= 6 ?
        '⭐' : '📉'
      }
        </span>
        <span className='text-xl sm:text-2xl'>
        {parseInt(analysis?.overallHealthScore) >= 8 ?
        'Excellent'
        : parseInt(analysis?.overallHealthScore) >= 6 ?
        'Good' : 'Improvements Needed'
      }
        </span>
    </div>
    <div className="progress-bar">
    <div className={`
      w-full rounded-full h-full shadow-md transition-all duartion-1000 ease-out 
      ${
        parseInt(analysis?.overallHealthScore) >= 8 ?
        'progress-excellent'
        : parseInt(analysis?.overallHealthScore) >= 6 ?
        'progress-good' : 'progress-improvement'     
      }

      `}
      style={{
        width: `${(parseInt(analysis?.overallHealthScore)) * 10}%`
      }}
      ></div>  
    </div>
  </div>



)
}
{/* ALL CARDS INSIDE THIS DIV  */}
    </div>
    
    

      {/* Everything would remain under these 2 elements */}
    </div>
   </main>
  )
}

export default App
