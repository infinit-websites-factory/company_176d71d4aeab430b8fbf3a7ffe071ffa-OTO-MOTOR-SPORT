import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, X, SlidersHorizontal, Car, Boxes, Cog, Fuel, Tag, Gauge, CalendarRange } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface VehicleFiltersProps {
  searchTerm?: string;
  onSearchChange: (value: string) => void;
  selectedBrand?: string;
  onBrandChange: (value: string) => void;
  selectedBodyType?: string;
  onBodyTypeChange: (value: string) => void;
  selectedTransmission?: string;
  onTransmissionChange: (value: string) => void;
  selectedFuel?: string;
  onFuelChange: (value: string) => void;
  priceRange?: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  mileageRange?: [number, number];
  onMileageRangeChange: (value: [number, number]) => void;
  yearRange?: [number, number];
  onYearRangeChange: (value: [number, number]) => void;
  onClearFilters: () => void;
  brands?: string[];
  bodyTypes?: string[];
  transmissions?: string[];
  fuels?: string[];
}

const VehicleFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedBrand = '',
  onBrandChange,
  selectedBodyType = '',
  onBodyTypeChange,
  selectedTransmission = '',
  onTransmissionChange,
  selectedFuel = '',
  onFuelChange,
  priceRange = [0, 100000],
  onPriceRangeChange,
  mileageRange = [0, 300000],
  onMileageRangeChange,
  yearRange = [2000, new Date().getFullYear()],
  onYearRangeChange,
  onClearFilters,
  brands = [],
  bodyTypes = [],
  transmissions = [],
  fuels = []
}: VehicleFiltersProps) => {
  const { t, translateVehicleAttribute, formatPrice, getCurrencySymbol } = useLanguage();

  // Safely access array values with fallbacks
  const safePriceRange = priceRange || [0, 100000];
  const safeMileageRange = mileageRange || [0, 300000];
  const safeYearRange = yearRange || [2000, new Date().getFullYear()];

  const hasActiveFilters = searchTerm || selectedBrand || selectedBodyType || selectedTransmission || selectedFuel ||
    safePriceRange[0] > 0 || safePriceRange[1] < 100000 ||
    safeMileageRange[0] > 0 || safeMileageRange[1] < 300000 ||
    safeYearRange[0] > 2000 || safeYearRange[1] < new Date().getFullYear();

  const rangeValue = "text-xs font-semibold text-primary bg-primary/10 rounded-md px-2 py-0.5";
  const fieldLabel = "flex items-center gap-2 text-sm font-medium text-foreground";

  // Orange focus/hover/open glow for dropdowns; extra highlight when a value is active
  const triggerBase =
    "bg-white border-gray-200 shadow-md transition-all duration-300 hover:border-red-500 hover:shadow-[0_10px_25px_rgba(227,6,19,0.3)] focus:border-primary focus:ring-2 focus:ring-primary/30 data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/25";
  const triggerActive = "border-primary text-primary bg-primary/5 font-medium";
  const triggerCls = (active: boolean) => `${triggerBase} ${active ? triggerActive : ""}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/70">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <SlidersHorizontal size={18} className="text-primary" />
          {t('filters.title')}
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-primary hover:text-primary hover:bg-primary/10 h-8 px-2"
          >
            <X size={15} className="mr-1" />
            {t('filters.clear_filters')}
          </Button>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className={fieldLabel}><Search size={15} className="text-gray-400" />{t('filters.search_label')}</label>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? "text-primary" : "text-muted-foreground"}`} size={16} />
            <Input
              placeholder={t('search.placeholder')}
              className={`pl-10 bg-white border-gray-200 shadow-md transition-all duration-300 hover:border-red-500 hover:shadow-[0_10px_25px_rgba(227,6,19,0.3)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 ${searchTerm ? "border-primary bg-primary/5" : ""}`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Brand Filter */}
        <div className="space-y-2">
          <label className={fieldLabel}><Car size={15} className="text-gray-400" />{t('filters.brand')}</label>
          <Select value={selectedBrand} onValueChange={(value) => onBrandChange(value === 'all' ? '' : value)}>
            <SelectTrigger className={triggerCls(!!selectedBrand)}><SelectValue placeholder={t('filters.brand_all')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.brand_all')}</SelectItem>
              {brands.map((brand) => (<SelectItem key={brand} value={brand}>{brand}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Type Filter */}
        <div className="space-y-2">
          <label className={fieldLabel}><Boxes size={15} className="text-gray-400" />{t('filters.body_type')}</label>
          <Select value={selectedBodyType} onValueChange={(value) => onBodyTypeChange(value === 'all' ? '' : value)}>
            <SelectTrigger className={triggerCls(!!selectedBodyType)}><SelectValue placeholder={t('filters.body_type_all')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.body_type_all')}</SelectItem>
              {bodyTypes.map((type) => (<SelectItem key={type} value={type}>{translateVehicleAttribute('body_type', type)}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission Filter */}
        <div className="space-y-2">
          <label className={fieldLabel}><Cog size={15} className="text-gray-400" />{t('filters.transmission')}</label>
          <Select value={selectedTransmission} onValueChange={(value) => onTransmissionChange(value === 'all' ? '' : value)}>
            <SelectTrigger className={triggerCls(!!selectedTransmission)}><SelectValue placeholder={t('filters.transmission_all')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.transmission_all')}</SelectItem>
              {transmissions.map((transmission) => (<SelectItem key={transmission} value={transmission}>{translateVehicleAttribute('transmission', transmission)}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Filter */}
        <div className="space-y-2">
          <label className={fieldLabel}><Fuel size={15} className="text-gray-400" />{t('filters.fuel')}</label>
          <Select value={selectedFuel} onValueChange={(value) => onFuelChange(value === 'all' ? '' : value)}>
            <SelectTrigger className={triggerCls(!!selectedFuel)}><SelectValue placeholder={t('filters.fuel_all')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.fuel_all')}</SelectItem>
              {fuels.map((fuel) => (<SelectItem key={fuel} value={fuel}>{translateVehicleAttribute('fuel', fuel)}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={fieldLabel}><Tag size={15} className="text-gray-400" />{t('filters.price')}</label>
          </div>
          <div className="px-1">
            <Slider value={safePriceRange} onValueChange={onPriceRangeChange} max={100000} step={1000} className="w-full" />
            <div className="flex justify-between mt-2">
              <span className={rangeValue}>{formatPrice(safePriceRange[0] || 0)}</span>
              <span className={rangeValue}>{safePriceRange[1] >= 100000 ? `${formatPrice(100000)}+` : formatPrice(safePriceRange[1] || 0)}</span>
            </div>
          </div>
        </div>

        {/* Mileage Range */}
        <div className="space-y-3">
          <label className={fieldLabel}><Gauge size={15} className="text-gray-400" />{t('filters.mileage')}</label>
          <div className="px-1">
            <Slider value={safeMileageRange} onValueChange={onMileageRangeChange} max={300000} step={5000} className="w-full" />
            <div className="flex justify-between mt-2">
              <span className={rangeValue}>{safeMileageRange[0]?.toLocaleString() || '0'} km</span>
              <span className={rangeValue}>{safeMileageRange[1] >= 300000 ? '300,000+ km' : `${safeMileageRange[1]?.toLocaleString() || '0'} km`}</span>
            </div>
          </div>
        </div>

        {/* Year Range */}
        <div className="space-y-3">
          <label className={fieldLabel}><CalendarRange size={15} className="text-gray-400" />{t('filters.year')}</label>
          <div className="px-1">
            <Slider value={safeYearRange} onValueChange={onYearRangeChange} min={2000} max={new Date().getFullYear()} step={1} className="w-full" />
            <div className="flex justify-between mt-2">
              <span className={rangeValue}>{safeYearRange[0] || 2000}</span>
              <span className={rangeValue}>{safeYearRange[1] || new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleFilters;