import { useLanguage } from "@/contexts/LanguageContext";
import whatsappLogo from "@/assets/whatsapp-logo.png";

const WHATSAPP_MESSAGES: Record<string, string> = {
  es: "Hola OTO MOTOR",
  en: "Hello OTO MOTOR",
  fr: "Bonjour OTO MOTOR",
};

const WHATSAPP_ARIA: Record<string, string> = {
  es: "Contactar por WhatsApp",
  en: "Contact via WhatsApp",
  fr: "Contacter par WhatsApp",
};

const FloatingWhatsApp = () => {
  const { getWhatsAppNumber, language } = useLanguage();
  const message = encodeURIComponent(WHATSAPP_MESSAGES[language] || WHATSAPP_MESSAGES.es);

  return (
    <a
      href={`https://wa.me/${getWhatsAppNumber()}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 shadow-elegant transition-all duration-300 hover:scale-110"
      aria-label={WHATSAPP_ARIA[language] || WHATSAPP_ARIA.es}
    >
      <img
        src={whatsappLogo}
        alt="WhatsApp"
        className="w-full h-full object-contain"
      />
    </a>
  );
};

export default FloatingWhatsApp;
