import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, X, RefreshCw, Check, Upload, AlertCircle, 
  FlipHorizontal, Sparkles, Image as ImageIcon, ArrowLeft 
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isInitializing, setIsInitializing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start Camera Stream
  const startCamera = async (mode: 'user' | 'environment') => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop existing stream first
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser or upload a screenshot/photo below.');
      } else {
        setCameraError(err.message || 'Unable to access camera. You can upload a photo or screenshot instead.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Clean up on close
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setCameraError(null);
    onClose();
  };

  // Capture current video frame to canvas
  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);

    // Stop live stream to save resources
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Switch facing mode (Front / Back camera)
  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Handle local file upload (screenshot or photo)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCapturedImage(event.target.result);
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirm image and send to AI
  const handleConfirmImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl shadow-indigo-950/90 text-slate-200">
        
        {/* Header Bar with Prominent Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-600/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <span>AI Vision Camera & Scanner</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800 font-mono">
                  Multimodal Gemini
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Snap a website screenshot, screen photo, or document for instant AI analysis
              </p>
            </div>
          </div>

          <button
            id="camera-modal-close-btn"
            onClick={handleClose}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md"
            title="Close Camera"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Close (X)</span>
          </button>
        </div>

        {/* Main Camera Viewfinder or Image Preview */}
        <div className="my-4 relative rounded-2xl bg-black overflow-hidden border border-slate-800 aspect-video flex items-center justify-center">
          
          {capturedImage ? (
            // Photo Preview Screen
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 backdrop-blur-md">
                <Check className="w-3.5 h-3.5" />
                <span>Photo Captured</span>
              </div>
            </div>
          ) : cameraError ? (
            // Error / Fallback Screen
            <div className="p-6 text-center space-y-3 max-w-md">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{cameraError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto shadow-md"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Screenshot / Image File</span>
              </button>
            </div>
          ) : (
            // Live Video Stream Screen
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Viewfinder Target Guidelines */}
              <div className="absolute inset-4 pointer-events-none border border-cyan-400/30 rounded-xl flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-cyan-400/60 rounded-full animate-ping opacity-20" />
                <span className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400/80 bg-slate-900/60 px-1.5 py-0.5 rounded">
                  LIVE VIEWFINDER
                </span>
              </div>

              {/* Flip camera control on top right */}
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-md text-xs font-bold transition-all flex items-center gap-1 shadow-lg"
                title="Switch between front and back camera"
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px]">{facingMode === 'environment' ? 'Rear Cam' : 'Front Cam'}</span>
              </button>
            </div>
          )}

          {/* Hidden Canvas for Frame Capturing */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Hidden File Input for fallback / upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Action Controls Toolbar */}
        <div className="space-y-3">
          {capturedImage ? (
            // Actions when image is ready
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                id="camera-attach-btn"
                onClick={handleConfirmImage}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Attach to AI Assistant</span>
              </button>
            </div>
          ) : (
            // Actions when live camera is running
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                title="Select image from computer / mobile"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Upload File</span>
              </button>

              <button
                type="button"
                id="camera-snapshot-btn"
                onClick={handleTakePhoto}
                disabled={isInitializing || !!cameraError}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40"
              >
                <Camera className="w-4 h-4 text-cyan-200" />
                <span>Take Photo / Snapshot</span>
              </button>
            </div>
          )}

          {/* Footer Back & Info */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel / Go Back</span>
            </button>
            <span>Multi-modal Gemini 2.5/3.0 Vision Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
