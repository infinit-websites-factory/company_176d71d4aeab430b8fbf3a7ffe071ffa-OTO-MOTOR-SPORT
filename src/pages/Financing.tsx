import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, CheckCircle, ArrowRight, ArrowLeft, Shield, Clock, Sparkles, Loader2 } from "lucide-react";
import financingBg from "@/assets/img5.jpg";
import financingCars from "@/assets/oto-motor-financing-cars.jpg";

const CAR_WAITS_BADGE: Record<string, string> = {
  es: "Tu coche ideal te espera",
  en: "Your ideal car awaits",
  fr: "Votre voiture idéale vous attend",
};

const FINANCING_BADGE: Record<string, string> = {
  es: "Tasas rápidas y flexibles",
  en: "Quick & Flexible Rates",
  fr: "Taux rapides et flexibles",
};
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CONTACT_FORM_API_URL, PROFILE_ID, fetchCarsPaginated, transformApiCarToVehicle, Vehicle } from "@/services/carsApi";

const Financing = () => {
  const { toast } = useToast();
  const { language, getPhoneNumber, getAddress, t, formatPrice } = useLanguage();
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
  const [vehicleSelectOpen, setVehicleSelectOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehiculoId: "",
    entradaInicial: "",
    plazoPago: "",
    dniNie: "",
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    estadoCivil: "",
    numeroHijos: "",
    direccion: "",
    codigoPostal: "",
    poblacion: "",
    gastosHipotecaAlquiler: "",
    situacionEmpleo: "",
    antiguedadEmpleo: "",
    empresaTrabajo: "",
    ingresoNetoMensual: "",
    nacionalidad: "",
    acceptPrivacy: false
  });

  const totalSteps = 5;

  // Server-side paginated vehicle list for the dropdown (30 at a time).
  // We never load every car at once — the next page loads as the user scrolls.
  const VEHICLE_PAGE_SIZE = 30;
  const {
    data: vehiclesData,
    isLoading: loadingVehicles,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['financing-vehicles'],
    queryFn: ({ pageParam = 1 }) => fetchCarsPaginated({ page: pageParam, size: VEHICLE_PAGE_SIZE }),
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const vehicles: Vehicle[] = vehiclesData
    ? vehiclesData.pages.flatMap((p) => p.items.map(transformApiCarToVehicle))
    : [];
  const totalVehicles = vehiclesData?.pages[0]?.total ?? 0;

  // Infinite scroll inside the (Radix) dropdown: when the user scrolls near the
  // bottom of the open list, fetch the next page and append it.
  useEffect(() => {
    if (!vehicleSelectOpen) return;
    let cleanup: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      const viewport = document.querySelector('[data-radix-select-viewport]') as HTMLElement | null;
      if (!viewport) return;
      const onScroll = () => {
        if (
          viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 120 &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      };
      viewport.addEventListener('scroll', onScroll);
      cleanup = () => viewport.removeEventListener('scroll', onScroll);
    }, 60);
    return () => {
      window.clearTimeout(timer);
      cleanup?.();
    };
  }, [vehicleSelectOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const plazoPagoOptions = ["12", "18", "24", "36", "48", "60", "72", "84", "96", "108", "120"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehiculoId) {
      newErrors.vehiculoId = t('financing_page.form.required_field');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.entradaInicial) {
      newErrors.entradaInicial = t('financing_page.form.required_field');
    } else if (parseFloat(formData.entradaInicial) < 0) {
      newErrors.entradaInicial = t('financing_page.form.positive_amount');
    }

    if (!formData.plazoPago) {
      newErrors.plazoPago = t('financing_page.form.required_field');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.dniNie) {
      newErrors.dniNie = t('financing_page.form.required_field');
    }
    if (!formData.nombre) {
      newErrors.nombre = t('financing_page.form.required_field');
    }
    if (!formData.apellidos) {
      newErrors.apellidos = t('financing_page.form.required_field');
    }
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = t('financing_page.form.required_field');
    }
    if (!formData.estadoCivil) {
      newErrors.estadoCivil = t('financing_page.form.required_field');
    }
    if (!formData.nacionalidad) {
      newErrors.nacionalidad = t('financing_page.form.required_field');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.situacionEmpleo) {
      newErrors.situacionEmpleo = t('financing_page.form.required_field');
    }
    if (!formData.ingresoNetoMensual) {
      newErrors.ingresoNetoMensual = t('financing_page.form.required_field');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else if (currentStep === 3) {
      isValid = validateStep3();
    } else if (currentStep === 4) {
      isValid = validateStep4();
    }

    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t('financing_page.form.required_field');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('financing_page.form.invalid_email');
    }

    if (!formData.telefono) {
      newErrors.telefono = t('financing_page.form.required_field');
    }
    if (!formData.direccion) {
      newErrors.direccion = t('financing_page.form.required_field');
    }
    if (!formData.codigoPostal) {
      newErrors.codigoPostal = t('financing_page.form.required_field');
    }
    if (!formData.poblacion) {
      newErrors.poblacion = t('financing_page.form.required_field');
    }

    setErrors(newErrors);

    if (!formData.acceptPrivacy) {
      toast({
        title: "Error",
        description: t('financing_page.errors.privacy_required'),
        variant: "destructive"
      });
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedVehicle = vehicles.find(v => v.id === formData.vehiculoId);

      let vehicleInfo = t('financing_page.form.not_specified');
      let priceInfo = '';

      if (selectedVehicle) {
        vehicleInfo = `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})`;
        priceInfo = `Precio: ${formatPrice(selectedVehicle.price)}`;
      }

      const message = `SOLICITUD DE FINANCIACIÓN

=== VEHÍCULO SELECCIONADO ===
${vehicleInfo}
${priceInfo}

=== DETALLES DE FINANCIACIÓN ===
Entrada inicial: ${formatPrice(parseFloat(formData.entradaInicial))}
Plazo de pago: ${formData.plazoPago} meses

=== DATOS PERSONALES ===
DNI/NIE: ${formData.dniNie}
Nombre: ${formData.nombre}
Apellidos: ${formData.apellidos}
Fecha de nacimiento: ${formData.fechaNacimiento}
Estado civil: ${formData.estadoCivil}
Número de hijos: ${formData.numeroHijos || t('financing_page.form.not_specified')}
Nacionalidad: ${formData.nacionalidad}

=== DATOS DE CONTACTO ===
Email: ${formData.email}
Teléfono: ${formData.telefono}
Dirección: ${formData.direccion}
Código postal: ${formData.codigoPostal}
Población: ${formData.poblacion}

=== SITUACIÓN FINANCIERA Y LABORAL ===
Situación de empleo: ${formData.situacionEmpleo}
Antigüedad en empleo: ${formData.antiguedadEmpleo || t('financing_page.form.not_specified')}
Empresa: ${formData.empresaTrabajo || t('financing_page.form.not_specified')}
Ingreso neto mensual: ${formatPrice(parseFloat(formData.ingresoNetoMensual))}
Gastos hipoteca/alquiler mensual: ${formData.gastosHipotecaAlquiler ? formatPrice(parseFloat(formData.gastosHipotecaAlquiler)) : t('financing_page.form.not_specified')}`;

      const payload = {
        profile_id: PROFILE_ID,
        lead_firstname: formData.nombre,
        lead_lastname: formData.apellidos,
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

      setCurrentStep(6);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: t('financing_page.errors.submission_error'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO page="financing" />
      <Header />

      <main className="flex-1">
        {/* Hero Section with Form */}
        <section className="relative pt-12 pb-20 px-4 overflow-hidden bg-gradient-to-br from-[#F8F9FA] via-white to-[#F8F9FA]">
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          {/* Soft ambient glow behind the form for depth */}
          <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-[#111111]/8 rounded-full blur-3xl translate-y-1/4 translate-x-1/4 pointer-events-none" />

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Center column - Value proposition */}
              <div className="order-2 lg:col-span-7 space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                    <span aria-hidden="true">⚡</span>
                    {FINANCING_BADGE[language] || FINANCING_BADGE.en}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                    {t('financing_page.hero.title')}
                  </h1>
                  {/* Red accent bar */}
                  <div className="h-1.5 w-16 rounded-full bg-primary" />
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('financing_page.hero.subtitle')}
                  </p>
                </div>

                {/* Benefits — compact rows in one container */}
                <div className="rounded-2xl bg-white border border-gray-200/70 shadow-[0_10px_30px_rgba(0,0,0,0.28)] divide-y divide-gray-100 overflow-hidden">
                  {[
                    { icon: Shield, key: 'reduced_payments' },
                    { icon: Clock, key: 'fast_approval' },
                    { icon: CheckCircle2, key: 'no_surprises' },
                  ].map(({ icon: Icon, key }) => (
                    <div key={key} className="flex items-center gap-4 p-4 hover:bg-gray-100/40 transition-colors">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#111111]/15 to-[#111111]/5 border border-[#111111]/20 flex items-center justify-center text-[#111111]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-foreground leading-snug">{t(`financing_page.benefits.${key}.title`)}</h3>
                        <p className="text-slate-500 text-sm leading-snug">{t(`financing_page.benefits.${key}.description`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Left column - Car visual */}
              <div className="order-1 lg:col-span-5 hidden lg:block relative before:absolute before:-inset-3 before:bg-gradient-to-tr before:from-[#111111]/25 before:to-transparent before:blur-2xl before:rounded-3xl before:-z-10">
                <div className="relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/10 border border-transparent hover:border-gray-900 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out cursor-pointer">
                  <img
                    src={financingCars}
                    alt="OTO MOTOR"
                    className="object-cover object-right h-[520px] w-full"
                  />
                  {/* Legibility gradient at the bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  {/* Floating badge - bottom right (clears the baked-in OTO watermark) */}
                  <div className="absolute bottom-4 right-4">
                    <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-lg text-sm font-bold text-white backdrop-blur-md bg-black/40">
                      <span className="w-2.5 h-2.5 rounded-full bg-foreground animate-pulse" />
                      {CAR_WAITS_BADGE[language] || CAR_WAITS_BADGE.es}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
        {/* Financing form */}
        <section className="relative px-4 pb-20 bg-gradient-to-b from-[#F8F9FA] to-background">
          <div className="relative group max-w-2xl mx-auto">
            {/* Even red halo like the "Call us" card */}
            <div className="absolute -inset-1 bg-[#111111]/25 rounded-3xl blur-xl -z-10" />
            <Card className="relative bg-white rounded-2xl border border-gray-200/70 hover:border-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.28)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.42)] hover:-translate-y-1.5 transition-all duration-300 ease-out z-10">
                  <CardHeader className="space-y-4">
                    {currentStep === 1 && (
                      <div className="space-y-2">
                        <CardTitle className="text-2xl text-primary">{t('financing_page.form.step1.title')}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {t('financing_page.form.step1.subtitle')}
                        </p>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-2">
                        <CardTitle className="text-2xl text-primary">{t('financing_page.form.step2.title')}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {t('financing_page.form.step2.subtitle')}
                        </p>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-2">
                        <CardTitle className="text-2xl text-primary">{t('financing_page.form.step3.title')}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {t('financing_page.form.step3.subtitle')}
                        </p>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-2">
                        <CardTitle className="text-2xl text-primary">{t('financing_page.form.step4.title')}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {t('financing_page.form.step4.subtitle')}
                        </p>
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className="space-y-2">
                        <CardTitle className="text-2xl text-primary">{t('financing_page.form.step5.title')}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {t('financing_page.form.step5.subtitle')}
                        </p>
                      </div>
                    )}

                    {currentStep === 6 && null}
                  </CardHeader>

                  <CardContent>
                    {/* Step 1: Car Selection */}
                    {currentStep === 1 && (
                      <form onSubmit={handleNext} className="space-y-6">
                        <div className="space-y-6 animate-fade-in">
                          <div className="space-y-2">
                            <Label htmlFor="vehiculoId" className="text-gray-600">
                              {t('financing_page.form.vehicle_select')} *
                              {totalVehicles > 0 && (
                                <span className="ml-1 text-muted-foreground font-normal">({totalVehicles})</span>
                              )}
                            </Label>
                            {loadingVehicles ? (
                              <div className="text-center py-8 text-muted-foreground">
                                {t('financing_page.form.loading_vehicles')}
                              </div>
                            ) : (
                              <Select
                                value={formData.vehiculoId}
                                onValueChange={(value) => {
                                  handleSelectChange("vehiculoId", value);
                                  setErrors({ ...errors, vehiculoId: "" });
                                }}
                                onOpenChange={setVehicleSelectOpen}
                                required
                              >
                                <SelectTrigger className={`bg-gray-50 data-[placeholder]:text-muted-foreground ${errors.vehiculoId ? "border-red-500" : "border-gray-200"}`}>
                                  <SelectValue placeholder={t('financing_page.form.vehicle_select_placeholder')} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  {vehicles.map((vehicle) => (
                                    <SelectItem key={vehicle.id} value={vehicle.id}>
                                      {vehicle.brand} {vehicle.model} ({vehicle.year}) - {formatPrice(vehicle.price)}
                                    </SelectItem>
                                  ))}
                                  {isFetchingNextPage && (
                                    <div className="flex justify-center py-2 text-muted-foreground">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                            {errors.vehiculoId && <p className="text-sm text-red-500">{errors.vehiculoId}</p>}
                          </div>

                          {formData.vehiculoId && vehicles.find(v => v.id === formData.vehiculoId) && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              {(() => {
                                const vehicle = vehicles.find(v => v.id === formData.vehiculoId);
                                if (!vehicle) return null;

                                return (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-foreground">
                                      {vehicle.brand} {vehicle.model} ({vehicle.year})
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                      <div>{t('financing_page.form.price')}: <span className="font-semibold text-foreground">{formatPrice(vehicle.price)}</span></div>
                                      <div>{t('stock_page.results_count')}: {vehicle.mileage.toLocaleString('en-GB')}</div>
                                      <div>{t('sell_page.form.fuel')}: {vehicle.fuel}</div>
                                      <div>{t('sell_page.form.transmission')}: {vehicle.transmission}</div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={loadingVehicles}
                          >
                            {t('financing_page.form.continue')}
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Step 2: Financial Details */}
                    {currentStep === 2 && (
                      <form onSubmit={handleNext} className="space-y-6">
                        <div className="space-y-6 animate-fade-in">
                          {/* Selected Vehicle Context */}
                          {(() => {
                            const selectedVehicle = vehicles.find(v => v.id === formData.vehiculoId);
                            if (!selectedVehicle) return null;

                            const vehiclePrice = selectedVehicle.price;

                            return (
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">
                                    {selectedVehicle.brand} {selectedVehicle.model} · {formatPrice(vehiclePrice)}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {(() => {
                            const selectedVehicle = vehicles.find(v => v.id === formData.vehiculoId);
                            if (!selectedVehicle) return null;

                            const vehiclePrice = selectedVehicle.price;
                            const downPayment = parseFloat(formData.entradaInicial) || 0;
                            const loanAmount = Math.max(0, vehiclePrice - downPayment);
                            const maxDownPayment = vehiclePrice;

                            return (
                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-gray-600">{t('financing_page.form.down_payment')} *</Label>
                                    <span className="text-lg font-semibold text-primary">
                                      {formatPrice(downPayment)}
                                    </span>
                                  </div>
                                  <Slider
                                    value={[downPayment]}
                                    onValueChange={(values) => {
                                      setFormData({ ...formData, entradaInicial: values[0].toString() });
                                      setErrors({ ...errors, entradaInicial: "" });
                                    }}
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

                                {errors.entradaInicial && <p className="text-sm text-red-500">{errors.entradaInicial}</p>}
                              </div>
                            );
                          })()}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                              const selectedVehicle = vehicles.find(v => v.id === formData.vehiculoId);
                              if (!selectedVehicle) return null;

                              const vehiclePrice = selectedVehicle.price;
                              const downPayment = parseFloat(formData.entradaInicial) || 0;
                              const loanAmount = Math.max(0, vehiclePrice - downPayment);

                              return (
                                <div className="space-y-2">
                                  <Label className="text-gray-600">{t('financing_page.form.amount_to_finance')}</Label>
                                  <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                                    <span className="font-bold text-foreground">
                                      {formatPrice(loanAmount)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}

                            <div className="space-y-2">
                              <Label htmlFor="plazoPago" className="text-gray-600">{t('financing_page.form.payment_term')} *</Label>
                              <Select
                                value={formData.plazoPago}
                                onValueChange={(value) => {
                                  handleSelectChange("plazoPago", value);
                                  setErrors({ ...errors, plazoPago: "" });
                                }}
                                required
                              >
                                <SelectTrigger className={`bg-gray-50 data-[placeholder]:text-muted-foreground ${errors.plazoPago ? "border-red-500" : "border-gray-200"}`}>
                                  <SelectValue placeholder={t('financing_page.form.payment_term_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {plazoPagoOptions.map((plazo) => (
                                    <SelectItem key={plazo} value={plazo}>{plazo} {t('financing_page.form.payment_term_months')}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.plazoPago && <p className="text-sm text-red-500">{errors.plazoPago}</p>}
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                          >
                            {t('financing_page.form.continue')}
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Step 3: Personal Information */}
                    {currentStep === 3 && (
                      <form onSubmit={handleNext} className="space-y-6">
                        <div className="space-y-6 animate-fade-in">
                          {/* Selected Vehicle Context */}
                          {(() => {
                            const selectedVehicle = vehicles.find(v => v.id === formData.vehiculoId);
                            if (!selectedVehicle) return null;

                            const vehiclePrice = selectedVehicle.price;
                            const downPayment = parseFloat(formData.entradaInicial) || 0;
                            const loanAmount = Math.max(0, vehiclePrice - downPayment);

                            return (
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">
                                    {selectedVehicle.brand} {selectedVehicle.model} · {formatPrice(vehiclePrice)}
                                  </span>
                                  {formData.entradaInicial && (
                                    <span className="font-semibold text-primary">
                                      {t('financing_page.form.financing')}: {formatPrice(loanAmount)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          <div className="space-y-2">
                            <Label htmlFor="dniNie" className="text-gray-600">{t('financing_page.form.dni_nie')} *</Label>
                            <Input
                              id="dniNie"
                              placeholder={t('financing_page.form.dni_nie_placeholder')}
                              value={formData.dniNie}
                              onChange={(e) => {
                                handleInputChange(e);
                                setErrors({ ...errors, dniNie: "" });
                              }}
                              required
                              className={`bg-gray-50 ${errors.dniNie ? "border-red-500" : "border-gray-200"}`}
                            />
                            {errors.dniNie && <p className="text-sm text-red-500">{errors.dniNie}</p>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="nombre" className="text-gray-600">{t('financing_page.form.first_name')} *</Label>
                              <Input
                                id="nombre"
                                placeholder={t('financing_page.form.first_name_placeholder')}
                                value={formData.nombre}
                                onChange={(e) => {
                                  handleInputChange(e);
                                  setErrors({ ...errors, nombre: "" });
                                }}
                                required
                                className={`bg-gray-50 ${errors.nombre ? "border-red-500" : "border-gray-200"}`}
                              />
                              {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="apellidos" className="text-gray-600">{t('financing_page.form.last_name')} *</Label>
                              <Input
                                id="apellidos"
                                placeholder={t('financing_page.form.last_name_placeholder')}
                                value={formData.apellidos}
                                onChange={(e) => {
                                  handleInputChange(e);
                                  setErrors({ ...errors, apellidos: "" });
                                }}
                                required
                                className={`bg-gray-50 ${errors.apellidos ? "border-red-500" : "border-gray-200"}`}
                              />
                              {errors.apellidos && <p className="text-sm text-red-500">{errors.apellidos}</p>}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fechaNacimiento" className="text-gray-600">{t('financing_page.form.date_of_birth')} *</Label>
                              <Input
                                id="fechaNacimiento"
                                type="date"
                                value={formData.fechaNacimiento}
                                onChange={(e) => {
                                  handleInputChange(e);
                                  setErrors({ ...errors, fechaNacimiento: "" });
                                }}
                                required
                                className={`bg-gray-50 ${errors.fechaNacimiento ? "border-red-500" : "border-gray-200"}`}
                              />
                              {errors.fechaNacimiento && <p className="text-sm text-red-500">{errors.fechaNacimiento}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="estadoCivil" className="text-gray-600">{t('financing_page.form.marital_status')} *</Label>
                              <Select
                                value={formData.estadoCivil}
                                onValueChange={(value) => {
                                  handleSelectChange("estadoCivil", value);
                                  setErrors({ ...errors, estadoCivil: "" });
                                }}
                                required
                              >
                                <SelectTrigger className={`bg-gray-50 data-[placeholder]:text-muted-foreground ${errors.estadoCivil ? "border-red-500" : "border-gray-200"}`}>
                                  <SelectValue placeholder={t('financing_page.form.marital_status_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="soltero">{t('financing_page.form.marital_status_options.single')}</SelectItem>
                                  <SelectItem value="casado">{t('financing_page.form.marital_status_options.married')}</SelectItem>
                                  <SelectItem value="divorciado">{t('financing_page.form.marital_status_options.divorced')}</SelectItem>
                                  <SelectItem value="viudo">{t('financing_page.form.marital_status_options.widowed')}</SelectItem>
                                  <SelectItem value="separado">{t('financing_page.form.marital_status_options.separated')}</SelectItem>
                                  <SelectItem value="otro">{t('financing_page.form.marital_status_options.other')}</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.estadoCivil && <p className="text-sm text-red-500">{errors.estadoCivil}</p>}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="numeroHijos" className="text-gray-600">{t('financing_page.form.number_of_children')}</Label>
                              <Input
                                id="numeroHijos"
                                type="number"
                                placeholder="0"
                                value={formData.numeroHijos}
                                onChange={handleInputChange}
                                min="0"
                                className="bg-white border-gray-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="nacionalidad" className="text-gray-600">{t('financing_page.form.nationality')} *</Label>
                              <Input
                                id="nacionalidad"
                                placeholder={t('financing_page.form.nationality_placeholder')}
                                value={formData.nacionalidad}
                                onChange={(e) => {
                                  handleInputChange(e);
                                  setErrors({ ...errors, nacionalidad: "" });
                                }}
                                required
                                className={`bg-gray-50 ${errors.nacionalidad ? "border-red-500" : "border-gray-200"}`}
                              />
                              {errors.nacionalidad && <p className="text-sm text-red-500">{errors.nacionalidad}</p>}
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                          >
                            {t('financing_page.form.continue')}
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Step 4: Employment and Financial Situation */}
                    {currentStep === 4 && (
                      <form onSubmit={handleNext} className="space-y-6">
                        <div className="space-y-6 animate-fade-in">
                          {/* Selected Vehicle Context */}
                          {(() => {
                            const selectedVehicle = vehicles.find(v => v.id === formData.vehiculoId);
                            if (!selectedVehicle) return null;

                            const vehiclePrice = selectedVehicle.price;
                            const downPayment = parseFloat(formData.entradaInicial) || 0;
                            const loanAmount = Math.max(0, vehiclePrice - downPayment);

                            return (
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">
                                    {selectedVehicle.brand} {selectedVehicle.model} · {formatPrice(vehiclePrice)}
                                  </span>
                                  {formData.entradaInicial && (
                                    <span className="font-semibold text-primary">
                                      {t('financing_page.form.financing')}: {formatPrice(loanAmount)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          <div className="space-y-2">
                            <Label htmlFor="situacionEmpleo" className="text-gray-600">{t('financing_page.form.employment_status')} *</Label>
                            <Select
                              value={formData.situacionEmpleo}
                              onValueChange={(value) => {
                                handleSelectChange("situacionEmpleo", value);
                                setErrors({ ...errors, situacionEmpleo: "" });
                              }}
                              required
                            >
                              <SelectTrigger className={`bg-gray-50 data-[placeholder]:text-muted-foreground ${errors.situacionEmpleo ? "border-red-500" : "border-gray-200"}`}>
                                <SelectValue placeholder={t('financing_page.form.employment_status_placeholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="empleado-cuenta-ajena">{t('financing_page.form.employment_status_options.employee')}</SelectItem>
                                <SelectItem value="autonomo">{t('financing_page.form.employment_status_options.self_employed')}</SelectItem>
                                <SelectItem value="funcionario">{t('financing_page.form.employment_status_options.civil_servant')}</SelectItem>
                                <SelectItem value="jubilado">{t('financing_page.form.employment_status_options.retired')}</SelectItem>
                                <SelectItem value="desempleado">{t('financing_page.form.employment_status_options.unemployed')}</SelectItem>
                                <SelectItem value="estudiante">{t('financing_page.form.employment_status_options.student')}</SelectItem>
                                <SelectItem value="otro">{t('financing_page.form.employment_status_options.other')}</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.situacionEmpleo && <p className="text-sm text-red-500">{errors.situacionEmpleo}</p>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="antiguedadEmpleo" className="text-gray-600">{t('financing_page.form.employment_duration')}</Label>
                              <Input
                                id="antiguedadEmpleo"
                                type="number"
                                placeholder="5"
                                value={formData.antiguedadEmpleo}
                                onChange={handleInputChange}
                                min="0"
                                step="0.5"
                                className="bg-white border-gray-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="empresaTrabajo" className="text-gray-600">{t('financing_page.form.company_name')}</Label>
                              <Input
                                id="empresaTrabajo"
                                placeholder={t('financing_page.form.company_name_placeholder')}
                                value={formData.empresaTrabajo}
                                onChange={handleInputChange}
                                className="bg-white border-gray-200"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="ingresoNetoMensual" className="text-gray-600">{t('financing_page.form.monthly_net_income')} *</Label>
                              <Input
                                id="ingresoNetoMensual"
                                type="number"
                                placeholder={t('financing_page.form.monthly_net_income_placeholder')}
                                value={formData.ingresoNetoMensual}
                                onChange={(e) => {
                                  handleInputChange(e);
                                  setErrors({ ...errors, ingresoNetoMensual: "" });
                                }}
                                required
                                min="0"
                                step="100"
                                className={`bg-gray-50 ${errors.ingresoNetoMensual ? "border-red-500" : "border-gray-200"}`}
                              />
                              {errors.ingresoNetoMensual && <p className="text-sm text-red-500">{errors.ingresoNetoMensual}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gastosHipotecaAlquiler" className="text-gray-600">{t('financing_page.form.mortgage_rent_expenses')}</Label>
                              <Input
                                id="gastosHipotecaAlquiler"
                                type="number"
                                placeholder={t('financing_page.form.mortgage_rent_expenses_placeholder')}
                                value={formData.gastosHipotecaAlquiler}
                                onChange={handleInputChange}
                                min="0"
                                step="50"
                                className="bg-white border-gray-200"
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                          >
                            {t('financing_page.form.continue')}
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Step 5: Contact Information */}
                    {currentStep === 5 && (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6 animate-fade-in">
                          {/* Selected Vehicle Context */}
                          {(() => {
                            const selectedVehicle = vehicles.find(v => v.id === formData.vehiculoId);
                            if (!selectedVehicle) return null;

                            const vehiclePrice = selectedVehicle.price;
                            const downPayment = parseFloat(formData.entradaInicial) || 0;
                            const loanAmount = Math.max(0, vehiclePrice - downPayment);

                            return (
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">
                                    {selectedVehicle.brand} {selectedVehicle.model} · {formatPrice(vehiclePrice)}
                                  </span>
                                  {formData.entradaInicial && (
                                    <span className="font-semibold text-primary">
                                      {t('financing_page.form.financing')}: {formatPrice(loanAmount)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-gray-600">{t('financing_page.form.email')} *</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder={t('financing_page.form.email_placeholder')}
                                value={formData.email}
                                onChange={(e) => {
                                  handleInputChange(e);
                                  setErrors({ ...errors, email: "" });
                                }}
                                required
                                className={`bg-gray-50 ${errors.email ? "border-red-500" : "border-gray-200"}`}
                              />
                              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="telefono" className="text-gray-600">{t('financing_page.form.phone')} *</Label>
                              <div className="flex">
                                <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">
                                  <span className="text-sm text-foreground font-semibold">{getFlag()}</span>
                                </div>
                                <Input
                                  id="telefono"
                                  type="tel"
                                  placeholder={t('financing_page.form.phone_placeholder')}
                                  value={formData.telefono}
                                  onChange={(e) => {
                                    handleInputChange(e);
                                    setErrors({ ...errors, telefono: "" });
                                  }}
                                  required
                                  className={`bg-gray-50 rounded-l-none ${errors.telefono ? "border-red-500" : "border-gray-200"}`}
                                />
                              </div>
                              {errors.telefono && <p className="text-sm text-red-500">{errors.telefono}</p>}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="direccion" className="text-gray-600">{t('financing_page.form.address')} *</Label>
                            <Input
                              id="direccion"
                              placeholder={t('financing_page.form.address_placeholder')}
                              value={formData.direccion}
                              onChange={(e) => {
                                handleInputChange(e);
                                setErrors({ ...errors, direccion: "" });
                              }}
                              required
                              className={`bg-gray-50 ${errors.direccion ? "border-red-500" : "border-gray-200"}`}
                            />
                            {errors.direccion && <p className="text-sm text-red-500">{errors.direccion}</p>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="codigoPostal" className="text-gray-600">{t('financing_page.form.postal_code')} *</Label>
                              <Input
                                id="codigoPostal"
                                placeholder={t('financing_page.form.postal_code_placeholder')}
                                value={formData.codigoPostal}
                                onChange={(e) => {
                                  handleInputChange(e);
                                  setErrors({ ...errors, codigoPostal: "" });
                                }}
                                required
                                className={`bg-gray-50 ${errors.codigoPostal ? "border-red-500" : "border-gray-200"}`}
                              />
                              {errors.codigoPostal && <p className="text-sm text-red-500">{errors.codigoPostal}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="poblacion" className="text-gray-600">{t('financing_page.form.city')} *</Label>
                              <Input
                                id="poblacion"
                                placeholder={t('financing_page.form.city_placeholder')}
                                value={formData.poblacion}
                                onChange={(e) => {
                                  handleInputChange(e);
                                  setErrors({ ...errors, poblacion: "" });
                                }}
                                required
                                className={`bg-gray-50 ${errors.poblacion ? "border-red-500" : "border-gray-200"}`}
                              />
                              {errors.poblacion && <p className="text-sm text-red-500">{errors.poblacion}</p>}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-start space-x-2">
                              <Checkbox
                                id="acceptPrivacy"
                                checked={formData.acceptPrivacy}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, acceptPrivacy: checked as boolean })
                                }
                              />
                              <Label htmlFor="acceptPrivacy" className="text-sm text-gray-600">
                                {t('financing_page.form.accept_privacy')}{" "}
                                <button
                                  type="button"
                                  onClick={() => setOpenPrivacyModal(true)}
                                  className="text-primary hover:text-gray-600 underline"
                                >
                                  {t('financing_page.form.privacy_policy')}
                                </button>.
                              </Label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Button
                              type="submit"
                              className="w-full"
                              size="lg"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? t('financing_page.form.validating') : t('financing_page.form.validate')}
                            </Button>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentStep(1);
                                setFormData({
                                  vehiculoId: "",
                                  entradaInicial: "",
                                  plazoPago: "",
                                  dniNie: "",
                                  nombre: "",
                                  apellidos: "",
                                  email: "",
                                  telefono: "",
                                  fechaNacimiento: "",
                                  estadoCivil: "",
                                  numeroHijos: "",
                                  direccion: "",
                                  codigoPostal: "",
                                  poblacion: "",
                                  gastosHipotecaAlquiler: "",
                                  situacionEmpleo: "",
                                  antiguedadEmpleo: "",
                                  empresaTrabajo: "",
                                  ingresoNetoMensual: "",
                                  nacionalidad: "",
                                  acceptPrivacy: false
                                });
                              }}
                              className="w-full text-center text-sm text-muted-foreground hover:text-foreground underline"
                            >
                              {t('financing_page.form.cancel')}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Step 6: Success Message */}
                    {currentStep === 6 && (
                      <div className="space-y-6">
                        <div className="space-y-6 text-center py-8 animate-fade-in">
                          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                          </div>

                          <div className="space-y-3">
                            <h3 className="text-2xl font-bold text-foreground">
                              {t('financing_page.success.title')}
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              {t('financing_page.success.description')} <span className="font-semibold text-foreground">{t('financing_page.success.hours')}</span> {t('financing_page.success.description_suffix')}
                            </p>
                          </div>

                          <Button
                            type="button"
                            onClick={() => {
                              setCurrentStep(1);
                              setFormData({
                                vehiculoId: "",
                                entradaInicial: "",
                                plazoPago: "",
                                dniNie: "",
                                nombre: "",
                                apellidos: "",
                                email: "",
                                telefono: "",
                                fechaNacimiento: "",
                                estadoCivil: "",
                                numeroHijos: "",
                                direccion: "",
                                codigoPostal: "",
                                poblacion: "",
                                gastosHipotecaAlquiler: "",
                                situacionEmpleo: "",
                                antiguedadEmpleo: "",
                                empresaTrabajo: "",
                                ingresoNetoMensual: "",
                                nacionalidad: "",
                                acceptPrivacy: false
                              });
                            }}
                            variant="outline"
                            size="lg"
                          >
                            {t('financing_page.success.back_home')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
          </div>
        </section>
      </main>

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

export default Financing;
