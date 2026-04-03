"use client";

import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';

const Landing: React.FC = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
    </main>
  );
};

export default Landing;