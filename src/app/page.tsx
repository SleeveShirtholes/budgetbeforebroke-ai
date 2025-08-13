import CTA from "@/components/CTA";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/Toast";

export default function Home() {
  return (
    <ToastProvider defaultPosition="bottom-center">
      <div className="min-h-screen">
        <Navigation />
        <Hero />
        <Features />
        <CTA />
        <Footer />
      </div>
    </ToastProvider>
  );
}
