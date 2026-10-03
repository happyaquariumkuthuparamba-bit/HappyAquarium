import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User, BookOpen, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { Markdown } from "@/components/blog/Markdown";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  const cover = post.ogImage ?? post.coverImage;
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt ?? undefined,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const more = (await getBlogPosts(4)).filter((p) => p.id !== post.id);

  return (
    <>
      <PageHero
        title={post.title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      <Container className="pb-20">
        <article className="mx-auto max-w-3xl">
          {post.coverImage && (
            <Reveal>
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl glass">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width:768px) 100vw, 768px"
                  className="object-cover"
                  priority
                />
              </div>
            </Reveal>
          )}

          {/* Meta line */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink/60">
            {post.categoryName && (
              <span className="inline-flex items-center gap-1.5 text-aqua">
                <BookOpen className="h-4 w-4" />
                {post.categoryName}
              </span>
            )}
            {post.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author}
              </span>
            )}
            {post.readTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime} min read
              </span>
            )}
            {post.publishedAt && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString("en-IN")}
              </span>
            )}
          </div>

          {post.excerpt && (
            <p className="mt-5 text-lg leading-relaxed text-ink/85">
              {post.excerpt}
            </p>
          )}

          {/* Markdown content */}
          <div className="mt-8">
            <Markdown content={post.content} />
          </div>
        </article>

        {/* More articles */}
        {more.length > 0 && (
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-ink">
                More articles
              </h2>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-aqua hover:text-turquoise"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {more.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl glass transition-all duration-500 hover:-translate-y-1.5 hover:ocean-ring"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {p.coverImage ? (
                        <Image
                          src={p.coverImage}
                          alt={p.title}
                          fill
                          sizes="(max-width:768px) 90vw, 340px"
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
                        {p.categoryName && <span>{p.categoryName}</span>}
                        {p.readTime && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {p.readTime} min read
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-ink group-hover:text-aqua">
                        {p.title}
                      </h3>
                      {p.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-ink/60">
                          {p.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
