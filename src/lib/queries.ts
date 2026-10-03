import { getDb } from "@/db";
import * as s from "@/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  isNull,
  like,
  lte,
  ne,
  or,
  inArray,
  getTableColumns,
} from "drizzle-orm";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type FishCard = s.Fish & {
  categoryName: string | null;
  categorySlug: string | null;
  categoryColor: string | null;
};
export type ProductCard = s.Product & {
  categoryName: string | null;
  categorySlug: string | null;
};

import { cache } from "react";

/* -------------------------------------------------------------------------- */
/*  Settings / navigation / homepage                                          */
/* -------------------------------------------------------------------------- */

export const getSiteSettings = cache(async () => {
  const db = getDb();
  const [row] = await db.select().from(s.siteSettings).limit(1);
  return row ?? null;
});

export const getNav = cache(async (location: (typeof s.NAV_LOCATIONS)[number]) => {
  const db = getDb();
  return db
    .select()
    .from(s.navItems)
    .where(and(eq(s.navItems.location, location), eq(s.navItems.published, true)))
    .orderBy(asc(s.navItems.sortOrder));
});

export async function getHomepageSections() {
  const db = getDb();
  return db
    .select()
    .from(s.homepageSections)
    .where(eq(s.homepageSections.visible, true))
    .orderBy(asc(s.homepageSections.sortOrder));
}

/* -------------------------------------------------------------------------- */
/*  Fish                                                                      */
/* -------------------------------------------------------------------------- */

function fishSelect() {
  return getDb()
    .select({
      ...getTableColumns(s.fish),
      categoryName: s.categories.name,
      categorySlug: s.categories.slug,
      categoryColor: s.categories.color,
    })
    .from(s.fish)
    .leftJoin(s.categories, eq(s.fish.categoryId, s.categories.id))
    .$dynamic();
}

export async function getFeaturedFish(limit = 8): Promise<FishCard[]> {
  return fishSelect()
    .where(and(eq(s.fish.published, true), eq(s.fish.featured, true)))
    .orderBy(asc(s.fish.sortOrder), desc(s.fish.createdAt))
    .limit(limit);
}

export async function getTrendingFish(limit = 8): Promise<FishCard[]> {
  return fishSelect()
    .where(and(eq(s.fish.published, true), eq(s.fish.trending, true)))
    .orderBy(desc(s.fish.createdAt))
    .limit(limit);
}

export async function getNewFish(limit = 8): Promise<FishCard[]> {
  return fishSelect()
    .where(and(eq(s.fish.published, true), eq(s.fish.isNewArrival, true)))
    .orderBy(desc(s.fish.createdAt))
    .limit(limit);
}

export type FishListOpts = {
  categorySlug?: string;
  search?: string;
  difficulty?: string;
  imported?: boolean;
  sort?: "featured" | "price_asc" | "price_desc" | "name";
  limit?: number;
};

export async function getFishList(opts: FishListOpts = {}): Promise<FishCard[]> {
  const conds = [eq(s.fish.published, true)];
  if (opts.categorySlug) conds.push(eq(s.categories.slug, opts.categorySlug));
  if (opts.difficulty) conds.push(eq(s.fish.difficulty, opts.difficulty as never));
  if (opts.imported) conds.push(eq(s.fish.isImported, true));
  if (opts.search) {
    const q = `%${opts.search.toLowerCase()}%`;
    conds.push(
      or(
        like(s.fish.name, q),
        like(s.fish.scientificName, q),
        like(s.fish.shortDescription, q),
      )!,
    );
  }
  const order =
    opts.sort === "price_asc"
      ? asc(s.fish.offerPrice)
      : opts.sort === "price_desc"
        ? desc(s.fish.price)
        : opts.sort === "name"
          ? asc(s.fish.name)
          : desc(s.fish.featured);
  let q = fishSelect().where(and(...conds)).orderBy(order, asc(s.fish.name));
  if (opts.limit) q = q.limit(opts.limit);
  return q;
}

export async function getFishBySlug(slug: string): Promise<FishCard | null> {
  const [row] = await fishSelect().where(eq(s.fish.slug, slug)).limit(1);
  return row ?? null;
}

export async function getRelatedFish(
  fish: Pick<s.Fish, "id" | "categoryId">,
  limit = 4,
): Promise<FishCard[]> {
  if (!fish.categoryId) return [];
  return fishSelect()
    .where(
      and(
        eq(s.fish.published, true),
        eq(s.fish.categoryId, fish.categoryId),
        ne(s.fish.id, fish.id),
      ),
    )
    .orderBy(desc(s.fish.featured))
    .limit(limit);
}

/** Lightweight list for planner / compatibility selectors. */
export async function getAllFishLite() {
  const db = getDb();
  return db
    .select({
      id: s.fish.id,
      slug: s.fish.slug,
      name: s.fish.name,
      heroImage: s.fish.heroImage,
      aggression: s.fish.aggression,
      difficulty: s.fish.difficulty,
      tankSizeMin: s.fish.tankSizeMin,
      adultSize: s.fish.adultSize,
      price: s.fish.price,
      offerPrice: s.fish.offerPrice,
      waterType: s.fish.waterType,
      categoryName: s.categories.name,
    })
    .from(s.fish)
    .leftJoin(s.categories, eq(s.fish.categoryId, s.categories.id))
    .where(eq(s.fish.published, true))
    .orderBy(asc(s.fish.name));
}

/* -------------------------------------------------------------------------- */
/*  Categories                                                                */
/* -------------------------------------------------------------------------- */

export async function getCategories(kind: (typeof s.CATEGORY_KINDS)[number]) {
  const db = getDb();
  return db
    .select()
    .from(s.categories)
    .where(and(eq(s.categories.kind, kind), eq(s.categories.published, true)))
    .orderBy(asc(s.categories.sortOrder));
}

export async function getCategoryBySlug(
  slug: string,
  kind: (typeof s.CATEGORY_KINDS)[number],
) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(s.categories)
    .where(and(eq(s.categories.slug, slug), eq(s.categories.kind, kind)))
    .limit(1);
  return row ?? null;
}

/* -------------------------------------------------------------------------- */
/*  Products                                                                  */
/* -------------------------------------------------------------------------- */

function productSelect() {
  return getDb()
    .select({
      ...getTableColumns(s.products),
      categoryName: s.categories.name,
      categorySlug: s.categories.slug,
    })
    .from(s.products)
    .leftJoin(s.categories, eq(s.products.categoryId, s.categories.id))
    .$dynamic();
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCard[]> {
  return productSelect()
    .where(and(eq(s.products.published, true), eq(s.products.featured, true)))
    .orderBy(asc(s.products.sortOrder))
    .limit(limit);
}

export async function getProductList(opts: {
  categorySlug?: string;
  search?: string;
} = {}): Promise<ProductCard[]> {
  const conds = [eq(s.products.published, true)];
  if (opts.categorySlug) conds.push(eq(s.categories.slug, opts.categorySlug));
  if (opts.search) {
    const q = `%${opts.search.toLowerCase()}%`;
    conds.push(or(like(s.products.name, q), like(s.products.shortDescription, q))!);
  }
  return productSelect().where(and(...conds)).orderBy(asc(s.products.name));
}

export async function getProductBySlug(slug: string): Promise<ProductCard | null> {
  const [row] = await productSelect().where(eq(s.products.slug, slug)).limit(1);
  return row ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<ProductCard[]> {
  if (!ids.length) return [];
  const db = getDb();
  return db.select({
    ...getTableColumns(s.products),
    categoryName: s.categories.name,
    categorySlug: s.categories.slug,
  }).from(s.products)
    .leftJoin(s.categories, eq(s.products.categoryId, s.categories.id))
    .where(and(eq(s.products.published, true), inArray(s.products.id, ids)))
    .limit(20);
}

export async function getFishByIds(ids: string[]): Promise<FishCard[]> {
  if (!ids.length) return [];
  const db = getDb();
  return db.select({
    ...getTableColumns(s.fish),
    categoryName: s.categories.name,
    categorySlug: s.categories.slug,
    categoryColor: s.categories.color,
  }).from(s.fish)
    .leftJoin(s.categories, eq(s.fish.categoryId, s.categories.id))
    .where(and(eq(s.fish.published, true), inArray(s.fish.id, ids)))
    .limit(20);
}

/* -------------------------------------------------------------------------- */
/*  Offers / gallery / testimonials / faqs                                    */
/* -------------------------------------------------------------------------- */

export async function getActiveOffers(placement?: (typeof s.OFFER_PLACEMENTS)[number]) {
  const now = new Date();
  const conds = [
    eq(s.offers.active, true),
    or(isNull(s.offers.startAt), lte(s.offers.startAt, now))!,
    or(isNull(s.offers.endAt), gte(s.offers.endAt, now))!,
  ];
  if (placement) conds.push(eq(s.offers.placement, placement));
  return getDb()
    .select()
    .from(s.offers)
    .where(and(...conds))
    .orderBy(asc(s.offers.sortOrder));
}

export async function getGallery(limit?: number) {
  const db = getDb();
  const q = db
    .select()
    .from(s.galleryItems)
    .where(eq(s.galleryItems.published, true))
    .orderBy(asc(s.galleryItems.sortOrder))
    .$dynamic();
  return limit ? q.limit(limit) : q;
}

export async function getTestimonials(limit = 6) {
  return getDb()
    .select()
    .from(s.testimonials)
    .where(eq(s.testimonials.published, true))
    .orderBy(asc(s.testimonials.sortOrder))
    .limit(limit);
}

export async function getFaqs() {
  return getDb()
    .select()
    .from(s.faqs)
    .where(eq(s.faqs.published, true))
    .orderBy(asc(s.faqs.sortOrder));
}

/* -------------------------------------------------------------------------- */
/*  Blog                                                                      */
/* -------------------------------------------------------------------------- */

function blogSelect() {
  return getDb()
    .select({
      ...getTableColumns(s.blogPosts),
      categoryName: s.categories.name,
      categorySlug: s.categories.slug,
    })
    .from(s.blogPosts)
    .leftJoin(s.categories, eq(s.blogPosts.categoryId, s.categories.id))
    .$dynamic();
}

export async function getBlogPosts(limit?: number) {
  const q = blogSelect()
    .where(eq(s.blogPosts.status, "published"))
    .orderBy(desc(s.blogPosts.publishedAt));
  return limit ? q.limit(limit) : q;
}

export async function getBlogPostBySlug(slug: string) {
  const [row] = await blogSelect().where(eq(s.blogPosts.slug, slug)).limit(1);
  return row ?? null;
}

/* -------------------------------------------------------------------------- */
/*  Planner / compatibility                                                   */
/* -------------------------------------------------------------------------- */

export async function getPlannerPresets() {
  return getDb()
    .select()
    .from(s.plannerPresets)
    .where(eq(s.plannerPresets.published, true))
    .orderBy(asc(s.plannerPresets.sortOrder));
}

/** Published tank equipment-pricing tiers for the planner estimate. */
export async function getTankPricing() {
  return getDb()
    .select()
    .from(s.tankPricing)
    .where(eq(s.tankPricing.published, true))
    .orderBy(asc(s.tankPricing.sortOrder));
}
