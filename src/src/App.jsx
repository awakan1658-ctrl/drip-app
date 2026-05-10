import { useState, useEffect, useRef, useCallback } from "react";

const DRIP_SETS = [
  { label: "成人用", sub: "20滴/mL", value: 20 },
  { label: "小児用", sub: "60滴/mL", value: 60 },
];

const STORAGE_KEY = "drip_presets_v1";

function loadPresets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function savePresets(presets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

function calcDropsPerMin(vol, totalMin, dripSet) {
  if (!vol || !totalMin || totalMin <= 0) return 0;
  return (vol * dripSet) / totalMin;
}

function paceText(dropsPerMin) {
  if (dropsPerMin <= 0) return null;
  const sec = 60 / dropsPerMin;
  if (sec >= 1) return `${sec.toFixed(1)}秒に1滴`;
  return `1秒に${(dropsPerMin / 60).toFixed(1)}滴`;
}

function formatTime(totalMin) {
  if (!totalMin || totalMin <= 0) return "—";
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (h === 0) return `${m}分`;
  return `${h}時間${m > 0 ? m + "分" : ""}`;
}

function DripVisualizer({ dropsPerMin, ticking }) {
  const [drops, setDrops] = useState([]);
  const dropIdRef = useRef(0);
  const intervalRef = useRef(null);
  const secPerDrop = dropsPerMin > 0 ? 60 / dropsPerMin : 0;

  const addDrop = useCallback(() => {
    const id = dropIdRef.current++;
    setDrops(prev => [...prev.slice(-8), { id, createdAt: Date.now() }]);
    setTimeout(() => {
      setDrops(prev => prev.filter(d => d.id !== id));
    }, 1800);
  }, []);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (ticking && secPerDrop > 0) {
      addDrop();
      intervalRef.current = setInterval(addDrop, secPerDrop * 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [ticking, secPerDrop, addDrop]);

  const fallDuration = Math.max(0.6, Math.min(secPerDrop * 0.5, 1.4));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      <svg width="80" height="90" viewBox="0 0 80 90">
        <line x1="40" y1="0" x2="40" y2="10" stroke="#7aaed4" strokeWidth="2" />
        <line x1="28" y1="10" x2="52" y2="10" stroke="#7aaed4" strokeWidth="2" strokeLinecap="round" />
        <rect x="16" y="10" width="48" height="58" rx="16" fill="rgba(79,195,247,0.13)" stroke="rgba(79,195,247,0.45)" strokeWidth="2" />
        <clipPath id="bagClip">
          <rect x="17" y="11" width="46" height="56" rx="15" />
        </clipPath>
        <g clipPath="url(#bagClip)">
          <rect x="17" y="38" width="46" height="30" fill="rgba(79,195,247,0.28)" />
          <path d="M17 38 Q30 34 40 38 Q50 42 63 38 L63 30 L17 30 Z" fill="rgba(79,195,247,0.15)" />
        </g>
        <line x1="26" y1="28" x2="54" y2="28" stroke="rgba(79,195,247,0.3)" strokeWidth="1" />
        <line x1="26" y1="35" x2="54" y2="35" stroke="rgba(79,195,247,0.2)" strokeWidth="1" />
        <rect x="34" y="66" width="12" height="8" rx="3" fill="rgba(79,195,247,0.3)" stroke="rgba(79,195,247,0.5)" strokeWidth="1.5" />
      </svg>
      <div style={{ width: 4, height: 18, background: "rgba(79,195,247,0.35)", borderRadius: 2 }} />
      <svg width="36" height="28" viewBox="0 0 36 28">
        <rect x="16" y="0" width="4" height="28" rx="2" fill="rgba(79,195,247,0.35)" />
        <rect x="4" y="6" width="28" height="16" rx="8" fill="#1a3a5c" stroke="rgba(79,195,247,0.6)" strokeWidth="2" />
        <rect x="15" y="9" width="6" height="10" rx="3"
          fill={ticking ? "rgba(79,195,247,0.6)" : "rgba(79,195,247,0.2)"}
          style={{ transition: "fill 0.3s" }} />
        <circle cx="18" cy="14" r="4" fill={ticking ? "#4fc3f7" : "#2a5a7a"} stroke="rgba(79,195,247,0.5)" strokeWidth="1.5"
          style={{ transition: "fill 0.3s" }} />
      </svg>
      <svg width="48" height="70" viewBox="0 0 48 70" style={{ marginTop: -2 }}>
        <path d="M14 4 Q14 0 24 0 Q34 0 34 4 L38 60 Q38 68 24 68 Q10 68 10 60 Z"
          fill="rgba(14,30,55,0.7)" stroke="rgba(79,195,247,0.35)" strokeWidth="1.5" />
        <clipPath id="chamberClip">
          <path d="M14 4 Q14 0 24 0 Q34 0 34 4 L38 60 Q38 68 24 68 Q10 68 10 60 Z" />
        </clipPath>
        <g clipPath="url(#chamberClip)">
          <rect x="10" y="46" width="28" height="24" fill="rgba(79,195,​​​​​​​​​​​​​​​​
