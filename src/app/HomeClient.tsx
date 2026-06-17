"use client";

import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CityChooseModal from "@/components/CityChooseModal";
import LocationPrompt from "@/components/LocationPrompt";
import HeroSection from "@/components/home/HeroSection";
import TrustStats from "@/components/home/TrustStats";
import HowItWorks from "@/components/home/HowItWorks";
import CitySelector from "@/components/home/CitySelector";
import MaterialGrid from "@/components/home/MaterialGrid";
import Testimonials from "@/components/home/Testimonials";
import CTABanner from "@/components/home/CTABanner";

interface HomeClientProps {
  verifiedCount?: number;
}

export default function HomeClient({ verifiedCount = 0 }: HomeClientProps) {
  const {
    currentCity,
    changeCity,
    favorites,
    unreadNotifCount,
    suggestedCity,
    showLocationPrompt,
    dismissLocationPrompt,
    isLocating,
  } = useAppContext();

  const [showCityModal, setShowCityModal] = useState(false);

  const handleCityChange = (newCitySlug: string) => {
    setShowCityModal(false);
    changeCity(newCitySlug);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white flex flex-col font-sans antialiased pt-24 md:pt-28">
      <Header
        currentCity={currentCity}
        onCityClick={() => setShowCityModal(true)}
        favoritesCount={favorites.length}
        unreadNotifCount={unreadNotifCount}
      />

      <main className="flex-grow">
        <HeroSection verifiedCount={verifiedCount} onCityClick={() => setShowCityModal(true)} />
        <TrustStats />
        <HowItWorks />
        <CitySelector
          currentCity={currentCity}
          onCityClick={() => setShowCityModal(true)}
          isLocating={isLocating}
        />
        <MaterialGrid currentCity={currentCity} />
        <Testimonials />
        <CTABanner />
      </main>

      <Footer />

      {showLocationPrompt && suggestedCity && (
        <LocationPrompt
          cityName={suggestedCity.name}
          onConfirm={() => changeCity(suggestedCity.slug)}
          onDismiss={dismissLocationPrompt}
        />
      )}

      {showCityModal && (
        <CityChooseModal
          currentCity={currentCity}
          onClose={() => setShowCityModal(false)}
          onSelectCity={handleCityChange}
        />
      )}
    </div>
  );
}
