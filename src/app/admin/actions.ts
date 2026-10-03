"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import * as s from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";

/* ------------------------------ auth ------------------------------ */

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const db = getDb();
  const [user] = await db
    .select()
    .from(s.users)
    .where(eq(s.users.email, email))
    .limit(1);

  if (!user || !user.active) return { error: "Invalid credentials." };
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Invalid credentials." };

  await db
    .update(s.users)
    .set({ lastLoginAt: new Date() })
    .where(eq(s.users.id, user.id));

  const token = await signSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ------------------------------ helpers ------------------------------ */

function str(fd: FormData, k: string): string | undefined {
  const v = fd.get(k);
  const t = typeof v === "string" ? v.trim() : "";
  return t === "" ? undefined : t;
}
function num(fd: FormData, k: string): number | undefined {
  const v = str(fd, k);
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function bool(fd: FormData, k: string): boolean {
  return fd.get(k) != null;
}
function lines(fd: FormData, k: string): string[] | undefined {
  const v = str(fd, k);
  if (!v) return undefined;
  return v
    .split(/[\n,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/* ------------------------------ fish ------------------------------ */

export async function saveFish(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const db = getDb();
  const id = str(formData, "id");

  const data = {
    name: str(formData, "name") ?? "Unnamed",
    slug:
      str(formData, "slug") ??
      (str(formData, "name") ?? "fish")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    scientificName: str(formData, "scientificName"),
    categoryId: str(formData, "categoryId"),
    shortDescription: str(formData, "shortDescription"),
    description: str(formData, "description"),
    careGuide: str(formData, "careGuide"),
    origin: str(formData, "origin"),
    temperatureMin: num(formData, "temperatureMin"),
    temperatureMax: num(formData, "temperatureMax"),
    phMin: num(formData, "phMin"),
    phMax: num(formData, "phMax"),
    difficulty: (str(formData, "difficulty") ?? "beginner") as never,
    aggression: (str(formData, "aggression") ?? "peaceful") as never,
    waterType: (str(formData, "waterType") ?? "freshwater") as never,
    tankSizeMin: num(formData, "tankSizeMin"),
    adultSize: num(formData, "adultSize"),
    lifespan: str(formData, "lifespan"),
    diet: str(formData, "diet"),
    compatibility: str(formData, "compatibility"),
    price: num(formData, "price"),
    offerPrice: num(formData, "offerPrice"),
    stock: num(formData, "stock") ?? 0,
    availability: (str(formData, "availability") ?? "available") as never,
    rateType: (str(formData, "rateType") ?? "pair") as never,
    heroImage: str(formData, "heroImage"),
    gallery: lines(formData, "gallery"),
    video: str(formData, "video"),
    tags: lines(formData, "tags"),
    varieties: (() => {
      const raw = str(formData, "varieties");
      if (!raw) return null;
            return raw.split('\n').filter(Boolean).map(line => {
        const parts = line.split("|").map(s => s.trim());
        return { name: parts[0] || "", price: parts[1] ? Number(parts[1]) : undefined, offerPrice: parts[2] ? Number(parts[2]) : undefined };
      });
    })(),
    featured: bool(formData, "featured"),
    trending: bool(formData, "trending"),
    isImported: bool(formData, "isImported"),
    isNewArrival: bool(formData, "isNewArrival"),
    published: bool(formData, "published"),
    variantIds: formData.getAll("variantIds").map(String).filter(Boolean),
    metaTitle: str(formData, "metaTitle"),
    metaDescription: str(formData, "metaDescription"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(s.fish).set(data).where(eq(s.fish.id, id));
  } else {
    await db.insert(s.fish).values({ id: crypto.randomUUID(), ...data });
  }
  revalidatePath("/admin/fish");
  redirect("/admin/fish");
}

export async function deleteFish(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) {
    const db = getDb();
    await db.delete(s.fish).where(eq(s.fish.id, id));
  }
  revalidatePath("/admin/fish");
  redirect("/admin/fish");
}

/* ------------------------------ site settings ------------------------------ */

export async function updateSiteSettings(formData: FormData): Promise<void> {
  await requireAdmin("admin");
  const db = getDb();
  const socials = str(formData, "socials");
  const openingHours = str(formData, "openingHours");
  const theme = str(formData, "theme");

  await db
    .update(s.siteSettings)
    .set({
      storeName: str(formData, "storeName"),
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      phone: str(formData, "phone"),
      whatsapp: str(formData, "whatsapp"),
      email: str(formData, "email"),
      addressLine: str(formData, "addressLine"),
      area: str(formData, "area"),
      city: str(formData, "city"),
      state: str(formData, "state"),
      pincode: str(formData, "pincode"),
      mapLat: num(formData, "mapLat"),
      mapLng: num(formData, "mapLng"),
      mapEmbedUrl: str(formData, "mapEmbedUrl"),
      directionsUrl: str(formData, "directionsUrl"),
      logo: str(formData, "logo"),
      favicon: str(formData, "favicon"),
      socials: socials ? (JSON.parse(socials) as never) : undefined,
      openingHours: openingHours ? (JSON.parse(openingHours) as never) : undefined,
      gaId: str(formData, "gaId"),
      metaPixel: str(formData, "metaPixel"),
      theme: theme ? (JSON.parse(theme) as never) : undefined,
      metaTitle: str(formData, "metaTitle"),
      metaDescription: str(formData, "metaDescription"),
      keywords: str(formData, "keywords"),
      instagramWidgetToken: str(formData, "instagramWidgetToken"),
      updatedAt: new Date(),
    })
    .where(eq(s.siteSettings.id, "default"));
  revalidatePath("/admin/settings");
  redirect("/admin/settings");
}

/* --------------------------- homepage sections --------------------------- */

export async function saveHomepageSection(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const db = getDb();
  const id = str(formData, "id");
  const configJson = str(formData, "config");

  const data = {
    sectionType: str(formData, "sectionType") as never,
    title: str(formData, "title"),
    subtitle: str(formData, "subtitle"),
    config: configJson ? (JSON.parse(configJson) as never) : undefined,
    sortOrder: num(formData, "sortOrder") ?? 0,
    visible: bool(formData, "visible"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(s.homepageSections).set(data).where(eq(s.homepageSections.id, id));
  } else {
    await db.insert(s.homepageSections).values({ id: crypto.randomUUID(), ...data });
  }
  revalidatePath("/admin/homepage");
  redirect("/admin/homepage");
}

export async function deleteHomepageSection(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) {
    const db = getDb();
    await db.delete(s.homepageSections).where(eq(s.homepageSections.id, id));
  }
  revalidatePath("/admin/homepage");
  redirect("/admin/homepage");
}

/* ------------------------------ offers ------------------------------ */

export async function saveOffer(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const db = getDb();
  const id = str(formData, "id");

  const data = {
    title: str(formData, "title") ?? "Offer",
    subtitle: str(formData, "subtitle"),
    description: str(formData, "description"),
    image: str(formData, "image"),
    badge: str(formData, "badge"),
    discountText: str(formData, "discountText"),
    ctaText: str(formData, "ctaText"),
    ctaLink: str(formData, "ctaLink"),
    placement: (str(formData, "placement") ?? "homepage_banner") as never,
    startAt: str(formData, "startAt") ? new Date(str(formData, "startAt")!) : undefined,
    endAt: str(formData, "endAt") ? new Date(str(formData, "endAt")!) : undefined,
    active: bool(formData, "active"),
    sortOrder: num(formData, "sortOrder") ?? 0,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(s.offers).set(data).where(eq(s.offers.id, id));
  } else {
    await db.insert(s.offers).values({ id: crypto.randomUUID(), ...data });
  }
  revalidatePath("/admin/offers");
  redirect("/admin/offers");
}

export async function deleteOffer(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) {
    const db = getDb();
    await db.delete(s.offers).where(eq(s.offers.id, id));
  }
  revalidatePath("/admin/offers");
  redirect("/admin/offers");
}

/* ------------------------------ enquiries ------------------------------ */

export async function updateEnquiryStatus(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const id = str(formData, "id");
  const status = str(formData, "status");
  const notes = str(formData, "notes");
  if (id && status) {
    const db = getDb();
    await db
      .update(s.enquiries)
      .set({ status: status as never, notes, updatedAt: new Date() })
      .where(eq(s.enquiries.id, id));
  }
  revalidatePath("/admin/enquiries");
}

/* ------------------------------ products ------------------------------ */

export async function saveProduct(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const db = getDb();
  const id = str(formData, "id");
  const data = {
    name: str(formData, "name") ?? "Product",
    slug: str(formData, "slug") ?? (str(formData, "name") ?? "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    description: str(formData, "description"),
    price: num(formData, "price"),
    offerPrice: num(formData, "offerPrice"),
    heroImage: str(formData, "image"),
    gallery: lines(formData, "gallery"),
    categoryId: str(formData, "categoryId"),
    stock: num(formData, "stock") ?? 0,
    featured: bool(formData, "featured"),
    trending: bool(formData, "trending"),
    published: bool(formData, "published"),
    variantIds: formData.getAll("variantIds").map(String).filter(Boolean),
    sortOrder: num(formData, "sortOrder") ?? 0,
    metaTitle: str(formData, "metaTitle"),
    metaDescription: str(formData, "metaDescription"),
    updatedAt: new Date(),
  };
  if (id) await db.update(s.products).set(data).where(eq(s.products.id, id));
  else await db.insert(s.products).values({ id: crypto.randomUUID(), ...data });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) { const db = getDb(); await db.delete(s.products).where(eq(s.products.id, id)); }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function toggleProductPublished(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const id = str(formData, "id");
  if (id) {
    const db = getDb();
    const [p] = await db.select({ published: s.products.published }).from(s.products).where(eq(s.products.id, id)).limit(1);
    if (p) await db.update(s.products).set({ published: !p.published, updatedAt: new Date() }).where(eq(s.products.id, id));
  }
  revalidatePath("/admin/products");
}

/* ------------------------------ blog ------------------------------ */

export async function savePost(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const db = getDb();
  const id = str(formData, "id");
  const isPublished = bool(formData, "published");

  // Preserve an existing publishedAt so re-saving a live post doesn't reshuffle
  // the public ordering; stamp a fresh one when a draft goes live.
  let publishedAt: Date | null = isPublished ? new Date() : null;
  if (id) {
    const [ex] = await db
      .select({ publishedAt: s.blogPosts.publishedAt })
      .from(s.blogPosts)
      .where(eq(s.blogPosts.id, id))
      .limit(1);
    publishedAt = isPublished ? (ex?.publishedAt ?? new Date()) : null;
  }

  const data = {
    title: str(formData, "title") ?? "Post",
    slug:
      str(formData, "slug") ??
      (str(formData, "title") ?? "post")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    excerpt: str(formData, "excerpt"),
    content: str(formData, "content"),
    coverImage: str(formData, "image"),
    author: str(formData, "author"),
    categoryId: str(formData, "categoryId"),
    tags: lines(formData, "tags"),
    varieties: (() => {
      const raw = str(formData, "varieties");
      if (!raw) return null;
            return raw.split('\n').filter(Boolean).map(line => {
        const parts = line.split("|").map(s => s.trim());
        return { name: parts[0] || "", price: parts[1] ? Number(parts[1]) : undefined, offerPrice: parts[2] ? Number(parts[2]) : undefined };
      });
    })(),
    featured: bool(formData, "featured"),
    status: (isPublished ? "published" : "draft") as never,
    publishedAt,
    metaTitle: str(formData, "metaTitle"),
    metaDescription: str(formData, "metaDescription"),
    updatedAt: new Date(),
  };
  if (id) await db.update(s.blogPosts).set(data).where(eq(s.blogPosts.id, id));
  else await db.insert(s.blogPosts).values({ id: crypto.randomUUID(), ...data, createdAt: new Date() });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deletePost(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) { const db = getDb(); await db.delete(s.blogPosts).where(eq(s.blogPosts.id, id)); }
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function togglePostPublished(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const id = str(formData, "id");
  if (id) {
    const db = getDb();
    const [p] = await db.select({ status: s.blogPosts.status }).from(s.blogPosts).where(eq(s.blogPosts.id, id)).limit(1);
    if (p) {
      const next: "published" | "draft" = p.status === "published" ? "draft" : "published";
      await db.update(s.blogPosts).set({ status: next, updatedAt: new Date() }).where(eq(s.blogPosts.id, id));
    }
  }
  revalidatePath("/admin/blog");
}

/* ------------------------------ gallery ------------------------------ */

export async function saveGalleryItem(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const db = getDb();
  const id = str(formData, "id");
  const imageUrl = str(formData, "image");
  if (!imageUrl && !id) throw new Error("Image URL is required.");
  const data = {
    title: str(formData, "title"),
    caption: str(formData, "description"),
    url: imageUrl ?? "",
    kind: (str(formData, "category") ?? "showcase") as (typeof s.GALLERY_KINDS)[number],
    featured: bool(formData, "featured"),
    published: bool(formData, "published"),
    variantIds: formData.getAll("variantIds").map(String).filter(Boolean),
    sortOrder: num(formData, "sortOrder") ?? 0,
    updatedAt: new Date(),
  };
  if (id) await db.update(s.galleryItems).set(data).where(eq(s.galleryItems.id, id));
  else await db.insert(s.galleryItems).values({ id: crypto.randomUUID(), ...data });
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryItem(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) { const db = getDb(); await db.delete(s.galleryItems).where(eq(s.galleryItems.id, id)); }
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function toggleGalleryPublished(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const id = str(formData, "id");
  if (id) {
    const db = getDb();
    const [r] = await db.select({ published: s.galleryItems.published }).from(s.galleryItems).where(eq(s.galleryItems.id, id)).limit(1);
    if (r) await db.update(s.galleryItems).set({ published: !r.published, updatedAt: new Date() }).where(eq(s.galleryItems.id, id));
  }
  revalidatePath("/admin/gallery");
}

/* ------------------------------ testimonials ------------------------------ */

export async function saveTestimonial(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const db = getDb();
  const id = str(formData, "id");
  const data = {
    customerName: str(formData, "name") ?? "Customer",
    location: str(formData, "role"),
    review: str(formData, "content") ?? "",
    rating: num(formData, "rating") ?? 5,
    avatar: str(formData, "avatar"),
    featured: bool(formData, "featured"),
    published: bool(formData, "published"),
    variantIds: formData.getAll("variantIds").map(String).filter(Boolean),
    sortOrder: num(formData, "sortOrder") ?? 0,
    updatedAt: new Date(),
  };
  if (id) await db.update(s.testimonials).set(data).where(eq(s.testimonials.id, id));
  else await db.insert(s.testimonials).values({ id: crypto.randomUUID(), ...data });
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) { const db = getDb(); await db.delete(s.testimonials).where(eq(s.testimonials.id, id)); }
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function toggleTestimonialPublished(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const id = str(formData, "id");
  if (id) {
    const db = getDb();
    const [r] = await db.select({ published: s.testimonials.published }).from(s.testimonials).where(eq(s.testimonials.id, id)).limit(1);
    if (r) await db.update(s.testimonials).set({ published: !r.published, updatedAt: new Date() }).where(eq(s.testimonials.id, id));
  }
  revalidatePath("/admin/testimonials");
}

/* ------------------------------ categories ------------------------------ */

export async function saveCategory(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const db = getDb();
  const id = str(formData, "id");
  const data = {
    name: str(formData, "name") ?? "Category",
    slug: str(formData, "slug") ?? (str(formData, "name") ?? "cat").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    kind: (str(formData, "kind") ?? "fish") as never,
    icon: str(formData, "icon"),
    description: str(formData, "description"),
    image: str(formData, "image"),
    published: bool(formData, "published"),
    variantIds: formData.getAll("variantIds").map(String).filter(Boolean),
    sortOrder: num(formData, "sortOrder") ?? 0,
  };
  if (id) await db.update(s.categories).set(data).where(eq(s.categories.id, id));
  else await db.insert(s.categories).values({ id: crypto.randomUUID(), ...data });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) { const db = getDb(); await db.delete(s.categories).where(eq(s.categories.id, id)); }
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

/* ------------------------------ faqs ------------------------------ */

export async function saveFaq(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const db = getDb();
  const id = str(formData, "id");
  const data = {
    question: str(formData, "question") ?? "Question?",
    answer: str(formData, "answer") ?? "",
    category: str(formData, "category") ?? "general",
    published: bool(formData, "published"),
    variantIds: formData.getAll("variantIds").map(String).filter(Boolean),
    sortOrder: num(formData, "sortOrder") ?? 0,
  };
  if (id) await db.update(s.faqs).set(data).where(eq(s.faqs.id, id));
  else await db.insert(s.faqs).values({ id: crypto.randomUUID(), ...data });
  revalidatePath("/admin/faqs");
  redirect("/admin/faqs");
}

export async function deleteFaq(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) { const db = getDb(); await db.delete(s.faqs).where(eq(s.faqs.id, id)); }
  revalidatePath("/admin/faqs");
  redirect("/admin/faqs");
}

/* ------------------------------ planner: tank pricing ------------------------------ */

export async function saveTankPricing(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const db = getDb();
  const id = str(formData, "id");
  const data = {
    name: str(formData, "name") ?? "Tier",
    litresMin: num(formData, "litresMin") ?? 0,
    litresMax: num(formData, "litresMax") ?? null,
    baseSetup: num(formData, "baseSetup") ?? 0,
    perLitre: num(formData, "perLitre") ?? 0,
    filterCost: num(formData, "filterCost") ?? 0,
    heaterCost: num(formData, "heaterCost") ?? 0,
    lightCost: num(formData, "lightCost") ?? 0,
    substrateCost: num(formData, "substrateCost") ?? 0,
    decorCost: num(formData, "decorCost") ?? 0,
    note: str(formData, "note"),
    sortOrder: num(formData, "sortOrder") ?? 0,
    published: bool(formData, "published"),
    updatedAt: new Date(),
  };
  if (id) await db.update(s.tankPricing).set(data).where(eq(s.tankPricing.id, id));
  else await db.insert(s.tankPricing).values({ id: crypto.randomUUID(), ...data });
  revalidatePath("/admin/planner");
  revalidatePath("/planner");
  redirect("/admin/planner");
}

export async function deleteTankPricing(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) { const db = getDb(); await db.delete(s.tankPricing).where(eq(s.tankPricing.id, id)); }
  revalidatePath("/admin/planner");
  revalidatePath("/planner");
  redirect("/admin/planner");
}

/* ------------------------------ planner: curated presets ------------------------------ */

export async function savePlannerPreset(formData: FormData): Promise<void> {
  await requireAdmin("staff");
  const db = getDb();
  const id = str(formData, "id");
  const fishIds = formData.getAll("fishIds").map((v) => String(v)).filter(Boolean);
  const data = {
    name: str(formData, "name") ?? "Setup",
    description: str(formData, "description"),
    image: str(formData, "image"),
    tankSizeMin: num(formData, "tankSizeMin") ?? null,
    tankSizeMax: num(formData, "tankSizeMax") ?? null,
    budgetMin: num(formData, "budgetMin") ?? null,
    budgetMax: num(formData, "budgetMax") ?? null,
    experience: (str(formData, "experience") ?? "beginner") as never,
    fishIds: fishIds.length ? (fishIds as never) : null,
    sortOrder: num(formData, "sortOrder") ?? 0,
    published: bool(formData, "published"),
    updatedAt: new Date(),
  };
  if (id) await db.update(s.plannerPresets).set(data).where(eq(s.plannerPresets.id, id));
  else await db.insert(s.plannerPresets).values({ id: crypto.randomUUID(), ...data });
  revalidatePath("/admin/planner");
  revalidatePath("/planner");
  redirect("/admin/planner");
}

export async function deletePlannerPreset(formData: FormData): Promise<void> {
  await requireAdmin("manager");
  const id = str(formData, "id");
  if (id) { const db = getDb(); await db.delete(s.plannerPresets).where(eq(s.plannerPresets.id, id)); }
  revalidatePath("/admin/planner");
  revalidatePath("/planner");
  redirect("/admin/planner");
}
