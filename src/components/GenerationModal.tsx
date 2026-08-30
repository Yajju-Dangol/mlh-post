import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
  Phone,
  Trash2,
} from 'lucide-react';
import { GenerationItem, PropertyFormData } from '../types';

interface GenerationModalProps {
  item: GenerationItem | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onRemix?: (propertyData: Partial<PropertyFormData>) => void;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({
  item,
  onClose,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const hasBranding = Boolean(
    item.branding &&
      (item.branding.logo ||
        item.branding.contact?.trim() ||
        item.branding.watermarkText?.trim())
  );

  const handleCopyDetails = () => {
    let text = `${item.propertyType}\nLocation: ${item.location}\nPrice: ${item.price}\nHighlights: ${item.highlights}`;
    if (item.branding?.contact) {
      text += `\nContact: ${item.branding.contact}`;
    }
    if (item.branding?.watermarkText) {
      text += `\nListing Tag: ${item.branding.watermarkText}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = item.imageUrl;
    link.download = `${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Big Image View */}
        <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-contain max-h-[60vh] md:max-h-[85vh]"
          />
        </div>

        {/* Right: Property details & Actions */}
        <div className="w-full md:w-88 p-6 flex flex-col justify-between overflow-y-auto bg-white">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400 uppercase">
                <span>{item.number}</span>
                <span>·</span>
                <span className="text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                  {item.ratio}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mt-1 leading-snug">
                {item.propertyType || item.title}
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-500 font-bold uppercase text-[10px]">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span>Location</span>
                </div>
                <div className="font-semibold text-gray-800 text-[13px]">
                  {item.location}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-500 font-bold uppercase text-[10px]">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span>Pricing</span>
                </div>
                <div className="font-bold text-gray-900 text-[14px]">
                  {item.price}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-500 font-bold uppercase text-[10px]">
                  <Sparkles className="w-3 h-3 text-gray-400" />
                  <span>Highlights</span>
                </div>
                <div className="text-gray-700 leading-relaxed font-medium">
                  {item.highlights}
                </div>
              </div>

              {hasBranding && (
                <div className="p-3 rounded-xl bg-gray-900 text-white space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-300 font-bold uppercase text-[10px]">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Branding Directives</span>
                  </div>
                  {item.branding?.contact && (
                    <div className="text-gray-200 font-mono text-[11px] truncate flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-gray-400" />
                      <span>{item.branding.contact}</span>
                    </div>
                  )}
                  {item.branding?.watermarkText && (
                    <div className="text-gray-300 text-[11px]">
                      {item.branding.watermarkText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <button
              type="button"
              onClick={handleCopyDetails}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Details Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Property Details</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this visual from gallery?')) {
                    onDelete(item.id);
                    onClose();
                  }
                }}
                className="w-full py-2 px-4 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Visual</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
