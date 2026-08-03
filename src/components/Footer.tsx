import { useState } from "react";
import { Phone, MapPin, Clock, Facebook, Instagram, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import otoMotorLogo from "@/assets/oto-motor-logo.png";

const Footer = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const { getPhoneNumber, getEmail, getAddress, getCityName, getOpeningHours, t } = useLanguage();
  const address = getAddress();
  const cityName = getCityName();

  const legalContent = {
    privacy: {
      title: t('legal.privacy_policy.title'),
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('legal.privacy_policy.section_2_1.title')}</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>{t('legal.privacy_policy.section_2_1.company_name')}:</strong> OTO MOTOR</p>
            <p><strong>{t('legal.privacy_policy.section_2_1.address')}:</strong> {address.full}</p>
            <p><strong>{t('legal.privacy_policy.section_2_1.phone')}:</strong> {getPhoneNumber()}</p>
          </div>
          <h3 className="text-lg font-semibold">{t('legal.privacy_policy.section_2_2.title')}</h3>
          <p>{t('legal.privacy_policy.section_2_2.intro')}</p>
          <ul className="list-disc pl-6 space-y-1">
            {t('legal.privacy_policy.section_2_2.items', { returnObjects: true }).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold">{t('legal.privacy_policy.section_2_3.title')}</h3>
          <p>{t('legal.privacy_policy.section_2_3.intro')}</p>
          <ul className="list-disc pl-6 space-y-1">
            {t('legal.privacy_policy.section_2_3.items', { returnObjects: true }).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold">{t('legal.privacy_policy.section_2_4.title')}</h3>
          <p>{t('legal.privacy_policy.section_2_4.content')}</p>
        </div>
      )
    },
    legal: {
      title: t('legal.legal_notice.title'),
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('legal.legal_notice.section_1_1.title')}</h3>
          <p>{t('legal.legal_notice.section_1_1.content')}</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>{t('legal.legal_notice.section_1_1.owner')}:</strong> OTO MOTOR</p>
            <p><strong>{t('legal.legal_notice.section_1_1.address')}:</strong> {address.full}</p>
            <p><strong>{t('legal.legal_notice.section_1_1.phone')}:</strong> {getPhoneNumber()}</p>
          </div>
          <h3 className="text-lg font-semibold">{t('legal.legal_notice.section_1_2.title')}</h3>
          <p>{t('legal.legal_notice.section_1_2.content')}</p>
          <ul className="list-disc pl-6 space-y-1">
            {t('legal.legal_notice.section_1_2.items', { returnObjects: true }).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold">{t('legal.legal_notice.section_1_3.title')}</h3>
          <p>{t('legal.legal_notice.section_1_3.content')}</p>
          <h3 className="text-lg font-semibold">{t('legal.legal_notice.section_1_4.title')}</h3>
          <p>{t('legal.legal_notice.section_1_4.content')}</p>
          <h3 className="text-lg font-semibold">{t('legal.legal_notice.section_1_5.title')}</h3>
          <p>{t('legal.legal_notice.section_1_5.content_prefix')} {cityName}{t('legal.legal_notice.section_1_5.content_suffix')}</p>
        </div>
      )
    },
    terms: {
      title: t('legal.terms_conditions.title'),
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('legal.terms_conditions.section_4_1.title')}</h3>
          <p>{t('legal.terms_conditions.section_4_1.intro')}</p>
          <ul className="list-disc pl-6 space-y-1">
            {t('legal.terms_conditions.section_4_1.items', { returnObjects: true }).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold">{t('legal.terms_conditions.section_4_2.title')}</h3>
          <ul className="list-disc pl-6 space-y-1">
            {t('legal.terms_conditions.section_4_2.items', { returnObjects: true }).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold">{t('legal.terms_conditions.section_4_3.title')}</h3>
          <p>{t('legal.terms_conditions.section_4_3.content')}</p>
          <h3 className="text-lg font-semibold">{t('legal.terms_conditions.section_4_4.title')}</h3>
          <p>{t('legal.terms_conditions.section_4_4.content')}</p>
          <h3 className="text-lg font-semibold">{t('legal.terms_conditions.section_4_5.title')}</h3>
          <p>{t('legal.terms_conditions.section_4_5.content')}</p>
          <h3 className="text-lg font-semibold">{t('legal.terms_conditions.section_4_6.title')}</h3>
          <p>{t('legal.terms_conditions.section_4_6.content_prefix')} {cityName}{t('legal.terms_conditions.section_4_6.content_suffix')}</p>
        </div>
      )
    },
    cookies: {
      title: t('legal.cookies.title'),
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('legal.cookies.section_3_1.title')}</h3>
          <p>{t('legal.cookies.section_3_1.content')}</p>
          <h3 className="text-lg font-semibold">{t('legal.cookies.section_3_2.title')}</h3>
          <p>{t('legal.cookies.section_3_2.content')}</p>
          <h3 className="text-lg font-semibold">{t('legal.cookies.section_3_3.title')}</h3>
          <p>{t('legal.cookies.section_3_3.content')}</p>
        </div>
      )
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white py-14">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <img src={otoMotorLogo} alt="OTO MOTOR Logo" className="h-14 object-contain brightness-0 invert" />
            </div>
            <p className="text-white/80 text-base leading-relaxed">
              {t('footer.company_description')} {cityName}.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.facebook.com/people/Oto-Motorsport-SL/61586883309321/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center transition-transform hover:scale-110"
              >
                <Facebook size={16} className="fill-current" />
              </a>
              <a
                href="https://www.instagram.com/otomotorsport/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full text-white flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white uppercase tracking-wide">{t('footer.contact_title')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-white" />
                <a href={`tel:${getPhoneNumber()}`} className="text-white/85 text-base hover:text-white transition-colors">{getPhoneNumber()}</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-white flex-shrink-0" />
                <a href={`mailto:${getEmail()}`} className="text-white/85 text-base hover:text-white transition-colors break-all">{getEmail()}</a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="text-white flex-shrink-0 mt-0.5" />
                <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-white/85 text-base hover:text-white transition-colors">{address.full}</a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white uppercase tracking-wide">{t('footer.services_title')}</h3>
            <ul className="space-y-2 text-white/85 text-base">
              <li><a href="/stock" className="hover:text-white transition-colors">{t('footer.services_list.vehicle_sales')}</a></li>
              <li><a href="/sell" className="hover:text-white transition-colors">{t('footer.services_list.vehicle_purchase')}</a></li>
              <li><a href="/financing" className="hover:text-white transition-colors">{t('footer.services_list.financing')}</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">{t('footer.services_list.delivery')}</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">{t('footer.services_list.vip_service')}</a></li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white uppercase tracking-wide">{t('footer.hours_title')}</h3>
            <ul className="space-y-2 text-white/85 text-base">
              {getOpeningHours().map((entry, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Clock size={16} className="text-white mt-1 shrink-0" />
                  <span className="w-24 shrink-0 text-white font-medium">{entry.label}</span>
                  <span className={entry.closed ? "text-white/60" : ""}>{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-[15px]">
              {t('footer.copyright')}{' '}<a href="https://infinit.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">INFINIT</a>
            </p>
            <div className="flex flex-wrap gap-4 text-[15px] text-white/70">
              <button onClick={() => setOpenModal('legal')} className="hover:text-white transition-colors">{t('footer.legal.legal_notice')}</button>
              <span>·</span>
              <button onClick={() => setOpenModal('privacy')} className="hover:text-white transition-colors">{t('footer.legal.privacy_policy')}</button>
              <span>·</span>
              <button onClick={() => setOpenModal('terms')} className="hover:text-white transition-colors">{t('footer.legal.terms_conditions')}</button>
              <span>·</span>
              <button onClick={() => setOpenModal('cookies')} className="hover:text-white transition-colors">{t('footer.legal.cookies')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      {Object.entries(legalContent).map(([key, content]) => (
        <Dialog key={key} open={openModal === key} onOpenChange={() => setOpenModal(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{content.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 text-sm text-muted-foreground">{content.content}</div>
          </DialogContent>
        </Dialog>
      ))}
    </footer>
  );
};

export default Footer;
