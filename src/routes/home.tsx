import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import CinematicBackdrop from "@/components/CinematicBackdrop";
import { parseSearchToParams } from "@/data/categories";
import { Search, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "The Room Index — Ask for the stay you actually want" },
      {
        name: "description",
        content:
          "Search the best hotel rooms by View, Value, Sleep, Space, Bathroom, Food & Drink, and Location. London is the first live index.",
      },
      { property: "og:title", content: "The Room Index — Ask for the stay you actually want" },
      {
        property: "og:description",
        content:
          "A searchable, voteable index of hotel rooms. Not booking. Not browsing. The end of hotel search.",
      },
    ],
  }),
  component: HomePage,
});

const CHIPS: { label: string; query: string }[] = [
  { label: "Best view in London", query: "best view in London" },
  { label: "Best bath in London", query: "best bath in London" },
  { label: "Best value in Shoreditch", query: "best value in Shoreditch" },
  { label: "Best sleep in Mayfair", query: "best sleep in Mayfair" },
];

function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const go = (raw: string) => {
    const { category, q: parsedQ } = parseSearchToParams(raw);
    navigate({
      to: "/london",
      search: { ...(category ? { category } : {}), ...(parsedQ ? { q: parsedQ } : {}) },
    });
  };

  return (
    <CinematicBackdrop>
      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1
          style={{
            fontFamily: "'Qidea','Cormorant Garamond',serif",
            fontWeight: 400,
            fontSize: "clamp(48px, 8vw, 96px)",
            lineHeight: 1.05,
            letterSpacing: "0.005em",
            color: "#fff",
          }}
        >
          The Room <span style={{ color: "#e11d48" }}>Index</span>
        </h1>
        <p
          style={{
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 300,
            fontSize: "clamp(13px, 1.4vw, 18px)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginTop: "18px",
            color: "rgba(255,255,255,0.78)",
          }}
        >
          The end of hotel search
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) go(q);
          }}
          className="mt-14 flex w-full max-w-2xl items-center gap-3 rounded-full px-5 py-3"
          style={{
            background: "rgba(8,14,22,0.55)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <Search size={18} strokeWidth={1.5} className="text-white/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask for the stay you actually want…"
            className="flex-1 bg-transparent text-white placeholder-white/45 outline-none"
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 300,
              fontSize: "16px",
              letterSpacing: "0.01em",
            }}
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/15"
            style={{ background: "rgba(225,29,72,0.85)", color: "#fff" }}
          >
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {CHIPS.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => go(c.query)}
              className="rounded-full px-4 py-2 transition hover:bg-white/10"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.85)",
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 300,
                fontSize: "13px",
                letterSpacing: "0.04em",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/london"
            className="inline-flex items-center justify-center rounded-full px-7 py-3 transition hover:opacity-90"
            style={{
              background: "#e11d48",
              color: "#fff",
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Explore the London Index
          </Link>
          <Link
            to="/submit"
            className="inline-flex items-center justify-center rounded-full px-7 py-3 transition hover:bg-white/10"
            style={{
              border: "1px solid rgba(255,255,255,0.32)",
              color: "rgba(255,255,255,0.92)",
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 300,
              fontSize: "13px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Submit a Room
          </Link>
        </div>

        <p
          className="mt-20 max-w-md"
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: "12px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          London live · More cities coming
        </p>
      </main>
    </CinematicBackdrop>
  );
}
