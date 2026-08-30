import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  List,
  Image as ImageIcon,
  MapPin,
  ShieldCheck,
  Loader2,
  Download,
  Eye,
  Trash2,
} from 'lucide-react';
import { GenerationItem, PropertyFormData } from '../types';

interface GenerationsGridProps {
  items: GenerationItem[];
  onSelectCard: (item: GenerationItem) => void;
  onDeleteCard?: (id: string) => void;
  onClearAll?: () => void;
  onNewProductionItem: () => void;
  isGenerating?: boolean;
  generatingData?: PropertyFormData;
  isLoading?: boolean;
}

export const GenerationsGrid: React.FC<GenerationsGridProps> = ({
  items,
  onSelectCard,
  onDeleteCard,
  onClearAll,
  onNewProductionItem,
  isGenerating = false,
  generatingData,
  isLoading = false,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 50-second average progress estimation
  useEffect(() => {
    if (!isGenerating) {
      setElapsedSeconds(0);
      return;
    }

    setElapsedSeconds(0);
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 0.5);
    }, 500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Compute realistic progress percentage calibrated to ~50s average duration
  const getProgressPercentage = () => {
    if (elapsedSeconds <= 45) {
      // 0s to 45s reaches 90%
      return Math.min(90, Math.round((elapsedSeconds / 50) * 100));
    }
    if (elapsedSeconds <= 60) {
      // 45s to 60s softly advances from 90% to 96%
      const extra = ((elapsedSeconds - 45) / 15) * 6;
      return Math.min(96, Math.round(90 + extra));
    }
    // Beyond 60s gracefully creeps towards 98%
    return Math.min(98, Math.round(96 + ((elapsedSeconds - 60) / 30) * 2));
  };

  const progressPercent = getProgressPercentage();

  return (
    <div className="relative pt-6 pb-12 space-y-5">
      {/* Header Row: "Recent Property Visuals" + creations counter + Clear All button + Grid/List Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-bold text-[#141416] tracking-tight">
            Recent Property Visuals
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#ebecee] text-[11px] font-semibold text-[#636366]">
            {items.length + (isGenerating ? 1 : 0)} creations
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#ebecee]">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-black shadow-2xs'
                : 'text-[#8e8e93] hover:text-black'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white text-black shadow-2xs'
                : 'text-[#8e8e93] hover:text-black'
            }`}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2-Column Grid Container */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
            : 'space-y-4'
        }
      >
        {/* ACTIVE GENERATING ANIMATION CARD (TOP OF GALLERY) */}
        {isGenerating && (
          <div className="rounded-2xl bg-white border border-gray-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col transition-all duration-300">
            {/* Clean minimal generation canvas */}
            <div className="relative aspect-[16/10] w-full bg-[#fbfbfc] border-b border-gray-100 flex flex-col items-center justify-center p-6 text-center">
              {/* Top Meta */}
              {(generatingData?.price || generatingData?.ratio) && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  {generatingData?.price && (
                    <span className="px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-bold">
                      {generatingData.price}
                    </span>
                  )}
                  {generatingData?.ratio && (
                    <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 text-[10px] font-medium font-mono">
                      {generatingData.ratio}
                    </span>
                  )}
                </div>
              )}

              {/* Minimal Center Content */}
              <div className="relative z-10 flex flex-col items-center gap-3 w-full max-w-[260px]">
                <Loader2 className="w-7 h-7 text-black animate-spin" />

                <div className="space-y-0.5 text-center">
                  <h4 className="text-[13.5px] font-semibold text-gray-900">
                    Generating visual...
                  </h4>
                  <p className="text-[11.5px] text-gray-500">
                    Can take up to ~50 seconds
                  </p>
                </div>

                {/* Minimal Slim Progress Bar */}
                <div className="w-full space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10.5px] text-gray-500 font-mono">
                    <span>{Math.floor(elapsedSeconds)}s</span>
                    <span className="font-semibold text-gray-900">{progressPercent}%</span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-gray-200/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-black transition-all duration-300 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card Content for Generating State */}
            <div className="p-5 flex-1 flex flex-col justify-between bg-white">
              <div className="space-y-2">
                <h3 className="font-bold text-[15px] text-gray-900 truncate">
                  {generatingData?.propertyType || 'Rendering new property...'}
                </h3>

                {generatingData?.location && (
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{generatingData.location}</span>
                  </div>
                )}

                {generatingData?.highlights && (
                  <p className="text-[12.5px] text-gray-600 leading-relaxed font-normal bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    {generatingData.highlights}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100 text-[11px] text-gray-500">
                <span className="font-medium text-gray-700">Rendering in progress</span>
                <span className="font-mono text-gray-500">
                  {elapsedSeconds < 50
                    ? `~${Math.max(1, 50 - Math.floor(elapsedSeconds))}s left`
                    : 'Finalizing...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {items.map((item) => {
          const hasBranding = Boolean(
            item.branding &&
              (item.branding.logo ||
                item.branding.contact?.trim() ||
                item.branding.watermarkText?.trim())
          );

          return (
            <div
              key={item.id}
              onClick={() => onSelectCard(item)}
              className="group cursor-pointer rounded-2xl bg-white border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-gray-300 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Top Image Preview */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />

                {/* Top overlay badge for price or aspect ratio */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-bold tracking-wide shadow-sm">
                    {item.price}
                  </span>
                  {item.ratio && (
                    <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-black text-[10px] font-bold font-mono">
                      {item.ratio}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  {hasBranding && (
                    <div className="px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Branded</span>
                    </div>
                  )}
                  {item.referenceImage && (
                    <div className="px-2 py-1 rounded-lg bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1">
                      <span>Ref Used</span>
                    </div>
                  )}
                </div>

                {/* Optional Watermark Overlay at bottom of visual */}
                {hasBranding && item.branding?.watermarkText && (
                  <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-semibold tracking-wider uppercase pointer-events-none">
                    {item.branding.watermarkText}
                  </div>
                )}
              </div>

              {/* Bottom Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-[16px] text-[#141416] truncate">
                      {item.propertyType || item.title}
                    </h3>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-[10px] font-bold text-[#636366] uppercase tracking-wider shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[12px] text-[#636366]">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <p className="text-[13px] text-[#48484a] leading-relaxed font-normal bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    {item.highlights}
                  </p>
                </div>

                {/* Footer: Download & View & Delete Action Buttons */}
                <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCard(item);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = document.createElement('a');
                        link.href = item.imageUrl;
                        link.download = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
                        link.click();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-black hover:bg-gray-800 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    {onDeleteCard && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCard(item.id);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete visual"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-[#8e8e93]">
                    {item.createdAt}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Configuration Slot: New Production Item */}
        <div
          onClick={onNewProductionItem}
          className="cursor-pointer min-h-[360px] rounded-2xl border-2 border-dashed border-gray-200/90 bg-white/40 hover:bg-white/80 hover:border-gray-300 transition-all flex flex-col items-center justify-center p-8 text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200/80 shadow-2xs group-hover:shadow-xs flex items-center justify-center text-gray-400 group-hover:text-black mb-3 transition-colors">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h4 className="text-[14px] font-bold text-[#1c1c1e] group-hover:text-black">
            New Property Visual Post
          </h4>
          <p className="text-[12px] text-[#8e8e93] mt-0.5">
            Fill in the 4 parameters above to render
          </p>
        </div>
      </div>
    </div>
  );
};
