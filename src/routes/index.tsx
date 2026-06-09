import { createFileRoute } from "@tanstack/react-router";
import heroOcean from "@/assets/hero-ocean.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Room Index — The End of Hotel Search" },
      {
        name: "description",
        content:
          "The Room Index helps you discover the perfect luxury stay. Ask for the room, view, or experience you actually want.",
      },
      { property: "og:title", content: "The Room Index — The End of Hotel Search" },
      {
        property: "og:description",
        content:
          "Ask for the stay you actually want. Luxury hotel discovery, reimagined.",
      },
      { property: "og:image", content: heroOcean.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroOcean.url },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Inter:wght@300;400;500&display=swap",
      },
    ],
  }),
  component: Index,
});

const SUGGESTIONS = [
  "Best view in London",
  "Best room in New York",
  "Best bath in Paris",
];

function MenuIcon() {
  return (
    <button
      aria-label="Open menu"
      className="absolute left-[36px] top-[48px] z-20 flex flex-col gap-[7px] p-1 transition-opacity hover:opacity-100"
      style={{ opacity: 0.85 }}
    >
      <span className="block h-[2px] w-[34px] bg-white" />
      <span className="block h-[2px] w-[34px] bg-white" />
      <span className="block h-[2px] w-[34px] bg-white" />
    </button>
  );
}

function Index() {
  return (
    <main
      className="relative h-screen w-screen overflow-hidden"
      style={{
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        backgroundImage: `url(${heroOcean.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Top-to-bottom darkening gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      {/* Bottom band emphasis for search area */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[45%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      <MenuIcon />

      {/* Hero copy */}
      <div
        className="absolute left-1/2 z-20 w-full -translate-x-1/2 px-6 text-center"
        style={{ top: "20%" }}
      >
        <p
          className="text-white"
          style={{
            fontWeight: 300,
            fontSize: "clamp(20px, 2.4vw, 32px)",
            letterSpacing: "0.02em",
          }}
        >
          Welcome to
        </p>
        <h1
          className="mt-4"
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
            fontWeight: 400,
            color: "#ff0000",
            fontSize: "clamp(56px, 9vw, 112px)",
            lineHeight: 1.05,
            letterSpacing: "0.005em",
          }}
        >
          The Room Index
        </h1>
        <p
          className="mt-8 text-white"
          style={{
            fontWeight: 300,
            fontSize: "clamp(15px, 1.6vw, 24px)",
            letterSpacing: "0.08em",
          }}
        >
          THE END OF HOTEL SEARCH
        </p>
      </div>

      {/* Search area */}
      <div
        className="absolute left-1/2 z-20 w-[90%] max-w-[1120px] -translate-x-1/2 md:w-[70%]"
        style={{ top: "63%" }}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Ask for the stay you actually want..."
            className="w-full text-white outline-none transition-all focus:border-white"
            style={{
              height: "clamp(72px, 9vh, 96px)",
              borderRadius: "999px",
              border: "1.2px solid rgba(255,255,255,0.9)",
              background: "rgba(10, 18, 24, 0.45)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              paddingLeft: "clamp(28px, 4vw, 64px)",
              paddingRight: "clamp(28px, 4vw, 64px)",
              fontSize: "clamp(16px, 1.8vw, 28px)",
              fontWeight: 300,
            }}
          />
          <style>{`
            input::placeholder {
              color: rgba(255,255,255,0.82);
              font-weight: 300;
            }
          `}</style>
        </div>

        {/* Suggestion chips */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="flex items-center justify-center text-white transition-colors"
              style={{
                flex: 1,
                height: "60px",
                borderRadius: "999px",
                background: "rgba(120, 135, 140, 0.55)",
                fontSize: "clamp(15px, 1.3vw, 20px)",
                fontWeight: 300,
                color: "rgba(255,255,255,0.92)",
                border: "none",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(150, 165, 170, 0.65)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(120, 135, 140, 0.55)";
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
