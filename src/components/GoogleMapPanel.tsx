/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { LondonRoom } from "@/data/londonRooms";
import { compositeScore } from "@/data/categories";

interface Props {
  rooms: LondonRoom[];
  highlightedId?: string | null;
  onHover?: (id: string | null) => void;
  singlePin?: boolean;
  showRankBadges?: boolean;
  variant?: "card" | "pane";
  panToHighlighted?: boolean;
}

declare global {
  interface Window {
    google?: typeof google;
    __roomIndexInitMap?: () => void;
    __roomIndexMapsPromise?: Promise<typeof google>;
  }
}

const LONDON_CENTER = { lat: 51.5074, lng: -0.1278 };

const ROOM_INDEX_DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#141b22" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7d827a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0f14" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#9a9a8e" }] },
  { featureType: "administrative.neighborhood", elementType: "labels.text.fill", stylers: [{ color: "#6a6e66" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a2520" }, { visibility: "on" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1c242c" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#222b34" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2a3640" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1722" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3e556a" }] },
];

function loadMaps(): Promise<typeof google> | null {
  if (typeof window === "undefined") return null;
  if (window.google?.maps) return Promise.resolve(window.google);
  if (window.__roomIndexMapsPromise) return window.__roomIndexMapsPromise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`Google Maps browser key present: ${Boolean(key)}`);
  }
  if (!key) return null;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

  window.__roomIndexMapsPromise = new Promise((resolve, reject) => {
    window.__roomIndexInitMap = () => resolve(window.google!);
    const s = document.createElement("script");
    const params = new URLSearchParams({ key, loading: "async", callback: "__roomIndexInitMap" });
    if (channel && channel.trim()) params.set("channel", channel);
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("script-load-failed"));
    document.head.appendChild(s);
  });
  return window.__roomIndexMapsPromise;
}

function pinIcon(g: typeof google, active: boolean, rank?: number): google.maps.Icon | google.maps.Symbol {
  if (active) {
    return {
      path: g.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: "#e11d48",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 1.5,
    };
  }
  return {
    path: g.maps.SymbolPath.CIRCLE,
    scale: rank && rank <= 10 ? 6 : 4.5,
    fillColor: "#f1ebdc",
    fillOpacity: 0.92,
    strokeColor: "#0a0f14",
    strokeWeight: 1,
  };
}

export default function GoogleMapPanel({
  rooms,
  highlightedId = null,
  onHover,
  singlePin = false,
  showRankBadges = true,
  variant = "card",
  panToHighlighted = false,
}: Props) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const prevRoomsRef = useRef<LondonRoom[] | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRoom = rooms.find((r) => r.id === highlightedId) ?? (singlePin ? rooms[0] : null);
  const isPane = variant === "pane";

  // Initial load
  useEffect(() => {
    const hasKey = Boolean(import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY);
    if (!hasKey) {
      setError("Map unavailable — Google Maps browser key missing.");
      return;
    }
    const p = loadMaps();
    if (!p) {
      setError("Map unavailable — Google Maps browser key missing.");
      return;
    }
    let cancelled = false;
    p.then((g) => {
      if (cancelled || !divRef.current) return;
      try {
        mapRef.current = new g.maps.Map(divRef.current, {
          center: LONDON_CENTER,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          clickableIcons: false,
          backgroundColor: "#0a0f14",
          styles: ROOM_INDEX_DARK_STYLE,
          gestureHandling: "cooperative",
        });
        setReady(true);
      } catch {
        setError("Map unavailable — Google Maps failed to load.");
      }
    }).catch(() => setError("Map unavailable — Google Maps failed to load."));
    return () => {
      cancelled = true;
    };
  }, []);

  // Build/refresh markers + fit bounds only when the rooms set actually changes
  useEffect(() => {
    if (!ready || !mapRef.current || !window.google) return;
    const g = window.google;
    const map = mapRef.current;
    const roomsChanged = prevRoomsRef.current !== rooms;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    rooms.forEach((r, i) => {
      const rank = i + 1;
      const m = new g.maps.Marker({
        position: { lat: r.lat, lng: r.lng },
        map,
        icon: pinIcon(g, r.id === highlightedId || singlePin, rank),
        zIndex: r.id === highlightedId ? 999 : rank,
        label:
          showRankBadges && rank <= 10 && r.id !== highlightedId && !singlePin
            ? { text: String(rank), color: "#0a0f14", fontSize: "9px", fontWeight: "600" }
            : undefined,
      });
      m.addListener("mouseover", () => onHover?.(r.id));
      m.addListener("mouseout", () => onHover?.(null));
      m.addListener("click", () => onHover?.(r.id));
      markersRef.current.set(r.id, m);
    });

    if (roomsChanged) {
      if (singlePin && rooms[0]) {
        map.setCenter({ lat: rooms[0].lat, lng: rooms[0].lng });
        map.setZoom(15);
      } else if (rooms.length > 0) {
        const bounds = new g.maps.LatLngBounds();
        rooms.forEach((r) => bounds.extend({ lat: r.lat, lng: r.lng }));
        map.fitBounds(bounds, 56);
        if (rooms.length === 1) map.setZoom(15);
      }
      prevRoomsRef.current = rooms;
    }
  }, [ready, rooms, singlePin, showRankBadges]);

  // Update active pin styling without rebuilding
  useEffect(() => {
    if (!ready || !window.google) return;
    const g = window.google;
    markersRef.current.forEach((m, id) => {
      const rank = rooms.findIndex((r) => r.id === id) + 1;
      const active = id === highlightedId || singlePin;
      m.setIcon(pinIcon(g, active, rank));
      m.setZIndex(active ? 999 : rank);
    });
  }, [highlightedId, ready, rooms, singlePin]);

  // Gently pan to highlighted room (opt-in via panToHighlighted)
  useEffect(() => {
    if (!ready || !panToHighlighted || !mapRef.current || !highlightedId) return;
    const room = rooms.find((r) => r.id === highlightedId);
    if (!room) return;
    mapRef.current.panTo({ lat: room.lat, lng: room.lng });
  }, [highlightedId, ready, panToHighlighted, rooms]);

  const wrapperStyle: React.CSSProperties = isPane
    ? {
        borderLeft: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(8,14,22,0.6)",
      }
    : {
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(8,14,22,0.6)",
      };

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${isPane ? "" : "rounded-2xl"}`}
      style={wrapperStyle}
    >
      <div ref={divRef} className="absolute inset-0" />

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <p
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            {error}
          </p>
          <p
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontSize: "10px",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "320px",
              lineHeight: 1.5,
            }}
          >
            Check Google Maps connector, Maps JavaScript API, billing, and referrer restrictions.
          </p>
        </div>
      )}

      {/* Top-left label */}
      <div
        className="pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1"
        style={{
          background: "rgba(8,14,22,0.72)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          fontFamily: "'Poppins',sans-serif",
          fontSize: "10px",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.75)",
        }}
      >
        London / Index Map
      </div>

      {/* Bottom-right footer */}
      <div
        className="pointer-events-none absolute bottom-3 right-3 rounded-full px-3 py-1"
        style={{
          background: isPane ? "rgba(8,14,22,0.5)" : "rgba(8,14,22,0.72)",
          border: `1px solid rgba(255,255,255,${isPane ? 0.06 : 0.1})`,
          fontFamily: "'Poppins',sans-serif",
          fontSize: isPane ? "9px" : "9.5px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: `rgba(255,255,255,${isPane ? 0.4 : 0.55})`,
        }}
      >
        Map · Central London
      </div>

      {/* Active tooltip card */}
      {ready && !error && activeRoom && (
        <div
          className="absolute left-1/2 top-3 z-10 w-[260px] -translate-x-1/2 rounded-xl p-4 text-white"
          style={{
            marginTop: "36px",
            background: "rgba(8,14,22,0.92)",
            border: "1px solid rgba(225,29,72,0.45)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
          }}
        >
          <p
            style={{
              fontSize: "9.5px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {activeRoom.neighbourhood}
          </p>
          <p
            className="mt-1"
            style={{
              fontFamily: "'Qidea','Cormorant Garamond',serif",
              fontSize: "18px",
              lineHeight: 1.15,
            }}
          >
            {activeRoom.hotelName}
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: "italic",
              fontSize: "13px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {activeRoom.roomName}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span style={{ fontFamily: "'Qidea',serif", fontSize: "20px" }}>
              {compositeScore(activeRoom).toFixed(1)}
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}> / 10</span>
            </span>
            <Link
              to="/room/$id"
              params={{ id: activeRoom.id }}
              className="rounded-full px-3 py-1 transition hover:bg-white/10"
              style={{
                border: "1px solid rgba(255,255,255,0.28)",
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#fff",
              }}
            >
              View room
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
