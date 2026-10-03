import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Thermometer, Droplets, Ruler, Clock, Fish as FishIcon, Waves,
  Utensils, Shield, Globe, MessageCircle, Phone, Check,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Badge, Button } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { FishCard } from "@/components/cards/FishCard";
import FishGallery from "@/components/fish/FishGallery";
import {
  getFishBySlug, getRelatedFish, getSiteSettings, getFishByIds,
} from "@/lib/queries";
import {
  formatPrice, discountPct, whatsappHref, callHref,
  DIFFICULTY_LABELS, AGGRESSION_LABELS, AVAILABILITY_LABELS,
} from "@/lib/utils";
import { SITE, reserveMsg, fishEnquiryMsg } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fish = await getFishBySlug(slug);
  if (!fish) return { title: "Fish not found" };
  return {
    title: fish.metaTitle ?? fish.name,
    description: fish.metaDescription ?? fish.shortDescription ?? undefined,
    openGraph: {
      title: fish.name,
      description: fish.shortDescription ?? undefined,
      images: fish.heroImage ? [fish.heroImage] : undefined,
    },
  };
}

function Stat({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl glass p-4">
      <span className="mt-0.5 text-aqua">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-ink/60">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

export default async function FishDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fish = await getFishBySlug(slug);
  if (!fish) notFound();

  const [related, settings] = await Promise.all([
    getRelatedFish(fish, 4),
    getSiteSettings(),
  ]);
  const variantFish = fish.variantIds?.length
    ? await getFishByIds(fish.variantIds as string[])
    : [];
  const whatsapp = settings?.whatsapp ?? SITE.whatsapp;
  const phone = settings?.phone ?? SITE.phone;

  const off = discountPct(fish.price, fish.offerPrice);
  const price = fish.offerPrice ?? fish.price;
  const images = [fish.heroImage, ...(fish.gallery ?? [])].filter(
    Boolean,
  ) as string[];
  const temp =
    fish.temperatureMin && fish.temperatureMax
      ? `${fish.temperatureMin}–${fish.temperatureMax}°C`
      : null;
  const ph =
    fish.phMin && fish.phMax ? `pH ${fish.phMin}–${fish.phMax}` : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fish.name,
    image: images,
    description: fish.shortDescription ?? fish.description ?? "",
    category: fish.categoryName ?? "Aquarium Fish",
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      priceCurrency: fish.currency ?? "INR",
      price: price ?? 0,
      availability:
        fish.availability === "out_of_stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        title={fish.name}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Fish", href: "/fish" },
          { label: fish.name },
        ]}
      />

      <Container className="pb-20">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <Reveal>
            <FishGallery images={images} alt={fish.name} />
            {fish.video && (
              <div className="mt-4 overflow-hidden rounded-2xl glass">
                <video src={fish.video} controls className="w-full" />
              </div>
            )}
          </Reveal>

          {/* Info */}
          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center gap-2">
              {fish.categoryName && (
                <Link
                  href={`/fish?category=${fish.categorySlug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 py-1 text-xs text-ink/85 hover:bg-ink/10"
                >
                  {fish.categoryName}
                </Link>
              )}
              {fish.isImported && <Badge tone="amber">Imported</Badge>}
              {fish.isNewArrival && <Badge tone="green">New Arrival</Badge>}
              {fish.trending && <Badge tone="aqua">Trending</Badge>}
            </div>

            {fish.scientificName && (
              <p className="mt-3 text-sm italic text-ink/60">
                {fish.scientificName}
              </p>
            )}
            <p className="mt-3 text-lg text-ink/85">{fish.shortDescription}</p>

            {/* Price */}
            <div className="mt-6 flex items-end gap-3">
              <span className="font-num text-4xl font-bold text-ink">
                {formatPrice(price, fish.currency)}
              </span>
              <span className="mb-1 text-sm font-medium text-ink/55">
                {fish.rateType === "single" ? "per fish" : "per pair"}
              </span>
              {off > 0 && (
                <>
                  <span className="font-num text-xl text-ink/45 line-through">
                    {formatPrice(fish.price, fish.currency)}
                  </span>
                  <Badge tone="coral">Save {off}%</Badge>
                </>
              )}
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-ink/75">
              <Check className="h-4 w-4 text-emerald-600" />
              {AVAILABILITY_LABELS[fish.availability ?? "available"]}
            </p>

            {/* Varieties */}
            {fish.varieties && fish.varieties.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs uppercase tracking-wide text-ink/60">
                  Available varieties
                </p>
                <div className="flex flex-wrap gap-2">
                  {fish.varieties.map((v, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-xs text-aqua"
                    >
                      {v.name}
                      {v.price ? ` · ${formatPrice(v.price)}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                href={whatsappHref(whatsapp, reserveMsg(fish.name))}
                external
                size="lg"
              >
                <MessageCircle className="h-5 w-5" /> Reserve on WhatsApp
              </Button>
              <Button href={callHref(phone)} variant="ghost" size="lg">
                <Phone className="h-5 w-5" /> Call to Enquire
              </Button>
            </div>

            {/* Stat grid */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <Stat icon={<Globe className="h-4 w-4" />} label="Origin" value={fish.origin} />
              <Stat icon={<Thermometer className="h-4 w-4" />} label="Temperature" value={temp} />
              <Stat icon={<Droplets className="h-4 w-4" />} label="Water pH" value={ph} />
              <Stat icon={<Waves className="h-4 w-4" />} label="Water type" value={fish.waterType} />
              <Stat icon={<FishIcon className="h-4 w-4" />} label="Min tank size" value={fish.tankSizeMin ? `${fish.tankSizeMin} L` : null} />
              <Stat icon={<Ruler className="h-4 w-4" />} label="Adult size" value={fish.adultSize ? `${fish.adultSize} cm` : null} />
              <Stat icon={<Clock className="h-4 w-4" />} label="Lifespan" value={fish.lifespan} />
              <Stat icon={<Shield className="h-4 w-4" />} label="Difficulty" value={DIFFICULTY_LABELS[fish.difficulty ?? "beginner"]} />
              <Stat icon={<Shield className="h-4 w-4" />} label="Temperament" value={AGGRESSION_LABELS[fish.aggression ?? "peaceful"]} />
              <Stat icon={<Utensils className="h-4 w-4" />} label="Diet" value={fish.diet} />
            </div>
          </Reveal>
        </div>

        {/* Long description + care guide */}
        <div className="mt-14">
          <Reveal>
            <div className="rounded-3xl glass p-7">
              <h2 className="text-2xl font-semibold text-ink">About the {fish.name}</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-ink/75">
                {fish.description}
              </p>
              {fish.careGuide && (
                <>
                  <h3 className="mt-8 text-xl font-semibold text-ink">Care Guide</h3>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/75">
                    {fish.careGuide}
                  </p>
                </>
              )}
            </div>
          </Reveal>
        </div>

        {/* Linked variant fish */}
        {variantFish.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-semibold text-ink">
              Also available in
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {variantFish.map((vf) => (
                <FishCard key={vf.id} fish={vf} whatsapp={whatsapp} />
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-semibold text-ink">
              You might also like
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((f) => (
                <FishCard key={f.id} fish={f} whatsapp={whatsapp} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
