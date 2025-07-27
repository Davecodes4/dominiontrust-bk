import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Security from '../components/sections/Security';
import Testimonials from '../components/sections/Testimonials';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Features />
        <Security />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
