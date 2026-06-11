import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { toast } from "sonner";
import CinematicBackdrop from "@/components/CinematicBackdrop";
import GoogleMapPanel from "@/components/GoogleMapPanel";
import IndexStatusBadge from "@/components/IndexStatusBadge";
import { londonRooms, type Category } from "@/data/londonRooms";
import {
  CATEGORIES,
  CATEGORY_KEYS,
  categoryLabel,
  compositeScore,
  sortRooms,
} from "@/data/categories";

const searchSchema = z.object({
  category: fallback(z.enum(CATEGORY_KEYS as [Category, ...Category[]]), undefined as unknown as Category).optional(),
  q: fallback(z.string(), "").optional(),
});

export const Route = createFileRoute("/london")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "London Room Index — The Room Index" },
      {
        name: "description",
        content:
          "Ranked London hotel rooms by View, Value, Sleep, Space, Bathroom, Food & Drink, and Location. Seeded by us. Corrected by travellers.",
      },
      { property: "og:title", content: "London Room Index" },
      { property: "og:description", content: "Seeded by us. Corrected by travellers." },
    ],
  }),
  component: LondonPage,
});

function LondonPage() {
  const { category, q } = Route.useSearch();
  const [active, setActive] = useState<Category | "all">(category ?? "all");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [scrollActiveId, setScrollActiveId] = useState<string | null>(null);
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [mapOpen, setMapOpen] = useState(false);

  const lowerQ = (q ?? "").toLowerCase();
  const mentionsOtherCity = useMemo(() => {
    const others = ["paris", "new york", "nyc", "tokyo", "rome", "madrid", "berlin", "lisbon", "barcelona"];
    return others.some((c) => lowerQ.includes(c));
  }, [lowerQ]);

  const rooms = useMemo(() => sortRooms(londonRooms, active), [active]);

  const activeId = hoverId ?? scrollActiveId ?? rooms[0]?.id ?? null;

  // Scroll-sync: observe room cards on desktop and pick the one nearest viewport centre
  const cardRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const setCardRef = (id: string) => (el: HTMLLIElement | null) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const visible = new Set<string>();

    const pick = () => {
      const centre = window.innerHeight / 2;
      let bestId: string | null = null;
      let bestDist = Infinity;
      visible.forEach((id) => {
        const el = cardRefs.current.get(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const c = rect.top + rect.height / 2;
        const d = Math.abs(c - centre);
        if (d < bestDist) {
          bestDist = d;
          bestId = id;
        }
      });
      if (bestId) {
        setScrollActiveId((prev) => (prev === bestId ? prev : bestId));
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = (e.target as HTMLElement).dataset.roomId;
          if (!id) return;
          if (e.isIntersecting) visible.add(id);
          else visible.delete(id);
        });
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(pick);
        }, 80);
      },
      { root: null, rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );

    cardRefs.current.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [rooms]);

  return (
    <CinematicBackdrop>
      <div className="mx-auto w-full max-w-7xl px-6 pb-24 pt-24">
        <header className="mb-10 text-white">
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            The Room Index · London
          </p>
          <h1
            className="mt-3"
            style={{
              fontFamily: "'Qidea','Cormorant Garamond',serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 400,
              lineHeight: 1.05,
            }}
          >
            London Room <span style={{ color: "#e11d48" }}>Index</span>
          </h1>
          <p
            className="mt-3"
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "22px",
              fontStyle: "italic",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Seeded by us. Corrected by travellers.
          </p>
          <p
            className="mt-2 max-w-2xl"
            style={{
              fontSize: "13px",
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Ranked by View, Value, Sleep, Space, Bathroom, Food &amp; Drink, and Location.
          </p>
        </header>

        {/* Filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Pill active={active === "all"} onClick={() => setActive("all")}>
            All
          </Pill>
          {CATEGORIES.map((c) => (
            <Pill
              key={c.key}
              active={active === c.key}
              onClick={() => setActive(c.key)}
            >
              {c.label}
            </Pill>
          ))}
        </div>

        {q && (
          <p
            className="mb-2"
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "18px",
              fontStyle: "italic",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            Showing results for &ldquo;{q}&rdquo;
          </p>
        )}
        {mentionsOtherCity && (
          <p
            className="mb-6 inline-block rounded-full px-3 py-1"
            style={{
              background: "rgba(225,29,72,0.12)",
              border: "1px solid rgba(225,29,72,0.4)",
              color: "#fda4af",
              fontSize: "11px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Only London is live in this MVP
          </p>
        )}

        {/* Mobile map toggle */}
        <div className="mb-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMapOpen((o) => !o)}
            className="rounded-full px-4 py-1.5"
            style={{
              background: mapOpen ? "#fff" : "rgba(255,255,255,0.05)",
              color: mapOpen ? "#0a0f14" : "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.22)",
              fontFamily: "'Poppins',sans-serif",
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {mapOpen ? "Hide map" : "Show map"}
          </button>
          {mapOpen && (
            <div className="mt-4 h-[60vh]">
              <GoogleMapPanel
                rooms={rooms}
                highlightedId={hoverId}
                onHover={setHoverId}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(440px,44%)]">
          {/* Left: ranked list */}
          <ol className="flex flex-col gap-5">
            {rooms.map((r, i) => (
              <li key={r.id}>
                <RoomCard
                  rank={i + 1}
                  room={r}
                  activeCategory={active}
                  highlighted={hoverId === r.id}
                  onHover={setHoverId}
                  voted={!!voted[r.id]}
                  onVote={() => {
                    if (voted[r.id]) return;
                    setVoted((v) => ({ ...v, [r.id]: true }));
                    toast.success("Vote recorded for this session.");
                  }}
                />
              </li>
            ))}
          </ol>

          {/* Right: sticky map */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 h-[calc(100vh-7rem)]">
              <GoogleMapPanel
                rooms={rooms}
                highlightedId={hoverId}
                onHover={setHoverId}
              />
            </div>
          </aside>
        </div>

      </div>
    </CinematicBackdrop>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-1.5 transition"
      style={{
        background: active ? "#fff" : "rgba(255,255,255,0.04)",
        color: active ? "#0a0f14" : "rgba(255,255,255,0.82)",
        border: `1px solid ${active ? "#fff" : "rgba(255,255,255,0.2)"}`,
        fontFamily: "'Poppins',sans-serif",
        fontSize: "12px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontWeight: 400,
      }}
    >
      {children}
    </button>
  );
}

function RoomCard({
  rank,
  room,
  activeCategory,
  highlighted,
  onHover,
  voted,
  onVote,
}: {
  rank: number;
  room: (typeof londonRooms)[number];
  activeCategory: Category | "all";
  highlighted: boolean;
  onHover: (id: string | null) => void;
  voted: boolean;
  onVote: () => void;
}) {
  const composite = compositeScore(room);
  const activeScore =
    activeCategory !== "all" ? room.scores[activeCategory] : null;

  return (
    <article
      onMouseEnter={() => onHover(room.id)}
      onMouseLeave={() => onHover(null)}
      className="overflow-hidden rounded-2xl transition"
      style={{
        background: highlighted ? "rgba(255,255,255,0.07)" : "rgba(8,14,22,0.5)",
        border: `1px solid ${highlighted ? "rgba(225,29,72,0.5)" : "rgba(255,255,255,0.1)"}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="flex flex-col md:flex-row">
        <div
          className="relative h-56 w-full shrink-0 md:h-auto md:w-72"
          style={{
            backgroundImage: `url(${room.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <span
            className="absolute left-3 top-3 flex h-9 min-w-[44px] items-center justify-center rounded-full px-2"
            style={{
              background: "rgba(8,14,22,0.85)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: "'Qidea',serif",
              fontSize: "16px",
            }}
          >
            #{rank}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {room.neighbourhood}
              </p>
              <h3
                style={{
                  fontFamily: "'Qidea','Cormorant Garamond',serif",
                  fontSize: "26px",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  marginTop: "4px",
                }}
              >
                {room.hotelName}
              </h3>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontSize: "16px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {room.roomName}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <IndexStatusBadge status={room.indexStatus} />
              <div className="flex items-baseline gap-1">
                <span
                  style={{
                    fontFamily: "'Qidea',serif",
                    fontSize: "34px",
                    lineHeight: 1,
                    color: "#fff",
                  }}
                >
                  {composite.toFixed(1)}
                </span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                  / 10
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Seed score
              </span>
            </div>
          </div>

          <p
            className="mt-4 max-w-xl"
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "18px",
              fontStyle: "italic",
              color: "rgba(255,255,255,0.88)",
              lineHeight: 1.45,
            }}
          >
            “{room.verdict}”
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.8)",
                fontWeight: 500,
              }}
            >
              {room.priceBand} · £{room.priceGbp}/night
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            {room.categoryTags.map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {categoryLabel(t)}
              </span>
            ))}
            {activeScore !== null && (
              <span
                className="ml-auto rounded-full px-3 py-1"
                style={{
                  background: "rgba(225,29,72,0.16)",
                  border: "1px solid rgba(225,29,72,0.5)",
                  color: "#fda4af",
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {categoryLabel(activeCategory as Category)} {activeScore}/10
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onVote}
              disabled={voted}
              className="rounded-full px-4 py-1.5 transition disabled:opacity-60"
              style={{
                background: voted ? "rgba(120,180,140,0.18)" : "#e11d48",
                color: voted ? "#a7d4b3" : "#fff",
                border: `1px solid ${voted ? "rgba(120,180,140,0.4)" : "transparent"}`,
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {voted ? "Voted" : "Vote"}
            </button>
            <Link
              to="/room/$id"
              params={{ id: room.id }}
              className="rounded-full px-4 py-1.5 transition hover:bg-white/10"
              style={{
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              View room
            </Link>
            <Link
              to="/submit"
              className="rounded-full px-4 py-1.5 transition hover:bg-white/10"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Submit correction
            </Link>
            <button
              type="button"
              onClick={() =>
                toast("Booking links coming soon.", { description: "We're not an OTA." })
              }
              className="rounded-full px-4 py-1.5 transition hover:bg-white/10"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Check hotel
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
