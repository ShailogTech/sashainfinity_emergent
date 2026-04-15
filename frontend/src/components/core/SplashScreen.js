import { useEffect, useRef, useState, useCallback } from "react";

export default function SplashScreen({ onComplete }) {
  const [counter, setCounter] = useState(0);
  const charsRef = useRef([]);
  const subtitleRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const dotsRef = useRef([]);
  const containerRef = useRef(null);

  const word1 = "SASHA";
  const word2 = "INFINITY";

  useEffect(() => {
    let val = 0;
    const interval = setInterval(() => {
      val += Math.random() * 15 + 5;
      if (val >= 100) {
        val = 100;
        clearInterval(interval);
      }
      setCounter(Math.min(100, Math.round(val)));
    }, 40);

    // Stagger chars
    const charTimeout = setTimeout(() => {
      charsRef.current.forEach((c, i) => {
        if (c) {
          setTimeout(() => {
            c.style.transition = "transform 0.9s cubic-bezier(.26,.16,.1,1)";
            c.style.transform = "translateY(0)";
          }, i * 50);
        }
      });
    }, 300);

    // Subtitle
    const subTimeout = setTimeout(() => {
      if (subtitleRef.current) {
        subtitleRef.current.style.transition = "opacity 0.8s ease, transform 0.8s cubic-bezier(.26,.16,.1,1)";
        subtitleRef.current.style.opacity = "1";
        subtitleRef.current.style.transform = "scaleX(1)";
      }
    }, 900);

    // Lines
    const lineTimeout = setTimeout(() => {
      if (line1Ref.current) {
        line1Ref.current.style.transition = "transform 0.8s cubic-bezier(.26,.16,.1,1), opacity 0.4s";
        line1Ref.current.style.transform = "scaleX(1)";
        line1Ref.current.style.opacity = "1";
      }
      if (line2Ref.current) {
        line2Ref.current.style.transition = "transform 0.8s cubic-bezier(.26,.16,.1,1), opacity 0.4s";
        line2Ref.current.style.transform = "scaleX(1)";
        line2Ref.current.style.opacity = "1";
      }
    }, 700);

    // Dots
    dotsRef.current.forEach((dot, i) => {
      if (dot) {
        setTimeout(() => {
          dot.style.transition = "transform 0.6s cubic-bezier(.26,.16,.1,1)";
          dot.style.transform = "scale(1)";
        }, 500 + i * 80);
      }
    });

    // Complete after animation
    const completeTimeout = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.transition = "opacity 0.6s ease";
        containerRef.current.style.opacity = "0";
      }
      setTimeout(() => onComplete(), 700);
    }, 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(charTimeout);
      clearTimeout(subTimeout);
      clearTimeout(lineTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  const counterStr = String(counter).padStart(3, "0");
  let charIndex = 0;

  return (
    <div ref={containerRef} data-testid="splash-screen" style={{
      position: "fixed", inset: 0, background: "#fff", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", flexDirection: "column"
    }}>
      {/* Decorative dots */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        {[
          { w: 18, bg: "#55b1ff", top: "15%", left: "20%" },
          { w: 14, bg: "#ffabb7", top: "25%", right: "15%" },
          { w: 22, bg: "#ffd955", bottom: "20%", left: "12%" },
          { w: 12, bg: "#7ec1f9", bottom: "30%", right: "22%" },
          { w: 16, bg: "#f4911a", top: "45%", left: "5%" },
          { w: 10, bg: "#55b1ff", top: "12%", right: "30%" },
          { w: 20, bg: "#ffabb7", bottom: "15%", right: "10%" },
          { w: 15, bg: "#ffd955", top: "60%", right: "6%" },
          { w: 13, bg: "#7ec1f9", bottom: "10%", left: "35%" },
        ].map((d, i) => (
          <div key={i} ref={el => dotsRef.current[i] = el} style={{
            position: "absolute", borderRadius: "50%", transform: "scale(0)",
            width: d.w, height: d.w, background: d.bg,
            top: d.top, bottom: d.bottom, left: d.left, right: d.right
          }} />
        ))}
      </div>

      {/* Decorative lines */}
      <div ref={line1Ref} style={{
        position: "absolute", zIndex: 3, borderRadius: 8, opacity: 0,
        width: 200, height: 4,
        background: "linear-gradient(90deg, #f4911a, #ffd955)",
        top: "38%", left: "8%", transformOrigin: "left center", transform: "scaleX(0)"
      }} />
      <div ref={line2Ref} style={{
        position: "absolute", zIndex: 3, borderRadius: 8, opacity: 0,
        width: 200, height: 4,
        background: "linear-gradient(90deg, #ffabb7, #55b1ff)",
        bottom: "38%", right: "8%", transformOrigin: "right center", transform: "scaleX(0)"
      }} />

      {/* Brand name */}
      <div style={{ position: "relative", zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", overflow: "hidden", lineHeight: 1.05 }}>
          {word1.split("").map((ch, i) => {
            const idx = charIndex++;
            return (
              <span key={idx} ref={el => charsRef.current[idx] = el} style={{
                fontFamily: "'Lexend Deca', sans-serif",
                fontSize: "clamp(52px, 12vw, 140px)",
                fontWeight: 900, color: "#f4911a", lineHeight: 1.05,
                letterSpacing: "-0.03em", display: "inline-block",
                transform: "translateY(110%)"
              }}>{ch}</span>
            );
          })}
        </div>
        <div style={{ display: "flex", overflow: "hidden", lineHeight: 1.05 }}>
          {word2.split("").map((ch, i) => {
            const idx = charIndex++;
            return (
              <span key={idx} ref={el => charsRef.current[idx] = el} style={{
                fontFamily: "'Lexend Deca', sans-serif",
                fontSize: "clamp(52px, 12vw, 140px)",
                fontWeight: 900, color: "#302c1a", lineHeight: 1.05,
                letterSpacing: "-0.03em", display: "inline-block",
                transform: "translateY(110%)"
              }}>{ch}</span>
            );
          })}
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ position: "relative", zIndex: 4, marginTop: 8, overflow: "hidden" }}>
        <span ref={subtitleRef} style={{
          fontFamily: "'Inter', sans-serif", fontSize: "clamp(11px, 1.4vw, 15px)",
          fontWeight: 600, color: "#302c1a", letterSpacing: 6,
          textTransform: "uppercase", opacity: 0, transform: "scaleX(0.1)",
          transformOrigin: "center", display: "inline-block"
        }}>FUTURE OF EDUCATION — 2025</span>
      </div>

      {/* Counter */}
      <div style={{
        position: "absolute", bottom: 0, right: 0, zIndex: 5,
        display: "flex", alignItems: "baseline", padding: "24px 40px"
      }}>
        {counterStr.split("").map((d, i) => (
          <span key={i} style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontSize: "clamp(56px, 8vw, 96px)",
            fontWeight: 900, color: "#302c1a", lineHeight: 1
          }}>{d}</span>
        ))}
        <span style={{
          fontFamily: "'Lexend Deca', sans-serif",
          fontSize: "clamp(20px, 3vw, 36px)",
          fontWeight: 700, color: "#302c1a", marginLeft: 2
        }}>%</span>
      </div>

      {/* Loading label */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, zIndex: 5, padding: "24px 40px"
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
          color: "rgba(48,44,26,0.4)", letterSpacing: 3, textTransform: "uppercase"
        }}>{counter >= 100 ? "Ready" : "Loading"}</span>
      </div>
    </div>
  );
}
