import Navbar from "../Components/Navbar";
import HeroSection from "../Components/Herosection";
import Features from "../Components/Features";
import Journal from "../Components/journal";
import AppPromo from "../Components/AppPromo";
import FAQ from "../Components/FAQ";
import Newsletter from "../Components/Newsletter";
import Footer from "../Components/Footer";

export default function Landing() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Features />
      <Journal />
      <AppPromo />
      <FAQ />
      <Newsletter />
      <Footer />
    </>
  );
}
