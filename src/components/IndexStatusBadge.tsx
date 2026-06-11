import type { IndexStatus } from "@/data/londonRooms";

const STYLES: Record<IndexStatus, { bg: string; fg: string; border: string }> = {
  Seeded: { bg: "rgba(255,255,255,0.06)", fg: "rgba(255,255,255,0.85)", border: "rgba(255,255,255,0.18)" },
  "Vote open": { bg: "rgba(225,29,72,0.12)", fg: "#fda4af", border: "rgba(225,29,72,0.5)" },
  "Traveller nominated": { bg: "rgba(202,164,103,0.12)", fg: "#e2c290", border: "rgba(202,164,103,0.45)" },
  "Traveller verified": { bg: "rgba(120,180,140,0.12)", fg: "#a7d4b3", border: "rgba(120,180,140,0.45)" },
};

export default function IndexStatusBadge({ status }: { status: IndexStatus }) {
  const s = STYLES[status];
  return (
    <span
      className="inline-flex items-center"
      style={{
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        borderRadius: "999px",
        padding: "3px 10px",
        fontSize: "10px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        fontWeight: 400,
      }}
    >
      {status}
    </span>
  );
}
