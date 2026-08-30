import React, { useState } from 'react';
import {
  X,
  Upload,
  Phone,
  ShieldCheck,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { BrandingData } from '../types';

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingData;
  onSave: (data: BrandingData) => void;
}

export const BrandingModal: React.FC<BrandingModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSave,
}) => {
  const [localData, setLocalData] = useState<BrandingData>(branding);

  // Sync state when modal opens
  React.useEffect(() => {
    setLocalData(branding);
  }, [branding, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localData);
    onClose();
  };

  const handleClearAll = () => {
    const empty: BrandingData = {
      logo: null,
      contact: '',
      watermarkText: '',
    };
    setLocalData(empty);
    onSave(empty);
    onClose();
  };

  const hasAnyBranding =
    Boolean(localData.logo) ||
    localData.contact.trim() !== '' ||
    localData.watermarkText.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800">
              <ShieldCheck className="w-4 h-4 text-[#141416]" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#141416] tracking-tight">
                Branding & Watermark
              </h2>
              <p className="text-[12px] text-[#8e8e93]">
                Configure agency logo, contact info, and watermark overlay
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Detail 1: Logo (Disabled - Model Incompatible) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#636366] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                1. Agency / Realtor Logo
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md uppercase tracking-wide">
                Model Incompatible
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50/80 select-none">
              {/* Underlying Disabled View */}
              <div className="p-4 flex flex-col items-center justify-center text-center opacity-30">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-1.5">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-gray-600">
                  Click to upload logo or drag & drop
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Transparent PNG recommended
                </div>
              </div>

              {/* Model Incompatible Full Overlay */}
              <div className="absolute inset-0 bg-gray-900/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-3 cursor-not-allowed">
                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Model Incompatible</span>
                </div>
                <p className="text-[11px] text-gray-300 mt-1 font-medium">
                  Image input is not supported by current text-to-image model
                </p>
              </div>
            </div>
          </div>

          {/* Detail 2: Contact */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#636366] uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>2. Contact Details</span>
            </label>
            <input
              type="text"
              value={localData.contact}
              onChange={(e) =>
                setLocalData((prev) => ({ ...prev, contact: e.target.value }))
              }
              placeholder='e.g., "+91 98765 43210 | info@realty.com"'
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200/80 text-[14px] text-[#1c1c1e] placeholder:text-[#8e8e93] font-medium focus:bg-white focus:outline-none focus:border-gray-400 focus:shadow-2xs transition-all"
            />
          </div>

          {/* Detail 3: Watermark Text */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#636366] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              <span>3. Watermark Text</span>
            </label>
            <input
              type="text"
              value={localData.watermarkText}
              onChange={(e) =>
                setLocalData((prev) => ({ ...prev, watermarkText: e.target.value }))
              }
              placeholder='e.g., "Exclusive Listing · Verified Property"'
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200/80 text-[14px] text-[#1c1c1e] placeholder:text-[#8e8e93] font-medium focus:bg-white focus:outline-none focus:border-gray-400 focus:shadow-2xs transition-all"
            />
          </div>

          {/* Mini Live Preview of Branding */}
          {hasAnyBranding && (
            <div className="rounded-2xl border border-gray-200 bg-gray-900 p-3 relative overflow-hidden text-white shadow-inner">
              <div className="text-[10px] font-mono uppercase text-gray-400 mb-2">
                Live Watermark & Brand Preview
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {localData.logo ? (
                    <img
                      src={localData.logo}
                      alt="Brand Preview"
                      className="w-6 h-6 object-contain rounded bg-white/10 p-0.5"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-[10px] font-bold">
                      RE
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] font-bold leading-tight">
                      {localData.watermarkText || 'Property Watermark'}
                    </div>
                    {localData.contact && (
                      <div className="text-[10px] text-gray-300 font-mono">
                        {localData.contact}
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded bg-white/20 text-[9px] font-bold uppercase tracking-wider">
                  Branded
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-gray-500 hover:text-rose-600 transition-colors"
          >
            Clear Branding
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
