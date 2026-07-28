import { useState } from "react";
import { Phone, MapPin, Clock, Mail, ExternalLink, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import PageHeader from "@/components/PageHeader";
import SEO from "@/components/SEO";
import contactBackground from "@/assets/contact.png";
import officeImage from "@/assets/oto-motor-office.jpg";
import showroomImage from "@/assets/oto-motor-showroom.jpg";

const OFFICE_BADGE: Record<string, string> = {
  es: "Nuestras Oficinas",
  en: "Our Office",
  fr: "Nos Bureaux",
};
const OPEN_MAPS_LABEL: Record<string, string> = {
  es: "Abrir en Google Maps",
  en: "Open in Google Maps",
  fr: "Ouvrir dans Google Maps",
};
const DIRECTIONS_LABEL: Record<string, string> = {
  es: "Cómo llegar",
  en: "Directions",
  fr: "Itinéraire",
};
const OPEN_NOW_LABEL: Record<string, string> = { es: "Abierto ahora", en: "Open now", fr: "Ouvert" };
const CLOSED_NOW_LABEL: Record<string, string> = { es: "Cerrado ahora", en: "Closed now", fr: "Fermé" };

// Weekly opening hours by JS day index (0=Sun) → time ranges (24h)
const OPEN_SCHEDULE: Record<number, [number, number][]> = {
  1: [[9, 14], [16, 19]], // Mon
  2: [[9, 14], [16, 19]], // Tue
  3: [[9, 19]],           // Wed
  4: [[10, 20]],          // Thu
  5: [[10, 20]],          // Fri
};

const isOpenNow = (): boolean => {
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  return (OPEN_SCHEDULE[now.getDay()] || []).some(([s, e]) => h >= s && h < e);
};
import { useToast } from "@/hooks/use-toast";
import { CONTACT_FORM_API_URL, PROFILE_ID } from "@/services/carsApi";

const Contact = () => {
  const { toast } = useToast();
  const { language, getPhoneNumber, getEmail, getAddress, getOpeningHours, t } = useLanguage();
  const address = getAddress();

  const getFlag = () => {
    switch (language) {
      case "es": return "🇪🇸";
      case "en": return "🇬🇧";
      case "fr": return "🇫🇷";
      default: return "🇪🇸";
    }
  };
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    mensaje: "",
    acceptMarketing: false,
    acceptPrivacy: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptMarketing) {
      toast({
        title: "Error",
        description: t('contact_page.errors.privacy_required'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        profile_id: PROFILE_ID,
        lead_firstname: formData.nombre,
        lead_lastname: formData.apellido,
        lead_phone_number: formData.telefono,
        lead_email: formData.email,
        message: formData.mensaje
      };

      const response = await fetch(CONTACT_FORM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: t('contact_page.errors.submission_error'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const phoneNumber = getPhoneNumber();

  const contactInfo = [
    {
      icon: Phone,
      title: t('contact_page.info.call_us.title'),
      description: t('contact_page.info.call_us.description'),
      contact: phoneNumber,
      href: `tel:${phoneNumber}`
    },
    {
      icon: Mail,
      title: t('contact_page.info.write_us.title'),
      description: t('contact_page.info.write_us.description'),
      contact: getEmail(),
      href: `mailto:${getEmail()}`
    },
    {
      icon: MapPin,
      title: t('contact_page.info.visit_us.title'),
      description: `${t('contact_page.info.visit_us.description')} ${address.full}`,
      contact: address.full,
      href: address.mapsUrl
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO page="contact" />
      <Header />

      {/* Hero Section */}
      <PageHeader title={t('contact_page.title')} subtitle={t('contact_page.subtitle')} backgroundImage={showroomImage} />

      {/* Contact details — office visual + stacked cards */}
      <section className="relative overflow-hidden py-20 px-4 bg-white">
        {/* Decorative orange graphics */}
        <div className="absolute top-8 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Left: office visual */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-md h-full min-h-[380px] hover:border-red-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_24px_50px_-10px_rgba(227,6,19,0.4)] transition-all duration-300 ease-out cursor-pointer">
                <img
                  src={officeImage}
                  alt={`${t('contact_page.location.title')} - OTO MOTOR`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-sm rounded-full pl-3 pr-4 py-2 shadow-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-bold text-foreground">
                  {OFFICE_BADGE[language] || OFFICE_BADGE.es}
                </span>
              </div>
            </div>

            {/* Right: stacked contact cards */}
            <div className="flex flex-col gap-5 justify-center">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <a
                    key={index}
                    href={info.href}
                    target={info.icon === MapPin ? "_blank" : undefined}
                    rel={info.icon === MapPin ? "noopener noreferrer" : undefined}
                    className="group flex items-start gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-red-500 hover:shadow-[0_10px_25px_rgba(227,6,19,0.3)] hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Solid orange icon badge */}
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-red-500 flex items-center justify-center shadow-md shadow-red-500/30">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground">{info.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{info.description}</p>
                      <span className="block mt-2 text-foreground font-semibold group-hover:text-primary transition-colors break-all">
                        {info.contact}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="relative overflow-hidden py-12 px-4 bg-gradient-to-b from-[#FFF5F0] to-background">
        {/* Decorative orange graphics */}
        <div className="absolute -top-16 -left-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.5] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.12) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />
        <div className="container mx-auto max-w-2xl relative z-10">
          <div className="relative group">
            {/* Ambient red backlight glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#E52B28]/20 via-red-500/15 to-[#E52B28]/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500 -z-10" />
          <Card className="relative bg-white rounded-2xl border border-slate-200/80 hover:border-[#E52B28] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-5px_rgba(229,43,40,0.15)] hover:-translate-y-1.5 transition-all duration-300 ease-out z-10">
            <CardContent className="p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {t('contact_page.success.title')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('contact_page.success.description')}
                  </p>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        nombre: "",
                        apellido: "",
                        email: "",
                        telefono: "",
                        mensaje: "",
                        acceptMarketing: false,
                        acceptPrivacy: false
                      });
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {t('contact_page.success.send_another')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-gray-600">{t('contact_page.form.name')}</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                        className="bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E52B28]/20 focus:border-[#E52B28] transition-all"
                        placeholder={t('contact_page.form.name_placeholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido" className="text-gray-600">{t('contact_page.form.surname')}</Label>
                      <Input
                        id="apellido"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        required
                        className="bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E52B28]/20 focus:border-[#E52B28] transition-all"
                        placeholder={t('contact_page.form.surname_placeholder')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-600">{t('contact_page.form.email')}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E52B28]/20 focus:border-[#E52B28] transition-all"
                        placeholder={t('contact_page.form.email_placeholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-gray-600">{t('contact_page.form.phone')}</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">
                          <span className="text-sm text-red-600 font-semibold">{getFlag()}</span>
                        </div>
                        <Input
                          id="telefono"
                          name="telefono"
                          type="tel"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          required
                          className="bg-white border-gray-200 rounded-l-none focus:outline-none focus:ring-2 focus:ring-[#E52B28]/20 focus:border-[#E52B28] transition-all"
                          placeholder={t('contact_page.form.phone_placeholder')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensaje" className="text-gray-600">{t('contact_page.form.message')}</Label>
                    <Textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder={t('contact_page.form.message_placeholder')}
                      className="bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E52B28]/20 focus:border-[#E52B28] transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptMarketing"
                        checked={formData.acceptMarketing}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, acceptMarketing: checked as boolean })
                        }
                      />
                      <Label htmlFor="acceptMarketing" className="text-sm text-gray-600">
                        {t('contact_page.form.accept_marketing')}{" "}
                        <button
                          type="button"
                          onClick={() => setOpenPrivacyModal(true)}
                          className="text-primary hover:text-gray-600 underline"
                        >
                          {t('contact_page.form.privacy_policy')}
                        </button>.
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#E52B28] hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                  >
                    {isSubmitting ? t('contact_page.form.submitting') : t('contact_page.form.submit')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="relative overflow-hidden py-16 px-4 bg-gradient-to-br from-gray-50 via-white to-[#FFF5F0]">
        {/* Decorative orange graphics */}
        <div className="absolute -top-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <h2 className="text-3xl font-bold text-foreground mb-10">
            {t('contact_page.location.title')}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: details column */}
            <div className="flex flex-col gap-6">
              {/* Address card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-red-500 hover:shadow-[0_10px_25px_rgba(227,6,19,0.3)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-red-500 flex items-center justify-center shadow-md shadow-red-500/30">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {t('contact_page.location.address_title')}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {address.street}<br />
                      {address.city}
                    </p>
                  </div>
                </div>
                <a
                  href={address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl h-11 px-5 shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  {OPEN_MAPS_LABEL[language] || OPEN_MAPS_LABEL.es}
                </a>
              </div>

              {/* Business hours card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-red-500 hover:shadow-[0_10px_25px_rgba(227,6,19,0.3)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-red-500 flex items-center justify-center shadow-md shadow-red-500/30">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground truncate">
                      {t('contact_page.location.hours_title')}
                    </h3>
                  </div>
                  {(() => {
                    const open = isOpenNow();
                    return (
                      <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        <span className={`w-2 h-2 rounded-full ${open ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                        {open ? (OPEN_NOW_LABEL[language] || OPEN_NOW_LABEL.es) : (CLOSED_NOW_LABEL[language] || CLOSED_NOW_LABEL.es)}
                      </span>
                    );
                  })()}
                </div>
                <dl className="text-sm">
                  {getOpeningHours().map((entry, index) => (
                    <div key={index} className="flex justify-between items-center gap-4 py-2.5 border-b border-slate-100 last:border-0">
                      <dt className="font-semibold text-foreground">{entry.label}</dt>
                      <dd className={entry.closed ? "text-muted-foreground/70" : "text-muted-foreground"}>{entry.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Right: map block */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 min-h-[420px] hover:border-red-500/40 transition-all duration-300">
              <iframe
                src={address.mapsEmbedUrl}
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${t('contact_page.location.title')} - OTO MOTOR, ${address.city}`}
              ></iframe>
              {/* Directions overlay button */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.full)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 bg-white text-primary font-semibold rounded-full h-11 px-5 shadow-lg hover:bg-primary hover:text-white transition-colors"
              >
                <Navigation className="w-4 h-4" />
                {DIRECTIONS_LABEL[language] || DIRECTIONS_LABEL.es}
              </a>
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      <Footer />

      {/* Privacy Policy Modal */}
      <Dialog open={openPrivacyModal} onOpenChange={setOpenPrivacyModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t('legal.privacy_policy.title')}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-sm text-muted-foreground">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contact;