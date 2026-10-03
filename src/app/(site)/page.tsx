import Hero from "@/components/home/Hero";
import {
  FishRail,
  CategoryGrid,
  AccessoryRail,
  GalleryMosaic,
  ArticlesRail,
  MapSection,
} from "@/components/home/sections";
import OffersStrip from "@/components/home/OffersStrip";
import Testimonials from "@/components/home/Testimonials";
import FaqAccordion from "@/components/home/FaqAccordion";
import Newsletter from "@/components/home/Newsletter";
import InstagramFeed from "@/components/home/InstagramFeed";
import { Container } from "@/components/ui/primitives";
import { SITE } from "@/lib/site";
import {
  getSiteSettings,
  getHomepageSections,
  getFeaturedFish,
  getNewFish,
  getTrendingFish,
  getCategories,
  getFeaturedProducts,
  getActiveOffers,
  getGallery,
  getTestimonials,
  getFaqs,
  getBlogPosts,
} from "@/lib/queries";

export const revalidate = 300; // Re-render at most every 5 minutes

export default async function HomePage() {
  const [
    settings,
    sections,
    featuredFish,
    newFish,
    trendingFish,
    fishCategories,
    products,
    offers,
    gallery,
    testimonials,
    faqs,
    posts,
  ] = await Promise.all([
    getSiteSettings(),
    getHomepageSections(),
    getFeaturedFish(8),
    getNewFish(8),
    getTrendingFish(8),
    getCategories("fish"),
    getFeaturedProducts(8),
    getActiveOffers(),
    getGallery(9),
    getTestimonials(6),
    getFaqs(),
    getBlogPosts(3),
  ]);

  const whatsapp = settings?.whatsapp ?? SITE.whatsapp;
  const storeName = settings?.storeName ?? SITE.name;
  const tagline = settings?.tagline ?? SITE.tagline;

  const heroCfg = sections.find((s) => s.sectionType === "hero")?.config as
    | { badges?: string[] }
    | undefined;
  const badges = heroCfg?.badges ?? [
    "35+ species in stock",
    "Imported fish weekly",
    "Free water testing",
    "Aquarium setup service",
  ];

  const titleFor = (type: string, fallback: string) =>
    sections.find((s) => s.sectionType === type)?.title ?? fallback;
  const subFor = (type: string) =>
    sections.find((s) => s.sectionType === type)?.subtitle ?? undefined;
  const visible = (type: string) =>
    sections.length === 0 || sections.some((s) => s.sectionType === type);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "PetStore"],
    "name": storeName,
    "image": `${SITE.url}/og.jpg`,
    "telephone": whatsapp,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Near Eye Hospital",
      "addressLocality": "Kuthuparamba",
      "addressRegion": "Kerala",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 11.8286,
      "longitude": 75.5670
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "21:00"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero
        storeName={storeName}
        tagline={tagline}
        badges={badges}
        whatsapp={whatsapp}
      />

      {visible("featured_fish") && (
        <FishRail
          eyebrow="Featured"
          title={titleFor("featured_fish", "Featured Fish")}
          subtitle={subFor("featured_fish")}
          fish={featuredFish}
          whatsapp={whatsapp}
        />
      )}

      {visible("categories") && (
        <CategoryGrid
          eyebrow="Browse"
          title={titleFor("categories", "Explore by Category")}
          subtitle={subFor("categories")}
          categories={fishCategories}
        />
      )}

      {visible("offers") && offers.length > 0 && (
        <OffersStrip
          title={titleFor("offers", "Today's Offers")}
          subtitle={subFor("offers")}
          offers={offers.map((o) => ({
            ...o,
            endAt: o.endAt ? o.endAt.toISOString() : null,
          }))}
        />
      )}

      {visible("latest_arrivals") && (
        <FishRail
          eyebrow="Fresh in"
          title={titleFor("latest_arrivals", "Latest Arrivals")}
          subtitle={subFor("latest_arrivals")}
          fish={newFish}
          whatsapp={whatsapp}
          tint
        />
      )}

      {visible("popular_fish") && (
        <FishRail
          eyebrow="Trending"
          title={titleFor("popular_fish", "Popular Right Now")}
          subtitle={subFor("popular_fish")}
          fish={trendingFish}
          whatsapp={whatsapp}
        />
      )}

      {visible("accessories") && (
        <AccessoryRail
          eyebrow="Equip"
          title={titleFor("accessories", "Premium Accessories")}
          subtitle={subFor("accessories")}
          products={products}
          whatsapp={whatsapp}
        />
      )}

      {visible("gallery") && (
        <GalleryMosaic
          eyebrow="Inspiration"
          title={titleFor("gallery", "Aquarium Gallery")}
          subtitle={subFor("gallery")}
          items={gallery}
        />
      )}

      {visible("testimonials") && (
        <Testimonials
          title={titleFor("testimonials", "Loved by Hobbyists")}
          subtitle={subFor("testimonials")}
          items={testimonials}
        />
      )}

      {visible("articles") && (
        <ArticlesRail
          eyebrow="Learn"
          title={titleFor("articles", "Fish Care Articles")}
          subtitle={subFor("articles")}
          posts={posts}
        />
      )}

      {settings?.instagramWidgetToken && (
        <section className="py-16 sm:py-20">
          <Container>
            <p className="mb-10 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-clay">From our Instagram</p>
            <InstagramFeed token={settings.instagramWidgetToken} />
          </Container>
        </section>
      )}

      {visible("map") && (
        <MapSection
          eyebrow="Find us"
          title={titleFor("map", "Visit Our Store")}
          subtitle={subFor("map")}
          settings={settings}
        />
      )}

      {visible("faq") && (
        <FaqAccordion
          title={titleFor("faq", "Frequently Asked Questions")}
          subtitle={subFor("faq")}
          faqs={faqs}
        />
      )}

      {visible("newsletter") && (
        <Newsletter
          title={titleFor("newsletter", "Stay in the Loop")}
          subtitle={subFor("newsletter")}
        />
      )}
    </>
  );
}
