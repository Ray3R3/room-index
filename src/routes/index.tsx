import { createFileRoute } from "@tanstack/react-router";
import heroOcean from "@/assets/hero-ocean.png.asset.json";
import Countdown from "@/components/Countdown";
import CinematicBackdrop from "@/components/CinematicBackdrop";

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
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Poppins:wght@200;300;400;500&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
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

        <div className="mt-16 w-full" style={{ maxWidth: "900px" }}>
          <Countdown />
        </div>
      </main>
    </CinematicBackdrop>
  );
}

