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
      reset()
    }finally{
      setIsLoading(false)
    }
  }

  const reset = () =>{
    setAnalysis("")
    setPresenceCheckList([])
    setReportText("")
    setUploadedFile(null)
  }


  console.log('analysis object', analysis)


  return (
    <main className='min-h-screen overflow-hidden bg-[url("/bg.png")] bg-cover bg-center bg-no-repeat'>
     <input type="file" name="upload-file" id="upload-file" onChange={handleUpload} />
    </main>
  )
}

export default App
