import React from 'react';
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Services from '../components/home/Services';
import FeaturedProjects from '../components/home/FeaturedProjects';
import Approach from '../components/home/Approach';
import Skills from '../components/home/Skills';
import ContactForm from '../components/home/ContactForm';

const Home = () => {
  return (
    <div className="page-shell">
      <Hero />
      <About />
      <Services />
      <FeaturedProjects />
      <Approach />
      <Skills />
      <ContactForm />
    </div>
  );
};

export default Home;
