import { Star, ExternalLink, BadgeCheck, MessageSquarePlus } from "lucide-react";
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

const StarRating = ({ rating, className = "w-5 h-5" }: { rating: number; className?: string }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      const fill = Math.min(1, Math.max(0, rating - (star - 1)));
      return (
        <div key={star} className="relative">
          <Star className={`${className} text-black/15`} />
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
    <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-red-600 text-white">
      {/* Decorative rings */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-white/10" />
      <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full border border-white/10" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header + rating badge */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={googleLogo} alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
              <span className="text-white/80 text-sm font-bold uppercase tracking-[0.2em]">Google Reviews</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">{t("reviews.title")}</h2>
            <p className="text-white/80 mt-3 text-lg">{t("reviews.subtitle")}</p>
          </div>

          {overallRating > 0 && (
            <div className="shrink-0 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-5 flex items-center gap-5">
              <div>
                <div className="text-4xl font-bold leading-none mb-2">{overallRating.toFixed(1)}</div>
                <StarRating rating={overallRating} className="w-4 h-4" />
              </div>
              <div className="w-px h-12 bg-white/25" />
              <div className="flex items-center gap-2">
                <img src={googleLogo} alt="Google" className="w-8 h-8 bg-white rounded-lg p-1" />
                <span className="text-sm text-white/80 leading-tight max-w-[110px]">
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
                className="group w-full max-w-2xl bg-white rounded-2xl p-8 shadow-2xl shadow-black/20 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {review.photoUri ? (
                      <img
                        src={review.photoUri}
                        alt={review.author}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/40 ring-offset-2 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 ring-2 ring-primary/40 ring-offset-2 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-lg">{review.author.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">{review.author}</h3>
                      {review.relativeTime && <p className="text-xs text-muted-foreground">{review.relativeTime}</p>}
                    </div>
                  </div>
                  <img src={googleLogo} alt="Google" className="w-6 h-6 shrink-0" />
                </div>

                <div className="inline-flex self-start items-center gap-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-2.5 py-1 mb-3">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {verified}
                </div>

                <StarRating rating={review.rating} className="w-5 h-5" />

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{viewOn}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
              <MessageSquarePlus className="w-10 h-10 mx-auto mb-4 text-white" />
              <p className="text-white/90">{EMPTY_LABEL[language] || EMPTY_LABEL.en}</p>
            </div>
          )
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href={PLACE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white text-primary hover:bg-white/90 h-11 px-8 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
