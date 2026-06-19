import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Logo } from "./Logo";
import { DemoLink } from "./DemoLink";
import { HoverAccentLine } from "./HoverAccentLine";

const linkCols = [
  ["Accreditation", "RAMSupport", "SAFE @ WSSU", "Title IX", "Work at WSSU"],
  ["My WSSU", "Academic Calendar", "Bookstore", "Campus Map", "Directory"],
];

const legalLinks = [
  "Privacy statement",
  "Accessibility Statement",
  "Policies & Regulations",
  "Consumer Information",
  "Sitemap",
];

const socialLinks = [
  { label: "Facebook", icon: Facebook },
  { label: "Instagram", icon: Instagram },
  { label: "X", icon: Twitter },
  { label: "LinkedIn", icon: Linkedin },
  { label: "YouTube", icon: Youtube },
] as const;

export function Footer() {
  return (
    <footer className="bg-wssu-black text-wssu-white">
      <div className="flex h-1 w-full" aria-hidden="true">
        <span className="flex-1 bg-wssu-gold" />
        <span className="flex-1 bg-wssu-teal" />
        <span className="flex-1 bg-wssu-lime" />
      </div>
      <div className="section-header-container pb-12 pt-12 md:pt-16">
        <div className="grid grid-cols-1 gap-16 border-b border-wssu-white/15 pb-16 lg:grid-cols-12">
          <div className="space-y-8 font-sans lg:col-span-4">
            <Logo tone="footer" className="h-[3.75rem] w-auto md:h-[3.75rem]" />

            <div>
              <p className="text-base font-semibold text-wssu-white">Address</p>
              <p className="mt-2 text-sm leading-relaxed text-wssu-white/70">
                601 Martin Luther King Jr. Drive,
                <br />
                Winston-Salem, NC 27110
              </p>
            </div>

            <div>
              <p className="text-base font-semibold text-wssu-white">Contact</p>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <DemoLink className="font-medium text-wssu-white underline underline-offset-[3px] decoration-wssu-white/80 transition-colors hover:text-wssu-gold hover:decoration-wssu-gold">
                    336-750-2000
                  </DemoLink>
                </p>
                <p>
                  <DemoLink className="font-medium text-wssu-white underline underline-offset-[3px] decoration-wssu-white/80 transition-colors hover:text-wssu-gold hover:decoration-wssu-gold">
                    admissions@wssu.edu
                  </DemoLink>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              {socialLinks.map(({ label, icon: Icon }) => (
                <DemoLink
                  key={label}
                  aria-label={label}
                  className="text-wssu-white transition-colors hover:text-wssu-gold"
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </DemoLink>
              ))}
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-12 lg:col-span-6 lg:col-start-7 lg:w-auto lg:justify-self-end lg:gap-28">
            {linkCols.map((links) => (
              <ul key={links[0]} className="space-y-3 font-sans text-base">
                {links.map((l) => (
                  <li key={l}>
                    <DemoLink className="group flex flex-col items-start text-wssu-white/90 transition-colors hover:text-wssu-gold">
                      {l}
                      <HoverAccentLine color="gold" />
                    </DemoLink>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      <div className="section-container pb-12">
        <div className="flex flex-col items-start justify-between gap-4 pt-8 font-sans text-xs text-wssu-white/70 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Winston-Salem State University. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-3 gap-y-2 md:ml-auto md:justify-end md:gap-x-4">
            {legalLinks.map((l) => (
              <DemoLink
                key={l}
                className="underline underline-offset-2 transition-colors hover:text-wssu-gold"
              >
                {l}
              </DemoLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
