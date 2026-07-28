import { createContext, useContext, useState, ReactNode } from "react";
import { translations, TranslationKey } from "@/translations";

export type Language = "es" | "en" | "fr";

interface AddressInfo {
  street: string;
  city: string;
  full: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  getPhoneNumber: () => string;
  getPhoneNumberWithPrefix: () => string;
  getWhatsAppNumber: () => string;
  getEmail: () => string;
  getAddress: () => AddressInfo;
  getOpeningHours: () => { label: string; value: string; closed?: boolean }[];
  getHoursSummary: () => string;
  getCityName: () => string;
  getCurrency: () => string;
  getCurrencySymbol: () => string;
  formatPrice: (price: number) => string;
  t: (key: TranslationKey, options?: { returnObjects?: boolean }) => any;
  translateVehicleAttribute: (category: 'fuel' | 'transmission' | 'body_type' | 'color', value: string) => string;
}

const PHONE_NUMBERS = {
  es: "+34600749009",
  en: "+34600749009",
  fr: "+34600749009",
};

const EMAIL = "otomotor2013@gmail.com";

const MAPS_URL = "https://www.google.com/maps/place/OTO+Motor+Sport+SL/@40.4010822,-3.9984665,19.5z/data=!4m6!3m5!1s0xd41972fe334e1cd:0x8ed9162adbdbd02e!8m2!3d40.4011529!4d-3.9982816!16s%2Fg%2F11stm4ppb3";
const MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d537.1095864083261!2d-3.9984664581218397!3d40.40108224877727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd41972fe334e1cd%3A0x8ed9162adbdbd02e!2sOTO%20Motor%20Sport%20SL!5e0!3m2!1sen!2sin!4v1784570989990!5m2!1sen!2sin";

const ADDRESSES: Record<Language, AddressInfo> = {
  es: {
    street: "C. Cardeñas, 27B",
    city: "28690 Brunete, Madrid, España",
    full: "C. Cardeñas, 27B, 28690 Brunete, Madrid, España",
    mapsUrl: MAPS_URL,
    mapsEmbedUrl: MAPS_EMBED_URL
  },
  en: {
    street: "C. Cardeñas, 27B",
    city: "28690 Brunete, Madrid, Spain",
    full: "C. Cardeñas, 27B, 28690 Brunete, Madrid, Spain",
    mapsUrl: MAPS_URL,
    mapsEmbedUrl: MAPS_EMBED_URL
  },
  fr: {
    street: "C. Cardeñas, 27B",
    city: "28690 Brunete, Madrid, Espagne",
    full: "C. Cardeñas, 27B, 28690 Brunete, Madrid, Espagne",
    mapsUrl: MAPS_URL,
    mapsEmbedUrl: MAPS_EMBED_URL
  }
};

const OPENING_HOURS: Record<Language, { label: string; value: string; closed?: boolean }[]> = {
  es: [
    { label: "Lun – Mar", value: "9:00–14:00, 16:00–19:00" },
    { label: "Miércoles", value: "9:00–19:00" },
    { label: "Jue – Vie", value: "10:00–20:00" },
    { label: "Sáb – Dom", value: "Cerrado", closed: true },
  ],
  en: [
    { label: "Mon – Tue", value: "9:00–14:00, 16:00–19:00" },
    { label: "Wednesday", value: "9:00–19:00" },
    { label: "Thu – Fri", value: "10:00–20:00" },
    { label: "Sat – Sun", value: "Closed", closed: true },
  ],
  fr: [
    { label: "Lun – Mar", value: "9h00–14h00, 16h00–19h00" },
    { label: "Mercredi", value: "9h00–19h00" },
    { label: "Jeu – Ven", value: "10h00–20h00" },
    { label: "Sam – Dim", value: "Fermé", closed: true },
  ],
};

const HOURS_SUMMARY: Record<Language, string> = {
  es: "Lun–Vie · Sáb y Dom cerrado",
  en: "Mon–Fri · Sat & Sun closed",
  fr: "Lun–Ven · Sam & Dim fermé",
};

const CURRENCIES: Record<Language, { code: string; symbol: string }> = {
  es: { code: "EUR", symbol: "€" },
  en: { code: "EUR", symbol: "€" },
  fr: { code: "EUR", symbol: "€" }
};

const formatPhoneNumber = (phone: string, language: Language): string => {
  const digits = phone.substring(1);
  // Spanish format: +34 747 77 57 28
  return `+34 ${digits.substring(2, 5)} ${digits.substring(5, 7)} ${digits.substring(7, 9)} ${digits.substring(9)}`;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("es");

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const getPhoneNumber = () => {
    return formatPhoneNumber(PHONE_NUMBERS[language], language);
  };

  const getPhoneNumberWithPrefix = () => {
    return PHONE_NUMBERS[language];
  };

  const getWhatsAppNumber = () => {
    return PHONE_NUMBERS[language].substring(1);
  };

  const getEmail = () => {
    return EMAIL;
  };

  const getAddress = () => {
    return ADDRESSES[language];
  };

  const getOpeningHours = () => {
    return OPENING_HOURS[language];
  };

  const getHoursSummary = () => {
    return HOURS_SUMMARY[language];
  };

  const getCityName = () => {
    return "Brunete";
  };

  const getCurrency = () => {
    return CURRENCIES[language].code;
  };

  const getCurrencySymbol = () => {
    return CURRENCIES[language].symbol;
  };

  const formatPrice = (price: number): string => {
    const currency = CURRENCIES[language];
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const t = (key: TranslationKey, options?: { returnObjects?: boolean }): any => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (options?.returnObjects) {
      return value;
    }

    return typeof value === 'string' ? value : key;
  };

  const translateVehicleAttribute = (category: 'fuel' | 'transmission' | 'body_type' | 'color', value: string): string => {
    if (!value) return value;

    try {
      const translationKey = `vehicle_attributes.${category}.${value}` as TranslationKey;
      const translated = t(translationKey);

      if (translated === translationKey) {
        return value;
      }

      return translated;
    } catch {
      return value;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, getPhoneNumber, getPhoneNumberWithPrefix, getWhatsAppNumber, getEmail, getAddress, getOpeningHours, getHoursSummary, getCityName, getCurrency, getCurrencySymbol, formatPrice, t, translateVehicleAttribute }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
