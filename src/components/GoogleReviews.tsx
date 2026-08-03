import { Star, ExternalLink, BadgeCheck, MessageSquarePlus, Quote } from "lucide-react";
import googleLogo from "@/assets/google-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { fetchGoogleReviews, GOOGLE_PLACE_ID } from "@/services/carsApi";

const PLACE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`;

const VIEW_ALL_LABEL: Record<string, string> = {
  es: "Ver todas las reseñas en Google",
  en: "View all reviews on Google",
  fr: "Voir tous les avis sur Google",
};
const VIEW_ON_LABEL: Record<string, string> = {
  es: "Ver en Google",
  en: "View on Google",
  fr: "Voir sur Google",
};
const VERIFIED_LABEL: Record<string, string> = {
  es: "Reseña verificada",
  en: "Verified review",
  fr: "Avis vérifié",
};
const EMPTY_LABEL: Record<string, string> = {
  es: "Sé el primero en dejarnos una reseña en Google.",
  en: "Be the first to leave us a review on Google.",
  fr: "Soyez le premier à nous laisser un avis sur Google.",
};

const StarRating = ({
  rating,
  className = "w-5 h-5",
  trackClass = "text-black/15",
}: {
  rating: number;
  className?: string;
  trackClass?: string;
}) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      const fill = Math.min(1, Math.max(0, rating - (star - 1)));
      return (
        <div key={star} className="relative">
          <Star className={`${className} ${trackClass}`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <Star className={`${className} fill-amber-400 text-amber-400`} />
          </div>
        </div>
      );
    })}
  </div>
);

const GoogleReviews = () => {
  const { t, language } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["google-reviews"],
    queryFn: fetchGoogleReviews,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Live data only — no placeholder content
  const overallRating = data?.rating ?? 0;
  const totalReviews = data?.count ?? 0;
  const reviews = data?.reviews ?? [];
  const viewOn = VIEW_ON_LABEL[language] || VIEW_ON_LABEL.en;
  const verified = VERIFIED_LABEL[language] || VERIFIED_LABEL.en;

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-b from-secondary via-background to-secondary text-foreground">
      {/* Dot-grid texture, faded toward the edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground) / 0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)",
        }}
      />
      {/* Decorative outline rings + soft blob */}
      <div className="absolute -top-28 -left-28 w-[26rem] h-[26rem] rounded-full border border-foreground/[0.07]" />
      <div className="absolute -bottom-40 -right-24 w-[34rem] h-[34rem] rounded-full border border-foreground/[0.06]" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-foreground/[0.04] blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header + rating badge */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-foreground/5 border border-foreground/10 pl-2 pr-3.5 py-1.5">
              <img src={googleLogo} alt="Google" className="w-4 h-4" />
              <span className="text-foreground/70 text-xs font-bold uppercase tracking-[0.2em]">Google Reviews</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-[1.05] text-foreground tracking-tight">
              {t("reviews.title")}
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-1 w-10 rounded-full bg-foreground" />
              <p className="text-muted-foreground text-lg">{t("reviews.subtitle")}</p>
            </div>
          </div>

          {overallRating > 0 && (
            <div className="shrink-0 rounded-[1.75rem] bg-foreground text-background px-7 py-6 flex items-center gap-5 shadow-2xl shadow-foreground/25 ring-1 ring-white/10">
              <div>
                <div className="text-5xl font-bold leading-none mb-2.5 tracking-tight">{overallRating.toFixed(1)}</div>
                <StarRating rating={overallRating} className="w-4 h-4" trackClass="text-white/20" />
              </div>
              <div className="w-px h-14 bg-white/15" />
              <div className="flex items-center gap-2.5">
                <img src={googleLogo} alt="Google" className="w-9 h-9 bg-white rounded-xl p-1.5" />
                <span className="text-sm text-background/70 leading-tight max-w-[110px]">
                  {t("reviews.based_on")} {totalReviews} {t("reviews.reviews_count")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live review cards */}
        {reviews.length > 0 ? (
          <div className="flex flex-col items-center gap-6">
            {reviews.map((review, i) => (
              <a
                key={i}
                href={review.reviewUri || PLACE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full max-w-2xl bg-card rounded-2xl p-8 pt-9 border border-border shadow-xl shadow-black/[0.07] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#4285F4]/15 transition-all overflow-hidden"
              >
                {/* Google 4-colour top bar */}
                <div className="absolute inset-x-0 top-0 h-1.5 flex">
                  <div className="flex-1 bg-[#4285F4]" />
                  <div className="flex-1 bg-[#EA4335]" />
                  <div className="flex-1 bg-[#FBBC05]" />
                  <div className="flex-1 bg-[#34A853]" />
                </div>
                {/* Soft colour glow in the corner */}
                <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#4285F4]/10 blur-3xl pointer-events-none" />
                {/* Oversized quote glyph */}
                <Quote className="absolute top-3 right-5 w-24 h-24 text-[#4285F4]/10 rotate-180" strokeWidth={1} />

                <div className="relative flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {review.photoUri ? (
                      <img
                        src={review.photoUri}
                        alt={review.author}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#4285F4]/30 ring-offset-2 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4285F4] to-[#34A853] text-white ring-2 ring-[#4285F4]/25 ring-offset-2 flex items-center justify-center shrink-0 shadow-md shadow-[#4285F4]/20">
                        <span className="font-bold text-lg">{review.author.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">{review.author}</h3>
                      {review.relativeTime && <p className="text-xs text-muted-foreground">{review.relativeTime}</p>}
                    </div>
                  </div>
                  <img src={googleLogo} alt="Google" className="w-6 h-6 shrink-0" />
                </div>

                <div className="relative inline-flex self-start items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-semibold px-2.5 py-1 mb-3">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {verified}
                </div>

                <StarRating rating={review.rating} className="w-5 h-5" />

                <div className="relative mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-[#4285F4] transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{viewOn}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
              <MessageSquarePlus className="w-10 h-10 mx-auto mb-4 text-foreground" />
              <p className="text-muted-foreground">{EMPTY_LABEL[language] || EMPTY_LABEL.en}</p>
            </div>
          )
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href={PLACE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover h-12 px-8 text-sm font-bold shadow-lg shadow-foreground/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {VIEW_ALL_LABEL[language] || VIEW_ALL_LABEL.en}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
