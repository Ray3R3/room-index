import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import CinematicBackdrop from "@/components/CinematicBackdrop";
import GoogleMapPanel from "@/components/GoogleMapPanel";
import IndexStatusBadge from "@/components/IndexStatusBadge";
import { getRoomById } from "@/data/londonRooms";
import { CATEGORIES, categoryLabel, compositeScore } from "@/data/categories";

export const Route = createFileRoute("/room/$id")({
  loader: ({ params }) => {
    const room = getRoomById(params.id);
    if (!room) throw notFound();
    return { room };
  },
  head: ({ loaderData }) => {
    const room = loaderData?.room;
    if (!room) return { meta: [{ title: "Room — The Room Index" }] };
    return {
      meta: [
        { title: `${room.hotelName} — ${room.roomName} | The Room Index` },
        { name: "description", content: room.verdict },
        { property: "og:title", content: `${room.hotelName} — ${room.roomName}` },
        { property: "og:description", content: room.verdict },
        { property: "og:image", content: room.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: room.image },
      ],
    };
  },
  notFoundComponent: () => (
    <CinematicBackdrop>
      <div className="mx-auto max-w-xl px-6 py-32 text-center text-white">
        <h1 style={{ fontFamily: "'Qidea',serif", fontSize: "44px" }}>Room not found</h1>
        <p className="mt-3 text-white/70">This room isn&rsquo;t in the index yet.</p>
        <Link
          to="/london"
          className="mt-6 inline-block rounded-full px-6 py-2"
          style={{ background: "#e11d48", color: "#fff", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          Back to London Index
        </Link>
      </div>
    </CinematicBackdrop>
  ),
  component: RoomPage,
});

function RoomPage() {
  const { room } = Route.useLoaderData() as { room: import("@/data/londonRooms").LondonRoom };
  const [voted, setVoted] = useState<string | null>(null);
  const composite = compositeScore(room);

  const vote = (kind: "worthIt" | "overrated" | "stayedHere") => {
    setVoted(kind);
    const msg =
      kind === "worthIt" ? "Marked as worth it." :
      kind === "overrated" ? "Marked as overrated." :
      "Thanks for confirming you've stayed.";
    toast.success(msg);
  };

  return (
    <CinematicBackdrop>
      <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-24 text-white">
        <Link
          to="/london"
          className="inline-flex items-center gap-1.5 text-white/70 hover:text-white"
          style={{ fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          <ChevronLeft size={14} /> Back to London Index
        </Link>

        <div
          className="mt-6 h-72 w-full overflow-hidden rounded-2xl md:h-[420px]"
          style={{
            backgroundImage: `url(${room.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />

        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {room.neighbourhood} · £{room.priceGbp}/night ({room.priceBand})
            </p>
            <h1
              className="mt-2"
              style={{
                fontFamily: "'Qidea','Cormorant Garamond',serif",
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 400,
                lineHeight: 1.05,
              }}
            >
              {room.hotelName}
            </h1>
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: "italic",
                fontSize: "22px",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              {room.roomName}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <IndexStatusBadge status={room.indexStatus} />
            <div className="flex items-baseline gap-1">
              <span style={{ fontFamily: "'Qidea',serif", fontSize: "44px", lineHeight: 1 }}>
                {composite.toFixed(1)}
              </span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>/ 10</span>
            </div>
            <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
              Composite seed score
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {room.categoryTags.map((t) => (
            <span
              key={t}
              className="rounded-full px-3 py-1"
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: "10px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.72)",
              }}
            >
              {categoryLabel(t)}
            </span>
          ))}
        </div>

        {/* Score breakdown */}
        <section className="mt-12">
          <h2
            style={{
              fontFamily: "'Qidea',serif",
              fontSize: "26px",
              marginBottom: "16px",
            }}
          >
            Score breakdown
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((c) => {
              const v = room.scores[c.key];
              return (
                <div key={c.key}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>
                      {c.label}
                    </span>
                    <span style={{ fontFamily: "'Qidea',serif", fontSize: "16px" }}>
                      {v}<span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>/10</span>
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <div
                      style={{
                        width: `${(v / 10) * 100}%`,
                        height: "100%",
                        background:
                          v >= 9 ? "#e11d48" : v >= 7 ? "rgba(226,194,144,0.9)" : "rgba(255,255,255,0.55)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why it ranks / might not */}
        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h3 style={{ fontFamily: "'Qidea',serif", fontSize: "22px", marginBottom: "10px" }}>
              Why it ranks
            </h3>
            <ul className="flex flex-col gap-2">
              {room.whyItRanks.map((b) => (
                <li
                  key={b}
                  className="flex gap-3"
                  style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: "rgba(255,255,255,0.88)" }}
                >
                  <span style={{ color: "#e11d48" }}>—</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Qidea',serif", fontSize: "22px", marginBottom: "10px" }}>
              Why it might not
            </h3>
            <ul className="flex flex-col gap-2">
              {room.whyItMight.map((b) => (
                <li
                  key={b}
                  className="flex gap-3"
                  style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", color: "rgba(255,255,255,0.78)" }}
                >
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>—</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <p
          className="mt-10 max-w-2xl"
          style={{
            fontSize: "13px",
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
            What to verify before booking:
          </strong>{" "}
          room type, view guarantee, cancellation policy, and total price.
        </p>

        {/* Map */}
        <section className="mt-12">
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "8px",
              background: "rgba(8,14,22,0.4)",
              maxWidth: "560px",
            }}
          >
            <EditorialMap rooms={[room]} singlePin />
          </div>
        </section>

        {/* Vote row */}
        <section className="mt-12">
          <h3 style={{ fontFamily: "'Qidea',serif", fontSize: "22px", marginBottom: "12px" }}>
            Your verdict
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { k: "worthIt" as const, label: "Worth it" },
              { k: "overrated" as const, label: "Overrated" },
              { k: "stayedHere" as const, label: "Stayed here" },
            ].map((b) => (
              <button
                key={b.k}
                type="button"
                onClick={() => vote(b.k)}
                className="rounded-full px-6 py-3 transition"
                style={{
                  background: voted === b.k ? "#e11d48" : "rgba(255,255,255,0.05)",
                  color: voted === b.k ? "#fff" : "rgba(255,255,255,0.9)",
                  border: `1px solid ${voted === b.k ? "transparent" : "rgba(255,255,255,0.22)"}`,
                  fontSize: "12px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/submit"
            className="rounded-full px-6 py-3"
            style={{
              border: "1px solid rgba(255,255,255,0.28)",
              color: "rgba(255,255,255,0.92)",
              fontSize: "12px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Submit a correction
          </Link>
          <Link
            to="/london"
            className="rounded-full px-6 py-3"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.7)",
              fontSize: "12px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Back to London Index
          </Link>
        </div>
      </div>
    </CinematicBackdrop>
  );
}
