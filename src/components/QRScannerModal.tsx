'use client';

import { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  AlertTriangle,
  CheckCircle2,
  Upload,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: (decodedData: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [fallbackInput, setFallbackInput] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    setScannedResult(null);

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setErrorMessage(
        'Camera API is not supported by your browser or environment. Please use image upload or manual input below.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      mediaStreamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Camera permission was denied. You can grant camera permission in browser settings or use manual input below.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage(
          'No camera hardware detected on this device. Use manual input or upload a QR image below.'
        );
      } else {
        setErrorMessage(
          `Unable to access camera: ${err.message || 'Device camera is busy or unavailable'}.`
        );
      }
    }
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleSuccess(code.data);
          return;
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  const handleSuccess = (data: string) => {
    setScannedResult(data);
    stopCamera();
    if (onScanSuccess) {
      onScanSuccess(data);
    }
  };

  // Handle uploaded QR image file fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleSuccess(code.data);
          } else {
            alert('Could not detect a valid QR code in the uploaded image. Please try another image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fallbackInput.trim()) {
      handleSuccess(fallbackInput.trim());
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">QR Scanner Demonstration</h3>
              <p className="text-[11px] text-slate-500">Live optical QR decoding & manual demo verification</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport or Error */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center shadow-inner">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning Reticle Frame */}
          {isScanning && !scannedResult && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-brand-500 rounded-2xl relative animate-pulse shadow-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-500 -mt-1 -ml-1 rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-500 -mt-1 -mr-1 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-500 -mb-1 -ml-1 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-500 -mb-1 -mr-1 rounded-br" />
                <div className="w-full h-0.5 bg-brand-400 absolute top-1/2 -translate-y-1/2 animate-bounce opacity-80" />
              </div>
            </div>
          )}

          {/* Error / Denial Notice Overlay */}
          {errorMessage && (
            <div className="absolute inset-0 p-6 bg-slate-900/90 text-white flex flex-col items-center justify-center text-center space-y-2">
              <AlertTriangle className="w-10 h-10 text-amber-400 animate-pulse" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">Camera Unavailable</h4>
              <p className="text-[11px] text-slate-300 max-w-xs">{errorMessage}</p>
              <button
                onClick={startCamera}
                className="mt-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Camera Access
              </button>
            </div>
          )}
        </div>

        {/* Decoded Result Presentation */}
        {scannedResult ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>QR Code Successfully Decoded!</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200 font-mono text-[11px] text-slate-800 break-all select-all">
              {scannedResult}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setScannedResult(null);
                  startCamera();
                }}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold text-xs transition"
              >
                Scan Another QR
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow transition"
              >
                Use Decoded Code
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <Smartphone className="w-4 h-4 text-brand-600" /> Point camera directly at the demo payment QR code
          </div>
        )}

        {/* Fallback Options: File Upload & Manual String */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
            Alternative / Fallback Options
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Upload Image Fallback */}
            <label className="p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/30 flex items-center justify-center gap-2 cursor-pointer font-bold text-slate-700 transition">
              <Upload className="w-4 h-4 text-brand-600" />
              <span>Upload QR Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Manual Code Fallback Form */}
            <form onSubmit={handleManualSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={fallbackInput}
                onChange={(e) => setFallbackInput(e.target.value)}
                placeholder="Paste QR payload..."
                className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
