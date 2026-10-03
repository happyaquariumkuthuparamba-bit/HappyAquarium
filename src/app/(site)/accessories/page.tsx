import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/cards/ProductCard";
import { getProductList, getCategories, getSiteSettings } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aquarium Accessories & Supplies",
  description:
    "Tanks, filters, air pumps, lighting, live plants, food, medicines and everything for your aquarium — at Happy Aquarium, Kuthuparamba.",
};

export default async function AccessoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const [products, categories, settings] = await Promise.all([
    getProductList({ categorySlug: sp.category }),
    getCategories("product"),
    getSiteSettings(),
  ]);
  const whatsapp = settings?.whatsapp ?? SITE.whatsapp;

  return (
    <>
      <PageHero
        eyebrow="Everything you need"
        title="Aquarium Accessories"
        subtitle="From tanks and filters to plants, food and medicines — quality supplies to build and maintain a thriving aquarium."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Accessories" }]}
      />
      <Container className="pb-20">
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/accessories"
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
              !sp.category ? "bg-aqua text-paper" : "bg-ink/[0.06] text-ink/75 hover:bg-ink/10"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/accessories?category=${c.slug}`}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
                sp.category === c.slug
                  ? "bg-aqua text-paper"
                  : "bg-ink/[0.06] text-ink/75 hover:bg-ink/10"
              }`}
            >
              {c.icon} {c.name}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl glass p-12 text-center text-ink/75">
            No products in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.05}>
                <ProductCard product={p} whatsapp={whatsapp} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
