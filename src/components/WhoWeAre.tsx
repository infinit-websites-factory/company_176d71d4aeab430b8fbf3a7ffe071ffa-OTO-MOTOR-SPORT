import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchCompanyInfo, CompanyInfo } from "@/services/carsApi";
import collageImage from "@/assets/oto-motor-collage.jpg";

const CONTENT: Record<string, {
  badge: string;
  headline: string;
  description: string;
  cta: string;
  stats: { vehicles: string; rating: string; reviews: string };
}> = {
  es: {
    badge: "Quiénes Somos",
    headline: "Pasión por la excelencia automovilística premium",
    description:
      "En OTO MOTOR comercializamos e importamos vehículos premium a la carta, de ocasión, seminuevos y de KM 0. Asesoramos a cada cliente durante todo el proceso para que su experiencia con nosotros sea un éxito.",
    cta: "Conoce más sobre nosotros",
    stats: { vehicles: "Vehículos disponibles", rating: "Valoración en Google", reviews: "Reseñas verificadas" },
  },
  en: {
    badge: "Who We Are",
    headline: "Passion for Premium Automotive Excellence",
    description:
      "At OTO MOTOR we market and import premium vehicles to order — used, nearly new and KM 0. We advise every client throughout the whole process so their experience with us is a success.",
    cta: "Learn More About Us",
    stats: { vehicles: "Vehicles available", rating: "Google rating", reviews: "Verified reviews" },
  },
  fr: {
    badge: "Qui Sommes-Nous",
    headline: "La passion de l'excellence automobile premium",
    description:
      "Chez OTO MOTOR, nous commercialisons et importons des véhicules premium à la carte — d'occasion, quasi neufs et KM 0. Nous accompagnons chaque client tout au long du processus pour garantir une expérience réussie.",
    cta: "En savoir plus sur nous",
    stats: { vehicles: "Véhicules disponibles", rating: "Note Google", reviews: "Avis vérifiés" },
  },
};

const WhoWeAre = () => {
  const { language } = useLanguage();
  const c = CONTENT[language] || CONTENT.es;

  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCompanyInfo()
      .then((data) => {
        if (active) setInfo(data);
      })
      .catch(() => {
        if (active) setInfo(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = [
    { value: info ? `${info.vehiclesInStock}` : "", label: c.stats.vehicles },
    { value: info ? info.googleRating.toFixed(1) : "", label: c.stats.rating },
    { value: info ? `${info.reviewCount}` : "", label: c.stats.reviews },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto px-4">
        {/* Left: collage image with multi-layered ambient glow */}
        <div className="lg:col-span-6 relative before:absolute before:-inset-2 before:bg-[#E52B28]/30 before:blur-2xl before:rounded-3xl before:-z-10 after:absolute after:-inset-5 after:bg-[#E52B28]/15 after:blur-[60px] after:rounded-3xl after:-z-20">
          <div className="relative rounded-2xl overflow-hidden border border-red-200/70 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25),0_10px_30px_rgba(227,6,19,0.3)] hover:border-red-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_24px_50px_-10px_rgba(227,6,19,0.4)] transition-all duration-300 ease-out cursor-pointer">
            <img
              src={collageImage}
              alt="OTO MOTOR"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: content */}
        <div className="lg:col-span-6 space-y-6">
          <span className="bg-[#E52B28]/10 text-[#E52B28] border border-[#E52B28]/20 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase inline-flex items-center gap-1.5">
            {c.badge}
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {c.headline}
          </h2>

          {/* Description — API/skeleton state */}
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-11/12" />
              <div className="h-4 bg-gray-100 rounded w-4/5" />
            </div>
          ) : (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {c.description}
            </p>
          )}

          {/* Stats row — mini stat cards */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 hover:border-[#E52B28]/30 rounded-xl p-4 shadow-[0_8px_25px_-8px_rgba(229,43,40,0.25)] hover:shadow-[0_14px_32px_-8px_rgba(229,43,40,0.45)] transition-all duration-300 hover:-translate-y-1"
              >
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gray-100 rounded w-16" />
                    <div className="h-3 bg-gray-100 rounded w-20" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-extrabold text-[#E52B28]">{stat.value}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
                  </>
                )}
              </div>
            ))}
          </div>

          <a
            href="/services"
            className="inline-flex items-center gap-2 bg-[#E52B28] hover:bg-[#c4211f] text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-[#E52B28]/25 hover:shadow-xl hover:shadow-[#E52B28]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {c.cta}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
