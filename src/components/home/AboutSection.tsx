import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function AboutSection() {
  const highlights = [
    "Over 23+ Years of Excellence",
    "Rare & Imported Fish Varieties",
    "Premium Planted Aquariums",
    "Custom Aquarium Builds Across South India"
  ];

  return (
    <section className="relative overflow-hidden bg-[#fffdf8] py-24 sm:py-32 border-t border-ink/5">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <Reveal>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-paper shadow-2xl">
              <Image
                src="/images/fish/discus-fish.jpg" // Using an elegant fish as a placeholder
                alt="Happy Aquarium planted tank"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-ink/10"></div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 hidden sm:block z-10">
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-teal text-white shadow-xl ring-8 ring-[#fffdf8]">
                  <span className="font-display text-4xl font-bold">23+</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Years Exp.</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-col justify-center">
              <h2 className="font-display text-sm font-semibold tracking-[0.2em] text-teal uppercase">
                About Happy Aquarium
              </h2>
              <p className="mt-4 font-display text-3xl font-medium tracking-tight text-ink sm:text-5xl leading-[1.1]">
                Mastering the Art of Aquatic Ecosystems.
              </p>
              <p className="mt-6 text-base leading-relaxed text-ink/75 sm:text-lg">
                With a rich legacy spanning <strong>over 23 years</strong>, Happy Aquarium has established itself as South India’s premier destination for aquarists. We don't just sell fish; we curate living art.
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink/75 sm:text-lg">
                We take pride in offering an exclusive, large variety of <strong>imported, rare, and premium planted aquarium fishes</strong>. Beyond our exquisite livestock, our expertise lies in crafting breathtaking <strong>planted aquariums</strong> and designing <strong>custom aquarium builds</strong> for homes and businesses across all of South India. 
              </p>
              
              <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {highlights.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-ink/80 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-teal shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
