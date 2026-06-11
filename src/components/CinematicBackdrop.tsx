import type { ReactNode } from "react";
import heroOcean from "@/assets/hero-ocean.png.asset.json";

interface Props {
  children: ReactNode;
  /** Use "page" for content pages that scroll; "screen" for fixed full-screen pages. */
  variant?: "page" | "screen";
}

export default function CinematicBackdrop({ children, variant = "page" }: Props) {
  return (
    <div
      className={
        variant === "screen"
          ? "relative h-screen w-screen overflow-hidden"
          : "relative min-h-screen w-full"
      }
      style={{
        fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
        color: "#fff",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          backgroundImage: `url(${heroOcean.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,14,22,0.55) 0%, rgba(8,14,22,0.78) 45%, rgba(5,9,14,0.92) 100%)",
        }}
      />
      {children}
    </div>
  );
}
