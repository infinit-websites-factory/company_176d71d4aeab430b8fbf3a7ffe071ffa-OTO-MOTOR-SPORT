interface PageHeaderProps {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  backgroundImage?: string;
}

const PageHeader = ({ title, subtitle, align = "center", backgroundImage }: PageHeaderProps) => {
  // Image-backed hero (e.g. Contact page) — dark overlay + white text
  if (backgroundImage) {
    return (
      <section
        className="relative flex items-center min-h-[300px] md:min-h-[360px] py-16 px-4 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})`, backgroundPosition: "center 45%" }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-slate-900/60" />

        <div className={`container mx-auto max-w-4xl relative z-10 ${align === "center" ? "text-center" : ""}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">{title}</h1>
          {subtitle && (
            <p className={`text-lg text-gray-200 leading-relaxed drop-shadow ${align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"}`}>
              {subtitle}
            </p>
          )}
          <div className={`mt-6 h-1 w-20 rounded-full bg-primary ${align === "center" ? "mx-auto" : ""}`} />
        </div>
      </section>
    );
  }

  // Default light header
  return (
    <section className="relative bg-gradient-to-b from-[#F8F9FA] to-white py-16 px-4 overflow-hidden border-b border-gray-100">
      {/* Decorative brand glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className={`container mx-auto max-w-4xl relative z-10 ${align === "center" ? "text-center" : ""}`}>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
        {subtitle && (
          <p className={`text-lg text-muted-foreground leading-relaxed ${align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"}`}>
            {subtitle}
          </p>
        )}
        <div className={`mt-6 h-1 w-20 rounded-full bg-primary ${align === "center" ? "mx-auto" : ""}`} />
      </div>
    </section>
  );
};

export default PageHeader;
