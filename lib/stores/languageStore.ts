import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'es' | 'en' | 'fr' | 'de' | 'it';

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'es',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper para obtener textos en el idioma seleccionado
export const useTranslation = () => {
  const { language } = useLanguageStore();

  return {
    language,
    t: (translations: { es?: string; en?: string; fr?: string; de?: string; it?: string }) => {
      return translations[language] || translations.es || '';
    },
  };
};
