import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  requireAdmin, getFishByIdAdmin, getFishCategoriesAdmin, listFishAdmin,
} from "@/lib/admin";
import { saveFish } from "@/app/admin/actions";
import {
  DIFFICULTY_LEVELS, AGGRESSION_LEVELS, WATER_TYPES, AVAILABILITY, RATE_TYPES
} from "@/db/schema";
import ImageField from "@/components/admin/ImageField";
import VariantPicker from "@/components/admin/VariantPicker";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-xl border border-ink/15 bg-[#fffdf8] px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-clay/50 focus:outline-none focus:ring-1 focus:ring-clay/30";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink/55">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink/45">{hint}</span>}
    </label>
  );
}

export default async function FishForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("staff");
  const { id } = await params;
  const isNew = id === "new";
  const [fish, categories, allFish] = await Promise.all([
    isNew ? Promise.resolve(null) : getFishByIdAdmin(id),
    getFishCategoriesAdmin(),
    listFishAdmin(),
  ]);
  if (!isNew && !fish) notFound();
  const f = fish;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/fish" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-aqua">
        <ArrowLeft className="h-4 w-4" /> Back to fish
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-softwhite">
        {isNew ? "Add new fish" : `Edit: ${f?.name}`}
      </h1>

      <form action={saveFish} className="mt-6 space-y-6">
        {!isNew && <input type="hidden" name="id" value={f!.id} />}

        <section className="rounded-2xl glass p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-aqua">Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><input name="name" required defaultValue={f?.name ?? ""} className={inputCls} /></Field>
            <Field label="Slug" hint="Leave blank to auto-generate"><input name="slug" defaultValue={f?.slug ?? ""} className={inputCls} /></Field>
            <Field label="Scientific name"><input name="scientificName" defaultValue={f?.scientificName ?? ""} className={inputCls} /></Field>
            <Field label="Category">
              <select name="categoryId" defaultValue={f?.categoryId ?? ""} className={inputCls}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Short description"><input name="shortDescription" defaultValue={f?.shortDescription ?? ""} className={inputCls} /></Field>
            <Field label="Origin"><input name="origin" defaultValue={f?.origin ?? ""} className={inputCls} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Description"><textarea name="description" rows={4} defaultValue={f?.description ?? ""} className={inputCls} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Care guide"><textarea name="careGuide" rows={3} defaultValue={f?.careGuide ?? ""} className={inputCls} /></Field>
          </div>
        </section>

        <section className="rounded-2xl glass p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-aqua">Care parameters</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Temp min (°C)"><input name="temperatureMin" type="number" step="0.1" defaultValue={f?.temperatureMin ?? ""} className={inputCls} /></Field>
            <Field label="Temp max (°C)"><input name="temperatureMax" type="number" step="0.1" defaultValue={f?.temperatureMax ?? ""} className={inputCls} /></Field>
            <Field label="Water type">
              <select name="waterType" defaultValue={f?.waterType ?? "freshwater"} className={inputCls}>
                {WATER_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </Field>
            <Field label="pH min"><input name="phMin" type="number" step="0.1" defaultValue={f?.phMin ?? ""} className={inputCls} /></Field>
            <Field label="pH max"><input name="phMax" type="number" step="0.1" defaultValue={f?.phMax ?? ""} className={inputCls} /></Field>
            <Field label="Min tank size (L)"><input name="tankSizeMin" type="number" defaultValue={f?.tankSizeMin ?? ""} className={inputCls} /></Field>
            <Field label="Adult size (cm)"><input name="adultSize" type="number" step="0.1" defaultValue={f?.adultSize ?? ""} className={inputCls} /></Field>
            <Field label="Lifespan"><input name="lifespan" defaultValue={f?.lifespan ?? ""} className={inputCls} /></Field>
            <Field label="Diet"><input name="diet" defaultValue={f?.diet ?? ""} className={inputCls} /></Field>
            <Field label="Difficulty">
              <select name="difficulty" defaultValue={f?.difficulty ?? "beginner"} className={inputCls}>
                {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Aggression">
              <select name="aggression" defaultValue={f?.aggression ?? "peaceful"} className={inputCls}>
                {AGGRESSION_LEVELS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Compatibility"><textarea name="compatibility" rows={2} defaultValue={f?.compatibility ?? ""} className={inputCls} /></Field>
          </div>
        </section>

        <section className="rounded-2xl glass p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-aqua">Pricing & stock</h2>
          <div className="grid gap-4 sm:grid-cols-5">
            <Field label="Price (₹)"><input name="price" type="number" step="1" defaultValue={f?.price ?? ""} className={inputCls} /></Field>
            <Field label="Offer price (₹)"><input name="offerPrice" type="number" step="1" defaultValue={f?.offerPrice ?? ""} className={inputCls} /></Field>
            <Field label="Rate Type">
              <select name="rateType" defaultValue={f?.rateType ?? "pair"} className={inputCls}>
                {RATE_TYPES.map((r) => <option key={r} value={r}>{r === "single" ? "Per Fish" : "Per Pair"}</option>)}
              </select>
            </Field>
            <Field label="Stock"><input name="stock" type="number" defaultValue={f?.stock ?? 0} className={inputCls} /></Field>
            <Field label="Availability">
              <select name="availability" defaultValue={f?.availability ?? "available"} className={inputCls}>
                {AVAILABILITY.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="rounded-2xl glass p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-aqua">Varieties</h2>
          <Field label="Variants" hint="Select other fish to show as variants">
            <VariantPicker
              name="variantIds"
              options={allFish.filter((x) => x.id !== f?.id).map((x) => ({ id: x.id, name: x.name, slug: x.slug }))}
              defaultValue={f?.variantIds ?? []}
            />
          </Field>
        </section>

        <section className="rounded-2xl glass p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-aqua">Media</h2>
          <div className="grid gap-4">
            <ImageField name="heroImage" label="Hero image" defaultValue={f?.heroImage ?? ""} hint="Paste a URL, or upload a photo from your device" />
            <Field label="Gallery URLs" hint="One per line"><textarea name="gallery" rows={3} defaultValue={(f?.gallery ?? []).join("\n")} className={inputCls} /></Field>
            <Field label="Video URL"><input name="video" defaultValue={f?.video ?? ""} className={inputCls} /></Field>
            <Field label="Tags" hint="Comma or newline separated"><input name="tags" defaultValue={(f?.tags ?? []).join(", ")} className={inputCls} /></Field>
          </div>
        </section>

        <section className="rounded-2xl glass p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-aqua">Flags & SEO</h2>
          <div className="flex flex-wrap gap-5">
            {([
              ["featured", "Featured", f?.featured],
              ["trending", "Trending", f?.trending],
              ["isImported", "Imported", f?.isImported],
              ["isNewArrival", "New arrival", f?.isNewArrival],
              ["published", "Published", f ? f.published : true],
            ] as const).map(([name, label, checked]) => (
              <label key={name} className="flex items-center gap-2 text-sm text-slate-200">
                <input type="checkbox" name={name} defaultChecked={!!checked} className="h-4 w-4 accent-[#22d3ee]" />
                {label}
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Meta title"><input name="metaTitle" defaultValue={f?.metaTitle ?? ""} className={inputCls} /></Field>
            <Field label="Meta description"><input name="metaDescription" defaultValue={f?.metaDescription ?? ""} className={inputCls} /></Field>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link href="/admin/fish" className="rounded-full glass px-6 py-3 text-sm text-slate-300 hover:bg-white/10">
            Cancel
          </Link>
          <button type="submit" className="rounded-full bg-gradient-to-r from-aqua to-turquoise px-8 py-3 text-sm font-semibold text-navy">
            {isNew ? "Create fish" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
