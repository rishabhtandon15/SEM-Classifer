import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleFileChange = (selectedFile) => {
    // Reset states
    setResult(null);
    setError(null);
    
    // Check if it's an image
    if (!selectedFile.type.match('image.*')) {
      setError("Please select a valid image file (PNG, JPG, TIFF)");
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const analyzeImage = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed. Ensure the backend is running.');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-mesh"></div>
      <div className="app-container">
        <header className="header">
          <h1 className="title">Nanoparticle Classifier</h1>
          <p className="subtitle">
            Upload SEM or TEM microscopic images to instantly identify and classify 
            nanomaterials like Carbon Nanotubes and Diamond Nanoparticles.
          </p>
        </header>

        <main className="main-content">
          {/* Upload Section */}
          <div className="glass-panel">
            <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Image Input</h2>
            
            {!preview ? (
              <div 
                className={`upload-area ${isDragging ? 'drag-active' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInput} 
                  accept="image/png, image/jpeg, image/tiff, image/tif" 
                  style={{ display: 'none' }} 
                />
                <UploadCloud className="upload-icon" />
                <p className="upload-text">Click or drag image to upload</p>
                <p className="upload-hint">Supports PNG, JPG, JPEG, TIFF</p>
              </div>
            ) : (
              <div className="preview-container">
                <img src={preview} alt="Upload preview" className="preview-image" />
                <button 
                  className="btn" 
                  style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)' }}
                  onClick={() => { setPreview(null); setFile(null); setResult(null); }}
                >
                  Clear Image
                </button>
              </div>
            )}

            {error && (
              <div className="error-message">
                <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                {error}
              </div>
            )}

            <button 
              className="btn" 
              onClick={analyzeImage}
              disabled={!file || isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>

          {/* Result Section */}
          <div className="glass-panel">
            <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Analysis Result</h2>
            
            <div className="result-card">
              {isLoading ? (
                <div className="result-placeholder">
                  <div className="spinner"></div>
                  <p style={{ marginTop: '1.5rem' }}>Running deep learning model...</p>
                </div>
              ) : result ? (
                <div className="result-content">
                  <p className="result-label">Detected Material</p>
                  <h3 className="result-value">{result.class_name}</h3>
                  
                  <div style={{ marginTop: '2rem' }}>
                    <div className="confidence-text">
                      <span>Confidence Score</span>
                      <span>{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="confidence-bar-container">
                      <div 
                        className="confidence-bar" 
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center' }}>
                    <CheckCircle2 color="#10b981" size={24} style={{ marginRight: '1rem' }} />
                    <p style={{ color: 'var(--text-main)' }}>Analysis complete. High-confidence classification achieved.</p>
                  </div>
                </div>
              ) : (
                <div className="result-placeholder">
                  <CheckCircle2 className="result-icon" />
                  <p>Upload an image and click analyze to see results here.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
