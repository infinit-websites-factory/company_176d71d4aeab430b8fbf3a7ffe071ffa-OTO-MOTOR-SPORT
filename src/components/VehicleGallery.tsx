import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import VehicleCard from "./VehicleCard";
import { fetchCars, transformApiCarToVehicle, type Vehicle } from "@/services/carsApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const VehicleGallery = () => {
  const { t } = useLanguage();
  const {
    data: carsResponse,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['cars'],
    queryFn: () => fetchCars(),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const vehicles: Vehicle[] = carsResponse
    ? carsResponse.items.map(transformApiCarToVehicle)
    : [];

  const recentVehicles = [...vehicles]
    .sort((a, b) => {
      const statusOrder = (status: string) => status === 'Published' ? 0 : 1;
      const statusDiff = statusOrder(a.status) - statusOrder(b.status);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 4);

  if (isError) {
    return (
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('vehicle_gallery.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('vehicle_gallery.subtitle')}
            </p>
          </div>
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('vehicle_gallery.error_loading')}</AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#F8F9FA]">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('vehicle_gallery.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('vehicle_gallery.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))
          ) : (
            recentVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} {...vehicle} />
            ))
          )}
        </div>

        {!isLoading && vehicles.length > 4 && (
          <div className="text-center mt-10">
            <a
              href="/stock"
              className="inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-sm hover:shadow-md"
            >
              {t('vehicle_gallery.view_cars')}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default VehicleGallery;
