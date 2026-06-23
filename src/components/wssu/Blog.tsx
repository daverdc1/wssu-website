import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHorizontalDragScroll } from "@/hooks/use-horizontal-drag-scroll";
import { OptimizedImage } from "./OptimizedImage";
import { ConnectedArrowControls } from "./ConnectedArrowControls";
import { DemoLink } from "./DemoLink";
import { HoverAccentLine } from "./HoverAccentLine";
import { SectionHeaderLabelRow } from "./SectionHeaderGrid";
import { blog } from "./photos";

const categories = [
  { name: "Academics", fill: "bg-wssu-gold", hoverText: "group-hover:text-wssu-black" },
  { name: "Arts", fill: "bg-wssu-teal", hoverText: "group-hover:text-wssu-white" },
  { name: "Community", fill: "bg-wssu-lime", hoverText: "group-hover:text-wssu-black" },
  { name: "Health", fill: "bg-wssu-coral", hoverText: "group-hover:text-wssu-white" },
  { name: "People", fill: "bg-wssu-violet", hoverText: "group-hover:text-wssu-white" },
  { name: "Research", fill: "bg-wssu-blue", hoverText: "group-hover:text-wssu-white" },
  { name: "Sports", fill: "bg-wssu-red", hoverText: "group-hover:text-wssu-white" },
] as const;

type CategoryName = (typeof categories)[number]["name"];

const categoryStyles = Object.fromEntries(
  categories.map((c) => [c.name, { fill: c.fill, hoverText: c.hoverText }]),
) as Record<CategoryName, { fill: (typeof categories)[number]["fill"]; hoverText: (typeof categories)[number]["hoverText"] }>;

const categoryLineColors: Record<
  CategoryName,
  "gold" | "teal" | "lime" | "coral" | "violet" | "blue" | "red"
> = {
  Academics: "gold",
  Arts: "teal",
  Community: "lime",
  Health: "coral",
  People: "violet",
  Research: "blue",
  Sports: "red",
};

const posts: {
  image: string;
  category: CategoryName;
  read: string;
  title: string;
  excerpt: string;
}[] = [
  {
    image: blog[0],
    category: "Community",
    read: "5 min read",
    title: "Admitted Students Day: Inside the Loudest Welcome on Campus",
    excerpt:
      "From red carpet check-in to a Ramily roar that shook the gym, here's what happens when future Rams meet WSSU for the first time.",
  },
  {
    image: blog[1],
    category: "Academics",
    read: "6 min read",
    title: "Why WSSU's Nursing Program Keeps Producing the State's Best",
    excerpt:
      "Clinical hours, faculty mentorship, and a culture of advocacy: how the BSN cohort prepares for a profession that needs them now.",
  },
  {
    image: blog[2],
    category: "Research",
    read: "4 min read",
    title: "How Rams Built a $600M Economic Engine in the Piedmont Triad",
    excerpt:
      "9,000+ alumni stayed close to home — and rewired the region's economy. The data, the stories, and the receipts.",
  },
  {
    image: blog[3],
    category: "Arts",
    read: "5 min read",
    title: "Inside the New Digital Media Lab Where Students Shoot, Edit, and Ship",
    excerpt:
      "From podcast booths to motion-capture rigs, the renovated arts wing is where creative Rams turn ideas into finished work.",
  },
  {
    image: blog[4],
    category: "Health",
    read: "7 min read",
    title: "Campus Wellness Center Expands Mental Health Support for Students",
    excerpt:
      "More counselors, peer support groups, and same-week appointments — how WSSU is meeting students where they are.",
  },
  {
    image: blog[5],
    category: "People",
    read: "4 min read",
    title: "Meet the Professor Who Turned a Lecture Hall Into a Startup Studio",
    excerpt:
      "Dr. Williams mentors first-gen founders through pitch nights, micro-grants, and the kind of tough love Rams remember.",
  },
  {
    image: blog[6],
    category: "Sports",
    read: "3 min read",
    title: "Rams Basketball Clinches CIAA Title in Overtime Thriller",
    excerpt:
      "A packed C.E. Gaines Center, a fourth-quarter rally, and a senior class that left everything on the floor.",
  },
  {
    image: blog[7],
    category: "Academics",
    read: "5 min read",
    title: "Honors College Cohort Publishes First Undergraduate Policy Journal",
    excerpt:
      "Twelve students spent a semester researching Piedmont Triad housing — then presented findings to city leaders.",
  },
  {
    image: blog[8],
    category: "Community",
    read: "6 min read",
    title: "Ramily Serve Day Draws 800 Volunteers Across Winston-Salem",
    excerpt:
      "Food drives, neighborhood cleanups, and mentorship pop-ups: one Saturday, one campus, one city better off for it.",
  },
];

function BlogCard({
  post,
  index,
}: {
  post: (typeof posts)[number];
  index: number;
}) {
  return (
    <article className="group flex h-full flex-col">
      <div className="photo-corner-cut relative aspect-[4/3] w-full overflow-hidden bg-wssu-black/5">
        <OptimizedImage
          src={post.image}
          alt={post.title}
          sizes="(min-width: 768px) 1024px, 100vw"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 bg-wssu-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-wssu-black">
          #{String(index + 1).padStart(2, "0")}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-wssu-black/60">
        <span className="relative inline-flex items-center justify-center overflow-hidden bg-wssu-black px-3.5 py-1 text-wssu-white transition-colors duration-300 ease-out">
          <span
            className={cn(
              "absolute inset-y-0 left-0 w-2 transition-[width] duration-300 ease-out group-hover:w-full",
              categoryStyles[post.category].fill,
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              "relative z-10 w-full text-center transition-colors duration-300 ease-out",
              categoryStyles[post.category].hoverText,
            )}
          >
            {post.category}
          </span>
        </span>
        <span>{post.read}</span>
      </div>
      <h3 className="mt-4 font-display text-2xl uppercase leading-tight text-wssu-black">
        <DemoLink className="block cursor-pointer text-left underline-offset-2 decoration-wssu-black transition-[text-decoration-color] duration-300 group-hover:underline">
          {post.title}
        </DemoLink>
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-wssu-black/75">{post.excerpt}</p>
      <DemoLink className="group/link relative mt-6 inline-flex text-xs font-bold uppercase tracking-[0.15em] text-wssu-black/60 transition-colors group-hover:text-wssu-black hover:text-wssu-black">
        <span className="inline-flex items-center gap-2">
          Read more
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 group-hover/link:translate-x-1" strokeWidth={2.5} />
        </span>
        <HoverAccentLine
          floating
          color={categoryLineColors[post.category]}
          expandOn="group-hover:w-12 group-hover/link:w-12"
        />
      </DemoLink>
    </article>
  );
}

const newsCardWidth =
  "w-[min(82vw,20rem)] sm:w-[min(75vw,24rem)] md:w-[min(47vw,26rem)] lg:w-[min(31vw,22rem)]";

function getScrollPaddingStart(container: HTMLElement) {
  const style = getComputedStyle(container);
  const value = style.scrollPaddingInlineStart || style.scrollPaddingLeft || "0";
  return Number.parseFloat(value) || 0;
}

export function Blog() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);
  const [current, setCurrent] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const syncFromScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || scrollingRef.current) return;

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("[data-news-card]"),
    );
    if (!cards.length) return;

    const padStart = getScrollPaddingStart(container);
    const anchor = container.scrollLeft + padStart;
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    const atEnd = container.scrollLeft >= maxScroll - 4;

    let next = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - anchor);
      if (distance < minDistance) {
        minDistance = distance;
        next = index;
      }
    });

    if (atEnd) next = posts.length - 1;

    setCurrent(next);
    setCanPrev(next > 0);
    setCanNext(!atEnd && next < posts.length - 1);
  }, []);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollLeft = 0;
    setCurrent(0);
    setCanPrev(false);
    setCanNext(posts.length > 1);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      prefersReducedMotionRef.current = media.matches;
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    syncFromScroll();
    container.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("resize", syncFromScroll);

    return () => {
      container.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", syncFromScroll);
    };
  }, [syncFromScroll]);

  const { isDragging } = useHorizontalDragScroll(scrollRef, syncFromScroll);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;

      const clamped = Math.max(0, Math.min(posts.length - 1, index));
      const card = container.querySelectorAll<HTMLElement>("[data-news-card]")[clamped];
      if (!card) return;

      const padStart = getScrollPaddingStart(container);
      const targetLeft = Math.max(0, card.offsetLeft - padStart);
      const isRapid = scrollingRef.current;

      scrollingRef.current = true;
      setCurrent(clamped);
      setCanPrev(clamped > 0);
      setCanNext(clamped < posts.length - 1);

      container.scrollTo({
        left: targetLeft,
        behavior: isRapid || prefersReducedMotionRef.current ? "auto" : "smooth",
      });

      const release = () => {
        scrollingRef.current = false;
        syncFromScroll();
      };

      container.addEventListener("scrollend", release, { once: true });
      window.setTimeout(release, isRapid ? 80 : 300);
    },
    [syncFromScroll],
  );

  return (
    <section className="bg-wssu-white py-24 md:py-32">
      <div className="section-header-container">
        <div className="grid grid-cols-1 gap-y-8 md:grid-cols-12 md:items-end md:gap-x-0 md:gap-y-8">
          <SectionHeaderLabelRow label="(07) — News" />
          <h2 className="font-display flex flex-col gap-y-[0.04em] text-5xl uppercase leading-[0.95] md:col-span-5 md:text-7xl">
            <span className="text-wssu-black">Ramily</span>
            <span className="text-wssu-black">News.</span>
          </h2>
          <div className="section-intro-grid section-intro-grid--full hidden w-full flex-col justify-end md:flex">
            <div className="flex w-full flex-wrap items-center justify-end gap-3">
              <DemoLink className="shrink-0 border border-wssu-black px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-wssu-black transition-colors hover:bg-wssu-black hover:text-wssu-white">
                All news
              </DemoLink>
              <div className="flex shrink-0 items-center">
                <ConnectedArrowControls
                  onPrev={() => scrollToIndex(current - 1)}
                  onNext={() => scrollToIndex(current + 1)}
                  canPrev={canPrev}
                  canNext={canNext}
                  prevLabel="Previous article"
                  nextLabel="Next article"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 w-full">
        <div
          ref={scrollRef}
          className={cn(
            "news-carousel-scroll touch-pan-x overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            isDragging ? "cursor-grabbing select-none" : "cursor-grab",
          )}
        >
          <div className="section-scroll-inset flex w-max gap-5 pr-[max(1.5rem,calc((100vw-min(100vw,1440px))/2+1.5rem))] md:gap-8 md:pr-0">
            {posts.map((post, idx) => (
              <div
                key={post.title}
                data-news-card
                className={cn("shrink-0 snap-start", newsCardWidth)}
              >
                <BlogCard post={post} index={idx} />
              </div>
            ))}
          </div>
        </div>

        <div className="section-scroll-inset mt-8 flex items-center justify-between gap-4 md:hidden">
          <DemoLink className="shrink-0 border border-wssu-black px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-wssu-black transition-colors hover:bg-wssu-black hover:text-wssu-white">
            All news
          </DemoLink>
          <ConnectedArrowControls
            onPrev={() => scrollToIndex(current - 1)}
            onNext={() => scrollToIndex(current + 1)}
            canPrev={canPrev}
            canNext={canNext}
            prevLabel="Previous article"
            nextLabel="Next article"
          />
        </div>
      </div>
    </section>
  );
}
