import { Car, Shield, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Car,
      title: t('services.vip.title'),
      description: t('services.vip.description'),
      additionalInfo: t('services.vip.additional_info'),
      iconBg: "bg-primary/10 text-primary",
      accent: "bg-primary",
    },
    {
      icon: Shield,
      title: t('services.warranty.title'),
      description: t('services.warranty.description'),
      additionalInfo: t('services.warranty.additional_info'),
      iconBg: "bg-primary/10 text-primary",
      accent: "bg-primary",
    },
    {
      icon: CreditCard,
      title: t('services.financing.title'),
      description: t('services.financing.description'),
      additionalInfo: undefined,
      iconBg: "bg-primary/10 text-primary",
      accent: "bg-primary",
    }
  ];

  return (
    <section className="py-20 px-4 bg-[#FFF5F0]">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg text-muted-foreground mx-auto max-w-3xl leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-xl p-7 border border-gray-100 shadow-lg hover:shadow-[0_10px_25px_rgba(227,6,19,0.3)] hover:border-red-500 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${service.accent} opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div className={`w-16 h-16 rounded-xl ${service.iconBg} flex items-center justify-center mb-5 mx-auto`}>
                  <IconComponent className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-3 leading-tight">
                  {service.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-4 text-sm">
                  {service.description}
                </p>

                {service.additionalInfo && (
                  <div className="flex items-start gap-2 text-sm text-primary bg-primary/5 rounded-lg px-3 py-2.5">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="italic">{service.additionalInfo}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-11 shadow-sm">
            <a href="/services" className="inline-flex items-center gap-2">
              {t('common.more_information')}
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
