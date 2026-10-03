import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { getBlogPosts, getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fish Care Blog & Guides",
  description:
    "Practical fish care guides from Happy Aquarium — water quality, feeding, disease prevention, tank setup and aquascaping tips for hobbyists of every level.",
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getCategories("blog"),
  ]);

  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Learn"
        title="Fish Care Blog"
        subtitle="Guides on fish care, water quality, feeding, diseases and aquascaping."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <Container className="pb-20">
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 py-1 text-xs text-ink/85"
              >
                {c.name}
              </span>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="rounded-3xl glass p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-aqua/50" />
            <p className="text-ink/75">
              No articles published yet. Check back soon for fresh fish care
              guides.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {/* Featured post — spans full width */}
            {featured && (
              <Reveal delay={0} className="md:col-span-3">
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl glass-strong transition-all duration-500 hover:-translate-y-1 hover:ocean-ring md:flex-row"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-auto md:w-1/2">
                    {featured.coverImage ? (
                      <Image
                        src={featured.coverImage}
                        alt={featured.title}
                        fill
                        sizes="(max-width:768px) 100vw, 640px"
                        className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full min-h-56 items-center justify-center bg-ocean-900">
                        <BookOpen className="h-10 w-10 text-aqua/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-medium text-aqua">
                      {featured.categoryName && (
                        <span>{featured.categoryName}</span>
                      )}
                      {featured.readTime && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {featured.readTime} min read
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-semibold text-ink group-hover:text-aqua sm:text-3xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="mt-3 line-clamp-3 text-ink/60">
                        {featured.excerpt}
                      </p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-aqua">
                      Read article
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )}

            {/* Remaining posts */}
            {rest.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.06}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl glass transition-all duration-500 hover:-translate-y-1.5 hover:ocean-ring"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width:768px) 90vw, 380px"
                        className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-ocean-900">
                        <BookOpen className="h-9 w-9 text-aqua/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-xs font-medium text-aqua">
                      {post.categoryName && <span>{post.categoryName}</span>}
                      {post.readTime && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readTime} min read
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-ink group-hover:text-aqua">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-ink/60">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
