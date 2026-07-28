import { useQuery } from "@tanstack/react-query";
import VehicleCard from "@/components/VehicleCard";
import VehicleFilters from "@/components/VehicleFilters";
import { fetchCars, transformApiCarToVehicle, type Vehicle } from "@/services/carsApi";
import { useVehicleFilters } from "@/hooks/useVehicleFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import SEO from "@/components/SEO";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const ITEMS_PER_PAGE = 30;

const SHOWING_LABEL: Record<string, (a: number, b: number, tt: number) => string> = {
  es: (a, b, tt) => `Mostrando ${a}–${b} de ${tt} vehículos`,
  en: (a, b, tt) => `Showing ${a}–${b} of ${tt} vehicles`,
  fr: (a, b, tt) => `Affichage ${a}–${b} sur ${tt} véhicules`,
};
const PREV_LABEL: Record<string, string> = { es: "Anterior", en: "Previous", fr: "Précédent" };
const NEXT_LABEL: Record<string, string> = { es: "Siguiente", en: "Next", fr: "Suivant" };

const Stock = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { 
    data: carsResponse, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['cars'],
    queryFn: () => fetchCars(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  const vehicles: Vehicle[] = carsResponse
    ? carsResponse.items.map(transformApiCarToVehicle)
    : [];

  const totalVehicles = carsResponse?.total || 0;

  const {
    filters,
    updateFilter,
    clearFilters,
    filteredVehicles,
    filterOptions,
  } = useVehicleFilters(vehicles);

  // Pagination (30 per page)
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE));
  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const paginatedVehicles = filteredVehicles.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const filterKey = JSON.stringify(filters);

  // Reset to page 1 whenever the filters/sort change
  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  const goToPage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    requestAnimationFrame(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // Page numbers with ellipsis (1 2 3 … last)
  const pageItems: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pageItems.push(i);
    } else if (pageItems[pageItems.length - 1] !== "…") {
      pageItems.push("…");
    }
  }

  // Set initial search from URL parameter only once, then remove it from the URL
  useEffect(() => {
    if (!initialSearch) return;

    updateFilter('searchTerm', initialSearch);

    const next = new URLSearchParams(searchParams);
    next.delete('search');
    setSearchParams(next, { replace: true });
  }, [initialSearch, updateFilter, setSearchParams, searchParams]);

  const sortOptions = [
    { value: 'updated_desc', label: t('stock_page.sort_options.updated_desc') },
    { value: 'updated_asc', label: t('stock_page.sort_options.updated_asc') },
    { value: 'price_asc', label: t('stock_page.sort_options.price_asc') },
    { value: 'price_desc', label: t('stock_page.sort_options.price_desc') },
    { value: 'year_desc', label: t('stock_page.sort_options.year_desc') },
    { value: 'year_asc', label: t('stock_page.sort_options.year_asc') },
    { value: 'mileage_asc', label: t('stock_page.sort_options.mileage_asc') },
    { value: 'mileage_desc', label: t('stock_page.sort_options.mileage_desc') },
    { value: 'brand_asc', label: t('stock_page.sort_options.brand_asc') },
  ];

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <SEO page="stock" />
        <Header />
        <main>
          <PageHeader title={t('stock_page.title')} subtitle={t('stock_page.subtitle')} />

          <div className="container mx-auto px-4 pt-16 pb-16">
            <Alert className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('vehicle_gallery.error_loading')}
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PageHeader title={t('stock_page.title')} subtitle={t('stock_page.subtitle')} />

        {/* Main Content with Sidebar Layout */}
        <div className="container mx-auto px-4 pt-12 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <VehicleFilters
                  searchTerm={filters.searchTerm}
                  onSearchChange={(value) => updateFilter('searchTerm', value)}
                  selectedBrand={filters.selectedBrand}
                  onBrandChange={(value) => updateFilter('selectedBrand', value)}
                  selectedBodyType={filters.selectedBodyType}
                  onBodyTypeChange={(value) => updateFilter('selectedBodyType', value)}
                  selectedTransmission={filters.selectedTransmission}
                  onTransmissionChange={(value) => updateFilter('selectedTransmission', value)}
                  selectedFuel={filters.selectedFuel}
                  onFuelChange={(value) => updateFilter('selectedFuel', value)}
                  priceRange={filters.priceRange}
                  onPriceRangeChange={(value) => updateFilter('priceRange', value)}
                  mileageRange={filters.mileageRange}
                  onMileageRangeChange={(value) => updateFilter('mileageRange', value)}
                  yearRange={filters.yearRange}
                  onYearRangeChange={(value) => updateFilter('yearRange', value)}
                  onClearFilters={clearFilters}
                  brands={filterOptions.brands}
                  bodyTypes={filterOptions.bodyTypes}
                  transmissions={filterOptions.transmissions}
                    fuels={filterOptions.fuels}
                  />
                </div>
              </div>

              {/* Vehicles Content */}
              <div className="lg:col-span-3">
                {/* Results Count and Sort Controls */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm text-muted-foreground">
                    {(filters.searchTerm || filters.selectedBrand || filters.selectedBodyType || filters.selectedTransmission || filters.selectedFuel) ? (
                      <>
                        {filteredVehicles.length} {filteredVehicles.length !== 1 ? t('stock_page.results_count_plural') : t('stock_page.results_count')} {t('stock_page.found')}
                      </>
                    ) : (
                      <>
                        {totalVehicles} {totalVehicles !== 1 ? t('stock_page.results_count_plural') : t('stock_page.results_count')}
                      </>
                    )}
                  </h2>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t('stock_page.sort_by')}</span>
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t('stock_page.sort_placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Vehicles Grid */}
                <div ref={gridRef} className="scroll-mt-28 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {isLoading ? (
                    Array.from({ length: 12 }).map((_, index) => (
                      <div key={index} className="space-y-3">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </div>
                    ))
                  ) : filteredVehicles.length > 0 ? (
                    paginatedVehicles.map((vehicle) => (
                      <VehicleCard key={vehicle.id} {...vehicle} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-lg text-muted-foreground mb-4">
                        {t('stock_page.no_results')}
                      </p>
                      <button
                        onClick={clearFilters}
                        className="text-primary hover:underline"
                      >
                        {t('stock_page.clear_filters')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Counter + Pagination */}
                {!isLoading && filteredVehicles.length > 0 && (
                  <div className="mt-10 flex flex-col items-center gap-5">
                    <p className="text-sm text-muted-foreground">
                      {(SHOWING_LABEL[language] || SHOWING_LABEL.es)(
                        startIdx + 1,
                        Math.min(startIdx + ITEMS_PER_PAGE, filteredVehicles.length),
                        filteredVehicles.length,
                      )}
                    </p>

                    {totalPages > 1 && (
                      <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        <button
                          onClick={() => goToPage(page - 1)}
                          disabled={page === 1}
                          className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-foreground hover:border-primary hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">{PREV_LABEL[language] || PREV_LABEL.es}</span>
                        </button>

                        {pageItems.map((item, idx) =>
                          item === "…" ? (
                            <span key={`e${idx}`} className="w-10 h-10 flex items-center justify-center text-muted-foreground">…</span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => goToPage(item)}
                              aria-current={item === page ? "page" : undefined}
                              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                                item === page
                                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                                  : "bg-white border border-gray-200 text-foreground hover:border-primary hover:text-primary"
                              }`}
                            >
                              {item}
                            </button>
                          ),
                        )}

                        <button
                          onClick={() => goToPage(page + 1)}
                          disabled={page === totalPages}
                          className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-foreground hover:border-primary hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-colors"
                        >
                          <span className="hidden sm:inline">{NEXT_LABEL[language] || NEXT_LABEL.es}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Stock;