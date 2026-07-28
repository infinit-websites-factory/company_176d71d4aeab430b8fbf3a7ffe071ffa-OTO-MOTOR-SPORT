import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import SEO from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ArrowRight, ArrowLeft, CheckCircle, Shield, Clock, Sparkles, Car, FileCheck2, Banknote, ArrowLeftRight, CalendarCheck } from "lucide-react";
import sellBg from "@/assets/img1.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CONTACT_FORM_API_URL, PROFILE_ID } from "@/services/carsApi";

const PROCESS_BENEFIT_ICONS = [FileCheck2, Banknote, ArrowLeftRight, CalendarCheck];

const PROCESS_CONTENT: Record<string, { title: string; subtitle: string; steps: { title: string; desc: string }[]; benefits: string[] }> = {
  es: {
    title: "Vender tu coche nunca fue tan fácil",
    subtitle: "Tres pasos y listo — sin complicaciones.",
    steps: [
      { title: "Introduce datos", desc: "Cuéntanos los detalles de tu vehículo." },
      { title: "Tasación rápida", desc: "Recibe una valoración en pocas horas." },
      { title: "Pago inmediato", desc: "Cobra al instante al cerrar el trato." },
    ],
    benefits: ["Papeleo incluido", "Pago al instante", "Aceptamos como parte de pago", "Cambio de nombre el mismo día"],
  },
  en: {
    title: "Selling your car has never been so easy",
    subtitle: "Three steps and you're done — no hassle.",
    steps: [
      { title: "Enter your details", desc: "Tell us about your vehicle." },
      { title: "Quick appraisal", desc: "Get a valuation within hours." },
      { title: "Instant payment", desc: "Get paid the moment we close the deal." },
    ],
    benefits: ["Paperwork included", "Instant payment", "We accept trade-ins", "Same-day name transfer"],
  },
  fr: {
    title: "Vendre votre voiture n'a jamais été aussi simple",
    subtitle: "Trois étapes et c'est fait — sans complications.",
    steps: [
      { title: "Saisissez les données", desc: "Donnez-nous les détails de votre véhicule." },
      { title: "Estimation rapide", desc: "Recevez une évaluation en quelques heures." },
      { title: "Paiement immédiat", desc: "Encaissez dès la conclusion de l'accord." },
    ],
    benefits: ["Papiers inclus", "Paiement instantané", "Reprise acceptée", "Changement de nom le jour même"],
  },
};

// Pill badge label above the Sell hero title (kept distinct from the title itself)
const SELL_HERO_BADGE: Record<string, string> = {
  es: "Valoración gratuita",
  en: "Free valuation",
  fr: "Estimation gratuite",
};

// Wizard step labels shown in the progress indicator
const STEP_LABELS: Record<string, string[]> = {
  es: ["Datos del vehículo", "Detalles técnicos", "Contacto"],
  en: ["Vehicle Basics", "Technical Details", "Contact Info"],
  fr: ["Infos véhicule", "Détails techniques", "Contact"],
};

// Wizard navigation button labels
const NAV_LABELS: Record<string, { next1: string; next2: string; back: string; submit: string }> = {
  es: { next1: "Siguiente: Detalles técnicos →", next2: "Siguiente: Contacto →", back: "← Atrás", submit: "Enviar solicitud de tasación" },
  en: { next1: "Next: Vehicle Details →", next2: "Next: Contact Info →", back: "← Back", submit: "Submit Appraisal Request" },
  fr: { next1: "Suivant : Détails →", next2: "Suivant : Contact →", back: "← Retour", submit: "Envoyer la demande" },
};

const Sell = () => {
  const { toast } = useToast();
  const { language, getPhoneNumber, getAddress, t } = useLanguage();
  const address = getAddress();

  const getFlag = () => {
    switch (language) {
      case "es": return "🇪🇸";
      case "en": return "🇬🇧";
      case "fr": return "🇫🇷";
      default: return "🇪🇸";
    }
  };
  const [currentStep, setCurrentStep] = useState(1);
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    tipoVehiculo: "turismo",
    marca: "",
    modelo: "",
    ano: "",
    carroceria: "",
    color: "",
    combustible: "",
    tipoCambio: "",
    version: "",
    kilometraje: "",
    matricula: "",
    cuandoVender: "",
    interesIntercambio: "",
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    acceptPrivacy: false
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Vehicle type specific marca lists
  const marcasTurismo = [
    "Abarth", "Aiways", "Aixam", "Alfa Romeo", "Alpine", "Aro", "Asia", "Aston Martin", "Audi",
    "Baic", "Bentley", "Bestune", "BMW", "BYD", "Cadillac", "Chevrolet", "Chrysler", "Citroën",
    "Corvette", "CUPRA", "Dacia", "Daewoo", "Daihatsu", "Daimler", "Dodge", "Dongfeng", "DR AUTOMOBILES",
    "DS", "DFSK", "EBRO", "EVO", "Ferrari", "Fiat", "Fisker", "Ford", "Galloper", "Honda", "HONGQI",
    "HUMMER", "Hyundai", "Ineos", "Infiniti", "Innocenti", "Isuzu", "Iveco", "JAECOO", "Jaguar",
    "Jeep", "Kia", "KIA", "KGM", "Lada", "Lamborghini", "Lancia", "Land Rover", "Leapmotor", "Lexus",
    "Ligier", "Livan", "Lotus", "Lynk & Co", "Mahindra", "Maserati", "Maybach", "Mazda", "MCC",
    "McLaren", "Mercedes", "Mercedes-Benz", "MG", "MHero", "Micro", "MINI", "Mitsubishi", "Morgan",
    "MAXUS", "Nissan", "OMODA", "Opel", "Peugeot", "Pilote", "Polestar", "Pontiac", "Porsche",
    "Renault", "Rolls-Royce", "Rover", "Saab", "Santana", "SEAT", "SERES", "Skoda", "Skywell",
    "smart", "Smart", "SsangYong", "Subaru", "Suzuki", "SWM", "TATA", "Tesla", "Toyota", "UMM",
    "VAZ", "Volkswagen", "Volvo", "Voyah", "Weinsberg", "Xpeng", "Yooudooo", "Yudo", "Zhidou"
  ];

  const marcasIndustrial = [
    "Baic", "BYD", "Cenntro", "Citroën", "Dacia", "Daewoo", "DAF", "Daihatsu", "DFSK", "DR AUTOMOBILES",
    "DSK", "EVO", "EVUM", "Farizon", "Fiat", "Ford", "Foton", "Hyundai", "Ineos", "Isuzu", "Iveco",
    "Jeep", "KGM", "KIA", "Lada", "Land Rover", "LDV", "LEVC", "Ligier", "Livan", "Mahindra", "MAN",
    "MAXUS", "Mazda", "Mercedes", "Mercedes-Benz", "Mitsubishi", "Mitsubishi Fuso", "MW Motors",
    "Nextem", "Nissan", "Opel", "Peugeot", "Piaggio", "RAM", "Renault", "Renault Trucks", "SaIC",
    "SAIC MAXUS", "Santana", "Scania", "SEAT", "Skoda", "SsangYong", "Suzuki", "TATA", "Toyota",
    "UMM", "Volkswagen", "Volvo"
  ];

  // Generate years from 2025 down to 2000
  const years = Array.from({ length: 26 }, (_, i) => (2025 - i).toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Reset marca when vehicle type changes
    if (field === "tipoVehiculo") {
      setFormData({ ...formData, [field]: value, marca: "" });
    }
  };

  // Step 1 → Step 2: Vehicle Basics (brand + year are selects; model is native-required)
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.marca) newErrors.marca = t("sell_page.form.required_field");
    if (!formData.ano) newErrors.ano = t("sell_page.form.required_field");

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setCurrentStep(2);
  };

  // Step 2 → Step 3: Technical Details (dropdowns validated manually; text inputs native-required)
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (formData.tipoVehiculo === "turismo" && !formData.carroceria) {
      newErrors.carroceria = t("sell_page.form.required_field");
    }
    if (!formData.combustible) newErrors.combustible = t("sell_page.form.required_field");
    if (!formData.tipoCambio) newErrors.tipoCambio = t("sell_page.form.required_field");

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setCurrentStep(3);
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check privacy acceptance
    if (!formData.acceptPrivacy) {
      toast({
        title: "Error",
        description: t("sell_page.errors.privacy_required"),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build the message
      const tipoVehiculoLabel = formData.tipoVehiculo === "turismo" ? "Turismo" : "Industrial";

      let message = `SOLICITUD DE TASACIÓN

=== DATOS DEL VEHÍCULO ===
Tipo: ${tipoVehiculoLabel}
Marca: ${formData.marca}
Modelo: ${formData.modelo}
Versión: ${formData.version}
Año: ${formData.ano}`;

      if (formData.tipoVehiculo === "turismo" && formData.carroceria) {
        message += `\nCarrocería: ${formData.carroceria.charAt(0).toUpperCase() + formData.carroceria.slice(1)}`;
      }

      message += `
Color: ${formData.color}
Combustible: ${formData.combustible.charAt(0).toUpperCase() + formData.combustible.slice(1)}
Tipo de cambio: ${formData.tipoCambio.charAt(0).toUpperCase() + formData.tipoCambio.slice(1)}
Kilometraje: ${formData.kilometraje} km`;

      if (formData.matricula) {
        message += `\nMatrícula: ${formData.matricula}`;
      }

      const payload = {
        profile_id: PROFILE_ID,
        lead_firstname: formData.nombre,
        lead_lastname: formData.apellido,
        lead_phone_number: formData.telefono,
        lead_email: formData.email,
        message: message
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
        description: t("sell_page.errors.submission_error"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO page="sell" />
      <Header />

      <main className="flex-1">
        {/* Hero Section with Form */}
        <section className="relative pt-12 pb-20 px-4 overflow-hidden bg-gradient-to-br from-[#F8F9FA] via-white to-[#FFF5F0]">
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

          <div className="container mx-auto max-w-7xl relative z-10">
            {/* Centered header */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                <Car className="w-4 h-4" />
                {SELL_HERO_BADGE[language] || SELL_HERO_BADGE.es}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                {t("sell_page.hero.title")}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t("sell_page.hero.subtitle")}
              </p>
            </div>

            {/* Benefits below the form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-12">
              <div className="flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-red-500 hover:shadow-[0_10px_25px_rgba(227,6,19,0.3)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#E52B28]/15 to-[#E52B28]/5 border border-[#E52B28]/20 flex items-center justify-center text-[#E52B28] shadow-sm mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{t("sell_page.benefits.best_price.title")}</h3>
                <p className="text-slate-600 text-sm font-normal">{t("sell_page.benefits.best_price.description")}</p>
              </div>

              <div className="flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-red-500 hover:shadow-[0_10px_25px_rgba(227,6,19,0.3)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#E52B28]/15 to-[#E52B28]/5 border border-[#E52B28]/20 flex items-center justify-center text-[#E52B28] shadow-sm mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{t("sell_page.benefits.fast_process.title")}</h3>
                <p className="text-slate-600 text-sm font-normal">{t("sell_page.benefits.fast_process.description")}</p>
              </div>

              <div className="flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-red-500 hover:shadow-[0_10px_25px_rgba(227,6,19,0.3)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#E52B28]/15 to-[#E52B28]/5 border border-[#E52B28]/20 flex items-center justify-center text-[#E52B28] shadow-sm mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{t("sell_page.benefits.no_commitment.title")}</h3>
                <p className="text-slate-600 text-sm font-normal">{t("sell_page.benefits.no_commitment.description")}</p>
              </div>

              <div className="flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-red-500 hover:shadow-[0_10px_25px_rgba(227,6,19,0.3)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#E52B28]/15 to-[#E52B28]/5 border border-[#E52B28]/20 flex items-center justify-center text-[#E52B28] shadow-sm mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{t("sell_page.benefits.any_vehicle.title")}</h3>
                <p className="text-slate-600 text-sm font-normal">{t("sell_page.benefits.any_vehicle.description")}</p>
              </div>
            </div>

            {/* Primary: appraisal wizard */}
            <div className="relative z-10 max-w-2xl mx-auto mt-12 before:absolute before:-inset-2 before:bg-gradient-to-r before:from-[#E52B28]/20 before:via-red-500/12 before:to-[#E52B28]/20 before:blur-2xl before:rounded-3xl before:-z-10 after:absolute after:-inset-2 after:bg-[#E52B28]/10 after:blur-[45px] after:rounded-3xl after:-z-20">
              <Card className="bg-white border border-slate-100 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15),0_10px_30px_rgba(229,43,40,0.2)]">
                {isSubmitted ? (
                  /* Success */
                  <div className="text-center py-8 animate-fade-in space-y-6">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-foreground">
                        {t("sell_page.success.title")}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {t("sell_page.success.description")} <span className="font-semibold text-foreground">{t("sell_page.success.hours")}</span> {t("sell_page.success.description_suffix")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setIsSubmitted(false);
                        setCurrentStep(1);
                        setErrors({});
                        setFormData({
                          tipoVehiculo: "turismo",
                          marca: "",
                          modelo: "",
                          ano: "",
                          carroceria: "",
                          color: "",
                          combustible: "",
                          tipoCambio: "",
                          version: "",
                          kilometraje: "",
                          matricula: "",
                          cuandoVender: "",
                          interesIntercambio: "",
                          nombre: "",
                          apellido: "",
                          telefono: "",
                          email: "",
                          acceptPrivacy: false
                        });
                      }}
                    >
                      {t("sell_page.success.back_home")}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Progress indicator */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3 gap-2">
                        {STEP_LABELS[language].map((label, i) => {
                          const n = i + 1;
                          const reached = currentStep >= n;
                          return (
                            <div key={n} className="flex items-center gap-2 min-w-0">
                              <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${reached ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                                {n}
                              </span>
                              <span className={`text-sm font-medium truncate hidden sm:block ${currentStep === n ? "text-primary" : "text-gray-400"}`}>
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    {/* Step 1: Vehicle Basics */}
                    {currentStep === 1 && (
                      <form onSubmit={handleStep1Next} className="space-y-6 animate-fade-in">
                        {/* Vehicle type toggle */}
                        <div className="space-y-2">
                          <Label className="text-gray-600">{t("sell_page.form.vehicle_type")} {t("sell_page.form.required")}</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              className={`h-10 ${formData.tipoVehiculo === "turismo" ? "bg-gray-100 hover:bg-gray-100 hover:text-foreground border-gray-300 text-foreground" : "bg-white hover:bg-gray-50 hover:text-foreground border-gray-200 text-foreground"}`}
                              onClick={() => handleSelectChange("tipoVehiculo", "turismo")}
                            >
                              {t("sell_page.form.vehicle_type_tourism")}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={`h-10 ${formData.tipoVehiculo === "industrial" ? "bg-gray-100 hover:bg-gray-100 hover:text-foreground border-gray-300 text-foreground" : "bg-white hover:bg-gray-50 hover:text-foreground border-gray-200 text-foreground"}`}
                              onClick={() => handleSelectChange("tipoVehiculo", "industrial")}
                            >
                              {t("sell_page.form.vehicle_type_industrial")}
                            </Button>
                          </div>
                        </div>

                        {/* Brand + Model */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="marca" className="text-gray-600">{t("sell_page.form.brand")} {t("sell_page.form.required")}</Label>
                            <Select
                              value={formData.marca}
                              onValueChange={(value) => {
                                handleSelectChange("marca", value);
                                setErrors({ ...errors, marca: "" });
                              }}
                              required
                              disabled={!formData.tipoVehiculo}
                            >
                              <SelectTrigger className={`bg-gray-50 data-[placeholder]:text-muted-foreground ${errors.marca ? "border-red-500" : "border-gray-200"}`}>
                                <SelectValue placeholder={t("sell_page.form.brand_placeholder")} />
                              </SelectTrigger>
                              <SelectContent>
                                {(formData.tipoVehiculo === "turismo" ? marcasTurismo : marcasIndustrial).map((marca) => (
                                  <SelectItem key={marca} value={marca}>{marca}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.marca && <p className="text-sm text-red-500">{errors.marca}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="modelo" className="text-gray-600">{t("sell_page.form.model")} {t("sell_page.form.required")}</Label>
                            <Input
                              id="modelo"
                              placeholder={t("sell_page.form.model_placeholder")}
                              value={formData.modelo}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-gray-200"
                            />
                          </div>
                        </div>

                        {/* Year */}
                        <div className="space-y-2">
                          <Label htmlFor="ano" className="text-gray-600">{t("sell_page.form.year")} {t("sell_page.form.required")}</Label>
                          <Select
                            value={formData.ano}
                            onValueChange={(value) => {
                              handleSelectChange("ano", value);
                              setErrors({ ...errors, ano: "" });
                            }}
                            required
                          >
                            <SelectTrigger className={`bg-gray-50 data-[placeholder]:text-muted-foreground ${errors.ano ? "border-red-500" : "border-gray-200"}`}>
                              <SelectValue placeholder={t("sell_page.form.year_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((year) => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.ano && <p className="text-sm text-red-500">{errors.ano}</p>}
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button type="submit" size="lg" className="px-6">
                            {NAV_LABELS[language].next1}
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Step 2: Technical Details */}
                    {currentStep === 2 && (
                      <form onSubmit={handleStep2Next} className="space-y-6 animate-fade-in">
                        {/* Version + Bodywork */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="version" className="text-gray-600">{t("sell_page.form.version")} {t("sell_page.form.required")}</Label>
                            <Input
                              id="version"
                              placeholder={t("sell_page.form.version_placeholder")}
                              value={formData.version}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-gray-200"
                            />
                          </div>
                          {formData.tipoVehiculo === "turismo" && (
                            <div className="space-y-2">
                              <Label htmlFor="carroceria" className="text-gray-600">{t("sell_page.form.body_type")} {t("sell_page.form.required")}</Label>
                              <Select
                                value={formData.carroceria}
                                onValueChange={(value) => {
                                  handleSelectChange("carroceria", value);
                                  setErrors({ ...errors, carroceria: "" });
                                }}
                                required
                              >
                                <SelectTrigger className={`bg-gray-50 data-[placeholder]:text-muted-foreground ${errors.carroceria ? "border-red-500" : "border-gray-200"}`}>
                                  <SelectValue placeholder={t("sell_page.form.body_type_placeholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="berlina">{t("sell_page.form.body_types.berlina")}</SelectItem>
                                  <SelectItem value="coupe">{t("sell_page.form.body_types.coupe")}</SelectItem>
                                  <SelectItem value="cabrio">{t("sell_page.form.body_types.cabrio")}</SelectItem>
                                  <SelectItem value="familiar">{t("sell_page.form.body_types.familiar")}</SelectItem>
                                  <SelectItem value="monovolumen">{t("sell_page.form.body_types.monovolumen")}</SelectItem>
                                  <SelectItem value="suv">{t("sell_page.form.body_types.suv")}</SelectItem>
                                  <SelectItem value="pickup">{t("sell_page.form.body_types.pickup")}</SelectItem>
                                  <SelectItem value="otro">{t("sell_page.form.body_types.otro")}</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.carroceria && <p className="text-sm text-red-500">{errors.carroceria}</p>}
                            </div>
                          )}
                        </div>

                        {/* Fuel + Transmission */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="combustible" className="text-gray-600">{t("sell_page.form.fuel")} {t("sell_page.form.required")}</Label>
                            <Select
                              value={formData.combustible}
                              onValueChange={(value) => {
                                handleSelectChange("combustible", value);
                                setErrors({ ...errors, combustible: "" });
                              }}
                              required
                            >
                              <SelectTrigger className={`bg-gray-50 data-[placeholder]:text-muted-foreground ${errors.combustible ? "border-red-500" : "border-gray-200"}`}>
                                <SelectValue placeholder={t("sell_page.form.fuel_placeholder")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gasolina">{t("sell_page.form.fuel_types.gasolina")}</SelectItem>
                                <SelectItem value="diesel">{t("sell_page.form.fuel_types.diesel")}</SelectItem>
                                <SelectItem value="hibrido">{t("sell_page.form.fuel_types.hibrido")}</SelectItem>
                                <SelectItem value="hibrido-enchufable">{t("sell_page.form.fuel_types.hibrido_enchufable")}</SelectItem>
                                <SelectItem value="electrico">{t("sell_page.form.fuel_types.electrico")}</SelectItem>
                                <SelectItem value="gas">{t("sell_page.form.fuel_types.gas")}</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.combustible && <p className="text-sm text-red-500">{errors.combustible}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tipoCambio" className="text-gray-600">{t("sell_page.form.transmission")} {t("sell_page.form.required")}</Label>
                            <Select
                              value={formData.tipoCambio}
                              onValueChange={(value) => {
                                handleSelectChange("tipoCambio", value);
                                setErrors({ ...errors, tipoCambio: "" });
                              }}
                              required
                            >
                              <SelectTrigger className={`bg-gray-50 data-[placeholder]:text-muted-foreground ${errors.tipoCambio ? "border-red-500" : "border-gray-200"}`}>
                                <SelectValue placeholder={t("sell_page.form.transmission_placeholder")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manual">{t("sell_page.form.transmission_types.manual")}</SelectItem>
                                <SelectItem value="automatico">{t("sell_page.form.transmission_types.automatico")}</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.tipoCambio && <p className="text-sm text-red-500">{errors.tipoCambio}</p>}
                          </div>
                        </div>

                        {/* Mileage + Color */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="kilometraje" className="text-gray-600">{t("sell_page.form.mileage")} {t("sell_page.form.required")}</Label>
                            <Input
                              id="kilometraje"
                              type="number"
                              placeholder={t("sell_page.form.mileage_placeholder")}
                              value={formData.kilometraje}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-gray-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="color" className="text-gray-600">{t("sell_page.form.color")} {t("sell_page.form.required")}</Label>
                            <Input
                              id="color"
                              placeholder={t("sell_page.form.color_placeholder")}
                              value={formData.color}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-gray-200"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={handleBack}
                            className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                          >
                            {NAV_LABELS[language].back}
                          </button>
                          <Button type="submit" size="lg" className="px-6">
                            {NAV_LABELS[language].next2}
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Step 3: Contact & Submit */}
                    {currentStep === 3 && (
                      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                        {/* Registration (optional) */}
                        <div className="space-y-2">
                          <Label htmlFor="matricula" className="text-gray-600">{t("sell_page.form.license_plate")}</Label>
                          <Input
                            id="matricula"
                            placeholder={t("sell_page.form.license_plate_placeholder")}
                            value={formData.matricula}
                            onChange={handleInputChange}
                            className="bg-white border-gray-200"
                          />
                        </div>

                        {/* Name + Surname */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nombre" className="text-gray-600">{t("sell_page.form.first_name")} {t("sell_page.form.required")}</Label>
                            <Input
                              id="nombre"
                              name="nombre"
                              placeholder={t("sell_page.form.first_name_placeholder")}
                              value={formData.nombre}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-gray-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="apellido" className="text-gray-600">{t("sell_page.form.last_name")} {t("sell_page.form.required")}</Label>
                            <Input
                              id="apellido"
                              name="apellido"
                              placeholder={t("sell_page.form.last_name_placeholder")}
                              value={formData.apellido}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-gray-200"
                            />
                          </div>
                        </div>

                        {/* Phone + Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="telefono" className="text-gray-600">{t("sell_page.form.phone")} {t("sell_page.form.required")}</Label>
                            <div className="flex">
                              <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">
                                <span className="text-sm text-red-600 font-semibold">{getFlag()}</span>
                              </div>
                              <Input
                                id="telefono"
                                name="telefono"
                                type="tel"
                                placeholder={t("sell_page.form.phone_placeholder")}
                                value={formData.telefono}
                                onChange={handleInputChange}
                                required
                                className="bg-white border-gray-200 rounded-l-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-600">{t("sell_page.form.email")} {t("sell_page.form.required")}</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder={t("sell_page.form.email_placeholder")}
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-gray-200"
                            />
                          </div>
                        </div>

                        {/* Privacy */}
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="acceptPrivacy"
                            checked={formData.acceptPrivacy}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, acceptPrivacy: checked as boolean })
                            }
                          />
                          <Label htmlFor="acceptPrivacy" className="text-sm text-gray-600">
                            {t("sell_page.form.accept_privacy")}{" "}
                            <button
                              type="button"
                              onClick={() => setOpenPrivacyModal(true)}
                              className="text-primary hover:text-gray-600 underline"
                            >
                              {t("sell_page.form.privacy_policy")}
                            </button>.
                          </Label>
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? t("sell_page.form.validating") : NAV_LABELS[language].submit}
                        </Button>
                        <button
                          type="button"
                          onClick={handleBack}
                          className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                        >
                          {NAV_LABELS[language].back}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* How it works + benefits */}
      {(() => {
        const P = PROCESS_CONTENT[language] || PROCESS_CONTENT.es;
        return (
          <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-b from-white to-[#FFF5F0]">
            <div className="absolute -top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="container mx-auto max-w-6xl relative z-10">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{P.title}</h2>
                <p className="text-lg text-muted-foreground">{P.subtitle}</p>
              </div>

              {/* 3-step process */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 mb-16">
                {P.steps.map((step, i) => (
                  <div key={i} className="relative flex flex-col items-center text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-primary/30 mb-5">
                      {i + 1}
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-[220px]">{step.desc}</p>
                    {i < P.steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0 border-t-2 border-dashed border-primary/40">
                        <ArrowRight className="absolute -right-1.5 -top-[11px] w-5 h-5 text-primary/60" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 4-grid benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {P.benefits.map((label, i) => {
                  const Icon = PROCESS_BENEFIT_ICONS[i];
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-gray-100 shadow-xl hover:shadow-[0_12px_30px_rgba(227,6,19,0.3)] hover:border-red-500 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center text-center"
                    >
                      <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#E52B28]/15 to-[#E52B28]/5 border border-[#E52B28]/20 flex items-center justify-center text-[#E52B28] shadow-sm mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-foreground leading-snug">{label}</h4>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

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

export default Sell;
