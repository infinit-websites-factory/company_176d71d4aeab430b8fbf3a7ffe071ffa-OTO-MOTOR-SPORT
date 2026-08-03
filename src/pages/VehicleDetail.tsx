import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Share2, MapPin, Phone, Calendar, Mail, User, X, Gauge, Fuel, Cog, Car, Palette, DoorOpen, Users, Cylinder, Zap } from "lucide-react";
import { fetchCars, transformApiCarToVehicle, type Vehicle, CONTACT_FORM_API_URL, PROFILE_ID } from "@/services/carsApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ReservedBanner from "@/components/ReservedBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import dgtB from "@/assets/dgt-b.png";
import dgtC from "@/assets/dgt-c.png";
import dgtCero from "@/assets/dgt-cero.png";
import dgtEco from "@/assets/dgt-eco.png";
const VehicleDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const { toast: toastHook } = useToast();
  const { language, getPhoneNumber, getAddress, t, translateVehicleAttribute, formatPrice, getCurrencySymbol } = useLanguage();
  const address = getAddress();

  const getFlag = () => {
    switch (language) {
      case "es": return "🇪🇸";
      case "en": return "🇬🇧";
      case "fr": return "🇫🇷";
      default: return "🇪🇸";
    }
  };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  // Keep the active thumbnail in view as the main image changes
  // (scroll only the strip horizontally — avoids scrollIntoView moving the page)
  useEffect(() => {
    const strip = thumbsRef.current;
    const active = strip?.children[currentImageIndex] as HTMLElement | undefined;
    if (!strip || !active) return;
    const left = active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2;
    strip.scrollTo({ left, behavior: "smooth" });
  }, [currentImageIndex]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  // Form data states
  const [appointmentFormData, setAppointmentFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fecha: "",
    hora: "",
    mensaje: "",
    acceptTerms: false
  });

  const [reservationFormData, setReservationFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    mensaje: "",
    acceptTerms: false
  });

  const [contactFormData, setContactFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    mensaje: ""
  });
  const {
    data: carsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchCars,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
  const foundCar = carsData?.items.find(car => car.id === id);
  const vehicle: Vehicle | undefined = foundCar ? transformApiCarToVehicle(foundCar) : undefined;
  useEffect(() => {
    if (!isLoading && !vehicle) {
      navigate('/stock');
    }
  }, [vehicle, isLoading, navigate]);
  if (isLoading || !vehicle) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-8 pb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-50 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-video bg-gray-50 rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-50 rounded w-2/3"></div>
                <div className="h-4 bg-gray-50 rounded w-1/2"></div>
                <div className="h-10 bg-gray-50 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % vehicle.images.length);
  };
  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };
  const monthlyPayment = Math.round(vehicle.price / 84); // 84 months financing

  const getBadgeImage = (badge?: string) => {
    if (!badge) return null;
    const badgeLower = badge.toLowerCase();
    // Check more specific patterns first to avoid incorrect matches
    if (badgeLower.includes('cero') || badgeLower.includes('0')) return dgtCero;
    if (badgeLower.includes('eco')) return dgtEco;
    if (badgeLower.includes('c')) return dgtC;
    if (badgeLower.includes('b')) return dgtB;
    return null;
  };

  const badgeImage = getBadgeImage(vehicle.environmentalBadge);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('vehicle_detail.actions.link_copied'));
  };
  const handleReserve = () => {
    toast.success(t('vehicle_detail.reserve.success'));
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationFormData.acceptTerms) {
      toastHook({
        title: "Error",
        description: t('vehicle_detail.errors.privacy_required'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingReservation(true);

    try {
      const payload = {
        profile_id: PROFILE_ID,
        lead_firstname: reservationFormData.nombre,
        lead_lastname: reservationFormData.apellido,
        lead_phone_number: reservationFormData.telefono,
        lead_email: reservationFormData.email,
        message: `RESERVA!\n${reservationFormData.mensaje}`,
        interest_car_id: id
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

      toast.success(t('vehicle_detail.reserve.success'));
      setIsReservationModalOpen(false);
      setReservationFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        mensaje: "",
        acceptTerms: false
      });
    } catch (error) {
      console.error('Error submitting reservation:', error);
      toastHook({
        title: "Error",
        description: t('vehicle_detail.errors.reservation_error'),
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReservation(false);
    }
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentFormData.acceptTerms) {
      toastHook({
        title: "Error",
        description: t('vehicle_detail.errors.privacy_required'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingAppointment(true);

    try {
      // Format date from YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = appointmentFormData.fecha.split('-');
      const formattedDate = `${day}/${month}/${year}`;

      const payload = {
        profile_id: PROFILE_ID,
        lead_firstname: appointmentFormData.nombre,
        lead_lastname: appointmentFormData.apellido,
        lead_phone_number: appointmentFormData.telefono,
        lead_email: appointmentFormData.email,
        message: `CITA - ${formattedDate} ${appointmentFormData.hora}\n${appointmentFormData.mensaje}`,
        interest_car_id: id
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

      toast.success(t('vehicle_detail.appointment.success'));
      setIsAppointmentModalOpen(false);
      setAppointmentFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        fecha: "",
        hora: "",
        mensaje: "",
        acceptTerms: false
      });
    } catch (error) {
      console.error('Error submitting appointment:', error);
      toastHook({
        title: "Error",
        description: t('vehicle_detail.errors.appointment_error'),
        variant: "destructive"
      });
    } finally {
      setIsSubmittingAppointment(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmittingContact(true);

    try {
      const payload = {
        profile_id: PROFILE_ID,
        lead_firstname: contactFormData.nombre,
        lead_lastname: contactFormData.apellido,
        lead_phone_number: contactFormData.telefono,
        lead_email: contactFormData.email,
        message: contactFormData.mensaje,
        interest_car_id: id
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

      setIsContactSubmitted(true);
      setContactFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        mensaje: ""
      });
    } catch (error) {
      console.error('Error submitting contact:', error);
      toastHook({
        title: "Error",
        description: t('vehicle_detail.errors.contact_error'),
        variant: "destructive"
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };
  return <div className="min-h-screen bg-background">
      <SEO page="vehicle_detail" vehicleName={vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined} />
      <Header />
      
      <main className="container mx-auto px-4 pt-8 pb-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/stock')} className="p-0 h-auto text-muted-foreground hover:text-muted-foreground hover:bg-transparent">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('vehicle_detail.breadcrumb.back_to_stock')}
          </Button>
        </nav>

        {/* Vehicle Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {vehicle.brand} {vehicle.model}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-100 font-medium">{vehicle.year}</Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-100 font-medium">{translateVehicleAttribute('transmission', vehicle.transmission)}</Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-100 font-medium">{translateVehicleAttribute('fuel', vehicle.fuel)}</Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-100 font-medium">{vehicle.mileage.toLocaleString()} {vehicle.mileageUnit}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2 border-primary/40 text-primary hover:bg-primary hover:text-white hover:border-primary transition-colors">
            <Share2 className="w-4 h-4" />
            {t('vehicle_detail.actions.share')}
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-50 group">
              {vehicle.status === 'Reserved' && <ReservedBanner size="large" />}
              <img src={vehicle.images[currentImageIndex]} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
              
              {vehicle.images.length > 1 && <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-foreground opacity-0 group-hover:opacity-100 hover:bg-[#111111] hover:text-white transition-all">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-foreground opacity-0 group-hover:opacity-100 hover:bg-[#111111] hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm transition-colors hover:bg-[#111111]">
                    {currentImageIndex + 1} / {vehicle.images.length}
                  </div>
                </>}
            </div>

            {/* Thumbnail Navigation — scrollable strip with all images */}
            {vehicle.images.length > 1 && <div ref={thumbsRef} className="flex gap-2 overflow-x-auto pb-2 snap-x thumb-scroll">
                {vehicle.images.map((image, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`shrink-0 w-28 aspect-video rounded overflow-hidden border-2 snap-start transition-colors ${currentImageIndex === index ? 'border-primary' : 'border-transparent hover:border-muted-foreground'}`}>
                    <img src={image} alt={`${t('vehicle_detail.gallery.view_label')} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>)}
              </div>}

            {/* Vehicle Description */}
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle>{t('vehicle_detail.details.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {vehicle.description ? (
                  <div className="text-sm whitespace-pre-line">
                    {vehicle.description}
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <p><strong>{vehicle.brand} {vehicle.model}</strong></p>
                    <p>{t('vehicle_detail.details.financing')}</p>
                    <p>{t('vehicle_detail.details.warranty')}</p>
                    <p>{t('vehicle_detail.details.transfer_costs')} {formatPrice(260)}.</p>
                    <p>{t('vehicle_detail.details.trade_in')}</p>
                    <p>{t('vehicle_detail.details.delivery')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Data */}
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle>{t('vehicle_detail.specifications.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(() => {
                    const specs = [
                      { icon: Calendar, label: t('vehicle_detail.specifications.year'), value: vehicle.year },
                      { icon: Gauge, label: t('vehicle_detail.specifications.mileage'), value: `${vehicle.mileage.toLocaleString()} ${vehicle.mileageUnit}` },
                      { icon: Fuel, label: t('vehicle_detail.specifications.fuel'), value: translateVehicleAttribute('fuel', vehicle.fuel).toUpperCase() },
                      { icon: Cog, label: t('vehicle_detail.specifications.transmission'), value: translateVehicleAttribute('transmission', vehicle.transmission).toUpperCase() },
                      { icon: Car, label: t('vehicle_detail.specifications.body_type'), value: translateVehicleAttribute('body_type', vehicle.type).toUpperCase() },
                      vehicle.color ? { icon: Palette, label: t('vehicle_detail.specifications.color'), value: translateVehicleAttribute('color', vehicle.color).toUpperCase() } : null,
                      vehicle.doors ? { icon: DoorOpen, label: t('vehicle_detail.specifications.doors'), value: vehicle.doors } : null,
                      vehicle.seats ? { icon: Users, label: t('vehicle_detail.specifications.seats'), value: vehicle.seats } : null,
                      vehicle.engineSize ? { icon: Cylinder, label: t('vehicle_detail.specifications.engine_size'), value: `${vehicle.engineSize} ${vehicle.engineSizeUnit}` } : null,
                      vehicle.enginePower ? { icon: Zap, label: t('vehicle_detail.specifications.engine_power'), value: `${vehicle.enginePower} CV` } : null,
                    ].filter(Boolean) as { icon: typeof Calendar; label: string; value: React.ReactNode }[];

                    return specs.map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4 hover:border-primary/30 hover:bg-white hover:shadow-sm transition-all duration-200"
                        >
                          <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Icon className="w-[18px] h-[18px]" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">{s.label}</div>
                            <div className="font-bold text-slate-900 text-sm">{s.value}</div>
                          </div>
                        </div>
                      );
                    });
                  })()}

                  {badgeImage && (
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4 hover:border-primary/30 hover:bg-white hover:shadow-sm transition-all duration-200">
                      <img src={badgeImage} alt={`Badge ${vehicle.environmentalBadge}`} className="w-10 h-10 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">{t('vehicle_detail.specifications.environmental_badge')}</div>
                        <div className="font-bold text-slate-900 text-sm">{(vehicle.environmentalBadge || '').toUpperCase()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-6 sticky top-8 self-start">
            {/* Pricing */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">{t('vehicle_detail.pricing.label')}</div>
              <div className="bg-primary/10 px-3 py-1 rounded-lg inline-block mb-4">
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(vehicle.price)}
                </div>
              </div>
            </div>

            {/* Reserve Button */}
            {vehicle.status !== 'Reserved' && (
            <Card className="bg-gradient-to-br from-[#111111] to-[#000000] text-white rounded-3xl p-6 shadow-xl shadow-black/20 border-0">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-semibold">{t('vehicle_detail.reserve.title')}</span>
                </div>
                <p className="text-sm mb-5 text-white/90">
                  {t('vehicle_detail.reserve.description')}
                </p>
                <Dialog open={isReservationModalOpen} onOpenChange={setIsReservationModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-white text-[#111111] hover:bg-gray-100 font-bold py-3.5 h-auto rounded-2xl transition-all shadow-md">
                      {t('vehicle_detail.reserve.button')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-background">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold text-foreground">
                        {t('vehicle_detail.reserve.modal_title')} {vehicle.brand} {vehicle.model}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReservationSubmit} className="space-y-6 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reservationName" className="text-gray-600">{t('vehicle_detail.form.name')}</Label>
                          <Input
                            id="reservationName"
                            placeholder={t('vehicle_detail.form.name_placeholder')}
                            required
                            className="bg-white border-gray-200"
                            value={reservationFormData.nombre}
                            onChange={(e) => setReservationFormData({ ...reservationFormData, nombre: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reservationSurname" className="text-gray-600">{t('vehicle_detail.form.surname')}</Label>
                          <Input
                            id="reservationSurname"
                            placeholder={t('vehicle_detail.form.surname_placeholder')}
                            required
                            className="bg-white border-gray-200"
                            value={reservationFormData.apellido}
                            onChange={(e) => setReservationFormData({ ...reservationFormData, apellido: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reservationEmail" className="text-gray-600">{t('vehicle_detail.form.email')}</Label>
                          <Input
                            id="reservationEmail"
                            type="email"
                            placeholder={t('vehicle_detail.form.email_placeholder')}
                            required
                            className="bg-white border-gray-200"
                            value={reservationFormData.email}
                            onChange={(e) => setReservationFormData({ ...reservationFormData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reservationPhone" className="text-gray-600">{t('vehicle_detail.form.phone')}</Label>
                          <div className="flex">
                            <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">
                              <span className="text-sm text-foreground font-semibold">{getFlag()}</span>
                            </div>
                            <Input
                              id="reservationPhone"
                              placeholder={t('vehicle_detail.form.phone_placeholder')}
                              className="bg-white border-gray-200 rounded-l-none"
                              required
                              value={reservationFormData.telefono}
                              onChange={(e) => setReservationFormData({ ...reservationFormData, telefono: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reservationMessage" className="text-gray-600">{t('vehicle_detail.form.message')}</Label>
                        <Textarea
                          id="reservationMessage"
                          placeholder={`${t('vehicle_detail.form.message_placeholder_reserve')} ${vehicle.brand} ${vehicle.model}`}
                          className="min-h-[80px] resize-none bg-white border-gray-200"
                          required
                          rows={5}
                          value={reservationFormData.mensaje}
                          onChange={(e) => setReservationFormData({ ...reservationFormData, mensaje: e.target.value })}
                        />
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="reservationTerms"
                          required
                          className="mt-1"
                          checked={reservationFormData.acceptTerms}
                          onCheckedChange={(checked) => setReservationFormData({ ...reservationFormData, acceptTerms: checked as boolean })}
                        />
                        <Label htmlFor="reservationTerms" className="text-sm text-gray-600">
                          {t('vehicle_detail.form.accept_terms')}{" "}
                          <button type="button" onClick={() => setOpenPrivacyModal(true)} className="text-primary hover:text-gray-600 underline cursor-pointer">
                            {t('vehicle_detail.form.privacy_policy')}
                          </button>.
                        </Label>
                      </div>

                      <Button type="submit" disabled={isSubmittingReservation} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3">
                        {isSubmittingReservation ? t('vehicle_detail.form.submitting') : t('vehicle_detail.form.confirm_reservation')}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              <Button variant="outline" className="w-full justify-center gap-2 whitespace-normal h-auto min-h-12 py-2.5 rounded-2xl text-center leading-snug font-semibold bg-white border border-slate-200 text-slate-800 hover:bg-gray-100 hover:border-[#111111] hover:text-[#111111] transition-all" asChild>
                <a href={`tel:${getPhoneNumber()}`}>
                  <Phone className="w-4 h-4 shrink-0" />
                  {t('vehicle_detail.actions.call_now')}
                </a>
              </Button>
              <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-center gap-2 whitespace-normal h-auto min-h-12 py-2.5 rounded-2xl text-center leading-snug font-semibold bg-white border border-slate-200 text-slate-800 hover:bg-gray-100 hover:border-[#111111] hover:text-[#111111] transition-all">
                    <Calendar className="w-4 h-4 shrink-0" />
                    {t('vehicle_detail.actions.schedule_appointment')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-background">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-foreground">
                      {t('vehicle_detail.appointment.modal_title')}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAppointmentSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="appointmentName" className="text-gray-600">{t('vehicle_detail.form.name')}</Label>
                        <Input
                          id="appointmentName"
                          placeholder={t('vehicle_detail.form.name_placeholder')}
                          required
                          className="bg-white border-gray-200"
                          value={appointmentFormData.nombre}
                          onChange={(e) => setAppointmentFormData({ ...appointmentFormData, nombre: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointmentSurname" className="text-gray-600">{t('vehicle_detail.form.surname')}</Label>
                        <Input
                          id="appointmentSurname"
                          placeholder={t('vehicle_detail.form.surname_placeholder')}
                          required
                          className="bg-white border-gray-200"
                          value={appointmentFormData.apellido}
                          onChange={(e) => setAppointmentFormData({ ...appointmentFormData, apellido: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="appointmentEmail" className="text-gray-600">{t('vehicle_detail.form.email')}</Label>
                        <Input
                          id="appointmentEmail"
                          type="email"
                          placeholder={t('vehicle_detail.form.email_placeholder')}
                          required
                          className="bg-white border-gray-200"
                          value={appointmentFormData.email}
                          onChange={(e) => setAppointmentFormData({ ...appointmentFormData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointmentPhone" className="text-gray-600">{t('vehicle_detail.form.phone')}</Label>
                        <div className="flex">
                          <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">
                            <span className="text-sm text-foreground font-semibold">{getFlag()}</span>
                          </div>
                          <Input
                            id="appointmentPhone"
                            placeholder={t('vehicle_detail.form.phone_placeholder')}
                            className="bg-white border-gray-200 rounded-l-none"
                            required
                            value={appointmentFormData.telefono}
                            onChange={(e) => setAppointmentFormData({ ...appointmentFormData, telefono: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="appointmentDate" className="text-gray-600">{t('vehicle_detail.appointment.date_label')}</Label>
                        <Input
                          id="appointmentDate"
                          type="date"
                          required
                          className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
                          value={appointmentFormData.fecha}
                          onChange={(e) => setAppointmentFormData({ ...appointmentFormData, fecha: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointmentTime" className="text-gray-600">{t('vehicle_detail.appointment.time_label')}</Label>
                        <Select
                          required
                          value={appointmentFormData.hora}
                          onValueChange={(value) => setAppointmentFormData({ ...appointmentFormData, hora: value })}
                        >
                          <SelectTrigger className="bg-white border-gray-200 text-gray-900 data-[placeholder]:text-gray-500">
                            <SelectValue placeholder={t('vehicle_detail.appointment.time_placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="09:00">09:00</SelectItem>
                            <SelectItem value="09:30">09:30</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="10:30">10:30</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="11:30">11:30</SelectItem>
                            <SelectItem value="12:00">12:00</SelectItem>
                            <SelectItem value="12:30">12:30</SelectItem>
                            <SelectItem value="16:00">16:00</SelectItem>
                            <SelectItem value="16:30">16:30</SelectItem>
                            <SelectItem value="17:00">17:00</SelectItem>
                            <SelectItem value="17:30">17:30</SelectItem>
                            <SelectItem value="18:00">18:00</SelectItem>
                            <SelectItem value="18:30">18:30</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appointmentMessage" className="text-gray-600">{t('vehicle_detail.form.message')}</Label>
                      <Textarea
                        id="appointmentMessage"
                        placeholder={`${t('vehicle_detail.appointment.message_placeholder')} ${vehicle.brand} ${vehicle.model}`}
                        className="min-h-[80px] resize-none bg-white border-gray-200"
                        required
                        rows={5}
                        value={appointmentFormData.mensaje}
                        onChange={(e) => setAppointmentFormData({ ...appointmentFormData, mensaje: e.target.value })}
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="appointmentTerms"
                        required
                        className="mt-1"
                        checked={appointmentFormData.acceptTerms}
                        onCheckedChange={(checked) => setAppointmentFormData({ ...appointmentFormData, acceptTerms: checked as boolean })}
                      />
                      <Label htmlFor="appointmentTerms" className="text-sm text-gray-600">
                        {t('vehicle_detail.form.accept_terms')}{" "}
                        <button type="button" onClick={() => setOpenPrivacyModal(true)} className="text-primary hover:text-gray-600 underline cursor-pointer">
                          {t('vehicle_detail.form.privacy_policy')}
                        </button>.
                      </Label>
                    </div>

                    <Button type="submit" disabled={isSubmittingAppointment} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3">
                      {isSubmittingAppointment ? t('vehicle_detail.form.submitting') : t('vehicle_detail.form.submit')}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('vehicle_detail.contact.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isContactSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {t('vehicle_detail.contact.success_title')}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {t('vehicle_detail.contact.success_description')}
                    </p>
                    <Button
                      onClick={() => {
                        setIsContactSubmitted(false);
                      }}
                      variant="outline"
                    >
                      {t('vehicle_detail.contact.send_another')}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t('vehicle_detail.form.name')}</Label>
                      <Input
                        id="name"
                        placeholder={t('vehicle_detail.form.name_placeholder')}
                        required
                        value={contactFormData.nombre}
                        onChange={(e) => setContactFormData({ ...contactFormData, nombre: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="surname">{t('vehicle_detail.form.surname')}</Label>
                      <Input
                        id="surname"
                        placeholder={t('vehicle_detail.form.surname_placeholder')}
                        required
                        value={contactFormData.apellido}
                        onChange={(e) => setContactFormData({ ...contactFormData, apellido: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('vehicle_detail.form.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('vehicle_detail.form.email_placeholder')}
                        required
                        value={contactFormData.email}
                        onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('vehicle_detail.form.phone')}</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 border border-r-0 border-input rounded-l-md bg-gray-50 text-sm whitespace-nowrap">
                          {getFlag()} {language === "es" ? "+34" : language === "en" ? "+44" : "+33"}
                        </div>
                        <Input
                          id="phone"
                          placeholder={t('vehicle_detail.form.phone_placeholder')}
                          className="rounded-l-none"
                          required
                          value={contactFormData.telefono}
                          onChange={(e) => setContactFormData({ ...contactFormData, telefono: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message">{t('vehicle_detail.form.message')}</Label>
                      <Textarea
                        id="message"
                        placeholder={`${t('vehicle_detail.contact.message_placeholder')} ${vehicle.brand} ${vehicle.model}`}
                        className="min-h-[80px]"
                        required
                        value={contactFormData.mensaje}
                        onChange={(e) => setContactFormData({ ...contactFormData, mensaje: e.target.value })}
                      />
                    </div>
                    <Button type="submit" disabled={isSubmittingContact} className="w-full">
                      {isSubmittingContact ? t('vehicle_detail.form.submitting') : t('vehicle_detail.contact.submit_button')}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Trade-in Offer */}
        
      </main>

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
    </div>;
};
export default VehicleDetail;