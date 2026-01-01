import React from 'react';

const UploadZone = ({ onUpload, isReady }) => {
  return (
    <div className="upload-area max-w-3xl mx-auto">
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
            !isReady ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Choose PDF File
        </label>
        <input
          type="file"
          name="upload-file"
          id="upload-file"
          className="hidden"
          onChange={onUpload}
          disabled={!isReady}
        />
      </div>
    </div>
  );
};

export default UploadZone;