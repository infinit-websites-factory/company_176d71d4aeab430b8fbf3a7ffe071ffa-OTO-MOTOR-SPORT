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

const MAPS_QUERY = "C/ Islas Cíes, 4, 28970 Humanes de Madrid";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`;
const MAPS_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&output=embed`;

const ADDRESSES: Record<Language, AddressInfo> = {
  es: {
    street: "C/ Islas Cíes, 4",
    city: "28970 Humanes de Madrid",
    full: "C/ Islas Cíes, 4, 28970 Humanes de Madrid",
    mapsUrl: MAPS_URL,
    mapsEmbedUrl: MAPS_EMBED_URL
  },
  en: {
    street: "C/ Islas Cíes, 4",
    city: "28970 Humanes de Madrid",
    full: "C/ Islas Cíes, 4, 28970 Humanes de Madrid",
    mapsUrl: MAPS_URL,
    mapsEmbedUrl: MAPS_EMBED_URL
  },
  fr: {
    street: "C/ Islas Cíes, 4",
    city: "28970 Humanes de Madrid",
    full: "C/ Islas Cíes, 4, 28970 Humanes de Madrid",
    mapsUrl: MAPS_URL,
    mapsEmbedUrl: MAPS_EMBED_URL
  }
};

const OPENING_HOURS: Record<Language, { label: string; value: string; closed?: boolean }[]> = {
  es: [
    { label: "Lun – Vie", value: "10:00–14:00, 16:00–20:00" },
    { label: "Sábado", value: "Con cita previa" },
    { label: "Domingo", value: "Cerrado", closed: true },
  ],
  en: [
    { label: "Mon – Fri", value: "10:00–14:00, 16:00–20:00" },
    { label: "Saturday", value: "By appointment" },
    { label: "Sunday", value: "Closed", closed: true },
  ],
  fr: [
    { label: "Lun – Ven", value: "10h00–14h00, 16h00–20h00" },
    { label: "Samedi", value: "Sur rendez-vous" },
    { label: "Dimanche", value: "Fermé", closed: true },
  ],
};

const HOURS_SUMMARY: Record<Language, string> = {
  es: "Lun–Vie · Sáb con cita previa",
  en: "Mon–Fri · Sat by appointment",
  fr: "Lun–Ven · Sam sur rendez-vous",
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
    return "Humanes de Madrid";
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
