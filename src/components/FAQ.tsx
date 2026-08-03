import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Minus, HelpCircle, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const VISIBLE_COUNT = 5;

const MORE_LABEL: Record<string, string> = {
  es: "Ver más",
  en: "Show more",
  fr: "Voir plus",
};
const LESS_LABEL: Record<string, string> = {
  es: "Ver menos",
  en: "Show less",
  fr: "Voir moins",
};

const FAQ = () => {
  const { t, language } = useLanguage();
  const [showAll, setShowAll] = useState(false);
  const [openItem, setOpenItem] = useState<string>("");

  const faqs = [
    { question: t('faq.questions.quality.question'), answer: t('faq.questions.quality.answer') },
    { question: t('faq.questions.warranty.question'), answer: t('faq.questions.warranty.answer') },
    { question: t('faq.questions.financing.question'), answer: t('faq.questions.financing.answer') },
    { question: t('faq.questions.delivery.question'), answer: t('faq.questions.delivery.answer') },
    { question: t('faq.questions.trade_in.question'), answer: t('faq.questions.trade_in.answer') },
    { question: t('faq.questions.test_drive.question'), answer: t('faq.questions.test_drive.answer') },
    { question: t('faq.questions.reserve.question'), answer: t('faq.questions.reserve.answer') },
    { question: t('faq.questions.schedule.question'), answer: t('faq.questions.schedule.answer') },
  ];

  const visibleFaqs = showAll ? faqs : faqs.slice(0, VISIBLE_COUNT);

  return (
    <section className="py-20 px-4 bg-[#F8F9FA]">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr] gap-8 lg:gap-12 items-start">
          {/* Left: promo card */}
          <div className="lg:sticky lg:top-24 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-gray-800 p-8 text-white shadow-xl shadow-primary/30">
            {/* Decorative question mark */}
            <span className="absolute -bottom-8 -right-2 text-[11rem] font-black leading-none text-white/10 select-none pointer-events-none">?</span>

            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-6">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-white/85 leading-relaxed mb-8">
              {t('faq.subtitle')}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold rounded-full px-6 h-12 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              {t('header.contact')}
            </a>
          </div>

          {/* Right: accordion */}
          <div>
            <Accordion
              type="single"
              collapsible
              value={openItem}
              onValueChange={setOpenItem}
              className="space-y-3"
            >
              {visibleFaqs.map((faq, index) => {
                const value = `item-${index}`;
                const isOpen = openItem === value;
                return (
                  <AccordionItem
                    key={index}
                    value={value}
                    className="bg-white rounded-2xl border border-transparent shadow-sm px-5 hover:shadow-md data-[state=open]:shadow-lg data-[state=open]:border-primary/20 transition-all"
                  >
                    <AccordionTrigger className="text-left text-[15px] font-semibold text-foreground hover:text-primary py-5 gap-4">
                      <span className="flex-1">{faq.question}</span>
                      <span
                        className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-200"
                        style={
                          isOpen
                            ? { backgroundColor: "hsl(var(--primary))", color: "#ffffff" }
                            : { backgroundColor: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }
                        }
                      >
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {faqs.length > VISIBLE_COUNT && (
              <div className="text-center lg:text-left mt-8">
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-6 h-11 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors shadow-sm"
                >
                  {showAll ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showAll ? LESS_LABEL[language] : MORE_LABEL[language]}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
