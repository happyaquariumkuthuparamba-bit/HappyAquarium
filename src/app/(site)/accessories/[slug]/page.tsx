import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Phone, Check, Package } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Badge, Button } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/cards/ProductCard";
import FishGallery from "@/components/fish/FishGallery";
import { getProductBySlug, getProductList, getProductsByIds, getSiteSettings } from "@/lib/queries";
import {
  formatPrice, discountPct, whatsappHref, callHref, AVAILABILITY_LABELS,
} from "@/lib/utils";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found" };
  return {
    title: p.metaTitle ?? p.name,
    description: p.metaDescription ?? p.shortDescription ?? undefined,
    openGraph: { images: p.heroImage ? [p.heroImage] : undefined },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, catProducts] = await Promise.all([
    getSiteSettings(),
    product.categorySlug
      ? getProductList({ categorySlug: product.categorySlug })
      : Promise.resolve([]),
  ]);
  const whatsapp = settings?.whatsapp ?? SITE.whatsapp;
  const phone = settings?.phone ?? SITE.phone;
  const related = catProducts.filter((p) => p.id !== product.id).slice(0, 4);
  const variantProducts = product.variantIds?.length
    ? await getProductsByIds(product.variantIds as string[])
    : [];

  const off = discountPct(product.price, product.offerPrice);
  const price = product.offerPrice ?? product.price;
  const images = [product.heroImage, ...(product.gallery ?? [])].filter(
    Boolean,
  ) as string[];

  return (
    <>
      <PageHero
        title={product.name}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Accessories", href: "/accessories" },
          { label: product.name },
        ]}
      />
      <Container className="pb-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            {images.length ? (
              <FishGallery images={images} alt={product.name} />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-3xl glass">
                <Package className="h-12 w-12 text-aqua/40" />
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center gap-2">
              {product.categoryName && (
                <Link
                  href={`/accessories?category=${product.categorySlug}`}
                  className="rounded-full bg-ink/[0.06] px-3 py-1 text-xs text-ink/85 hover:bg-ink/10"
                >
                  {product.categoryName}
                </Link>
              )}
              {product.brand && <Badge tone="muted">{product.brand}</Badge>}
              {product.isNewArrival && <Badge tone="green">New</Badge>}
            </div>

            <p className="mt-4 text-lg text-ink/85">
              {product.shortDescription}
            </p>

            <div className="mt-6 flex items-end gap-3">
              <span className="font-num text-4xl font-bold text-ink">
                {formatPrice(price, product.currency)}
              </span>
              {off > 0 && (
                <>
                  <span className="font-num text-xl text-ink/45 line-through">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <Badge tone="coral">Save {off}%</Badge>
                </>
              )}
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-ink/75">
              <Check className="h-4 w-4 text-emerald-600" />
              {AVAILABILITY_LABELS[product.availability ?? "available"]}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                href={whatsappHref(
                  whatsapp,
                  `Hi Happy Aquarium! I'm interested in the *${product.name}*. Is it available?`,
                )}
                external
                size="lg"
                variant="coral"
              >
                <MessageCircle className="h-5 w-5" /> Enquire on WhatsApp
              </Button>
              <Button href={callHref(phone)} variant="ghost" size="lg">
                <Phone className="h-5 w-5" /> Call Store
              </Button>
            </div>

            {product.specs && product.specs.length > 0 && (
              <div className="mt-8 overflow-hidden rounded-2xl glass">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs.map((sp, i) => (
                      <tr key={i} className="border-b border-ink/8 last:border-0">
                        <td className="px-4 py-3 text-ink/60">{sp.label}</td>
                        <td className="px-4 py-3 font-medium text-ink">
                          {sp.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Varieties */}
            {product.varieties && product.varieties.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs uppercase tracking-wide text-ink/60">
                  Available variants
                </p>
                <div className="flex flex-wrap gap-2">
                  {(product.varieties as {label:string;value:string}[]).map((v, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1 text-xs text-aqua"
                    >
                      {v.label}{v.value ? ' — ' + v.value : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Linked variant products */}
            {variantProducts.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-xs uppercase tracking-wide text-ink/60">
                  Also available in
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {variantProducts.map((vp) => (
                    <Link
                      key={vp.id}
                      href={`/accessories/${vp.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-ink/10 bg-[#fffdf8] p-3 hover:border-aqua/30 transition-colors"
                    >
                      {vp.heroImage && (
                        <img src={vp.heroImage} alt={vp.name} className="h-12 w-12 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{vp.name}</p>
                        <p className="text-xs text-ink/60">{formatPrice(vp.offerPrice ?? vp.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Reveal>
        </div>

        {product.description && (
          <Reveal className="mt-12">
            <div className="rounded-3xl glass p-7">
              <h2 className="text-2xl font-semibold text-ink">Description</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-ink/75">
                {product.description}
              </p>
            </div>
          </Reveal>
        )}

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-semibold text-ink">
              Related products
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} whatsapp={whatsapp} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
