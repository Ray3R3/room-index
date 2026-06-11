import { useEffect, useMemo, useState } from "react";

const LAUNCH_DATE = new Date("2026-06-18T00:00:00Z");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const now = Date.now();
  const diff = target.getTime() - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft(LAUNCH_DATE));
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(LAUNCH_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLive = useMemo(
    () =>
      timeLeft !== null &&
      timeLeft.days === 0 &&
      timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0,
    [timeLeft]
  );

  const units: { value: number | null; label: string }[] = [
    { value: timeLeft?.days ?? null, label: "Days" },
    { value: timeLeft?.hours ?? null, label: "Hours" },
    { value: timeLeft?.minutes ?? null, label: "Minutes" },
    { value: timeLeft?.seconds ?? null, label: "Seconds" },
  ];

  return (
    <div
      className="flex flex-col items-center"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <p
        className="text-white"
        style={{
          fontSize: "clamp(12px, 1.1vw, 16px)",
          fontWeight: 300,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          opacity: 0.75,
          marginBottom: "32px",
        }}
      >
        Launching Soon
      </p>

      {isLive ? (
        <p
          className="text-white"
          style={{
            fontSize: "clamp(36px, 4vw, 56px)",
            fontWeight: 300,
            letterSpacing: "0.04em",
          }}
        >
          Now Live
        </p>
      ) : (
        <div
          className="flex items-start justify-center"
          style={{ gap: "clamp(24px, 3vw, 48px)" }}
        >
          {units.map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div
                className="flex items-center justify-center text-white"
                style={{
                  minWidth: "clamp(72px, 9vw, 120px)",
                  padding: "clamp(16px, 2vh, 28px) clamp(8px, 1vw, 16px)",
                  borderRadius: "16px",
                  background: "rgba(5, 12, 18, 0.35)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(40px, 5vw, 72px)",
                    fontWeight: 300,
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                    fontVariantNumeric: "tabular-nums",
                    color: unit.label === "Days" ? "#e11d48" : undefined,
                  }}
                >
                  {unit.value === null ? "--" : pad(unit.value)}
                </span>
              </div>
              <span
                className="text-white"
                style={{
                  fontSize: "clamp(10px, 0.9vw, 13px)",
                  fontWeight: 400,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  opacity: 0.65,
                  marginTop: "14px",
                }}
              >
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <p
        className="text-white"
        style={{
          fontSize: "clamp(13px, 1.2vw, 18px)",
          fontWeight: 300,
          letterSpacing: "0.06em",
          opacity: 0.6,
          marginTop: "clamp(32px, 4vh, 48px)",
        }}
      >
        {"\n"}
      </p>
    </div>
  );
}
