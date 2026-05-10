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
          <rect x="10" y="46" width="28" height="24" fill="rgba(79,195,247,0.25)" />
          <path d="M10 46 Q18 43 24 46 Q30 49 38 46 L38 42 L10 42 Z" fill="rgba(79,195,247,0.12)" />
        </g>
        <rect x="22" y="3" width="4" height="8" rx="2" fill="rgba(79,195,247,0.5)" />
        {drops.map(drop => (
          <Drop key={drop.id} fallDuration={fallDuration} />
        ))}
        <rect x="21" y="64" width="6" height="8" rx="2" fill="rgba(79,195,247,0.4)" />
      </svg>
      <div style={{ width: 4, height: 24, background: "rgba(79,195,247,0.3)", borderRadius: 2 }} />
      <svg width="20" height="16" viewBox="0 0 20 16">
        <rect x="6" y="0" width="8" height="10" rx="2" fill="#1a3a5c" stroke="rgba(79,195,247,0.4)" strokeWidth="1.5" />
        <path d="M8 10 L7 16 L13 16 L12 10 Z" fill="rgba(79,195,247,0.35)" />
      </svg>
    </div>
  );
}

function Drop({ fallDuration }) {
  const [phase, setPhase] = useState("forming");
  useEffect(() => {
    const t = setTimeout(() => setPhase("falling"), 80);
    return () => clearTimeout(t);
  }, []);
  if (phase === "forming") {
    return <ellipse cx="24" cy="14" rx="2" ry="2.5" fill="rgba(79,195,247,0.85)" />;
  }
  return (
    <ellipse cx="24" cy="14" rx="2.5" ry="3" fill="rgba(79,195,247,0.85)"
      style={{ animation: `dropFall ${fallDuration}s ease-in forwards` }} />
  );
}

const TABS = { CALC: "calc", PRESETS: "presets" };

export default function App() {
  const [tab, setTab] = useState(TABS.CALC);
  const [volume, setVolume] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [dripSet, setDripSet] = useState(20);
  const [ticking, setTicking] = useState(false);
  const [presets, setPresets] = useState(loadPresets);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const audioCtx = useRef(null);
  const intervalRef = useRef(null);

  const totalMin = parseFloat(hours || 0) * 60 + parseFloat(minutes || 0);
  const vol = parseFloat(volume);
  const dropsPerMin = calcDropsPerMin(vol, totalMin, dripSet);
  const secPerDrop = dropsPerMin > 0 ? 60 / dropsPerMin : 0;
  const valid = dropsPerMin > 0;

  function beep() {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 660; osc.type = "sine";
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (ticking && secPerDrop > 0) {
      beep();
      intervalRef.current = setInterval(beep, secPerDrop * 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [ticking, secPerDrop]);

  useEffect(() => { if (!valid) setTicking(false); }, [valid]);

  function handleSavePreset() {
    if (!saveName.trim() || !valid) return;
    const newPreset = { id: Date.now(), name: saveName.trim(), volume: vol,
      hours: parseFloat(hours || 0), minutes: parseFloat(minutes || 0), dripSet, dropsPerMin };
    const updated = [...presets, newPreset];
    setPresets(updated); savePresets(updated);
    setSaveName(""); setShowSaveInput(false);
  }

  function handleLoadPreset(p) {
    setVolume(String(p.volume)); setHours(String(p.hours));
    setMinutes(String(p.minutes)); setDripSet(p.dripSet);
    setTab(TABS.CALC); setTicking(false);
  }

  function handleDeletePreset(id) {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated); savePresets(updated);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#081928", fontFamily: "'Noto Sans JP', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 40px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&family=JetBrains+Mono:wght@600&display=swap');
        @keyframes dropFall {
          0% { transform: translateY(0px); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(32px); opacity: 0; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ color: "#e0f4ff", fontSize: 20, fontWeight: 800, letterSpacing: "0.1em", margin: 0 }}>
          💧 点滴滴下 計算ツール</h1>
        <p style={{ color: "#4a7a9a", fontSize: 12, margin: "4px 0 0" }}>Drip Rate Calculator</p>
      </div>

      <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 12,
        padding: 4, marginBottom: 20, width: "100%", maxWidth: 420, gap: 4 }}>
        {[{ key: TABS.CALC, label: "⚗️ 計算" },
          { key: TABS.PRESETS, label: `📋 プリセット (${presets.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "10px", border: "none", borderRadius: 9,
            background: tab === t.key ? "rgba(79,195,247,0.18)" : "transparent",
            color: tab === t.key ? "#4fc3f7" : "#4a7a9a",
            fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
            cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 420 }}>
        {tab === TABS.CALC && (
          <div>
            <div style={cardStyle}>
              <Label>輸液セット</Label>
              <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 18 }}>
                {DRIP_SETS.map(d => (
                  <button key={d.value} onClick={() => setDripSet(d.value)} style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10,
                    border: dripSet === d.value ? "2px solid #4fc3f7" : "2px solid rgba(255,255,255,0.08)",
                    background: dripSet === d.value ? "rgba(79,195,247,0.12)" : "rgba(255,255,255,0.03)",
                    color: dripSet === d.value ? "#4fc3f7" : "#5a8eaa",
                    cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{d.label}</div>
                    <div style={{ fontSize: 11 }}>{d.sub}</div>
                  </button>
                ))}
              </div>
              <Label>輸液量 (mL)</Label>
              <NumInput value={volume} onChange={setVolume} placeholder="例: 500" />
              <Label style={{ marginTop: 14 }}>投与時間</Label>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <div style={{ flex: 1 }}><NumInput value={hours} onChange={setHours} placeholder="0" suffix="時間" /></div>
                <div style={{ flex: 1 }}><NumInput value={minutes} onChange={setMinutes} placeholder="0" suffix="分" /></div>
              </div>
            </div>
            {valid ? (
              <>
                <div style={{ ...cardStyle, marginTop: 14, display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ flexShrink: 0 }}>
                    <DripVisualizer dropsPerMin={dropsPerMin} ticking={ticking} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#5a8eaa", fontSize: 11, marginBottom: 4 }}>滴下速度</div>
                    <div style={{ color: "#4fc3f7", fontSize: 34, fontWeight: 800,
                      fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
                      textShadow: "0 0 16px rgba(79,195,247,0.5)" }}>
                      {dropsPerMin.toFixed(1)}
                      <span style={{ fontSize: 13, fontWeight: 400, color: "#7aaed4", marginLeft: 4 }}>滴/分</span>
                    </div>
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(79,195,247,0.1)",
                      borderRadius: 8, color: "#c5e8ff", fontSize: 15, fontWeight: 700 }}>
                      {paceText(dropsPerMin)}
                    </div>
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {[{ label: "投与時間", val: formatTime(totalMin) },
                        { label: "mL/時", val: (vol / (totalMin / 60)).toFixed(0) },
                        { label: "1滴間隔", val: secPerDrop >= 1 ? `${secPerDrop.toFixed(1)}秒` : `${(secPerDrop*1000).toFixed(0)}ms` }
                      ].map(s => (
                        <div key={s.label} style={{ background: "rgba(255,255,255,0.04)",
                          borderRadius: 8, padding: "5px 10px", textAlign: "center" }}>
                          <div style={{ color: "#4a7a9a", fontSize: 10 }}>{s.label}</div>
                          <div style={{ color: "#9ed8f0", fontSize: 13, fontWeight: 700 }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setTicking(t => !t)} style={{
                  width: "100%", marginTop: 12, padding: "15px", borderRadius: 14, border: "none",
                  background: ticking ? "linear-gradient(135deg, #e53935, #c62828)" : "linear-gradient(135deg, #0288d1, #4fc3f7)",
                  color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  boxShadow: ticking ? "0 4px 20px rgba(229,57,53,0.4)" : "0 4px 20px rgba(79,195,247,0.3)",
                  transition: "all 0.3s" }}>
                  {ticking ? "⏹ 滴下シミュレーション 停止" : "▶ 滴下シミュレーション 開始"}
                </button>
                <div style={{ marginTop: 12 }}>
                  {showSaveInput ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" placeholder="プリセット名（例：生食500mL/6h）"
                        value={saveName} onChange={e => setSaveName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSavePreset()}
                        style={{ flex: 1, padding: "12px 14px", borderRadius: 10,
                          border: "1px solid rgba(79,195,247,0.3)",
                          background: "rgba(255,255,255,0.05)", color: "#e0f4ff",
                          fontSize: 13, outline: "none", fontFamily: "inherit" }} autoFocus />
                      <button onClick={handleSavePreset} style={{ padding: "12px 16px", borderRadius: 10,
                        border: "none", background: "rgba(79,195,247,0.2)", color: "#4fc3f7",
                        fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>保存</button>
                      <button onClick={() => { setShowSaveInput(false); setSaveName(""); }} style={{
                        padding: "12px 14px", borderRadius: 10, border: "none",
                        background: "rgba(255,255,255,0.05)", color: "#5a8eaa",
                        cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowSaveInput(true)} style={{
                      width: "100%", padding: "12px", borderRadius: 12,
                      border: "1px dashed rgba(79,195,247,0.3)", background: "transparent",
                      color: "#4a7a9a", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      ＋ この設定をプリセットに保存</button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ ...cardStyle, marginTop: 14, textAlign: "center",
                color: "#3d6a8a", fontSize: 13, padding: "24px",
                border: "1px dashed rgba(255,255,255,0.08)" }}>
                輸液量と投与時間を入力してください
              </div>
            )}
          </div>
        )}

        {tab === TABS.PRESETS && (
          <div>
            {presets.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: "center", padding: "40px 24px",
                border: "1px dashed rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                <div style={{ color: "#4a7a9a", fontSize: 14 }}>
                  プリセットがまだありません。<br />計算タブで設定を保存してください。
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {presets.map(p => (
                  <div key={p.id} style={{ ...cardStyle, display: "flex", alignItems: "center",
                    gap: 12, padding: "16px 18px", border: "1px solid rgba(79,195,247,0.15)" }}>
                    <div style={{ flex: 1, cursor: "pointer" }} onClick={() => handleLoadPreset(p)}>
                      <div style={{ color: "#c5e8ff", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {[{ l: "輸液量", v: `${p.volume}mL` },
                          { l: "時間", v: formatTime(p.hours * 60 + p.minutes) },
                          { l: "滴下", v: `${p.dropsPerMin.toFixed(1)}滴/分` },
                          { l: "セット", v: p.dripSet === 20 ? "成人" : "小児" }
                        ].map(s => (
                          <span key={s.l} style={{ fontSize: 12, color: "#5a8eaa" }}>
                            <span style={{ color: "#3d6a8a" }}>{s.l}: </span>{s.v}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button onClick={() => handleLoadPreset(p)} style={{ padding: "7px 12px",
                        borderRadius: 8, border: "none", background: "rgba(79,195,247,0.15)",
                        color: "#4fc3f7", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>読込</button>
                      <button onClick={() => handleDeletePreset(p.id)} style={{ padding: "7px 12px",
                        borderRadius: 8, border: "none", background: "rgba(255,80,80,0.1)",
                        color: "#e57373", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>削除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <p style={{ textAlign: "center", color: "#1e3a50", fontSize: 11, marginTop: 28 }}>
        ※ 医療行為の最終判断は必ず専門職が行ってください
      </p>
    </div>
  );
}

function Label({ children, style }) {
  return (
    <div style={{ color: "#7aaed4", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", ...style }}>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, placeholder, suffix }) {
  return (
    <div style={{ position: "relative", marginTop: 8 }}>
      <input type="number" min="0" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: suffix ? "12px 46px 12px 14px" : "12px 14px",
          borderRadius: 10, border: "1px solid rgba(79,195,247,0.18)",
          background: "rgba(255,255,255,0.05)", color: "#e0f4ff", fontSize: 18, fontWeight: 700,
          outline: "none", boxSizing: "border-box", fontFamily: "'JetBrains Mono', monospace" }} />
      {suffix && (
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          color: "#5a8eaa", fontSize: 12, pointerEvents: "none" }}>{suffix}</span>
      )}
    </div>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(79,195,247,0.12)",
  borderRadius: 18,
  padding: "22px 18px",
};



