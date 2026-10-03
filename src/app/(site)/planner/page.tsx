import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/primitives";
import PlannerTool from "@/components/tools/PlannerTool";
import CustomQuoteForm from "@/components/tools/CustomQuoteForm";
import { getPlannerPresets, getAllFishLite, getTankPricing } from "@/lib/queries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aquarium Planner",
  description:
    "Tell us your tank size, budget and experience level — our aquarium planner suggests a thriving, compatible community of fish that fits your setup.",
};

export default async function PlannerPage() {
  const [presets, fish, tankPricing] = await Promise.all([
    getPlannerPresets(),
    getAllFishLite(),
    getTankPricing(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Tool"
        title="Aquarium Planner"
        subtitle="Enter your tank's length, breadth &amp; height — we'll estimate equipment cost and suggest a thriving community that fits your budget."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Planner" }]}
      />
      <Container className="pb-20">
        <PlannerTool presets={presets} fish={fish} tankPricing={tankPricing} />
        <CustomQuoteForm />
      </Container>
    </>
  );
}
