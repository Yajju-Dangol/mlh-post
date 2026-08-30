export interface BrandingData {
  logo: string | null;
  contact: string;
  watermarkText: string;
}

export interface PropertyFormData {
  propertyType: string;
  location: string;
  price: string;
  highlights: string;
  ratio: string;
  referenceImage: string | null;
  branding?: BrandingData;
}

export interface GenerationItem {
  id: string;
  number: string;
  title: string;
  prompt: string;
  propertyType: string;
  location: string;
  price: string;
  highlights: string;
  imageUrl: string;
  engine: string;
  badge?: string;
  tags?: { label: string; bg: string; text: string }[];
  sharedText?: string;
  avatars?: string[];
  createdAt: string;
  ratio: string;
  guidanceScale?: number;
  referenceImage?: string | null;
  branding?: BrandingData;
  compiledPrompt?: string;
  apiStatus?: string;
  compiledPayload?: {
    model: string;
    size: string;
    aspectRatio: string;
    compiledPrompt: string;
    hasReferenceImage: boolean;
    hasBranding: boolean;
  };
}

export interface PlaygroundSettings {
  engine: string;
  ratio: string;
}

export interface SystemConfig {
  model: string;
  gatewayUrl: string;
  hasApiKey: boolean;
  internalPrompt: string;
}
