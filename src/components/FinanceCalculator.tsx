import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface FinanceCalculatorProps {
  /** Cash / contract price of the vehicle (fallback base amount). */
  price: number;
  /** Financed price from the backoffice — used as the base amount when set. */
  financedPrice?: number;
}

// Illustrative nominal annual rate (TIN) used for the estimate. This is only an
// orientation figure — the real conditions depend on the approved financing.
const DEFAULT_TIN = 8.95;
const TERM_OPTIONS = [24, 36, 48, 60, 72, 84, 96];
const DEFAULT_TERM = 84;

/**
 * Computes the fixed monthly payment for an amortising loan.
 * Falls back to a straight division when the rate is zero.
 */
const monthlyInstalment = (principal: number, annualRatePct: number, months: number): number => {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
};

const FinanceCalculator = ({ price, financedPrice }: FinanceCalculatorProps) => {
  const { t, formatPrice } = useLanguage();

  // The simulator works off the financed price, falling back to the cash price
  // when the backoffice has not set a financed price.
  const basePrice = financedPrice ?? price;

  const [downPayment, setDownPayment] = useState(0);
  const [term, setTerm] = useState(DEFAULT_TERM);

  const { loanAmount, monthly } = useMemo(() => {
    const loan = Math.max(0, basePrice - downPayment);
    return {
      loanAmount: loan,
      monthly: monthlyInstalment(loan, DEFAULT_TIN, term),
    };
  }, [basePrice, downPayment, term]);

  // Cap the down-payment slider at the base price and round the ceiling to a
  // clean step so the top of the range is reachable.
  const maxDownPayment = Math.max(0, Math.round(basePrice));
  const tinLabel = DEFAULT_TIN.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Calculator className="w-[18px] h-[18px]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground leading-tight">{t("vehicle_detail.calculator.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("vehicle_detail.calculator.subtitle")}</p>
          </div>
        </div>

        {/* Monthly payment result */}
        <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            {t("vehicle_detail.calculator.monthly_payment")}
          </div>
          <div className="text-3xl font-bold text-primary">
            {formatPrice(Math.round(monthly))}
            <span className="text-base font-semibold text-primary/70">{t("vehicle_detail.calculator.per_month")}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {t("vehicle_detail.calculator.amount_financed")}: <span className="font-semibold text-foreground">{formatPrice(loanAmount)}</span>
          </div>
        </div>

        {/* Down payment */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-gray-600">{t("vehicle_detail.calculator.down_payment")}</Label>
            <span className="text-sm font-semibold text-foreground">{formatPrice(downPayment)}</span>
          </div>
          <Slider
            value={[Math.min(downPayment, maxDownPayment)]}
            onValueChange={(values) => setDownPayment(values[0])}
            min={0}
            max={maxDownPayment}
            step={500}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatPrice(0)}</span>
            <span>{formatPrice(maxDownPayment)}</span>
          </div>
        </div>

        {/* Term */}
        <div className="space-y-2">
          <Label className="text-gray-600">{t("vehicle_detail.calculator.term")}</Label>
          <Select value={String(term)} onValueChange={(value) => setTerm(Number(value))}>
            <SelectTrigger className="bg-gray-50 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TERM_OPTIONS.map((months) => (
                <SelectItem key={months} value={String(months)}>
                  {months} {t("vehicle_detail.calculator.months")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-[11px] leading-snug text-muted-foreground">
          {t("vehicle_detail.calculator.tin_label")} {tinLabel}%. {t("vehicle_detail.calculator.disclaimer")}
        </p>

        <Button asChild className="w-full rounded-xl font-semibold">
          <Link to="/financing" onClick={() => window.scrollTo(0, 0)}>
            {t("vehicle_detail.calculator.cta")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default FinanceCalculator;
