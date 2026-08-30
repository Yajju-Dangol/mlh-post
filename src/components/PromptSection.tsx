import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  Building2,
  MapPin,
  Tag,
  Sparkle,
  ShieldCheck,
} from 'lucide-react';
import { PropertyFormData, BrandingData, SystemConfig } from '../types';
import { BrandingModal } from './BrandingModal';

interface PromptSectionProps {
  formData: PropertyFormData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  onGenerate: () => void;
  isGenerating: boolean;
  systemConfig?: SystemConfig | null;
}

type FieldMode = 'select' | 'text';

const PROPERTY_TYPE_OPTIONS = [
  'M/1/6 — The Classic (4 BHK Luxury Villa)',
  'M/1/12A — The Contemporary (4 BHK Signature Villa)',
  'LDA Approved Luxury Residential Plot',
  '3 BHK Instant Villa (Turnkey Construction)',
  'Golf-Side Premium Gated Villa',
];

const LOCATION_OPTIONS = [
  'Ansal Golf City, Shaheed Path, Lucknow',
  'M1 Villa Avenue, Sector E, Ansal Golf City, Lucknow',
  'Gomti Nagar Extension, Lucknow',
  'Sushant Golf City, Lucknow',
  'Amar Shaheed Path Corridor, Lucknow',
];

const PRICE_OPTIONS = [
  '₹2.5 Cr onwards',
  '₹1.85 Cr onwards',
  '₹3.2 Cr onwards',
  'Price on Request / At Source Price',
  '₹95 Lacs onwards (Plots)',
];

const HIGHLIGHTS_OPTIONS = [
  '3,210 sq.ft · Main Road Facing · LDA Approved',
  '2,887 sq.ft · North-East Facing · Sculpted Terrace',
  'Golf-side Living · 24x7 Manned Gate · Corner Plot',
  'Up to 2,500 sq.ft Plot · 9 Months to Keys',
  'Prime Enclave · 5 Mins to Shaheed Path · Clear Titles',
];

export const PromptSection: React.FC<PromptSectionProps> = ({
  formData,
  setFormData,
  onGenerate,
  isGenerating,
}) => {
  const [ratioOpen, setRatioOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);

  // Field input modes: default is 'select' for each field
  const [fieldModes, setFieldModes] = useState<Record<string, FieldMode>>({
    propertyType: 'select',
    location: 'select',
    price: 'select',
    highlights: 'select',
  });

  const handleModeToggle = (field: string, mode: FieldMode) => {
    setFieldModes((prev) => ({
      ...prev,
      [field]: mode,
    }));
  };

  const ratios = [
    { label: '16:9', desc: 'Landscape / Web' },
    { label: '1:1', desc: 'Square / Instagram' },
    { label: '9:16', desc: 'Story / Reel' },
    { label: '4:3', desc: 'Standard Flyer' },
    { label: '21:9', desc: 'Ultrawide Banner' },
  ];

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveBranding = (brandingData: BrandingData) => {
    setFormData((prev) => ({
      ...prev,
      branding: brandingData,
    }));
  };

  const isFormValid =
    formData.propertyType.trim() !== '' &&
    formData.location.trim() !== '' &&
    formData.price.trim() !== '' &&
    formData.highlights.trim() !== '';

  const hasBranding = Boolean(
    formData.branding &&
    (formData.branding.logo ||
      formData.branding.contact.trim() !== '' ||
      formData.branding.watermarkText.trim() !== '')
  );

  return (
    <div className="space-y-5 pt-4 pb-2">
      {/* Top Header Row with Title */}
      <div>
        <h1 className="text-[30px] md:text-[34px] font-bold tracking-tight text-[#141416]">
          Generate High Quality Property Post
        </h1>
        <p className="text-[13px] text-[#636366] mt-0.5">
          Fill in or select the 4 property parameters below to craft instant high-impact architectural visuals.
        </p>
      </div>

      {/* Main Container: 4 Required Input Fields + Ratio & Reference Image Upload */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 transition-all space-y-5">

        {/* 4 Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Field 1: Property & Type */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#636366] uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span>Property & Type</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>

              {/* Mode Toggle: Select vs Text */}
              <div className="flex items-center bg-gray-100/90 p-0.5 rounded-lg border border-gray-200/80 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleModeToggle('propertyType', 'select')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${fieldModes.propertyType === 'select'
                    ? 'bg-white text-black font-bold shadow-2xs'
                    : 'text-gray-500 hover:text-black'
                    }`}
                >
                  Select
                </button>
                <button
                  type="button"
                  onClick={() => handleModeToggle('propertyType', 'text')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${fieldModes.propertyType === 'text'
                    ? 'bg-white text-black font-bold shadow-2xs'
                    : 'text-gray-500 hover:text-black'
                    }`}
                >
                  Text
                </button>
              </div>
            </div>

            {fieldModes.propertyType === 'select' ? (
              <div className="relative">
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl bg-gray-50/70 border border-gray-200/80 text-[14px] text-[#1c1c1e] font-medium focus:bg-white focus:outline-none focus:border-gray-400 focus:shadow-2xs transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Property & Type...</option>
                  {PROPERTY_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  {/* Keep current custom value if not in standard list */}
                  {formData.propertyType &&
                    !PROPERTY_TYPE_OPTIONS.includes(formData.propertyType) && (
                      <option value={formData.propertyType}>
                        {formData.propertyType} (Custom)
                      </option>
                    )}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <input
                type="text"
                value={formData.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                placeholder='e.g., "4 BHK Luxury Villa, Ansal Golf City"'
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200/80 text-[14px] text-[#1c1c1e] placeholder:text-[#8e8e93] font-medium focus:bg-white focus:outline-none focus:border-gray-400 focus:shadow-2xs transition-all"
              />
            )}
          </div>

          {/* Field 2: Location */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#636366] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>Location</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>

              {/* Mode Toggle: Select vs Text */}
              <div className="flex items-center bg-gray-100/90 p-0.5 rounded-lg border border-gray-200/80 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleModeToggle('location', 'select')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${fieldModes.location === 'select'
                    ? 'bg-white text-black font-bold shadow-2xs'
                    : 'text-gray-500 hover:text-black'
                    }`}
                >
                  Select
                </button>
                <button
                  type="button"
                  onClick={() => handleModeToggle('location', 'text')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${fieldModes.location === 'text'
                    ? 'bg-white text-black font-bold shadow-2xs'
                    : 'text-gray-500 hover:text-black'
                    }`}
                >
                  Text
                </button>
              </div>
            </div>

            {fieldModes.location === 'select' ? (
              <div className="relative">
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl bg-gray-50/70 border border-gray-200/80 text-[14px] text-[#1c1c1e] font-medium focus:bg-white focus:outline-none focus:border-gray-400 focus:shadow-2xs transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Location...</option>
                  {LOCATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  {formData.location &&
                    !LOCATION_OPTIONS.includes(formData.location) && (
                      <option value={formData.location}>
                        {formData.location} (Custom)
                      </option>
                    )}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder='e.g., "Sushant Golf City, Lucknow"'
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200/80 text-[14px] text-[#1c1c1e] placeholder:text-[#8e8e93] font-medium focus:bg-white focus:outline-none focus:border-gray-400 focus:shadow-2xs transition-all"
              />
            )}
          </div>

          {/* Field 3: Price */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#636366] uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                <span>Price</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>

              {/* Mode Toggle: Select vs Text */}
              <div className="flex items-center bg-gray-100/90 p-0.5 rounded-lg border border-gray-200/80 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleModeToggle('price', 'select')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${fieldModes.price === 'select'
                    ? 'bg-white text-black font-bold shadow-2xs'
                    : 'text-gray-500 hover:text-black'
                    }`}
                >
                  Select
                </button>
                <button
                  type="button"
                  onClick={() => handleModeToggle('price', 'text')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${fieldModes.price === 'text'
                    ? 'bg-white text-black font-bold shadow-2xs'
                    : 'text-gray-500 hover:text-black'
                    }`}
                >
                  Text
                </button>
              </div>
            </div>

            {fieldModes.price === 'select' ? (
              <div className="relative">
                <select
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl bg-gray-50/70 border border-gray-200/80 text-[14px] text-[#1c1c1e] font-medium focus:bg-white focus:outline-none focus:border-gray-400 focus:shadow-2xs transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Price Range...</option>
                  {PRICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  {formData.price && !PRICE_OPTIONS.includes(formData.price) && (
                    <option value={formData.price}>
                      {formData.price} (Custom)
                    </option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <input
                type="text"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder='e.g., "₹2.5 Cr onwards"'
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200/80 text-[14px] text-[#1c1c1e] placeholder:text-[#8e8e93] font-medium focus:bg-white focus:outline-none focus:border-gray-400 focus:shadow-2xs transition-all"
              />
            )}
          </div>

          {/* Field 4: Highlights */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#636366] uppercase tracking-wider">
                <Sparkle className="w-3.5 h-3.5 text-gray-400" />
                <span>Highlights</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>

              {/* Mode Toggle: Select vs Text */}
              <div className="flex items-center bg-gray-100/90 p-0.5 rounded-lg border border-gray-200/80 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleModeToggle('highlights', 'select')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${fieldModes.highlights === 'select'
                    ? 'bg-white text-black font-bold shadow-2xs'
                    : 'text-gray-500 hover:text-black'
                    }`}
                >
                  Select
                </button>
                <button
                  type="button"
                  onClick={() => handleModeToggle('highlights', 'text')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${fieldModes.highlights === 'text'
                    ? 'bg-white text-black font-bold shadow-2xs'
                    : 'text-gray-500 hover:text-black'
                    }`}
                >
                  Text
                </button>
              </div>
            </div>

            {fieldModes.highlights === 'select' ? (
              <div className="relative">
                <select
                  value={formData.highlights}
                  onChange={(e) => handleInputChange('highlights', e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl bg-gray-50/70 border border-gray-200/80 text-[14px] text-[#1c1c1e] font-medium focus:bg-white focus:outline-none focus:border-gray-400 focus:shadow-2xs transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Highlights...</option>
                  {HIGHLIGHTS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  {formData.highlights &&
                    !HIGHLIGHTS_OPTIONS.includes(formData.highlights) && (
                      <option value={formData.highlights}>
                        {formData.highlights} (Custom)
                      </option>
                    )}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <input
                type="text"
                value={formData.highlights}
                onChange={(e) => handleInputChange('highlights', e.target.value)}
                placeholder='e.g., "3000 sq.ft · Corner plot · Ready to move"'
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/70 border border-gray-200/80 text-[14px] text-[#1c1c1e] placeholder:text-[#8e8e93] font-medium focus:bg-white focus:outline-none focus:border-gray-400 focus:shadow-2xs transition-all"
              />
            )}
          </div>
        </div>

        {/* Bottom Row: Aspect Ratio Pill + Reference Image Upload (Optional) + Branding Button + Generate Button */}
        <div className="pt-2 border-t border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          <div className="flex flex-wrap items-center gap-3">
            {/* Aspect Ratio Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRatioOpen(!ratioOpen)}
                className="flex items-center gap-2.5 h-[42px] px-3.5 rounded-xl bg-gray-50/80 hover:bg-gray-100 border border-gray-200/80 text-xs font-semibold text-[#1c1c1e] transition-all shadow-2xs"
              >
                <span className="text-[10px] font-bold text-[#8e8e93] uppercase">RATIO:</span>
                <span className="px-2 py-0.5 rounded bg-black text-white text-[11px] font-bold">
                  {formData.ratio}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {ratioOpen && (
                <div className="absolute top-[48px] left-0 w-48 bg-white rounded-xl border border-gray-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Select Aspect Ratio
                  </div>
                  {ratios.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => {
                        handleInputChange('ratio', r.label);
                        setRatioOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${formData.ratio === r.label
                        ? 'bg-gray-100 font-bold text-black'
                        : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <span className="font-mono font-bold">{r.label}</span>
                      <span className="text-[10px] text-gray-400">{r.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BRANDING BUTTON */}
            <button
              type="button"
              onClick={() => setIsBrandingOpen(true)}
              className={`flex items-center gap-2 h-[42px] px-3.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${hasBranding
                ? 'border-gray-900 bg-[#121214] text-white hover:bg-black'
                : 'border-gray-200/80 bg-gray-50/80 hover:bg-gray-100 text-[#1c1c1e]'
                }`}
              title="Set logo, contact, and watermark branding details"
            >
              <ShieldCheck
                className={`w-3.5 h-3.5 ${hasBranding ? 'text-white' : 'text-gray-400'
                  }`}
              />
              <span>Branding</span>
              {hasBranding ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-white leading-none">
                  ON
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
              )}
            </button>
          </div>

          {/* Right Action: Generate Button */}
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !isFormValid}
            className="flex items-center justify-center gap-2 px-7 py-2.5 rounded-full bg-[#121214] hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Property Visual...</span>
              </>
            ) : (
              <>
                <span>Generate</span>
                <Sparkles className="w-3.5 h-3.5 fill-white" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Branding Popup Modal */}
      <BrandingModal
        isOpen={isBrandingOpen}
        onClose={() => setIsBrandingOpen(false)}
        branding={
          formData.branding || {
            logo: null,
            contact: '',
            watermarkText: '',
          }
        }
        onSave={handleSaveBranding}
      />
    </div>
  );
};
