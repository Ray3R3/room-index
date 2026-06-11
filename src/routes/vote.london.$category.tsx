import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import CinematicBackdrop from "@/components/CinematicBackdrop";
import { londonRooms, type Category } from "@/data/londonRooms";
import { CATEGORY_KEYS, categoryLabel, sortRooms } from "@/data/categories";

export const Route = createFileRoute("/vote/london/$category")({
  beforeLoad: ({ params }) => {
    if (!CATEGORY_KEYS.includes(params.category as Category)) throw notFound();
  },
  head: ({ params }) => {
    const cat = params.category as Category;
    const label = CATEGORY_KEYS.includes(cat) ? categoryLabel(cat) : "Best";
    return {
      meta: [
        { title: `Vote: Best ${label} in London — The Room Index` },
        {
          name: "description",
          content: `Vote on the best ${label.toLowerCase()} in London. We seeded the shortlist. Travellers decide what ranks.`,
        },
        { property: "og:title", content: `Vote: Best ${label} in London` },
        { property: "og:description", content: "We seeded the shortlist. Travellers decide." },
      ],
    };
  },
  component: VotePage,
});

function VotePage() {
  const { category } = Route.useParams();
  const cat = category as Category;
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [anyVote, setAnyVote] = useState(false);

  const candidates = useMemo(() => sortRooms(londonRooms, cat).slice(0, 8), [cat]);
  const label = categoryLabel(cat);

  return (
    <CinematicBackdrop>
      <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-24 text-white">
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          The Room Index · London · Vote
        </p>
        <h1
          className="mt-3"
          style={{
            fontFamily: "'Qidea','Cormorant Garamond',serif",
            fontSize: "clamp(40px, 6vw, 64px)",
            fontWeight: 400,
            lineHeight: 1.05,
          }}
        >
          Vote: Best <span style={{ color: "#e11d48" }}>{label}</span> in London
        </h1>
        <p
          className="mt-4"
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "22px",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          We seeded the shortlist. Travellers decide what ranks.
        </p>

        <ol className="mt-12 flex flex-col gap-5">
          {candidates.map((r, i) => (
            <li
              key={r.id}
              className="overflow-hidden rounded-2xl"
              style={{
                background: "rgba(8,14,22,0.55)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex flex-col sm:flex-row">
                <div
                  className="h-44 w-full shrink-0 sm:h-auto sm:w-56"
                  style={{
                    backgroundImage: `url(${r.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                  <div>
                    <p
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      Candidate #{i + 1} · {r.neighbourhood}
                    </p>
                    <h3
                      style={{
                        fontFamily: "'Qidea','Cormorant Garamond',serif",
                        fontSize: "24px",
                        marginTop: "4px",
                      }}
                    >
                      {r.hotelName}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontStyle: "italic",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {r.roomName}
                    </p>
                    <p
                      className="mt-2"
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: "17px",
                        fontStyle: "italic",
                        color: "rgba(255,255,255,0.88)",
                      }}
                    >
                      “{r.verdict}”
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      style={{
                        fontFamily: "'Qidea',serif",
                        fontSize: "28px",
                        color: "#fff",
                      }}
                    >
                      {r.scores[cat]}
                      <span
                        style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}
                      >
                        {" "}
                        / 10 · {label}
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled={voted[r.id]}
                      onClick={() => {
                        setVoted((v) => ({ ...v, [r.id]: true }));
                        setAnyVote(true);
                        toast.success("Vote recorded.", {
                          description: "Want to submit a better room?",
                        });
                      }}
                      className="rounded-full px-7 py-3 transition disabled:opacity-60"
                      style={{
                        background: voted[r.id] ? "rgba(120,180,140,0.2)" : "#e11d48",
                        color: voted[r.id] ? "#a7d4b3" : "#fff",
                        border: `1px solid ${
                          voted[r.id] ? "rgba(120,180,140,0.4)" : "transparent"
                        }`,
                        fontSize: "12px",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      {voted[r.id] ? "Voted" : "Vote"}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {anyVote && (
          <div
            className="mt-10 rounded-2xl p-6 text-center"
            style={{
              background: "rgba(225,29,72,0.08)",
              border: "1px solid rgba(225,29,72,0.35)",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: "italic",
                fontSize: "20px",
              }}
            >
              Stayed somewhere better?
            </p>
            <Link
              to="/submit"
              className="mt-4 inline-block rounded-full px-7 py-3"
              style={{
                background: "#e11d48",
                color: "#fff",
                fontSize: "12px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Submit it
            </Link>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/london"
            search={{ category: cat }}
            className="inline-block rounded-full px-6 py-2"
            style={{
              border: "1px solid rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.9)",
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            See full London Index →
          </Link>
        </div>
      </div>
    </CinematicBackdrop>
  );
}
