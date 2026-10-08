'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Camera,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import QRScannerModal from './QRScannerModal';

interface QRCodeDisplayProps {
  amount: number;
  orderNumber: string;
  upiId?: string;
  onPaymentConfirmed: (referenceId: string) => void;
  confirming?: boolean;
}

export default function QRCodeDisplay({
  amount,
  orderNumber,
  upiId = 'demo-yashodhamart@okhdfcbank',
  onPaymentConfirmed,
  confirming = false,
}: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [customRefId, setCustomRefId] = useState(`UPI-DEMO-${Date.now().toString().slice(-6)}`);
  const [showRefInput, setShowRefInput] = useState(false);

  // Construct UPI deep-link URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    'YashodhaMart Superstore'
  )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${orderNumber}`)}`;

  useEffect(() => {
    async function generateQRCode() {
      try {
        const url = await QRCode.toDataURL(upiUri, {
          width: 260,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    }
    generateQRCode();
  }, [upiUri]);

  const copyToClipboard = (text: string, type: 'upi' | 'order') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-brand-500/30 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Title & Badge */}
      <div className="text-center space-y-2 border-b border-slate-100 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
          <QrCode className="w-3.5 h-3.5" /> UPI / QR Demo Payment Gateway
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Scan to Pay with Any UPI App
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Scan using PhonePe, Google Pay, Paytm, BHIM, or any UPI supported banking app.
        </p>
      </div>

      {/* College Project / Demo Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="block font-bold">College Project Demo Simulation:</strong>
          <span className="text-[11px] text-amber-800 leading-relaxed block">
            This checkout simulates a real UPI QR payment. Sensitive credentials (PIN/passwords) are NEVER requested. Complete externally and confirm below.
          </span>
        </div>
      </div>

      {/* QR Code Presentation Box */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-4">
        {/* Amount Box */}
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Order Payment Amount
          </span>
          <span className="text-3xl font-black text-slate-900 tracking-tight">
            ₹{amount.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Dynamic QR Code */}
        <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Scan QR Code to pay ₹${amount}`}
              className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl"
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
              Generating payment QR...
            </div>
          )}
        </div>

        {/* UPI Details Badges */}
        <div className="w-full max-w-sm space-y-2 text-xs">
          {/* UPI ID */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Merchant UPI ID
              </span>
              <span className="font-mono font-bold text-slate-800 text-xs">{upiId}</span>
            </div>
            <button
              onClick={() => copyToClipboard(upiId, 'upi')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-brand-600 transition flex items-center gap-1 font-semibold text-[11px]"
              title="Copy UPI ID"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Order ID */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Order ID Reference
              </span>
              <span className="font-mono font-bold text-slate-800 text-xs">{orderNumber}</span>
            </div>
            <button
              onClick={() => copyToClipboard(orderNumber, 'order')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-brand-600 transition flex items-center gap-1 font-semibold text-[11px]"
              title="Copy Order ID"
            >
              {copiedOrder ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOrder ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* QR Scanner Demonstration Button */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-200"
        >
          <Camera className="w-4 h-4 text-brand-600" /> Test Live Camera QR Scanner Demo
        </button>
      </div>

      {/* Confirmation Section */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">Demo Transaction Reference (UTR)</span>
          <button
            type="button"
            onClick={() => setShowRefInput(!showRefInput)}
            className="text-brand-600 hover:underline font-semibold text-[11px]"
          >
            {showRefInput ? 'Use Auto UTR' : 'Edit Reference UTR'}
          </button>
        </div>

        {showRefInput ? (
          <input
            type="text"
            value={customRefId}
            onChange={(e) => setCustomRefId(e.target.value)}
            placeholder="e.g. UPI-DEMO-948201 or Bank UTR"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
            <span>Ref: {customRefId}</span>
            <span className="text-emerald-700 font-sans font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
              Auto-Generated Demo UTR
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onPaymentConfirmed(customRefId)}
          disabled={confirming}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CheckCircle2 className="w-5 h-5" />
          {confirming ? 'Submitting Payment Confirmation...' : 'I Have Completed Payment'}
        </button>

        <p className="text-[11px] text-center text-slate-400">
          Clicking confirmation records order with status <strong>&quot;Demo Confirmation Submitted&quot;</strong> and completes your order.
        </p>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={(decoded) => {
          // If scanned, fill ref
          setCustomRefId(`SCANNED-QR-${Date.now().toString().slice(-4)}`);
          setShowScanner(false);
          alert(`QR successfully scanned and decoded:\n\n${decoded}`);
        }}
      />
    </div>
  );
}
