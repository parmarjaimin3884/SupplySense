import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { TrustStrip } from "@/components/trust-strip";
import { Problems } from "@/components/problems";
import { Solutions } from "@/components/solutions";
import { AIAgents } from "@/components/ai-agents";
import { Workflow } from "@/components/workflow";
import { Showcase } from "@/components/showcase";
import { Benefits } from "@/components/benefits";
import { Comparison } from "@/components/comparison";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#111827]">
      {/* Section 1: Navigation */}
      <Navbar />

      {/* Section 2: Hero Section & Interactive Dashboard */}
      <Hero />

      {/* Section 3: Trusted Operations Teams */}
      <TrustStrip />

      {/* Section 4: Problem Section */}
      <Problems />

      {/* Section 5: Solution Section */}
      <Solutions />

      {/* Section 6: AI Agents Section */}
      <AIAgents />

      {/* Section 7: Product Workflow */}
      <Workflow />

      {/* Section 8: Dashboard Showcase */}
      <Showcase />

      {/* Section 9: Key Benefits */}
      <Benefits />

      {/* Section 10: Why SupplySense / Comparison */}
      <Comparison />

      {/* Section 11: Final Closing CTA */}
      <CTASection />

      {/* Section 12: Footer */}
      <Footer />
    </main>
  );
}
