import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { FishCard } from "@/components/cards/FishCard";
import FishFilters from "@/components/fish/FishFilters";
import { getFishList, getCategories, getSiteSettings } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aquarium Fish Collection",
  description:
    "Browse our full collection of aquarium and imported fish — guppies, oscars, cichlids, goldfish, koi, bettas and more. Live availability and prices.",
};

export default async function FishPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const sp = await searchParams;
  const [fish, categories, settings] = await Promise.all([
    getFishList({
      categorySlug: sp.category,
      difficulty: sp.difficulty,
      search: sp.q,
      sort: (sp.sort as never) ?? "featured",
    }),
    getCategories("fish"),
    getSiteSettings(),
  ]);
  const whatsapp = settings?.whatsapp ?? SITE.whatsapp;

  return (
    <>
      <PageHero
        eyebrow="The Collection"
        title="Aquarium Fish"
        subtitle="Explore our living collection — every fish healthy, hand-selected and ready for its new home. Live prices and availability."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Fish" }]}
      />
      <Container className="pb-20">
        <Suspense fallback={<div className="mb-8 h-24" />}>
          <FishFilters
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          />
        </Suspense>

        <p className="mb-5 text-sm text-ink/60">
          {fish.length} {fish.length === 1 ? "fish" : "fish"} found
        </p>

        {fish.length === 0 ? (
          <div className="rounded-3xl glass p-12 text-center">
            <p className="text-ink/75">
              No fish match your filters. Try clearing them or{" "}
              <a
                href={`https://wa.me/${whatsapp}`}
                className="text-aqua underline"
              >
                ask us on WhatsApp
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {fish.map((f, i) => (
              <Reveal key={f.id} delay={(i % 4) * 0.05}>
                <FishCard fish={f} whatsapp={whatsapp} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
