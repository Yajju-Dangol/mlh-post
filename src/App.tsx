import React, { useState, useEffect, useRef } from 'react';
import { GenerationItem, PropertyFormData, SystemConfig } from './types';
import { INITIAL_GENERATIONS, INITIAL_FORM_DATA } from './data/initialData';
import { Header } from './components/Header';
import { PromptSection } from './components/PromptSection';
import { GenerationsGrid } from './components/GenerationsGrid';
import { GenerationModal } from './components/GenerationModal';
import {
  supabase,
  fetchPropertiesFromSupabase,
  savePropertyToSupabase,
  deletePropertyFromSupabase,
} from './lib/supabase';

export default function App() {
  const [formData, setFormData] = useState<PropertyFormData>(() => {
    const saved = localStorage.getItem('property_form_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_FORM_DATA;
      }
    }
    return INITIAL_FORM_DATA;
  });

  const [generations, setGenerations] = useState<GenerationItem[]>(() => {
    const saved = localStorage.getItem('mlh_post_generations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const [selectedCard, setSelectedCard] = useState<GenerationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingFromDb, setIsLoadingFromDb] = useState(true);

  // Fetch real properties stored in Supabase & system config on mount
  useEffect(() => {
    // 1. Fetch server config
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setSystemConfig(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch server config:', err);
      });

    // 2. Fetch all real properties stored in Supabase
    async function loadSupabaseData() {
      try {
        setIsLoadingFromDb(true);
        const supabaseItems = await fetchPropertiesFromSupabase();
        if (supabaseItems && supabaseItems.length > 0) {
          setGenerations(supabaseItems);
        } else {
          // Fallback to server route if direct client fetch returned empty
          const res = await fetch('/api/properties');
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            const formatted: GenerationItem[] = data.items.map((row: any) => ({
              id: row.id,
              number: row.number || `#${row.id.slice(-4)}`,
              title: row.title || row.property_type || 'Property Visual',
              propertyType: row.property_type || row.propertyType,
              location: row.location,
              price: row.price,
              highlights: row.highlights,
              prompt: row.prompt || '',
              imageUrl: row.image_url || row.imageUrl,
              engine: row.engine || 'bytedance/seedream-5.0-pro',
              ratio: row.ratio || '16:9',
              branding: row.branding || undefined,
              apiStatus: row.api_status || 'saved',
              createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent',
              tags: [
                { label: 'SAVED IN SUPABASE', bg: '#ecfdf5', text: '#059669' },
              ],
            }));
            setGenerations(formatted);
          }
        }
      } catch (e) {
        console.warn('Supabase initial fetch warning:', e);
      } finally {
        setIsLoadingFromDb(false);
      }
    }

    loadSupabaseData();

    // 3. Supabase Realtime channel for live updates
    const channel = supabase
      .channel('public_properties_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => {
          loadSupabaseData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save creations to localStorage as local cache
  useEffect(() => {
    localStorage.setItem('mlh_post_generations', JSON.stringify(generations));
  }, [generations]);

  // Save form data to localStorage
  useEffect(() => {
    localStorage.setItem('property_form_data', JSON.stringify(formData));
  }, [formData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerate = async () => {
    // Immediate lock check to strictly ensure only ONE request at a time
    if (isGeneratingRef.current || isGenerating) {
      console.warn('Generation already in flight, ignoring duplicate trigger.');
      return;
    }

    if (!formData.propertyType.trim()) {
      showToast('Please specify Property & Type.');
      return;
    }
    if (!formData.location.trim()) {
      showToast('Please specify Location.');
      return;
    }

    isGeneratingRef.current = true;
    setIsGenerating(true);

    try {
      // Call backend API /api/generate (Single request)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyType: formData.propertyType,
          location: formData.location,
          price: formData.price,
          highlights: formData.highlights,
          ratio: formData.ratio,
          referenceImage: formData.referenceImage,
          branding: formData.branding,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate visual');
      }

      const nextNum = 1001 + generations.length;

      const newGen: GenerationItem = {
        id: `gen-${Date.now()}`,
        number: `#${nextNum}`,
        title: formData.propertyType.split(',')[0] || 'Property Visual',
        propertyType: formData.propertyType,
        location: formData.location,
        price: formData.price,
        highlights: formData.highlights,
        prompt: data.compiledPayload?.compiledPrompt || `${formData.propertyType} located at ${formData.location}. ${formData.highlights}.`,
        imageUrl: data.imageUrl,
        engine: data.model || 'bytedance/seedream-5.0-pro',
        badge: data.apiStatus === 'gateway_success' ? 'SEEDREAM 5.0' : 'ARCHITECTURAL AI',
        createdAt: 'Just now',
        ratio: formData.ratio,
        referenceImage: formData.referenceImage,
        branding: formData.branding,
        compiledPrompt: data.compiledPayload?.compiledPrompt,
        apiStatus: data.apiStatus,
        compiledPayload: data.compiledPayload,
        tags: [
          { label: 'SAVED IN SUPABASE', bg: '#ecfdf5', text: '#059669' },
        ],
      };

      // Add to local state
      setGenerations((prev) => [newGen, ...prev]);

      // Persist to Supabase asynchronously
      savePropertyToSupabase(newGen).then((saved) => {
        if (saved) {
          console.log('[Supabase] Saved generation to database:', newGen.id);
        }
      });

      // Also try saving via backend endpoint
      fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGen),
      }).catch((e) => console.warn('Server Supabase sync warning:', e));

      showToast(`Generated #${nextNum} and stored in Supabase!`);
    } catch (err: any) {
      console.error('Generation failed:', err);
      showToast(err.message || 'Generation error. Please check inputs.');
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    setGenerations((prev) => prev.filter((item) => item.id !== id));
    if (selectedCard?.id === id) {
      setSelectedCard(null);
    }
    showToast('Visual removed from gallery.');
    // Delete from Supabase
    try {
      deletePropertyFromSupabase(id);
      fetch(`/api/properties/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {
      console.warn('Failed to delete from remote database:', e);
    }
  };

  const handleClearAllCards = () => {
    if (window.confirm('Are you sure you want to clear all property visuals from the gallery?')) {
      const idsToDelete = generations.map((g) => g.id);
      setGenerations([]);
      setSelectedCard(null);
      localStorage.removeItem('mlh_post_generations');
      showToast('All property visuals cleared from gallery.');

      // Remove from database
      idsToDelete.forEach((id) => {
        deletePropertyFromSupabase(id);
        fetch(`/api/properties/${id}`, { method: 'DELETE' }).catch(() => {});
      });
    }
  };

  const handleNewProductionItem = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Fill in property details above to generate visual.');
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#1a1a1e] font-sans antialiased flex flex-col selection:bg-black selection:text-white">
      {/* Top Header - Logo and Name only */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 pt-2 pb-16">
        {/* 4 Input Fields + Ratio & Reference Image Section + Branding */}
        <PromptSection
          formData={formData}
          setFormData={setFormData}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          systemConfig={systemConfig}
        />

        {/* Recent Generations Grid */}
        <GenerationsGrid
          items={generations}
          onSelectCard={setSelectedCard}
          onDeleteCard={handleDeleteCard}
          onClearAll={handleClearAllCards}
          onNewProductionItem={handleNewProductionItem}
          isGenerating={isGenerating}
          generatingData={formData}
          isLoading={isLoadingFromDb}
        />
      </main>

      {/* Detail / Inspection Lightbox Modal */}
      <GenerationModal
        item={selectedCard}
        onClose={() => setSelectedCard(null)}
        onDelete={(id) => {
          handleDeleteCard(id);
        }}
        onRemix={(remixedData) => {
          setFormData((prev) => ({
            ...prev,
            ...remixedData,
          }));
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast('Loaded property parameters for remixing!');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

