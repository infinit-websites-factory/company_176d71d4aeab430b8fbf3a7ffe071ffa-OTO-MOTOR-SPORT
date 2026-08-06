import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft, ChevronRight, Gauge, Fuel, Settings2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ReservedBanner from "@/components/ReservedBanner";
import dgtB from "@/assets/dgt-b.png";
import dgtC from "@/assets/dgt-c.png";
import dgtCero from "@/assets/dgt-cero.png";
import dgtEco from "@/assets/dgt-eco.png";

interface VehicleCardProps {
  id: string;
  images: string[];
  brand: string;
  model: string;
  year: number;
  price: number;
  financedPrice?: number;
  mileage: number;
  mileageUnit: string;
  fuel: string;
  transmission: string;
  type: string;
  status: string;
  environmentalBadge?: string;
}

const VehicleCard = ({
  id,
  images = [],
  brand,
  model,
  year,
  price,
  financedPrice,
  mileage,
  mileageUnit,
  fuel,
  transmission,
  type,
  status,
  environmentalBadge
}: VehicleCardProps) => {
  const { translateVehicleAttribute, formatPrice, t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  useEffect(() => {
    if (images.length > 1) {
      const loadPromises = images.map((src, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            setImagesLoaded(prev => {
              const newLoaded = [...prev];
              newLoaded[index] = true;
              return newLoaded;
            });
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        });
      });
      Promise.all(loadPromises);
    }
  }, [images]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentImageIndex] || '/placeholder.svg';

  const getBadgeImage = (badge?: string) => {
    if (!badge) return null;
    const badgeLower = badge.toLowerCase();
    if (badgeLower.includes('cero') || badgeLower.includes('0')) return dgtCero;
    if (badgeLower.includes('eco')) return dgtEco;
    if (badgeLower.includes('c')) return dgtC;
    if (badgeLower.includes('b')) return dgtB;
    return null;
  };

  const badgeImage = getBadgeImage(environmentalBadge);

  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <Link to={`/stock/${id}`} className="block h-full" onClick={handleClick}>
      <Card className="group overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:border-gray-900 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full cursor-pointer">
        <div className="relative overflow-hidden">
          {status === 'Reserved' && <ReservedBanner size="small" />}
          <img
            src={currentImage}
            alt={`${brand} ${model}`}
            className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
            style={{ imageRendering: 'auto' }}
          />
          {/* Gradient for legibility of overlaid badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 pointer-events-none" />

          {/* Environmental (DGT) badge */}
          {badgeImage && (
            <img
              src={badgeImage}
              alt="Distintivo ambiental"
              className="absolute top-3 left-3 h-9 w-auto drop-shadow-md"
            />
          )}

          {images.length > 1 && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-[#111111] hover:text-white shadow-sm rounded-full transition-colors"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(); }}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-[#111111] hover:text-white shadow-sm rounded-full transition-colors"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(); }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded-full shadow-sm transition-colors group-hover:bg-[#111111] group-hover:text-white">
              {currentImageIndex + 1}/{images.length}
            </div>
          )}

          {/* Price badge (+ financed price when set in the backoffice) */}
          <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1.5">
            <div className="bg-primary text-primary-foreground font-bold text-lg px-3.5 py-1.5 rounded-lg shadow-lg">
              {formatPrice(price)}
            </div>
            {financedPrice != null && (
              <div className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-md shadow-md">
                {formatPrice(financedPrice)}
                <span className="ml-1 font-medium text-gray-500">{t('vehicle_detail.pricing.financed_short')}</span>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-5 flex flex-col flex-1">
          <div className="mb-4">
            <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">{brand} {model}</h3>
            <p className="text-muted-foreground text-sm mt-0.5">{year} · {translateVehicleAttribute('body_type', type)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
              <Gauge size={15} className="text-primary shrink-0" />
              <span className="truncate">{mileage.toLocaleString()} {mileageUnit}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
              <Fuel size={15} className="text-primary shrink-0" />
              <span className="truncate">{translateVehicleAttribute('fuel', fuel)}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
              <Settings2 size={15} className="text-primary shrink-0" />
              <span className="truncate">{translateVehicleAttribute('transmission', transmission)}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
              <Calendar size={15} className="text-primary shrink-0" />
              <span className="truncate">{year}</span>
            </div>
          </div>

          <div className="mt-auto">
            <Button className="w-full rounded-lg group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors" variant="outline">
              <Eye size={16} className="mr-2" />
              {t('common.view_details')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default VehicleCard;
