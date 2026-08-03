import { Car, Shield, CreditCard, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import SEO from "@/components/SEO";
import sellCarsPhoto from "@/assets/oto-motor-sell-cars.jpg";
import servicesHero from "@/assets/oto-motor-services-hero.jpg";

const SELL_IMAGE_TAG: Record<string, string> = {
  es: "🚗 Máximo valor garantizado",
  en: "🚗 Max Value Guarantee",
  fr: "🚗 Valeur maximale garantie",
};
const SELL_PILL: Record<string, string> = {
  es: "⚡ Tasación sin complicaciones",
  en: "⚡ Hassle-Free Vehicle Appraisal",
  fr: "⚡ Estimation sans souci",
};
const SELL_HEADLINE: Record<string, string> = {
  es: "Vende tu coche al mejor precio, sin estrés",
  en: "Sell Your Car at the Best Price, Stress-Free",
  fr: "Vendez votre voiture au meilleur prix, sans stress",
};

const Services = () => {
  const { t, language } = useLanguage();
  const mainServices = [
    {
      icon: Car,
      title: t('services_page.main_services.vip.title'),
      description: t('services_page.main_services.vip.description'),
      iconBg: "bg-primary/10 text-primary",
    },
    {
      icon: Shield,
      title: t('services_page.main_services.warranty.title'),
      description: t('services_page.main_services.warranty.description'),
      iconBg: "bg-primary/10 text-primary",
    },
    {
      icon: Truck,
      title: t('services_page.main_services.shipping.title'),
      description: t('services_page.main_services.shipping.description'),
      iconBg: "bg-primary/10 text-primary",
    },
    {
      icon: CreditCard,
      title: t('services_page.main_services.financing.title'),
      description: t('services_page.main_services.financing.description'),
      iconBg: "bg-primary/10 text-primary",
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO page="services" />
      <Header />

      {/* Hero Section */}
      <section
        className="relative flex items-center min-h-[300px] md:min-h-[360px] py-16 px-4 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${servicesHero})`, backgroundPosition: "center 45%" }}
      >
        {/* Dark gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {t('services_page.hero.title')}
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto drop-shadow">
            {`${t('services_page.hero.subtitle')}.`}
          </p>
          <div className="bg-[#111111] h-1 w-16 mx-auto rounded-full mt-4" />
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-xl border border-gray-100 shadow-lg p-7 hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:border-gray-900 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-xl ${service.iconBg} flex items-center justify-center mb-5 mx-auto`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sell Your Car Section */}
      <section className="bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-0 px-4 py-10 lg:px-0">
            <div className="group relative flex items-center justify-center p-8 lg:p-12">
              {/* Geometric showcase backdrop */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Soft orange blurred glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/25 rounded-full blur-[90px]" />
                {/* Right box — slides right on hover */}
                <div className="absolute right-4 bottom-4 w-3/4 h-3/4 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-[2rem] rotate-6 transition-transform duration-500 ease-out group-hover:translate-x-6 group-hover:translate-y-2" />
                {/* Left box — slides left on hover */}
                <div className="absolute left-6 top-6 w-1/2 h-1/2 border-2 border-primary/15 rounded-[2rem] -rotate-6 transition-transform duration-500 ease-out group-hover:-translate-x-6 group-hover:-translate-y-2" />
              </div>

              {/* Car image — pops up on hover */}
              <div className="relative transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03] before:absolute before:-inset-2 before:bg-[#111111]/20 before:blur-2xl before:rounded-3xl before:-z-10">
                <img
                  src={sellCarsPhoto}
                  alt={t('services_page.alt_texts.sell')}
                  className="w-full h-[450px] object-cover rounded-3xl shadow-2xl shadow-black/20 ring-1 ring-black/5"
                />
                {/* Accent badge overlay */}
                <div className="absolute -top-3 -left-3 bg-[#111111] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  {SELL_IMAGE_TAG[language] || SELL_IMAGE_TAG.es}
                </div>
              </div>
            </div>
            <div className="flex items-center bg-gray-50 rounded-2xl">
              <div className="px-8 py-16 lg:px-16 lg:py-20 space-y-6">
                <div className="bg-white text-[#111111] text-xs font-semibold px-3.5 py-1.5 rounded-full border border-gray-200 inline-flex items-center gap-1.5">
                  {SELL_PILL[language] || SELL_PILL.es}
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {SELL_HEADLINE[language] || SELL_HEADLINE.es}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('services_page.sell_section.description')}
                </p>
                <Button size="lg" className="gap-2" asChild>
                  <a href="/sell">
                    {t('services_page.sell_section.button')}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQ />
      <Footer />
    </div>
  );
};

export default Services;
