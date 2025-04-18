import CTA from "@/components/CTA";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-accent-50 to-white">
            <Navigation />
            <Hero />
            <Features />
            <CTA />
            <Footer />
        </div>
    );
}
