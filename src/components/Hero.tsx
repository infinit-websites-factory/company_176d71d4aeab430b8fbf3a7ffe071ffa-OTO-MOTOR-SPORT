import { Search, ShieldCheck, Truck, CreditCard } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import fachada from "@/assets/oto-motor-fachada.jpg";

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/stock?search=${encodeURIComponent(searchTerm.trim())}` : "/stock");
  };

  const features = [
    { icon: ShieldCheck, label: t("services.warranty.title") },
    { icon: Truck, label: t("services.vip.additional_info") },
    { icon: CreditCard, label: t("services.financing.title") },
  ];

  return (
    <section className="relative w-full h-[600px] overflow-hidden bg-slate-900">
      {/* Facade image fills the hero; only the lower edge is cropped */}
      <img src={fachada} alt="OTO MOTOR" className="absolute inset-0 w-full h-full object-cover object-top" />

      {/* Dark gradient overlay: charcoal on the left → transparent on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/50 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto max-w-7xl px-4 w-full">
          <div className="max-w-xl">
          {/* Headline */}
          <h1 className="text-white font-extrabold text-4xl lg:text-5xl leading-tight mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            {t("hero.title")}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-200 text-lg leading-relaxed mb-7 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
            {t("vehicle_gallery.subtitle")}
          </p>

          {/* Frosted search bar */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-1.5 mb-6 max-w-lg"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-0 outline-none pl-10 pr-2 h-11 text-white placeholder:text-white/60 text-base"
              />
            </div>
            <button
              type="submit"
              className="bg-[#111111] hover:bg-[#333333] text-white font-medium px-6 py-3 rounded-xl transition-colors shrink-0"
            >
              {t("common.search")}
            </button>
          </form>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2.5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl px-3 py-2 text-sm font-medium"
                >
                  <Icon className="w-4 h-4 text-gray-300" />
                  {f.label}
                </span>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
