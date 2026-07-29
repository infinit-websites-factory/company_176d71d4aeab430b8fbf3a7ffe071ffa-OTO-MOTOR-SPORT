import { Button } from "@/components/ui/button";
import { Phone, Menu, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "react-router-dom";
import otoMotorLogo from "@/assets/oto-motor-logo.png";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const Header = () => {
  const { getPhoneNumber, getAddress, getHoursSummary, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const address = getAddress();
  const isHomePage = location.pathname === "/";

  const FACEBOOK_URL = "https://www.facebook.com/people/Oto-Motorsport-SL/61586883309321/";
  const INSTAGRAM_URL = "https://www.instagram.com/otomotorsport/";

  const navigationLinks = [
    { href: "/", label: t('header.home') },
    { href: "/stock", label: t('header.vehicles') },
    { href: "/sell", label: t('header.sell_your_car') },
    { href: "/financing", label: t('header.financing') },
    { href: "/services", label: t('header.services') },
    { href: "/contact", label: t('header.contact') },
  ];

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      {/* Top bar: contact info */}
      <div className="bg-black">
        <div className="container mx-auto max-w-7xl px-4 py-2.5">
          <div className="flex items-center justify-between text-sm text-white/85">
            <div className="hidden md:flex items-center gap-6">
              <a href={`tel:${getPhoneNumber()}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone size={14} className="text-white" />
                <span>{getPhoneNumber()}</span>
              </a>
              <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MapPin size={14} className="text-white" />
                <span>{address.city}</span>
              </a>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-white" />
                <span>{getHoursSummary()}</span>
              </div>
            </div>
            <a href={`tel:${getPhoneNumber()}`} className="md:hidden flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={14} />
              <span>{getPhoneNumber()}</span>
            </a>

            {isHomePage && (
              <div className="flex items-center gap-2">
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center transition-transform hover:scale-110"
                >
                  <Facebook size={14} className="fill-current" />
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-7 h-7 rounded-full text-white flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}
                >
                  <Instagram size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main bar: logo + nav + CTA */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="hover:opacity-80 transition-opacity pr-3">
            <img
              src={otoMotorLogo}
              alt="OTO MOTOR Logo"
              className="h-12 object-contain"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navigationLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-[17px] font-bold tracking-tight whitespace-nowrap rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-white bg-black"
                      : "text-gray-800 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-3">
            <Button className="hidden sm:flex items-center gap-2 h-11 px-6 text-base" asChild>
              <a href={`tel:${getPhoneNumber()}`}>
                <Phone size={18} />
                {t('common.call_now')}
              </a>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={22} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="bg-white">
          <SheetHeader>
            <SheetTitle className="text-foreground text-left">{t('common.menu')}</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-1 mt-6">
            {navigationLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-bold tracking-tight px-3 py-3.5 rounded-lg transition-colors ${
                    isActive
                      ? "text-white bg-black"
                      : "text-gray-800 hover:text-primary hover:bg-primary/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="pt-4">
              <Button className="w-full items-center gap-2" asChild>
                <a href={`tel:${getPhoneNumber()}`}>
                  <Phone size={16} />
                  {t('common.call_now')}
                </a>
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
