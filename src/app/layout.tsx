import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Best Aquarium & Exotic Fish in Kuthuparamba, Kannur`,
    template: `%s · ${SITE.name}`,
  },
  description:
    "Visit Happy Aquarium near Eye Hospital, Kuthuparamba. We offer premium imported fish, aquarium accessories, and custom tank setups in the Kannur region.",
  keywords: [
    "aquarium fish Kerala",
    "aquarium shop Kuthuparamba",
    "imported fish Kannur",
    "exotic fish Kuthuparamba",
    "aquarium Kannur",
    "fish tank Kerala",
    "fish shop near me"
  ],
  openGraph: { type: "website", siteName: SITE.name, locale: "en_IN" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
