import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import BankingProducts from '../components/sections/BankingProducts';
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
        <BankingProducts />
        <Features />
        <Security />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
