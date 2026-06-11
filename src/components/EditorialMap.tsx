import type { LondonRoom } from "@/data/londonRooms";

interface Props {
  rooms: LondonRoom[];
  highlightedId?: string | null;
  onHover?: (id: string | null) => void;
  singlePin?: boolean;
}

// Bounding box for central London
const LAT_MIN = 51.485;
const LAT_MAX = 51.535;
const LNG_MIN = -0.21;
const LNG_MAX = -0.05;

const W = 600;
const H = 600;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
  const y = H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * H;
  return { x, y };
}

const NEIGHBOURHOODS: { name: string; lat: number; lng: number }[] = [
  { name: "MAYFAIR", lat: 51.5095, lng: -0.149 },
  { name: "SOHO", lat: 51.5135, lng: -0.135 },
  { name: "SHOREDITCH", lat: 51.5253, lng: -0.0789 },
  { name: "MARYLEBONE", lat: 51.5189, lng: -0.151 },
  { name: "COVENT GARDEN", lat: 51.5117, lng: -0.122 },
  { name: "KING'S CROSS", lat: 51.5308, lng: -0.123 },
  { name: "CHELSEA", lat: 51.4925, lng: -0.165 },
  { name: "BELGRAVIA", lat: 51.499, lng: -0.152 },
  { name: "SOUTHBANK", lat: 51.506, lng: -0.106 },
  { name: "NOTTING HILL", lat: 51.515, lng: -0.205 },
  { name: "BLOOMSBURY", lat: 51.521, lng: -0.126 },
  { name: "HOLBORN", lat: 51.5175, lng: -0.118 },
  { name: "WESTMINSTER", lat: 51.5, lng: -0.127 },
  { name: "CITY", lat: 51.514, lng: -0.088 },
];

export default function EditorialMap({
  rooms,
  highlightedId,
  onHover,
  singlePin = false,
}: Props) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block h-full w-full"
      style={{
        background:
          "linear-gradient(180deg, rgba(243,238,228,0.96) 0%, rgba(232,225,210,0.94) 100%)",
        borderRadius: "12px",
      }}
    >
      {/* Hyde Park */}
      <rect x="120" y="180" width="100" height="60" rx="6" fill="rgba(150,168,128,0.35)" />
      <text x="170" y="215" textAnchor="middle" fontSize="10" fill="rgba(80,90,60,0.7)" letterSpacing="2">
        HYDE PARK
      </text>

      {/* Green Park */}
      <rect x="220" y="240" width="50" height="22" rx="4" fill="rgba(150,168,128,0.3)" />

      {/* Regent's Park */}
      <rect x="210" y="80" width="80" height="50" rx="6" fill="rgba(150,168,128,0.3)" />
      <text x="250" y="110" textAnchor="middle" fontSize="9" fill="rgba(80,90,60,0.6)" letterSpacing="2">
        REGENT'S
      </text>

      {/* Thames */}
      <path
        d="M 0 360 C 80 380, 150 330, 230 360 C 310 390, 380 340, 450 380 C 510 415, 560 380, 600 410"
        stroke="rgba(110,135,160,0.45)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <text x="430" y="395" fontSize="10" fill="rgba(70,90,115,0.6)" letterSpacing="3">
        THAMES
      </text>

      {/* Streets (hairline arteries, abstract) */}
      <g stroke="rgba(60,50,40,0.18)" strokeWidth="0.7" fill="none">
        <path d="M 50 280 L 580 290" />
        <path d="M 60 220 L 560 250" />
        <path d="M 80 150 L 540 200" />
        <path d="M 250 40 L 280 580" />
        <path d="M 360 40 L 380 580" />
        <path d="M 450 60 L 470 560" />
        <path d="M 150 60 L 170 560" />
      </g>

      {/* Neighbourhood labels */}
      <g fontFamily="'Poppins', sans-serif" fontSize="8.5" fill="rgba(60,50,40,0.6)" letterSpacing="2">
        {NEIGHBOURHOODS.map((n) => {
          const { x, y } = project(n.lat, n.lng);
          return (
            <text key={n.name} x={x} y={y} textAnchor="middle">
              {n.name}
            </text>
          );
        })}
      </g>

      {/* Pins */}
      {rooms.map((r, i) => {
        const { x, y } = project(r.lat, r.lng);
        const active = !singlePin && r.id === highlightedId;
        return (
          <g
            key={r.id}
            onMouseEnter={() => onHover?.(r.id)}
            onMouseLeave={() => onHover?.(null)}
            style={{ cursor: onHover ? "pointer" : "default" }}
          >
            <circle
              cx={x}
              cy={y}
              r={active || singlePin ? 9 : 5.5}
              fill={active || singlePin ? "#e11d48" : "rgba(20,28,36,0.78)"}
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1.5"
            />
            {(active || singlePin) && (
              <text
                x={x}
                y={y - 14}
                textAnchor="middle"
                fontFamily="'Poppins',sans-serif"
                fontSize="10"
                fontWeight="500"
                fill="#1a1a1a"
              >
                #{i + 1} {r.hotelName}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
