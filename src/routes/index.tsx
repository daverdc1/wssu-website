import { createFileRoute } from "@tanstack/react-router";
import { DevSettingsProvider } from "@/lib/dev-settings";
import { HeroVideoProvider } from "@/lib/hero-video";
import { Nav } from "@/components/wssu/Nav";
import { AnnouncementsBanner } from "@/components/wssu/AnnouncementsBanner";
import { DevPanel } from "@/components/wssu/DevPanel";
import { Hero } from "@/components/wssu/Hero";
import { Stats } from "@/components/wssu/Stats";
import { Programs } from "@/components/wssu/Programs";
import { Outcomes } from "@/components/wssu/Outcomes";
import { WhyWSSU } from "@/components/wssu/WhyWSSU";
import { Testimonial } from "@/components/wssu/Testimonial";
import { RamilyCTA } from "@/components/wssu/RamilyCTA";
import { Blog } from "@/components/wssu/Blog";
import { Events } from "@/components/wssu/Events";
import { Footer } from "@/components/wssu/Footer";
import { hero } from "@/components/wssu/photos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Winston-Salem State University — Future-Focused Programs. Real-World Results." },
      {
        name: "description",
        content:
          "WSSU is the #1 HBCU in North Carolina for value and the state's only Carnegie-designated Opportunity College. Find your program. Join the Ramily.",
      },
      { property: "og:title", content: "Winston-Salem State University" },
      {
        property: "og:description",
        content: "Future-Focused Programs. Real-World Results. Join the Ramily.",
      },
      { property: "og:image", content: hero },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: hero },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <DevSettingsProvider>
      <HeroVideoProvider>
        <main className="min-h-screen overflow-x-clip bg-wssu-white text-wssu-black">
          <AnnouncementsBanner />
          <Nav />
          <Hero />
          <Stats />
          <Programs />
          <Outcomes />
          <WhyWSSU />
          <Testimonial />
          <RamilyCTA />
          <Blog />
          <Events />
          <Footer />
        </main>
        <DevPanel />
      </HeroVideoProvider>
    </DevSettingsProvider>
  );
}
