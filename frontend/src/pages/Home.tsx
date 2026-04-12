import React from 'react'
import HeroSection from '@/components/home/HeroSection'
import AboutSection from '@/components/home/AboutSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import NewsSection from '@/components/home/NewsSection'
import StaticPartnersSection from '@/components/home/StaticPartnersSection'
import PartnersSection from '@/components/home/PartnersSection'

export const HomePage = () => {
  return (
    <div style={{overflowX:'hidden'}}>
      <HeroSection/>
      <div style={{position:'relative',zIndex:10,background:'#fff'}}>
        <PartnersSection/>
        <AboutSection/>
        <CategoriesSection/>
        <TestimonialsSection/>
        <NewsSection/>
        <StaticPartnersSection/>
      </div>
    </div>
  )
}
