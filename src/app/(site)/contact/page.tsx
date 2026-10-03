import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container, Button } from "@/components/ui/primitives";
import { ContactForm } from "@/components/contact/ContactForm";
import { getSiteSettings } from "@/lib/queries";
import { SITE, WHATSAPP_DEFAULT_MSG } from "@/lib/site";
import { whatsappHref, callHref } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact & Visit",
  description:
    "Get in touch with Happy Aquarium in Kuthuparamba, Kannur — call, WhatsApp or drop by the store. Find our address, opening hours and directions.",
};

const MAP_FALLBACK =
  "https://www.google.com/maps?q=Kuthuparamba,Kerala&output=embed";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const phone = settings?.phone ?? SITE.phone;
  const whatsapp = settings?.whatsapp ?? SITE.whatsapp;
  const email = settings?.email ?? SITE.email;
  const addressLine = settings?.addressLine ?? SITE.addressLine;
  const area = settings?.area ?? SITE.area;
  const city = settings?.city ?? SITE.city;
  const state = settings?.state ?? SITE.state;
  const pincode = settings?.pincode ?? SITE.pincode;
  const mapEmbedUrl = settings?.mapEmbedUrl ?? MAP_FALLBACK;

  const addressParts = [addressLine, area, city, state, pincode].filter(
    Boolean,
  );

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact & Visit"
        subtitle="Questions about fish, tanks or setup? Call, WhatsApp or visit us in Kuthuparamba — we're happy to help you build a thriving aquarium."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <Container className="pb-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT — store info */}
          <div className="glass-strong rounded-3xl p-7">
            <h2 className="text-2xl font-semibold text-ink">
              Visit our store
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Drop by to see our livestock and supplies in person.
            </p>

            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-aqua" />
                <span className="text-ink/75">
                  {addressParts.join(", ")}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-aqua" />
                <a
                  href={callHref(phone)}
                  className="font-num text-ink/75 hover:text-aqua"
                >
                  {phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-aqua" />
                <a
                  href={`mailto:${email}`}
                  className="text-ink/75 hover:text-aqua"
                >
                  {email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-aqua" />
                <span className="text-ink/75">
                  Mon–Sat 9:00–20:00, Sun 10:00–18:00
                </span>
              </li>
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                variant="coral"
                href={whatsappHref(whatsapp, WHATSAPP_DEFAULT_MSG)}
                external
                ariaLabel="Chat on WhatsApp"
              >
                WhatsApp us
              </Button>
              <Button
                variant="ghost"
                href={callHref(phone)}
                external
                ariaLabel="Call us"
              >
                Call now
              </Button>
            </div>

            <div className="mt-7 min-h-[300px] overflow-hidden rounded-3xl glass">
              <iframe
                src={mapEmbedUrl}
                title="Happy Aquarium location map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[300px] w-full border-0"
                allowFullScreen
              />
            </div>
          </div>

          {/* RIGHT — enquiry form */}
          <ContactForm whatsapp={whatsapp} />
        </div>
      </Container>
    </>
  );
}
