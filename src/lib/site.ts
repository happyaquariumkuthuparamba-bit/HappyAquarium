/**
 * Static fallback store details. The live values come from the `site_settings`
 * table (editable in admin); these constants are the safe defaults used by
 * client components and when the DB is unavailable.
 */
export const SITE = {
  name: "Happy Aquarium",
  tagline: "Dive into a world of living colour",
  phone: "9947770808",
  whatsapp: "919947770808",
  email: "hello@happyaquarium.in",
  addressLine: "Near Eye Hospital",
  area: "Kuthuparamba",
  city: "Kannur",
  state: "Kerala",
  pincode: "670643",
  url: "https://happyaquarium.store",
} as const;

export const SITE_SOCIALS = {
  instagram: "https://www.instagram.com/happy_aquarium_kuthuparamba_",
  googleReview: "https://g.page/r/CcofhAyFywNVEBM/review",
} as const;

export const WHATSAPP_DEFAULT_MSG =
  "Hi Happy Aquarium! I'd like to enquire about your fish and aquarium supplies.";

export function fishEnquiryMsg(name: string) {
  return `Hi Happy Aquarium! I'm interested in the *${name}*. Is it available?`;
}

export function reserveMsg(name: string) {
  return `Hi Happy Aquarium! I'd like to reserve the *${name}*. Please hold it for me.`;
}
