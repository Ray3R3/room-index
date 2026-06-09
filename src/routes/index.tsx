import { createFileRoute } from "@tanstack/react-router";
import heroOcean from "@/assets/hero-ocean.png.asset.json";
import Countdown from "@/components/Countdown";

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
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Poppins:wght@200;300;400;500&display=swap",
      },

    ],
  }),
  component: Index,
});


function MenuIcon() {
  return (
    <button
      aria-label="Open menu"
      className="fixed z-30 flex flex-col p-1 transition-opacity hover:opacity-100"
      style={{ top: "44px", left: "36px", gap: "7px", opacity: 0.85 }}
    >
      <span className="block h-[2px] w-[34px]" style={{ backgroundColor: "#e11d48" }} />
      <span className="block h-[2px] w-[34px]" style={{ backgroundColor: "#e11d48" }} />
      <span className="block h-[2px] w-[34px]" style={{ backgroundColor: "#e11d48" }} />
    </button>
  );
}


function Index() {
  return (
    <main
      className="relative h-screen w-screen overflow-hidden"
      style={{
        fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
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
        style={{ top: "22.5%" }}
      >
        <h1
          style={{
            fontFamily: "'Qidea', 'Cormorant Garamond', 'Playfair Display', serif",
            fontWeight: 400,
            fontSize: "clamp(56px, 9vw, 112px)",
            lineHeight: 1.05,
            letterSpacing: "0.005em",
            marginTop: "10px",
            color: "#ffffff",
          }}
        >
          The Room <span style={{ color: "#e11d48" }}>Index</span>
        </h1>
        <p
          className="text-white"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(15px, 1.6vw, 24px)",
            letterSpacing: "0.08em",
            marginTop: "14px",
            textTransform: "uppercase",
          }}
        >
          THE END OF HOTEL SEARCH
        </p>
      </div>

      {/* Countdown area */}
      <div
        className="absolute left-1/2 z-20 w-full -translate-x-1/2 px-6"
        style={{ top: "64%", maxWidth: "900px" }}
      >
        <Countdown />
      </div>
    </main>
  );
}

