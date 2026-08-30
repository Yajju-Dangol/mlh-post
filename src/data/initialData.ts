import { GenerationItem, PlaygroundSettings, PropertyFormData } from '../types';

export const INITIAL_FORM_DATA: PropertyFormData = {
  propertyType: '',
  location: '',
  price: '',
  highlights: '',
  ratio: '16:9',
  referenceImage: null,
  branding: {
    logo: null,
    contact: '',
    watermarkText: '',
  },
};

export const INITIAL_GENERATIONS: GenerationItem[] = [];

export const INITIAL_SETTINGS: PlaygroundSettings = {
  engine: 'bytedance/seedream-5.0-pro',
  ratio: '16:9',
};

