import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { whatsappHref } from "@/lib/utils";
import { SITE_SOCIALS } from "@/lib/site";

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
function FbIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5H17V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.2H7.8V14h2.7v8h3z" />
    </svg>
  );
}
function YtIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M21.6 7.2s-.2-1.4-.8-2c-.75-.8-1.6-.8-2-.85C16 4.1 12 4.1 12 4.1h-.02s-4 0-6.8.25c-.4.05-1.25.05-2 .85-.6.6-.8 2-.8 2S2.1 8.8 2.1 10.5v1.6c0 1.65.2 3.3.2 3.3s.2 1.4.8 2c.75.8 1.75.75 2.2.85 1.6.15 6.7.2 6.7.2s4 0 6.8-.25c.4-.05 1.25-.05 2-.85.6-.6.8-2 .8-2s.2-1.65.2-3.3v-1.6c0-1.65-.2-3.3-.2-3.3zM9.9 14.6V9.2l5.15 2.7-5.15 2.7z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M21.8 10.2H12v3.8h5.6c-.5 2.5-2.7 4-5.6 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.5 0 2.8.5 3.8 1.4l2.8-2.8C16.7 2.9 14.5 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.5 0 9.7-3.9 9.7-9.7 0-.7-.1-1.4-.2-2.1z"/>
    </svg>
  );
}

export type FooterProps = {
  storeName: string;
  tagline?: string | null;
  phone: string;
  whatsapp: string;
  email?: string | null;
  addressLine?: string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  socials?: { instagram?: string; facebook?: string; youtube?: string } | null;
  nav: { label: string; url: string }[];
};

export default function Footer(p: FooterProps) {
  const addr = [p.addressLine, p.area, p.city, p.state].filter(Boolean).join(", ");
  const socialCls =
    "flex h-9 w-9 items-center justify-center rounded-full border border-paper/25 text-paper/80 transition-colors hover:border-clay hover:bg-clay hover:text-paper";

  return (
    <footer className="relative mt-24 bg-teal-2 text-paper">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <span className="font-display text-2xl font-semibold text-paper">{p.storeName}</span>
          {p.tagline && <p className="mt-3 text-sm text-paper/60">{p.tagline}</p>}
          <div className="mt-6 flex gap-3">
            <a href={p.socials?.instagram ?? SITE_SOCIALS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialCls}><IgIcon /></a>
            {p.socials?.facebook && <a href={p.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialCls}><FbIcon /></a>}
            {p.socials?.youtube && <a href={p.socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={socialCls}><YtIcon /></a>}
            <a href={SITE_SOCIALS.googleReview} target="_blank" rel="noopener noreferrer" aria-label="Leave a Google Review" className={socialCls}><GoogleIcon /></a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clay">Explore</h4>
          <ul className="mt-4 space-y-2.5">
            {p.nav.map((n) => (
              <li key={n.url}>
                <Link href={n.url} className="text-sm text-paper/70 hover:text-paper">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clay">Visit &amp; Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-paper/80">
            {addr && (
              <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" /><span>{addr}</span></li>
            )}
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-clay" /><a href={`tel:${p.phone}`} className="hover:text-paper">{p.phone}</a></li>
            {p.email && <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-clay" /><a href={`mailto:${p.email}`} className="hover:text-paper">{p.email}</a></li>}
            <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-clay" /><span>Mon–Sat 9:00–20:00 · Sun 10:00–18:00</span></li>
          </ul>
          <a
            href={whatsappHref(p.whatsapp, "Hi Happy Aquarium!")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm font-medium text-paper hover:bg-clay-2"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-paper/15">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-paper/50 sm:flex-row sm:px-8">
          <span>© {new Date().getFullYear()} {p.storeName}. All rights reserved.</span>
          <span>Made with care in Kerala · <Link href="/terms" className="hover:text-paper">Terms</Link> · <Link href="/privacy" className="hover:text-paper">Privacy</Link> · <Link href="/returns" className="hover:text-paper">Returns</Link> · <Link href="/admin" className="hover:text-paper">Admin</Link></span>
        </div>
      </div>
    </footer>
  );
}
