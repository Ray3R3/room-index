import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const LINKS: { to: string; label: string }[] = [
  { to: "/", label: "Landing" },
  { to: "/home", label: "Home" },
  { to: "/london", label: "London Index" },
  { to: "/vote/london/view", label: "Vote: Best View" },
  { to: "/submit", label: "Submit a Room" },
];

export default function SiteMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="fixed left-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border transition hover:bg-white/10"
        style={{
          background: "rgba(5,12,18,0.45)",
          borderColor: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#fff",
        }}
      >
        <Menu size={18} strokeWidth={1.5} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex"
          onClick={() => setOpen(false)}
          style={{ background: "rgba(2,6,10,0.65)", backdropFilter: "blur(6px)" }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-sm flex-col p-8"
            style={{
              background: "rgba(8,14,22,0.92)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontFamily: "'Qidea','Cormorant Garamond',serif",
                  fontSize: "24px",
                }}
              >
                The Room <span style={{ color: "#e11d48" }}>Index</span>
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="mt-12 flex flex-col gap-1">
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-white/85 transition hover:bg-white/5 hover:text-white"
                  style={{
                    fontFamily: "'Poppins',sans-serif",
                    fontWeight: 300,
                    fontSize: "18px",
                    letterSpacing: "0.04em",
                  }}
                  activeProps={{
                    className:
                      "block rounded-md px-3 py-3 bg-white/5 text-white",
                  }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <p
              className="mt-auto text-white/40"
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              London. Seeded by us. Corrected by travellers.
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
