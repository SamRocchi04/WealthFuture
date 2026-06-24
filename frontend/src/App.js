import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

if (typeof document !== "undefined") {
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "viewport";
    document.head.appendChild(meta);
  }
  meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
}

function PageTransition({ children }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => { setShow(true); }, 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0px)" : "translateY(25px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    }}>
      {children}
    </div>
  );
}

//#region DATA

const sectors = [
  "Agricoltura","Architettura e Design","Arte e Cultura","Banche e Finanza",
  "Commercio","Comunicazione","Costruzioni","Educazione","Energia",
  "IT e Software","Logistica","Sanità","Turismo","Altro"
];

const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Belgio","Brasile","Canada","Cina",
  "Francia","Germania","India","Italia","Giappone","Regno Unito","Stati Uniti"
].sort();

const PLAN_LIMITS = {
  free: {
    simulations: 1,
    lines: ["normale"],
    label: "Free",
    price: "€ 0",
    priceNote: "per sempre",
    scoreFinanziario: true,
    orizzonteAnni: 10,
    scenari: ["normale"],
    confrontoScelte: false,
    simulazionePensione: false,
    reportPdf: false,
    exportExcel: false,
    dashboardStorica: 30,
    aggiornamentoAutomatico: false,
    aiCoach: "limitato",
  },
  pro: {
    simulations: 5,
    lines: ["pessimistico","normale","ottimistico"],
    label: "Pro",
    price: "€ 9,99",
    priceNote: "/ mese",
    scoreFinanziario: true,
    orizzonteAnni: 30,
    scenari: ["pessimistico","normale","ottimistico"],
    confrontoScelte: true,
    simulazionePensione: true,
    reportPdf: true,
    exportExcel: true,
    dashboardStorica: 365,
    aggiornamentoAutomatico: false,
    aiCoach: "completo",
  },
  premium: {
    simulations: 20,
    lines: ["pessimistico","normale","ottimistico"],
    label: "Premium",
    price: "€ 19,99",
    priceNote: "/ mese",
    scoreFinanziario: true,
    orizzonteAnni: 70,
    scenari: ["pessimistico","normale","ottimistico"],
    confrontoScelte: true,
    simulazionePensione: true,
    reportPdf: true,
    exportExcel: true,
    dashboardStorica: 0,
    aggiornamentoAutomatico: true,
    aiCoach: "avanzato",
  },
};

//#endregion

// ── DESIGN TOKENS (Landing-aligned) ─────────────────────────────
const T = {
  base:      "#07091a",
  surface:   "#0c1023",
  card:      "#111827",
  cardHover: "#141e30",
  border:    "rgba(255,255,255,0.07)",
  borderHi:  "rgba(255,255,255,0.13)",
  blue:      "#2563eb",
  blueDim:   "rgba(37,99,235,0.12)",
  blueGlow:  "rgba(37,99,235,0.22)",
  violet:    "#7c3aed",
  green:     "#10b981",
  amber:     "#f59e0b",
  text:      "#f8fafc",
  muted:     "rgba(248,250,252,0.50)",
  hint:      "rgba(248,250,252,0.28)",
};

//#region APP

export default function App() {
  const [users, setUsers] = useState(() => {
  const savedUsers = localStorage.getItem("wealthfuture_users");
  return savedUsers ? JSON.parse(savedUsers) : [];
});
  const [logged, setLogged] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("home");
  const [authPage, setAuthPage] = useState(null);
  const [history, setHistory] = useState([]);
  const [plan, setPlan] = useState("free");
  const [selectedNews, setSelectedNews] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const openModal = (item) => { setSelectedNews(item); setTimeout(() => setModalVisible(true), 10); };
  const closeModal = () => { setModalVisible(false); setTimeout(() => setSelectedNews(null), 300); };
  useEffect(() => {
  localStorage.setItem(
    "wealthfuture_users",
    JSON.stringify(users)
  );
}, [users]);

  function handleRegister({ nome, cognome, email, password }) {
    const emailNorm = email.trim().toLowerCase();
    if (users.find(u => u.email === emailNorm)) {
      return { ok: false, error: "Questa email è associata ad un altro account." };
    }
    const newUser = { nome, cognome, email: emailNorm, password };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setLogged(true);
    setPage("home");
    return { ok: true };
  }

  function handleLogin({ email, password }) {
    const emailNorm = email.trim().toLowerCase();
    const found = users.find(u => u.email === emailNorm);
    if (!found) {
      return { ok: false, error: "Non esiste un account associato a questa email." };
    }
    if (found.password !== password) {
      return { ok: false, error: "Password errata." };
    }
    setCurrentUser(found);
    setLogged(true);
    setPage("home");
    return { ok: true };
  }

  if (!logged) {
    if (authPage === "login") {
      return (
        <Login
          mode="login"
          onLogin={handleLogin}
          onBack={() => setAuthPage(null)}
        />
      );
    }
    if (authPage === "register") {
      return (
        <Login
          mode="register"
          onRegister={handleRegister}
          onBack={() => setAuthPage(null)}
        />
      );
    }
    return (
      <Landing
        onLogin={() => setAuthPage("login")}
        onRegister={() => setAuthPage("register")}
      />
    );
  }

  return (
    <div style={styles.app}>
      <style>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <Background page={page} />
      <TopBar page={page} setPage={setPage} />

      <div style={styles.container}>
        {page === "home" && (
          <PageTransition key="home">
            <Home setPage={setPage} openModal={openModal} />
          </PageTransition>
        )}
        {page === "dashboard" && (
          <PageTransition key="dashboard">
            <Dashboard history={history} plan={plan} setPage={setPage} />
          </PageTransition>
        )}
        {page === "scenario" && (
          <PageTransition key="scenario">
            <Scenario history={history} setHistory={setHistory} plan={plan} setPage={setPage} />
          </PageTransition>
        )}
        {page === "history" && (
          <PageTransition key="history">
            <History history={history} setHistory={setHistory} />
          </PageTransition>
        )}
        {page === "account" && (
          <PageTransition key="account">
            <Account history={history} plan={plan} setPlan={setPlan} />
          </PageTransition>
        )}
        {page === "settings" && (
          <PageTransition key="settings">
            <Settings />
          </PageTransition>
        )}
      </div>

      {/* Modal montato FUORI dal container scrollabile per evitare lo stacking context */}
      {selectedNews && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: modalVisible ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0)",
            backdropFilter: modalVisible ? "blur(12px)" : "blur(0px)",
            WebkitBackdropFilter: modalVisible ? "blur(12px)" : "blur(0px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            transition: "background 0.3s ease, backdrop-filter 0.3s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "640px",
              maxWidth: "90vw",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "linear-gradient(135deg, #0f0f1e 0%, #151525 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "40px",
              borderRadius: "24px",
              boxShadow: "0 0 80px rgba(59,130,246,0.2), 0 32px 64px rgba(0,0,0,0.6)",
              position: "relative",
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
              transition: "opacity 0.35s cubic-bezier(0.34,1.56,0.64,1), transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div style={{ display: "inline-block", background: "linear-gradient(90deg,#3b82f6,#ec4899)", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: "white", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              {selectedNews.date}
            </div>
            <h2 style={{ margin: "0 0 16px 0", fontSize: 24, fontWeight: 800, color: "white", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
              {selectedNews.title}
            </h2>
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 20 }} />
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.65)" }}>
              {selectedNews.longDesc}
            </p>
            <button onClick={closeModal} style={{ marginTop: 32, padding: "10px 24px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", backdropFilter: "blur(10px)" }}>
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

//#endregion

//#region LANDING

function Landing({ onLogin, onRegister }) {
  // ── DESIGN TOKENS ────────────────────────────────────────────
const C = {
  base:     "#07091a",
  surface:  "#0c1023",
  card:     "#111827",
  cardHi:   "#162033",
  border:   "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.13)",
  blue:     "#2563eb",
  blueDim:  "rgba(37,99,235,0.15)",
  blueGlow: "rgba(37,99,235,0.25)",
  green:    "#10b981",
  greenDim: "rgba(16,185,129,0.12)",
  amber:    "#f59e0b",
  text:     "#f8fafc",
  muted:    "rgba(248,250,252,0.45)",
  hint:     "rgba(248,250,252,0.25)",
};

// ── SPARKLINE ─────────────────────────────────────────────────
function Sparkline({ data, color = C.green, width = 80, height = 32 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── ANIMATED TICKER ───────────────────────────────────────────
const TICKERS = [
  { sym: "MSFT", val: "421.80", chg: "+1.2%" },
  { sym: "AAPL", val: "196.45", chg: "+0.8%" },
  { sym: "NVDA", val: "138.20", chg: "+3.4%" },
  { sym: "BTC",  val: "67,420", chg: "+2.1%" },
  { sym: "ETH",  val: "3,512",  chg: "+1.7%" },
  { sym: "SPY",  val: "536.90", chg: "+0.5%" },
  { sym: "AMZN", val: "185.30", chg: "+0.9%" },
  { sym: "GOOGL",val: "175.60", chg: "-0.3%", neg: true },
];

function Ticker() {
  const doubled = [...TICKERS, ...TICKERS];
  return (
    <div style={{
      overflow: "hidden", width: "100%",
      borderBottom: `1px solid ${C.border}`,
      background: C.surface,
      padding: "8px 0",
    }}>
      <div style={{
        display: "flex", gap: 48,
        animation: "tickerScroll 30s linear infinite",
        width: "max-content",
      }}>
        {doubled.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.06em" }}>{t.sym}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontVariantNumeric: "tabular-nums" }}>{t.val}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: t.neg ? "#f87171" : C.green }}>{t.chg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────
function StatCard({ label, value, sub, color = C.green, data }) {
  return (
    <div className="wf-card-hover" style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: "20px 22px",
      transition: "border-color 0.2s, background 0.2s", cursor: "default",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.hint }}>
          {label}
        </span>
        {data && <Sparkline data={data} color={color} />}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", marginBottom: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

// ── FEATURE ROW ───────────────────────────────────────────────
function FeatureRow({ icon, title, desc }) {
  return (
    <div className="wf-card-hover" style={{
      display: "flex", gap: 16, alignItems: "flex-start",
      padding: "20px 22px", background: C.card,
      border: `1px solid ${C.border}`, borderRadius: 14,
      transition: "border-color 0.2s, background 0.2s",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: C.blueDim, border: `1px solid ${C.blueGlow}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 5 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{desc}</div>
      </div>
    </div>
  );
}

// ── BAR CHART ─────────────────────────────────────────────────
function BarChart() {
  const bars = [12, 22, 35, 48, 65, 80, 100];
  const labels = ["0", "5", "10", "15", "20", "25", "30a"];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, marginBottom: 8 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{
              height: `${h}%`, borderRadius: "4px 4px 0 0",
              background: i === bars.length - 1 ? C.green : `rgba(37,99,235,${0.3 + i * 0.1})`,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
        {labels.map(l => (
          <span key={l} style={{ fontSize: 10, color: C.hint, fontFamily: "monospace" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}


function CombinedChart() {
  const data = [
    { yr: 0,  val: 20000  },
    { yr: 5,  val: 52000  },
    { yr: 10, val: 112000 },
    { yr: 15, val: 214000 },
    { yr: 20, val: 286000 },
    { yr: 25, val: 374000 },
    { yr: 30, val: 436000 },
  ];

  const w = 280, h = 140;
  const maxV = 436000, minV = 0;
  const pad = { l: 8, r: 8, t: 12, b: 24 };
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;

  const px = (i) => pad.l + (i / (data.length - 1)) * chartW;
  const py = (v) => pad.t + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const linePts = data.map((d, i) => `${px(i)},${py(d.val)}`).join(" ");
  const areaPts = `${px(0)},${pad.t + chartH} ` + data.map((d, i) => `${px(i)},${py(d.val)}`).join(" ") + ` ${px(data.length - 1)},${pad.t + chartH} Z`;

  return (
    <div style={{ padding: "18px 22px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.hint, marginBottom: 12 }}>
        Crescita patrimoniale
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="cgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2563eb" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(t => {
          const y = pad.t + chartH * (1 - t);
          return (
            <line key={t}
              x1={pad.l} y1={y} x2={pad.l + chartW} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
          );
        })}

        {/* Barre */}
        {data.map((d, i) => {
          const bw = 14;
          const bx = px(i) - bw / 2;
          const bh = ((d.val - minV) / (maxV - minV)) * chartH;
          const by = pad.t + chartH - bh;
          return (
            <rect key={i}
              x={bx} y={by} width={bw} height={bh}
              rx="3"
              fill={i === data.length - 1 ? "url(#barGrad)" : `rgba(37,99,235,${0.18 + i * 0.08})`}
            />
          );
        })}

        {/* Area */}
        <path d={`M${areaPts}`} fill="url(#cgGrad)" />

        {/* Line */}
        <polyline points={linePts} fill="none" stroke="#10b981" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Dot finale */}
        <circle cx={px(data.length - 1)} cy={py(436000)} r="4" fill="#10b981" />
        <circle cx={px(data.length - 1)} cy={py(436000)} r="8" fill="#10b981" fillOpacity="0.18" />

        {/* Labels anni */}
        {data.map((d, i) => (
          <text key={i}
            x={px(i)} y={h - 2}
            textAnchor="middle" fontSize="8"
            fill="rgba(248,250,252,0.28)"
            fontFamily="monospace"
          >{d.yr}a</text>
        ))}

        {/* Labels valori sopra le barre */}
        {data.map((d, i) => (
          <text key={`v${i}`}
            x={px(i)} y={py(d.val) - 6}
            textAnchor="middle" fontSize="7.5"
            fill="rgba(248,250,252,0.35)"
            fontFamily="monospace"
          >
            {d.val >= 1000 ? `€${Math.round(d.val / 1000)}k` : `€${d.val}`}
          </text>
        ))}
      </svg>
    </div>
  );
}


// ── DASHBOARD PREVIEW ─────────────────────────────────────────
function DashboardPreview() {
  const spark1 = [20, 25, 22, 35, 40, 38, 55, 60, 58, 72, 80, 90];
  const spark2 = [10, 12, 15, 13, 18, 22, 20, 28, 30, 27, 35, 40];
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 20, overflow: "hidden",
      boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
    }}>
      <div style={{
        padding: "12px 18px", background: C.card,
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {["#ef4444", "#f59e0b", "#10b981"].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
        ))}
        <span style={{ fontSize: 12, color: C.hint, marginLeft: 8, fontFamily: "monospace" }}>wealthfuture.app — Dashboard</span>
      </div>
      <div style={{ padding: "20px 18px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.hint, marginBottom: 6 }}>Patrimonio netto</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>€ 136.400</div>
          <div style={{ fontSize: 12, color: C.green, fontWeight: 600, marginTop: 3 }}>↑ +€ 4.200 questo mese</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Investimenti", val: "€92.000", color: C.blue, data: spark1 },
            { label: "Liquidità",    val: "€44.400", color: C.green, data: spark2 },
          ].map(item => (
            <div key={item.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: C.hint, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>{item.label}</div>
              <Sparkline data={item.data} color={item.color} width={90} height={28} />
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{item.val}</div>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: C.hint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>FIRE progress</span>
            <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>43%</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "43%", background: `linear-gradient(90deg,${C.blue},${C.green})`, borderRadius: 3 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: C.muted }}>€136k attuale</span>
            <span style={{ fontSize: 11, color: C.muted }}>€316k target</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STEP ─────────────────────────────────────────────────────
function Step({ n, title, desc, isLast }) {
  return (
    <div style={{ display: "flex", gap: 16, position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: C.blueDim, border: `1px solid ${C.blueGlow}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, color: C.blue, fontFamily: "monospace",
        }}>{n}</div>
        {!isLast && <div style={{ width: 1, flex: 1, minHeight: 32, background: C.border, marginTop: 8 }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 32 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

// ── GLOBAL STYLES ─────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    html, body {
      overflow-x: hidden;
      width: 100%;
      max-width: 100vw;
    }
    
    html, body {
  overflow: hidden;
  height: 100%;
}

#root {
  height: 100%;
  overflow-y: auto;
}

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    @keyframes tickerScroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes pulse {
      0%,100% { opacity: 1; } 50% { opacity: 0.3; }
    }
    .wf-card-hover:hover {
      border-color: rgba(255,255,255,0.13) !important;
      background: #162033 !important;
    }
    .wf-btn-primary:hover  { filter: brightness(1.14); }
    .wf-btn-secondary:hover { background: rgba(255,255,255,0.08) !important; color: #f8fafc !important; }
    .wf-link:hover { color: rgba(248,250,252,0.7) !important; }

    @media (max-width: 640px) {
      section { padding-left: 16px !important; padding-right: 16px !important; }
      nav > div { padding-left: 16px !important; padding-right: 16px !important; }
    }
    
    input, select, textarea {
      font-family: 'Inter', system-ui, sans-serif;
    }
    input::placeholder { color: rgba(248,250,252,0.28); }
    select option { background: #111827; color: #f8fafc; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
    
    input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
  `}</style>
);

// ── MAIN COMPONENT ────────────────────────────────────────────
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div style={{ background: `
  radial-gradient(ellipse 80% 60% at 20% 10%, rgba(37,99,235,0.28) 0%, transparent 55%),
  radial-gradient(ellipse 70% 70% at 80% 15%, rgba(124,58,237,0.22) 0%, transparent 50%),
  radial-gradient(ellipse 60% 50% at 50% 90%, rgba(16,185,129,0.10) 0%, transparent 55%),
  #07091a`, minHeight: "100vh", color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <GlobalStyles />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: `1px solid ${C.border}`,
        background: "rgba(5,8,16,0.85)",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${C.blue},#7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: "white" }}>W</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>WealthFuture</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onLogin} className="wf-btn-secondary" style={{
              padding: "8px 18px", borderRadius: 9, border: `1px solid ${C.border}`,
              background: "transparent", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}>Accedi</button>
            <button onClick={onRegister} className="wf-btn-primary" style={{
              padding: "8px 18px", borderRadius: 9, border: "none",
              background: C.blue, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "filter 0.15s",
            }}>Inizia gratis</button>
          </div>
        </div>
      </nav>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 28px 100px" }}>
        <div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
  gap: 48,
  alignItems: "center",
}}>
          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(24px)",
            transition: "all 0.7s cubic-bezier(.16,1,.3,1)",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: C.blueDim, border: `1px solid ${C.blueGlow}`,
              marginBottom: 28,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 2s ease infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>Pianificazione finanziaria intelligente</span>
            </div>

            <h1 style={{
              fontSize: "clamp(2.2rem,4vw,3.8rem)",
              fontWeight: 900, lineHeight: 1.08,
              letterSpacing: "-0.04em",
              marginBottom: 22, color: C.text,
            }}>
              Costruisci il tuo<br />
              <span style={{ background: `linear-gradient(120deg,${C.blue} 0%,#7c3aed 60%,${C.green} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                futuro finanziario
              </span>
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.75, color: C.muted, maxWidth: 460, marginBottom: 36 }}>
              Simula la crescita del patrimonio, pianifica pensione, casa e indipendenza finanziaria con analisi precise basate sui tuoi dati reali.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
              <button onClick={onRegister} className="wf-btn-primary" style={{
                padding: "13px 28px", borderRadius: 11, border: "none",
                background: C.blue, color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
                transition: "filter 0.15s",
              }}>Inizia gratis</button>
              <button onClick={onLogin} className="wf-btn-secondary" style={{
                padding: "13px 28px", borderRadius: 11,
                border: `1px solid ${C.border}`, background: "transparent",
                color: C.muted, fontWeight: 600, fontSize: 14, cursor: "pointer",
                transition: "background 0.15s",
              }}>Accedi</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex" }}>
                {["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"].map((c, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: c, border: `2px solid ${C.base}`,
                    marginLeft: i === 0 ? 0 : -8, opacity: 0.85,
                  }} />
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>+12.000 utenti attivi</div>
                <div style={{ fontSize: 12, color: C.muted }}>★★★★★ 4.9/5</div>
              </div>
            </div>
          </div>

          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(30px)",
            transition: "all 0.9s cubic-bezier(.16,1,.3,1) 0.15s",
          }}>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            {[
              { label: "Patrimonio simulato",   val: "€ 130 mln", sub: "tra tutti gli utenti" },
              { label: "Simulazioni generate",  val: "500+",      sub: "ultimo mese" },
              { label: "Precisione proiezioni", val: "94.2%",      sub: "su dati storici" },
              { label: "Risparmio ottimizzato", val: "€ 380",      sub: "medio mensile utente" },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                padding: "28px 24px",
                borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.hint, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", marginBottom: 3 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "90px 28px" }}>
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.blue, marginBottom: 14 }}>Funzionalità</div>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", color: C.text, marginBottom: 12, maxWidth: 480 }}>
            Tutto quello che serve per decidere meglio
          </h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, maxWidth: 500 }}>
            Strumenti di analisi professionale, accessibili senza essere un esperto di finanza.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
          <FeatureRow icon="📈" title="Interesse composto" desc="Proiezioni a lungo termine basate su rendimento annuo, inflazione reale e contributi periodici." />
          <FeatureRow icon="🏦" title="Pianificazione pensione" desc="Stima il capitale accumulato all'età pensionabile e la rendita mensile disponibile." />
          <FeatureRow icon="🏠" title="Obiettivo casa" desc="Calcola in quanti anni puoi permetterti un mutuo, con simulazione di anticipo e rate." />
          <FeatureRow icon="⚡" title="Indipendenza finanziaria" desc="Scopri il tuo numero FIRE e quanto manca al punto in cui il capitale lavora per te." />
          <FeatureRow icon="🛡️" title="Fondo di emergenza" desc="Analizza la solidità della tua riserva liquidità rispetto alle spese mensili reali." />
          <FeatureRow icon="📊" title="Salute finanziaria" desc="Score aggregato 0–100 che misura equilibrio, crescita e rischio del tuo profilo." />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "90px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 48, alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.blue, marginBottom: 14 }}>Come funziona</div>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: C.text, marginBottom: 40 }}>
              Dalla prima cifra alla strategia completa
            </h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Step n="01" title="Inserisci il tuo profilo" desc="Reddito netto, spese, risparmi e patrimonio attuale. Bastano 3 minuti." />
              <Step n="02" title="Configura gli obiettivi" desc="Pensione, casa, FIRE o tutti e tre. Il sistema adatta i calcoli in tempo reale." />
              <Step n="03" title="Analizza le proiezioni" desc="Grafici interattivi con scenari ottimista, realistico e conservativo." isLast={false} />
              <Step n="04" title="Prendi decisioni informate" desc="Confronta strategie, ottimizza i risparmi e monitora i progressi nel tempo." isLast />
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "20px 22px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.hint, marginBottom: 4 }}>Motore di simulazione</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>WealthFuture Engine v2.0</div>
            </div>
            <div style={{ padding: "20px 22px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", fontFamily: "monospace", fontSize: 12.5, color: C.blue, lineHeight: 2, marginBottom: 14 }}>
                Vf = V₀ × (1 + r)ⁿ<br />
                <span style={{ color: C.hint }}>+ Σ c × (1 + r)^(n-t)</span><br />
                <span style={{ color: "rgba(248,250,252,0.2)" }}>− inflazione × n</span>
              </div>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.65, margin: 0 }}>
                Capitale iniziale, contributi periodici e rendimento composto corretti per l'inflazione storica italiana.
              </p>
            </div>
            <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}` }}>
              {[
                { k: "Reddito netto mensile", v: "€ 2.500" },
                { k: "Risparmio mensile",     v: "€ 500" },
                { k: "Patrimonio attuale",    v: "€ 20.000" },
                { k: "Rendimento annuo",      v: "5,0%" },
                { k: "Inflazione stimata",    v: "2,1%" },
              ].map((row, i, arr) => (
                <div key={row.k} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <span style={{ fontSize: 12, color: C.hint }}>{row.k}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontVariantNumeric: "tabular-nums" }}>{row.v}</span>
                </div>
              ))}
            </div>
            <CombinedChart />
          </div>
        </div>
      </section>

      {/* ── KPI ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 28px" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: C.text, marginBottom: 10 }}>
            Il tuo profilo finanziario, a colpo d'occhio
          </h2>
          <p style={{ fontSize: 15, color: C.muted }}>Indicatori chiave aggiornati ad ogni simulazione</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          <StatCard label="Pensione stimata"   value="€ 1.950/mese" sub="↑ rivalutabile con contributi" color={C.green} data={[30,35,38,42,48,55,60,65,72,80,85,90]} />
          <StatCard label="Anni al FIRE"        value="23 anni"      sub="con risparmio attuale"          color={C.blue}  data={[100,90,82,75,68,62,57,52,48,44,40,37]} />
          <StatCard label="Casa acquistabile"   value="€ 280.000"    sub="con mutuo al 70%"               color={C.amber} data={[10,15,22,30,38,45,52,60,68,74,80,88]} />
          <StatCard label="Salute finanziaria"  value="87 / 100"     sub="ottimo — top 15%"               color={C.green} data={[55,60,62,65,68,70,72,75,78,80,84,87]} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px 80px" }}>
        <div style={{
          borderRadius: 24,
          background: `linear-gradient(135deg,rgba(37,99,235,0.2) 0%,rgba(124,58,237,0.2) 50%,rgba(16,185,129,0.12) 100%)`,
          border: `1px solid rgba(37,99,235,0.3)`,
          padding: "60px 48px", textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.blue, marginBottom: 16 }}>Inizia oggi</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.04em", color: C.text, marginBottom: 14 }}>
            Il momento migliore era ieri.<br /> Il secondo è adesso.
          </h2>
          <p style={{ fontSize: 15, color: C.muted, maxWidth: 480, margin: "0 auto 36px" }}>
            Ogni mese di ritardo ha un costo reale. Inizia la simulazione gratuitamente e scopri dove puoi arrivare.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onRegister} className="wf-btn-primary" style={{
              padding: "14px 32px", borderRadius: 12, border: "none",
              background: C.blue, color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer",
              transition: "filter 0.15s",
            }}>Crea account gratuito</button>
            <button onClick={onLogin} className="wf-btn-secondary" style={{
              padding: "14px 32px", borderRadius: 12,
              border: `1px solid ${C.border}`, background: "transparent",
              color: C.muted, fontWeight: 600, fontSize: 15, cursor: "pointer",
              transition: "background 0.15s",
            }}>Ho già un account</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: `linear-gradient(135deg,${C.blue},#7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: "white" }}>W</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700 }}>WealthFuture</span>
            <span style={{ fontSize: 12, color: C.hint }}>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy Policy", "Cookie Policy", "Termini di Utilizzo", "Diritti dell'Utente", "Contatti"].map(l => (
              <span key={l} className="wf-link" style={{ fontSize: 12, color: C.hint, cursor: "pointer", transition: "color 0.15s" }}>{l}</span>
            ))}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 28px", maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", lineHeight: 1.6, margin: 0 }}>
            Solo simulazioni. I dati mostrati sono puramente illustrativi e a scopo educativo. Non costituiscono consulenza finanziaria, fiscale o legale. I rendimenti passati non garantiscono quelli futuri.
          </p>
        </div>
      </footer>
    </div>
  );
}


//#endregion

//#region LOGIN
function Login({ mode, onLogin, onRegister, onBack }) {
  const isRegister = mode === "register";

  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldMessages, setFieldMessages] = useState({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // ── Password strength ──────────────────────────────────────────
  function getPasswordStrength(pw) {
    if (!pw) return { score: 0, label: "", color: "transparent", width: "0%" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { score, label: "Debole",   color: "rgba(239,68,68,0.85)",   width: "30%" };
    if (score === 3) return { score, label: "Media",    color: "rgba(251,146,60,0.85)",  width: "60%" };
    if (score === 4) return { score, label: "Buona",    color: "rgba(234,179,8,0.85)",   width: "80%" };
    return              { score, label: "Ottima",   color: "rgba(34,197,94,0.85)",   width: "100%" };
  }

  function validatePassword(pw) {
    const missing = [];
    if (!/[A-Z]/.test(pw)) missing.push("una lettera maiuscola");
    if (!/[a-z]/.test(pw)) missing.push("una lettera minuscola");
    if (!/[0-9]/.test(pw)) missing.push("un numero");
    if (!/[^A-Za-z0-9]/.test(pw)) missing.push("un carattere speciale");
    if (pw.length < 8) missing.push("almeno 8 caratteri");
    return missing;
  }

  // ── Field validators ───────────────────────────────────────────
  function validateNome(v) {
    if (!v.trim()) return "Il nome è obbligatorio.";
    if (/[^A-Za-zÀ-ÿ\s'-]/.test(v)) return "Il nome non può contenere numeri o caratteri speciali.";
    return null;
  }
  function validateCognome(v) {
    if (!v.trim()) return "Il cognome è obbligatorio.";
    if (/[^A-Za-zÀ-ÿ\s'-]/.test(v)) return "Il cognome non può contenere numeri o caratteri speciali.";
    return null;
  }
  function validateEmail(v) {
    if (!v.trim()) return "L'email è obbligatoria.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Formato email non corretto (es. nome@dominio.com).";
    return null;
  }

  // ── Live field blur handlers ───────────────────────────────────
  function handleBlurNome() {
    const msg = validateNome(nome);
    setFieldErrors(p => ({ ...p, nome: !!msg }));
    setFieldMessages(p => ({ ...p, nome: msg || "" }));
  }
  function handleBlurCognome() {
    const msg = validateCognome(cognome);
    setFieldErrors(p => ({ ...p, cognome: !!msg }));
    setFieldMessages(p => ({ ...p, cognome: msg || "" }));
  }
  function handleBlurEmail() {
    const msg = validateEmail(email);
    setFieldErrors(p => ({ ...p, email: !!msg }));
    setFieldMessages(p => ({ ...p, email: msg || "" }));
  }

  // ── Submit ─────────────────────────────────────────────────────
  function handleSubmit() {
    setError("");
    const errs = {};
    const msgs = {};

    if (isRegister) {
      const nMsg = validateNome(nome);
      if (nMsg) { errs.nome = true; msgs.nome = nMsg; }
      const cMsg = validateCognome(cognome);
      if (cMsg) { errs.cognome = true; msgs.cognome = cMsg; }
    }

    const eMsg = validateEmail(email);
    if (eMsg) { errs.email = true; msgs.email = eMsg; }

    if (!password) {
      errs.password = true;
      msgs.password = "La password è obbligatoria.";
    } else if (isRegister) {
      const missing = validatePassword(password);
      if (missing.length > 0) {
        errs.password = true;
        msgs.password = "La password deve contenere: " + missing.join(", ") + ".";
      }
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFieldMessages(msgs);
      setError("Correggi i campi evidenziati.");
      return;
    }

    setFieldErrors({});
    setFieldMessages({});

    if (isRegister) {
      const result = onRegister({ nome, cognome, email, password });
      if (!result.ok) {
        setFieldErrors({ email: true });
        setFieldMessages({ email: result.error });
        setError(result.error);
      }
    } else {
      const result = onLogin({ email, password });
      if (!result.ok) {
        if (result.error.includes("Password")) {
          setFieldErrors({ password: true });
          setFieldMessages({ password: result.error });
        } else {
          setFieldErrors({ email: true });
          setFieldMessages({ email: result.error });
        }
        setError(result.error);
      }
    }
  }

  const strength = getPasswordStrength(password);

  // ── Styles helpers ─────────────────────────────────────────────
  const inputStyle = (field) => ({
    ...styles.input,
    borderColor: fieldErrors[field] ? "rgba(239,68,68,0.8)" : undefined,
  });

  const cardAnimStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px) scale(1)" : "translateY(32px) scale(0.97)",
    transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
  };
  const bgAnimStyle = {
    opacity: visible ? 1 : 0,
    transition: "opacity 0.7s ease",
  };
  const fieldAnim = (index) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px)" : "translateY(18px)",
    transition: `opacity 0.45s cubic-bezier(0.22,1,0.36,1) ${0.18 + index * 0.07}s, transform 0.45s cubic-bezier(0.22,1,0.36,1) ${0.18 + index * 0.07}s`,
  });

  const FieldError = ({ field }) => {
  if (!fieldErrors[field] || !fieldMessages[field]) return null;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginTop: 5,
      padding: "6px 10px",
      borderRadius: 8,
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.2)",
      animation: "fadeInDown 0.25s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="rgba(239,68,68,0.8)" strokeWidth="1.5"/>
        <path d="M8 4.5v4" stroke="rgba(239,68,68,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="11" r="0.8" fill="rgba(239,68,68,0.8)"/>
      </svg>
      <span style={{
        fontSize: 12,
        color: "rgba(239,100,100,0.85)",
        fontWeight: 500,
        letterSpacing: "0.01em",
      }}>
        {fieldMessages[field]}
      </span>
    </div>
  );
};

  return (
    <div style={styles.app}>
      <div style={{
        ...styles.bg,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.7s ease",
        background: isRegister
          ? "radial-gradient(circle at 20% 50%, rgba(37,99,235,0.5), transparent 55%), radial-gradient(circle at 80% 50%, rgba(124,58,237,0.4), transparent 55%)"
          : "radial-gradient(circle at 30% 40%, rgba(15,118,110,0.85), transparent 60%), radial-gradient(circle at 75% 65%, rgba(30,58,138,0.75), transparent 55%)"
      }} />

      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, padding: "20px" }}>
        <div style={{
          ...cardAnimStyle,
          display: "flex", width: "min(860px, 100%)", minHeight: 520,
          borderRadius: 24, overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>

          {/* ── LEFT PANEL ── */}
          <div style={{
            flex: "0 0 320px",
            background: isRegister
              ? "linear-gradient(145deg,rgba(37,99,235,0.25),rgba(124,58,237,0.3))"
              : "linear-gradient(145deg,rgba(15,118,110,0.3),rgba(30,58,138,0.35))",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            padding: "44px 32px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 44 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "white" }}>W</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", background: "linear-gradient(90deg,#3b82f6,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WealthFuture</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.03em", lineHeight: 1.3, marginBottom: 14 }}>
                {isRegister ? "Costruisci il tuo futuro finanziario" : "Bentornato su WealthFuture"}
              </div>
              <div style={{ fontSize: 14, color: "rgba(248,250,252,0.45)", lineHeight: 1.7 }}>
                {isRegister
                  ? "Simula crescita patrimonio, pensione e indipendenza finanziaria con analisi precise."
                  : "Accedi al tuo profilo per vedere le proiezioni e i tuoi scenari salvati."}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "📈", text: "Proiezioni a 30 anni" },
                { icon: "🏦", text: "Simulazione pensione" },
                { icon: "⚡", text: "Score FIRE personalizzato" },
              ].map(f => (
                <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{f.icon}</div>
                  <span style={{ fontSize: 13, color: "rgba(248,250,252,0.55)", fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL (form) ── */}
          <div style={{ flex: 1, background: "rgba(10,12,22,0.95)", backdropFilter: "blur(30px)", padding: "44px 36px", display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto" }}>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: 6 }}>
                {isRegister ? "Crea il tuo account" : "Accedi al tuo account"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(248,250,252,0.4)" }}>
                {isRegister ? "Gratis per sempre, nessuna carta richiesta." : "Inserisci le tue credenziali per continuare."}
              </div>
            </div>

            {/* Nome + Cognome */}
            {isRegister && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Nome</label>
                  <input placeholder="Mario" style={inputStyle("nome")} value={nome}
                    onChange={(e) => { setNome(e.target.value); setFieldErrors(p => ({ ...p, nome: false })); setFieldMessages(p => ({ ...p, nome: "" })); }}
                    onBlur={handleBlurNome} />
                  <FieldError field="nome" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Cognome</label>
                  <input placeholder="Rossi" style={inputStyle("cognome")} value={cognome}
                    onChange={(e) => { setCognome(e.target.value); setFieldErrors(p => ({ ...p, cognome: false })); setFieldMessages(p => ({ ...p, cognome: "" })); }}
                    onBlur={handleBlurCognome} />
                  <FieldError field="cognome" />
                </div>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Email</label>
              <input placeholder="mario@esempio.com" type="email" style={inputStyle("email")} value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: false })); setFieldMessages(p => ({ ...p, email: "" })); }}
                onBlur={handleBlurEmail} />
              <FieldError field="email" />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Password</label>
              <input placeholder={isRegister ? "Min. 8 caratteri" : "La tua password"} type="password"
                style={{ ...inputStyle("password"), marginBottom: 6 }} value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: false })); setFieldMessages(p => ({ ...p, password: "" })); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }} />
              {isRegister && password.length > 0 && (
                <div style={{ marginBottom: 4 }}>
                  <div style={{ width: "100%", height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", borderRadius: 99, width: strength.width, background: strength.color, boxShadow: `0 0 8px ${strength.color}`, transition: "width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.4s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Maiuscola · minuscola · numero · spec.</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>{strength.label}</span>
                  </div>
                </div>
              )}
              <FieldError field="password" />
            </div>

            {/* Submit */}
            <button style={{
              width: "100%", padding: "13px 20px", borderRadius: 12, border: "none",
              background: isRegister ? "linear-gradient(90deg,#2563eb,#7c3aed)" : "linear-gradient(90deg,#0f766e,#1d4ed8)",
              color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer",
              marginTop: 8, marginBottom: 14, transition: "filter 0.15s",
            }} onClick={handleSubmit}>
              {isRegister ? "Crea account gratuito →" : "Accedi"}
            </button>

            {/* Switch + back */}
            <div style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              {isRegister ? "Hai già un account? " : "Non hai un account? "}
              <span onClick={onBack} style={{ color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}>
                {isRegister ? "Accedi" : "Registrati gratis"}
              </span>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
//#endregion

//#region HOME

function Home({ setPage, openModal }) {
  const [visible, setVisible] = useState(false);
  const [barHeights, setBarHeights] = useState([0, 0, 0, 0, 0]);

  useState(() => {
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => { setBarHeights([60, 85, 45, 95, 70]); }, 400);
  });

  const news = [
  {
    title: "Nuovo motore di simulazione v2.0",
    date: "Giugno 2025",
    desc: "Algoritmi aggiornati con dati di mercato reali.",
    longDesc: "La versione 2.0 introduce un nuovo motore di simulazione finanziaria basato su dati storici di mercato, crescita salariale dinamica e modelli di investimento più accurati. Le proiezioni sono ora più realistiche sia nel breve che nel lungo periodo."
  },
  {
    title: "Scenari multi-paese disponibili",
    date: "Maggio 2025",
    desc: "Simulazioni disponibili in oltre 20 paesi.",
    longDesc: "È ora possibile confrontare il proprio futuro finanziario in differenti paesi. Il sistema tiene conto di stipendi medi, costo della vita e fiscalità locale per offrire proiezioni personalizzate e confrontabili."
  },
  {
    title: "Piano Premium: nuova analisi indipendenza finanziaria",
    date: "Aprile 2025",
    desc: "I nuovi insight premium includono il calcolo degli anni all'indipendenza finanziaria e la copertura pensione.",
    longDesc: "Il piano Premium introduce strumenti avanzati per calcolare quanti anni mancano alla tua indipendenza finanziaria, basandosi sul tasso di risparmio attuale, rendimento degli investimenti e spese previste. Inclusa anche un'analisi dettagliata della copertura pensionistica."
  },
  {
    title: "Sicurezza avanzata: autenticazione 2FA",
    date: "Marzo 2025",
    desc: "Proteggi il tuo account con la verifica in due passaggi disponibile nelle Impostazioni.",
    longDesc: "Abbiamo introdotto l'autenticazione a due fattori (2FA) per proteggere al meglio il tuo account. Puoi attivare la verifica tramite app authenticator o SMS direttamente dalla sezione Impostazioni del tuo profilo."
  },
];

  return (
    <div style={{ padding: "0 0 60px 0" }}>
      <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48, width: "100%", maxWidth: 1000, marginBottom: 40, flexWrap: "wrap" }}>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, opacity: visible ? 1 : 0, transition: "opacity 0.8s ease", flexShrink: 0 }}>
            {[
              { h: barHeights[0], color: "rgba(59,130,246,0.6)" },
              { h: barHeights[1], color: "rgba(139,92,246,0.7)" },
              { h: barHeights[2], color: "rgba(59,130,246,0.4)" },
              { h: barHeights[3], color: "rgba(236,72,153,0.7)" },
              { h: barHeights[4], color: "rgba(139,92,246,0.5)" },
            ].map((bar, i) => (
              <div key={i} style={{ width: 24, height: bar.h, background: bar.color, borderRadius: "6px 6px 0 0", border: "1px solid rgba(255,255,255,0.15)", transition: `height 1.2s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s`, boxShadow: `0 0 14px ${bar.color}` }} />
            ))}
          </div>

          <div style={{ textAlign: "center", flexShrink: 1 }}>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, color: "white", letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s", textShadow: "0 0 60px rgba(59,130,246,0.4)" }}>
              Il tuo futuro<br />
              <span style={{ background: "linear-gradient(90deg, #3b82f6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>a portata di clic</span>
            </h1>
            <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.6, maxWidth: 380, margin: "16px auto 0", opacity: visible ? 0.65 : 0, transition: "opacity 1s ease 0.6s" }}>
              Simula la tua situazione finanziaria futura, pianifica obiettivi di vita e scopri il tuo potenziale economico.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "center", opacity: visible ? 1 : 0, transition: "opacity 1s ease 0.9s" }}>
              <button style={{ padding: "13px 28px", borderRadius: 14, border: "none", background: "linear-gradient(90deg,#2563eb,#ec4899)", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 28px rgba(37,99,235,0.45)", letterSpacing: "0.01em" }} onClick={() => setPage("scenario")}>
                ⚡ Inizia ora
              </button>
              <button style={{ padding: "13px 28px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.07)", color: "white", fontWeight: 600, fontSize: 15, cursor: "pointer", backdropFilter: "blur(10px)" }} onClick={() => setPage("dashboard")}>
                Dashboard
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flexShrink: 0, opacity: visible ? 1 : 0, transition: "opacity 1s ease 0.8s" }}>
            <svg width="160" height="90" viewBox="0 0 160 90">
              <polyline points="0,80 40,55 80,62 120,28 160,10" fill="none" stroke="rgba(59,130,246,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {[0,40,80,120,160].map((x, i) => {
                const y = [80,55,62,28,10][i];
                return <circle key={i} cx={x} cy={y} r="4" fill="#3b82f6" />;
              })}
            </svg>
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 16px", backdropFilter: "blur(10px)", textAlign: "center" }}>
              <div style={{ fontSize: 11, opacity: 0.55 }}>Rendimento medio</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>+6.4%</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px 48px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#f8fafc" }}>Novità & Aggiornamenti</h2>
    <div style={{ background: "linear-gradient(90deg,#2563eb,#7c3aed)", borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 800, color: "white", letterSpacing: "0.06em", textTransform: "uppercase" }}>NUOVO</div>
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
    {news.map((item, i) => (
      <div
        key={i}
        onClick={() => openModal(item)}
        style={{
          padding: "22px 20px",
          background: "rgba(12,16,35,0.80)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          transition: "background 0.2s, border-color 0.2s, transform 0.2s",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(20,30,60,0.90)"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.30)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(12,16,35,0.80)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.22)", color: "#60a5fa", padding: "3px 10px", borderRadius: 20, marginBottom: 12 }}>{item.date}</div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#f8fafc", lineHeight: 1.45 }}>{item.title}</div>
        <div style={{ fontSize: 13, color: "rgba(248,250,252,0.45)", lineHeight: 1.7 }}>{item.desc}</div>
        <div style={{ marginTop: 14, fontSize: 12, color: "#60a5fa", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>Leggi di più <span style={{ fontSize: 14 }}>→</span></div>
      </div>
    ))}
  </div>
</div>

<div style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px" }}>
  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
    <div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 6, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.07em" }}>Solo simulazioni</div>
      <div style={{ fontSize: 12, color: "rgba(248,250,252,0.35)", lineHeight: 1.75 }}>Tutti i dati mostrati sono puramente simulativi e a scopo educativo. Non costituiscono consulenza finanziaria, fiscale o legale.</div>
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 6, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.07em" }}>Privacy & Cookie</div>
      <div style={{ fontSize: 12, color: "rgba(248,250,252,0.35)", lineHeight: 1.75 }}>I dati inseriti non vengono condivisi con terze parti. Utilizziamo solo cookie tecnici essenziali.</div>
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 6, color: "#f9a8d4", textTransform: "uppercase", letterSpacing: "0.07em" }}>Termini d'uso</div>
      <div style={{ fontSize: 12, color: "rgba(248,250,252,0.35)", lineHeight: 1.75 }}>L'uso della piattaforma implica l'accettazione dei termini di servizio. I risultati sono a puro scopo illustrativo.</div>
    </div>
    <div style={{ gridColumn: "1 / -1", fontSize: 11, color: "rgba(248,250,252,0.20)", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      © 2025 WealthFuture — Piattaforma di simulazione finanziaria. Tutti i diritti riservati.
    </div>
  </div>
</div>
    </div>
  );
}

//#endregion

//#region DASHBOARD

function Dashboard({ history, plan, setPage }) {
  const last = history[0];
  const totalScenarios = history.length;
  const avgSalary = history.length ? history.reduce((a, b) => a + b.salary, 0) / history.length : 0;
  const totalWealth = history.reduce((a, b) => a + (b.pension || 0), 0);
  const avgHealth = history.length ? history.reduce((a, b) => a + b.health, 0) / history.length : 0;
  const bestScenario = history.reduce((best, h) => (!best || h.pension > best.pension ? h : best), null);
  const riskLevel = avgHealth > 75 ? "Basso" : avgHealth > 50 ? "Medio" : "Alto";
  const limit = PLAN_LIMITS[plan].simulations;
  const remaining = Math.max(0, limit - totalScenarios);

  const kpis = [
    { label: "Scenari creati", value: totalScenarios, unit: "" },
    { label: "Patrimonio simulato", value: `€ ${totalWealth.toFixed(0)}`, unit: "" },
    { label: "Stipendio medio", value: `€ ${avgSalary.toFixed(0)}`, unit: "" },
    { label: "Health finanziaria", value: `${avgHealth.toFixed(0)}`, unit: "/100" },
    { label: "Livello rischio", value: riskLevel, unit: "" },
    { label: "Miglior scenario", value: bestScenario ? `€ ${(bestScenario.pensioneMensile ?? 0).toLocaleString("it-IT")}/mese` : "—", unit: "" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Dashboard Finanziaria</h2>
        <div style={styles.planBar}>
          <span style={planBadgeStyle(plan)}>{PLAN_LIMITS[plan].label}</span>
          <span style={{ marginLeft: 12, opacity: 0.6, fontSize: 13 }}>
            {remaining === 0 ? "Limite simulazioni raggiunto" : `${totalScenarios} / ${limit} simulazioni · ${remaining} rimast${remaining === 1 ? "a" : "e"}`}
          </span>
          <button style={{ ...styles.smallButton, marginLeft: "auto" }} onClick={() => setPage("account")}>Upgrade</button>
        </div>
      </div>

      <div style={styles.kpiStrip}>
        {kpis.map((k, i) => (
          <div key={i} style={styles.kpiItem}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={styles.kpiValue}>{k.value}<span style={styles.kpiUnit}>{k.unit}</span></div>
          </div>
        ))}
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>🤖 AI Coach Finanziario</span>
          <span style={{ ...planBadgeStyle(plan), marginLeft: 10 }}>
            {PLAN_LIMITS[plan].aiCoach === "limitato" ? "Limitato" : PLAN_LIMITS[plan].aiCoach === "completo" ? "Completo" : "Avanzato"}
          </span>
        </div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Trend reddito</span><span style={styles.dataValue}>{avgSalary > 3500 ? "📈 Crescita stabile" : "📊 Fase di accumulo"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Capacità risparmio</span><span style={styles.dataValue}>{avgSalary > 4000 ? "Alta capacità" : "Media capacità"}</span></div>
        {plan !== "free" && (<div style={styles.dataRow}><span style={styles.dataLabel}>Stabilità portfolio</span><span style={styles.dataValue}>{avgHealth > 70 ? "Portafoglio stabile" : "Alta volatilità"}</span></div>)}
        {plan !== "free" && (<div style={styles.dataRow}><span style={styles.dataLabel}>Scenario dominante</span><span style={styles.dataValue}>{last ? `${last.country} · ${last.sector}` : "Nessun dato"}</span></div>)}
        {plan === "premium" && (<div style={styles.dataRow}><span style={styles.dataLabel}>Aggiornamento automatico dati</span><span style={{ ...styles.dataValue, color: "#22c55e" }}>● Attivo</span></div>)}
        {plan === "free" && (
          <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            ✨ Sblocca insight avanzati con il piano Pro o Premium
          </div>
        )}
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>⚡ Azioni rapide</span></div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Crea nuovo scenario</span>
          <button style={{ ...styles.smallButton, background: "rgba(37,99,235,0.2)", borderColor: "rgba(37,99,235,0.4)", color: "#60a5fa" }} onClick={() => setPage("scenario")}>+ Nuovo</button>
        </div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Report PDF {!PLAN_LIMITS[plan].reportPdf && <span style={{ fontSize: 11, color: "#f59e0b", marginLeft: 6 }}>Pro+</span>}</span>
          <button style={{ ...styles.smallButton, opacity: PLAN_LIMITS[plan].reportPdf ? 1 : 0.45, cursor: PLAN_LIMITS[plan].reportPdf ? "pointer" : "not-allowed" }} disabled={!PLAN_LIMITS[plan].reportPdf}>
            {PLAN_LIMITS[plan].reportPdf ? "Scarica" : "🔒 Scarica"}
          </button>
        </div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Esporta Excel {!PLAN_LIMITS[plan].exportExcel && <span style={{ fontSize: 11, color: "#f59e0b", marginLeft: 6 }}>Pro+</span>}</span>
          <button style={{ ...styles.smallButton, opacity: PLAN_LIMITS[plan].exportExcel ? 1 : 0.45, cursor: PLAN_LIMITS[plan].exportExcel ? "pointer" : "not-allowed" }} disabled={!PLAN_LIMITS[plan].exportExcel}>
            {PLAN_LIMITS[plan].exportExcel ? "Esporta" : "🔒 Esporta"}
          </button>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>📅 Attività recente</span>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "rgba(255,255,255,0.06)", borderRadius: 20, color: "rgba(255,255,255,0.45)" }}>
            {PLAN_LIMITS[plan].dashboardStorica === 0 ? "∞ Storico illimitato" : PLAN_LIMITS[plan].dashboardStorica >= 365 ? `Storico ${Math.round(PLAN_LIMITS[plan].dashboardStorica / 365)} anno` : `Storico ${PLAN_LIMITS[plan].dashboardStorica} giorni`}
          </span>
        </div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Ultimo scenario creato</span><span style={styles.dataValue}>{last ? last.date : "—"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Utilizzo piattaforma</span><span style={{ ...styles.dataValue, color: totalScenarios > 5 ? "#22c55e" : "rgba(255,255,255,0.7)" }}>{totalScenarios > 5 ? "● Attivo" : "○ Iniziale"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Frequenza simulazioni</span><span style={styles.dataValue}>{totalScenarios > 10 ? "Alta" : "Bassa"}</span></div>
      </div>
    </div>
  );
}

//#endregion

//#region SCENARIO
function Scenario({ history, setHistory, plan, setPage }) {
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);
  const [activeLine, setActiveLine] = useState(null);
  const [errors, setErrors] = useState({});

  const limit = PLAN_LIMITS[plan].simulations;
  const allowedLines = PLAN_LIMITS[plan].lines;
  const limitReached = history.length >= limit;

  function run() {
    const newErrors = {};
    if (!data.age) newErrors.age = true;
    if (data.hasHome === undefined) newErrors.hasHome = true;
    if (data.hasHome === false && !data.homeAge) newErrors.homeAge = true;
    if (data.hasCar === undefined) newErrors.hasCar = true;
    if (data.hasCar === false && !data.carAge) newErrors.carAge = true;
    if (!data.salary) newErrors.salary = true;
    if (!data.savings) newErrors.savings = true;
    if (!data.sector) newErrors.sector = true;
    if (!data.country) newErrors.country = true;
    if (!data.expenses) newErrors.expenses = true;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});

    const salary   = Number(data.salary);
    const savings  = Number(data.savings);
    const age      = Number(data.age);
    const expenses = Number(data.expenses);
    const homeAge  = data.hasHome ? age : Number(data.homeAge);
    const carAge   = data.hasCar  ? age : Number(data.carAge);

    if (age < 16 || age > 100)          { alert("Età non valida"); return; }
    if (homeAge < age || homeAge > 100) { alert("L'età acquisto casa deve essere ≥ età attuale"); return; }
    if (carAge  < age || carAge  > 100) { alert("L'età acquisto auto deve essere ≥ età attuale"); return; }

    // ── Crescita stipendio per settore ──────────────────────────
    const sectorGrowth = {
      "IT e Software":         0.050,
      "Banche e Finanza":      0.045,
      "Energia":               0.040,
      "Sanità":                0.035,
      "Architettura e Design": 0.030,
      "Costruzioni":           0.030,
      "Commercio":             0.025,
      "Logistica":             0.025,
      "Comunicazione":         0.025,
      "Educazione":            0.020,
      "Arte e Cultura":        0.020,
      "Turismo":               0.020,
      "Agricoltura":           0.018,
      "Altro":                 0.025,
    };
    const growth = sectorGrowth[data.sector] ?? 0.025;

    // ── 1. SCORE FINANZIARIO (0–100) ────────────────────────────
    const surplusRate     = salary > 0 ? (salary - expenses) / salary : 0;
    const emergencyMonths = expenses > 0 ? savings / expenses : 0;
    const debtCapacity    = salary > 0 ? Math.max(1 - expenses / salary, 0) : 0;
    const ageBonus        = age < 35 ? 10 : age < 50 ? 5 : 0;
    // Normalizzazione: evita che surplus altissimi (es. 89%) gonfino lo score
    const surplusScore  = Math.min(surplusRate / 0.50, 1) * 40;
    const emergencyScore = (Math.min(emergencyMonths, 12) / 12) * 30;
    const debtScore     = Math.min(debtCapacity / 0.50, 1) * 20;
    const health        = Math.round(Math.min(surplusScore + emergencyScore + debtScore + ageBonus, 100));

    // ── Helper: interesse composto + contributi fissi al 20% ────
    // contribRate fisso: evita che surplus irrisori o altissimi distorcano
    function projectCapital(years, annualReturn, contribRate = 0.20) {
      let sal = salary;
      let cap = savings;
      for (let i = 0; i < years; i++) {
        sal *= 1 + growth;
        cap  = cap * (1 + annualReturn) + sal * 12 * contribRate;
      }
      return Math.round(cap);
    }

    // ── 2. MUTUO MAX (stipendio attuale, non proiettato) ────────
    const maxMortgageRate      = Math.round(salary * 0.30);
    const mortgageRate         = 0.035 / 12;
    const mortgageMonths       = 25 * 12;
    const pvMortgage           = (1 - Math.pow(1 + mortgageRate, -mortgageMonths)) / mortgageRate;
    const mortgageCapacity     = Math.round(maxMortgageRate * pvMortgage);
    const affordableHousePrice = Math.round(mortgageCapacity / 0.80 + savings * 0.50);

    // ── 3. FINANZIAMENTO AUTO (stipendio attuale) ───────────────
    const maxLoanRate     = Math.round(salary * 0.15);
    const carRate         = 0.06 / 12;
    const carMonths       = 5 * 12;
    const pvCar           = (1 - Math.pow(1 + carRate, -carMonths)) / carRate;
    const carLoanCapacity = Math.round(maxLoanRate * pvCar);

    // ── 4. PENSIONE (contribuzione fissa 20%, SWR 4%) ───────────
    const retirementAge     = 67;
    const yearsToRetirement = Math.max(0, retirementAge - age);
    const pension           = projectCapital(yearsToRetirement, 0.05, 0.20);
    const pensioneMensile   = Math.round((pension * 0.04) / 12);

    // ── 5. PATRIMONIO OGNI 10 ANNI (contribuzione fissa 20%) ────
    const wealth = {
      10: { pess: projectCapital(10, 0.03, 0.20), norm: projectCapital(10, 0.05, 0.20), real: projectCapital(10, 0.08, 0.20) },
      20: { pess: projectCapital(20, 0.03, 0.20), norm: projectCapital(20, 0.05, 0.20), real: projectCapital(20, 0.08, 0.20) },
      30: { pess: projectCapital(30, 0.03, 0.20), norm: projectCapital(30, 0.05, 0.20), real: projectCapital(30, 0.08, 0.20) },
    };

    // ── 6. TASSO DI RISPARMIO ────────────────────────────────────
    const monthlySurplus = salary - expenses;
    const savingsRate    = salary > 0 ? Math.round((monthlySurplus / salary) * 100) : 0;

    // ── 7. COPERTURA PENSIONE ────────────────────────────────────
    // rendita mensile / stipendio attuale × 100
    const breakEvenRetirement = salary > 0
      ? Math.round((pensioneMensile / salary) * 100)
      : 0;

    // ── 8. ANNI AL FIRE ──────────────────────────────────────────
    // target = spese annue × 25 (regola del 4%)
    // simulazione iterativa con rendimento 6%
    const targetFIRE   = expenses * 12 * 25;
    const surplusAnnuo = monthlySurplus * 12;
    let anniFIRE = null;
    if (monthlySurplus > 0) {
      let cap = savings, anni = 0;
      while (cap < targetFIRE && anni < 100) {
        cap = cap * 1.06 + surplusAnnuo;
        anni++;
      }
      anniFIRE = cap >= targetFIRE ? anni : null;
    }

    const res = {
      id: Date.now(), date: new Date().toLocaleDateString(),
      age, country: data.country, sector: data.sector, salary, savings,
      growth, health, pension, pensioneMensile, wealth,
      homeAge, carAge, maxMortgageRate, mortgageCapacity, affordableHousePrice,
      maxLoanRate, carLoanCapacity,
      monthlyExpenses: expenses, monthlySurplus, savingsRate,
      breakEvenRetirement,
      yearsToFinancialIndependence: anniFIRE,
      hasHome: data.hasHome, hasCar: data.hasCar,
    };

    setResult(res);
    setHistory(prev => [res, ...prev]);
  }

  if (limitReached && !result) {
    return (
      <div style={styles.center}>
        <div style={styles.narrowCard}>
          <h2 style={{ margin: "0 0 12px", fontSize: 20 }}>Limite raggiunto</h2>
          <p style={{ opacity: 0.6, lineHeight: 1.7, margin: "0 0 20px" }}>
            Hai esaurito le simulazioni disponibili con il piano <b>{PLAN_LIMITS[plan].label}</b>. Passa a un piano superiore per continuare.
          </p>
          <button style={styles.button} onClick={() => setPage("account")}>Scopri i piani</button>
        </div>
      </div>
    );
  }

  const orizzonteAnni = PLAN_LIMITS[plan].orizzonteAnni;
  const allChartPoints = [
    { years: 10, pessimistico: result?.wealth[10].pess, normale: result?.wealth[10].norm, ottimistico: result?.wealth[10].real },
    { years: 20, pessimistico: result?.wealth[20].pess, normale: result?.wealth[20].norm, ottimistico: result?.wealth[20].real },
    { years: 30, pessimistico: result?.wealth[30].pess, normale: result?.wealth[30].norm, ottimistico: result?.wealth[30].real },
    { years: 40, pessimistico: result?.wealth[30].pess * 1.10, normale: result?.wealth[30].norm * 1.20, ottimistico: result?.wealth[30].real * 1.50 },
    { years: 50, pessimistico: result?.wealth[30].pess * 1.20, normale: result?.wealth[30].norm * 1.35, ottimistico: result?.wealth[30].real * 1.70 },
    { years: 60, pessimistico: result?.wealth[30].pess * 1.25, normale: result?.wealth[30].norm * 1.50, ottimistico: result?.wealth[30].real * 2.00 },
    { years: 70, pessimistico: result?.wealth[30].pess * 1.30, normale: result?.wealth[30].norm * 1.70, ottimistico: result?.wealth[30].real * 2.30 },
    { years: 80, pessimistico: result?.wealth[30].pess * 1.35, normale: result?.wealth[30].norm * 2.00, ottimistico: result?.wealth[30].real * 2.80 },
  ];
  const chartData = allChartPoints.filter(p => p.years <= orizzonteAnni);

  return (
    <div style={styles.center}>
      {!result ? (
        <div style={styles.narrowCard}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Nuovo Scenario</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={planBadgeStyle(plan)}>{PLAN_LIMITS[plan].label}</span>
              <span style={{ opacity: 0.45, fontSize: 13 }}>{history.length} / {limit} simulazioni</span>
            </div>
          </div>

          {/* ── Sezione: Dati personali ── */}
          <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>📍 Dati personali</div>
            <div style={styles.field}>
              <label style={styles.label}>Età</label>
              <input type="number" min={16} max={100}
                style={{ ...styles.input, borderColor: errors.age ? "rgba(239,68,68,0.8)" : undefined }}
                value={data.age || ""}
                onChange={(e) => setData({ ...data, age: e.target.value })} />
              {errors.age && <div style={styles.fieldError}><span>⚠</span> Campo obbligatorio</div>}
            </div>
          </div>

          {/* ── Sezione: Situazione finanziaria ── */}
          <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: 16, marginTop: 8 }}>💰 Situazione finanziaria</div>
            {[
              { key: "salary",   label: "Stipendio netto mensile (€)", type: "number" },
              { key: "savings",  label: "Risparmi attuali (€)",        type: "number" },
              { key: "expenses", label: "Spese mensili (€)",           type: "number", min: 0, step: 50 },
            ].map(({ key, label, type, min, step }) => (
              <div key={key} style={styles.field}>
                <label style={styles.label}>{label}</label>
                <input type={type} min={min} step={step}
                  style={{ ...styles.input, borderColor: errors[key] ? "rgba(239,68,68,0.8)" : undefined }}
                  value={data[key] || ""}
                  onChange={(e) => setData({ ...data, [key]: e.target.value })} />
                {errors[key] && <div style={styles.fieldError}><span>⚠</span> Campo obbligatorio</div>}
              </div>
            ))}
          </div>

          {/* ── Sezione: Acquisti previsti ── */}
          <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: 16, marginTop: 8 }}>🏠 Acquisti previsti</div>

          <div style={styles.field}>
            <label style={styles.label}>Possiedi una casa?</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["Sì", "No"].map((opt) => (
                <button key={opt} type="button"
                  onClick={() => setData({ ...data, hasHome: opt === "Sì", homeAge: opt === "Sì" ? data.age : data.homeAge })}
                  style={{ flex: 1, padding: "11px", borderRadius: 11, border: data.hasHome === (opt === "Sì") ? "1px solid rgba(59,130,246,0.8)" : "1px solid rgba(255,255,255,0.15)", background: data.hasHome === (opt === "Sì") ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                  {opt}
                </button>
              ))}
            </div>
            {errors.hasHome && <div style={styles.fieldError}><span>⚠</span> Campo obbligatorio</div>}
          </div>

          {data.hasHome === false && (
            <div style={styles.field}>
              <label style={styles.label}>Età prevista acquisto casa</label>
              <input type="number" min={data.age || 16} max={100}
                style={{ ...styles.input, borderColor: errors.homeAge ? "rgba(239,68,68,0.8)" : undefined }}
                value={data.homeAge || ""}
                onChange={(e) => setData({ ...data, homeAge: e.target.value })} />
              {errors.homeAge && <div style={styles.fieldError}><span>⚠</span> Campo obbligatorio</div>}
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Possiedi una macchina?</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["Sì", "No"].map((opt) => (
                <button key={opt} type="button"
                  onClick={() => setData({ ...data, hasCar: opt === "Sì", carAge: opt === "Sì" ? data.age : data.carAge })}
                  style={{ flex: 1, padding: "11px", borderRadius: 11, border: data.hasCar === (opt === "Sì") ? "1px solid rgba(59,130,246,0.8)" : "1px solid rgba(255,255,255,0.15)", background: data.hasCar === (opt === "Sì") ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                  {opt}
                </button>
              ))}
            </div>
            {errors.hasCar && <div style={styles.fieldError}><span>⚠</span> Campo obbligatorio</div>}
          </div>

          {data.hasCar === false && (
            <div style={styles.field}>
              <label style={styles.label}>Età prevista acquisto macchina</label>
              <input type="number" min={data.age || 16} max={100}
                style={{ ...styles.input, borderColor: errors.carAge ? "rgba(239,68,68,0.8)" : undefined }}
                value={data.carAge || ""}
                onChange={(e) => setData({ ...data, carAge: e.target.value })} />
              {errors.carAge && <div style={styles.fieldError}><span>⚠</span> Campo obbligatorio</div>}
            </div>
          )}
          </div>{/* chiude sezione acquisti previsti */}

          <div style={styles.field}>
            <label style={styles.label}>Paese di residenza</label>
            <select style={{ ...styles.input, borderColor: errors.country ? "rgba(239,68,68,0.8)" : undefined }}
              value={data.country || ""} onChange={(e) => setData({ ...data, country: e.target.value })}>
              <option style={{ color: "#000" }}></option>
              {countries.map((c) => <option key={c} value={c} style={{ color: "#000", background: "#fff" }}>{c}</option>)}
            </select>
            {errors.country && <div style={styles.fieldError}><span>⚠</span> Campo obbligatorio</div>}
          </div>

{/* ── Sezione: Contesto lavorativo ── */}
          <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: 16, marginTop: 8 }}>💼 Contesto lavorativo</div>


          <div style={styles.field}>
            <label style={styles.label}>Settore lavorativo</label>
            <select style={{ ...styles.input, borderColor: errors.sector ? "rgba(239,68,68,0.8)" : undefined }}
              value={data.sector || ""} onChange={(e) => setData({ ...data, sector: e.target.value })}>
              <option style={{ color: "#000" }}></option>
              {sectors.map((s) => <option key={s} value={s} style={{ color: "#000", background: "#fff" }}>{s}</option>)}
            </select>
            {errors.sector && <div style={styles.fieldError}><span>⚠</span> Campo obbligatorio</div>}
          </div>
          </div>{/* chiude sezione contesto lavorativo */}

          <button
            style={{ ...styles.button, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onClick={run}
            onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            ⚡ Calcola scenario
          </button>
        </div>

      ) : (
        <div style={{ ...styles.narrowCard, maxWidth: 700 }}>
          <div style={{ marginBottom: 28, padding: "20px 22px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Risultato simulazione</h2>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{result.country} · {result.sector} · {result.age} anni</div>
          </div>

          {/* ── KPI strip ── */}
          <div style={styles.kpiStrip}>
            <div style={styles.kpiItem}>
              <div style={styles.kpiLabel}>Score finanziario</div>
              <div style={styles.kpiValue}>{result.health}<span style={styles.kpiUnit}>/100</span></div>
              <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>
                {plan === "free" ? "Base" : plan === "pro" ? "Avanzato" : "Professionale"}
              </div>
            </div>
            {!result.hasHome && (
              <div style={styles.kpiItem}>
                <div style={styles.kpiLabel}>Rata mutuo max</div>
                <div style={styles.kpiValue}>€ {result.maxMortgageRate.toLocaleString("it-IT")}<span style={styles.kpiUnit}>/m</span></div>
              </div>
            )}
            {!result.hasCar && (
              <div style={styles.kpiItem}>
                <div style={styles.kpiLabel}>Rata auto max</div>
                <div style={styles.kpiValue}>€ {result.maxLoanRate.toLocaleString("it-IT")}<span style={styles.kpiUnit}>/m</span></div>
              </div>
            )}
          </div>

          <div style={styles.divider} />

          {/* ── Pensione ── */}
          {PLAN_LIMITS[plan].simulazionePensione ? (
            <div style={styles.section}>
              <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Pensione stimata</span></div>
              <div style={styles.dataRow}>
                <span style={styles.dataLabel}>Capitale accumulato a 67 anni</span>
                <span style={{ ...styles.dataValue, color: "#22c55e", fontWeight: 700 }}>
                  € {result.pension.toLocaleString("it-IT")}
                </span>
              </div>
              <div style={styles.dataRow}>
                <span style={styles.dataLabel}>Rendita mensile stimata (SWR 4%)</span>
                <span style={{ ...styles.dataValue, color: "#22c55e", fontWeight: 700 }}>
                  € {result.pensioneMensile.toLocaleString("it-IT")} / mese
                </span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.4, padding: "12px 0" }}>
              Simulazione pensione disponibile dal piano Pro
            </div>
          )}

          {/* ── Analisi Pro / Premium ── */}
          {plan !== "free" && (
            <>
              <div style={styles.divider} />
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionTitle}>{plan === "premium" ? "Analisi Premium" : "Analisi Pro"}</span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Surplus mensile</span>
                  <span style={styles.dataValue}>€ {result.monthlySurplus.toLocaleString("it-IT")}</span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Tasso di risparmio</span>
                  <span style={styles.dataValue}>{result.savingsRate}%
                    <span style={{ fontSize: 11, opacity: 0.45, marginLeft: 6 }}>
                      {result.savingsRate >= 35 ? "· eccellente" : result.savingsRate >= 20 ? "· buono" : result.savingsRate >= 10 ? "· nella media" : "· basso"}
                    </span>
                  </span>
                </div>
                {PLAN_LIMITS[plan].confrontoScelte && (
                  <>
                    <div style={styles.dataRow}>
                      <span style={styles.dataLabel}>Casa acquistabile (stima)</span>
                      <span style={styles.dataValue}>€ {result.affordableHousePrice?.toLocaleString("it-IT") ?? "—"}</span>
                    </div>
                    <div style={styles.dataRow}>
                      <span style={styles.dataLabel}>Mutuo erogabile totale</span>
                      <span style={styles.dataValue}>€ {result.mortgageCapacity.toLocaleString("it-IT")}</span>
                    </div>
                    <div style={styles.dataRow}>
                      <span style={styles.dataLabel}>Auto finanziabile (totale)</span>
                      <span style={styles.dataValue}>€ {result.carLoanCapacity.toLocaleString("it-IT")}</span>
                    </div>
                  </>
                )}
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Copertura pensione</span>
                  <span style={styles.dataValue}>{result.breakEvenRetirement}% stipendio attuale
                    <span style={{ fontSize: 11, opacity: 0.45, marginLeft: 6 }}>
                      {result.breakEvenRetirement >= 80 ? "· ottima" : result.breakEvenRetirement >= 60 ? "· adeguata" : result.breakEvenRetirement >= 40 ? "· insufficiente" : "· critica"}
                    </span>
                  </span>
                </div>
                {result.yearsToFinancialIndependence && (
                  <div style={styles.dataRow}>
                    <span style={styles.dataLabel}>Anni all'indipendenza finanziaria (FIRE)</span>
                    <span style={styles.dataValue}>{result.yearsToFinancialIndependence} anni</span>
                  </div>
                )}
                {!result.yearsToFinancialIndependence && (
                  <div style={styles.dataRow}>
                    <span style={styles.dataLabel}>Anni all'indipendenza finanziaria (FIRE)</span>
                    <span style={{ ...styles.dataValue, opacity: 0.4 }}>Non raggiungibile con risparmio attuale</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div style={styles.divider} />

          {/* ── Grafico patrimonio ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>Patrimonio stimato</span>
              <span style={{ fontSize: 12, opacity: 0.4 }}>fino a {orizzonteAnni} anni</span>
            </div>
            {plan === "free" && (
              <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 8 }}>
                Scenari pessimistico e ottimistico disponibili dal piano Pro
              </div>
            )}
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="years" type="number" domain={[10, orizzonteAnni]}
                    ticks={allChartPoints.filter(p => p.years <= orizzonteAnni).map(p => p.years)}
                    label={{ value: "Anni", position: "insideBottom", offset: -10 }}
                    stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => new Intl.NumberFormat("it-IT", { notation: "compact", maximumFractionDigits: 1 }).format(v)}
                    stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = payload.find((p) => p.dataKey === activeLine);
                    if (!item) return null;
                    return (
                      <div style={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: 10, color: "white" }}>
                        <div style={{ color: item.stroke, fontWeight: 700, marginBottom: 4, fontSize: 12 }}>{item.dataKey}</div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>€ {Number(item.value).toLocaleString("it-IT")}</div>
                        <div style={{ opacity: 0.45, marginTop: 4, fontSize: 11 }}>{label} anni</div>
                      </div>
                    );
                  }} />
                  <Legend verticalAlign="bottom" height={40} wrapperStyle={{ paddingTop: 25 }} />
                  {allowedLines.includes("pessimistico") && (
                    <Line type="monotone" dataKey="pessimistico" stroke="#f87171" strokeWidth={2.5} dot={false} activeDot={{ r: 7, fill: "#f87171" }} onMouseEnter={() => setActiveLine("pessimistico")} />
                  )}
                  <Line type="monotone" dataKey="normale" stroke="#60a5fa" strokeWidth={2.5} dot={false} activeDot={{ r: 7, fill: "#60a5fa" }} onMouseEnter={() => setActiveLine("normale")} />
                  {allowedLines.includes("ottimistico") && (
                    <Line type="monotone" dataKey="ottimistico" stroke="#34d399" strokeWidth={2.5} dot={false} activeDot={{ r: 7, fill: "#34d399" }} onMouseEnter={() => setActiveLine("ottimistico")} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {(PLAN_LIMITS[plan].reportPdf || PLAN_LIMITS[plan].exportExcel) && (
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {PLAN_LIMITS[plan].reportPdf   && <button style={{ ...styles.smallButton, padding: "8px 16px" }}>Scarica PDF</button>}
              {PLAN_LIMITS[plan].exportExcel && <button style={{ ...styles.smallButton, padding: "8px 16px" }}>Esporta Excel</button>}
            </div>
          )}
          {plan === "free" && (
            <div style={{ fontSize: 12, opacity: 0.35, marginBottom: 12 }}>
              Report PDF ed Esportazione Excel disponibili dal piano Pro
            </div>
          )}

          <button style={styles.button} onClick={() => { setResult(null); setData({}); setErrors({}); }}>
            Nuovo Scenario
          </button>
        </div>
      )}
    </div>
  );
}
//#endregion

//#region HISTORY

function History({ history, setHistory }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Storico Scenari</h2>
      </div>

      {history.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 20px", textAlign: "center", gap: 16 }}>
          <div style={{ fontSize: 48, opacity: 0.3 }}>📁</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Nessuno scenario salvato</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", maxWidth: 320, lineHeight: 1.6 }}>Crea il tuo primo scenario per iniziare a tracciare la tua situazione finanziaria futura.</div>
        </div>
      )}

      <div style={{ maxWidth: 680 }}>
        {history.filter(Boolean).map((h) => {
          if (!h) return null;
          const open = openId === h.id;
          const pension = Number(h?.pension ?? 0);
          const mortgage = Number(h?.maxMortgageRate ?? 0);
          const health = Number(h?.health ?? 0);
          const healthColor = health >= 70 ? "#34d399" : health >= 40 ? "#f59e0b" : "#f87171";

          return (
            <div key={h.id} style={{ marginBottom: 10, background: open ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)", border: open ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px", transition: "background 0.2s, border-color 0.2s" }}
              onMouseEnter={e => { if (!open) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}}
              onMouseLeave={e => { if (!open) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📊</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{h?.country || "—"} · {h?.sector || "—"}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>📅 {h?.date}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: healthColor, background: `${healthColor}15`, padding: "4px 10px", borderRadius: 20, border: `1px solid ${healthColor}30` }}>Score {health}/100</span>
                  <div onClick={() => setOpenId(open ? null : h.id)} style={{ cursor: "pointer", width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, userSelect: "none", color: "rgba(255,255,255,0.6)" }}>
                    {open ? "−" : "+"}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setHistory((prev) => prev.filter((s) => s.id !== h.id)); if (openId === h.id) setOpenId(null); }}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "rgba(239,68,68,0.85)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                  >
                    Elimina
                  </button>
                </div>
              </div>

              {open && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.4, marginBottom: 10 }}>Dati inseriti</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 32px", marginBottom: 20 }}>
                    {[
                      { label: "Età", value: `${h.age} anni` },
                      { label: "Paese", value: h.country },
                      { label: "Settore", value: h.sector },
                      { label: "Stipendio netto mensile", value: `€ ${Number(h.salary).toLocaleString("it-IT")}` },
                      { label: "Risparmi attuali", value: `€ ${Number(h.savings).toLocaleString("it-IT")}` },
                      { label: "Spese mensili", value: `€ ${Number(h.monthlyExpenses ?? 0).toLocaleString("it-IT")}` },
                      { label: "Età acquisto casa", value: `${h.homeAge} anni` },
                      { label: "Età acquisto auto", value: `${h.carAge} anni` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 11, opacity: 0.4, marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.4, marginBottom: 10 }}>Risultati</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 32px" }}>
                    {[
                      { label: "Score finanziario", value: `${health}/100` },
                      { label: "Mutuo max mensile", value: `€ ${mortgage.toFixed(0)}` },
                      { label: "Capacità mutuo totale", value: `€ ${Number(h.mortgageCapacity ?? 0).toFixed(0)}` },
                      { label: "Finanziamento auto mensile", value: `€ ${Number(h.maxLoanRate ?? 0).toFixed(0)}` },
                      { label: "Capacità finanziamento auto", value: `€ ${Number(h.carLoanCapacity ?? 0).toFixed(0)}` },
                      { label: "Capitale pensione a 67 anni", value: `€ ${pension.toFixed(0)}`, highlight: true },
{ label: "Rendita mensile (SWR 4%)", value: `€ ${Number(h.pensioneMensile ?? 0).toLocaleString("it-IT")} / mese`, highlight: true },
                      { label: "Casa acquistabile (stima)", value: h.affordableHousePrice ? `€ ${Number(h.affordableHousePrice).toFixed(0)}` : "—" },
                      { label: "Surplus mensile", value: `€ ${Number(h.monthlySurplus ?? 0).toFixed(0)}` },
                      { label: "Tasso di risparmio", value: `${h.savingsRate ?? 0}%` },
                      { label: "Copertura pensione", value: `${h.breakEvenRetirement ?? 0}% stipendio` },
                      ...(h.yearsToFinancialIndependence ? [{ label: "Anni all'indipendenza fin.", value: `${h.yearsToFinancialIndependence} anni` }] : []),
                    ].map(({ label, value, highlight }) => (
                      <div key={label} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 11, opacity: 0.4, marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: highlight ? "#22c55e" : "white" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

//#endregion

//#region ACCOUNT

function Account({ history, plan, setPlan }) {
  const total = history.length;
  const last = history[0];
  const avgSalary = history.length ? history.reduce((a, b) => a + b.salary, 0) / history.length : 0;
  const totalWealth = history.reduce((a, b) => a + (b.pension || 0), 0);
  const bestScenario = history.reduce((best, h) => (!best || h.pension > best.pension ? h : best), null);
  const avgHealth = history.length ? history.reduce((a, b) => a + b.health, 0) / history.length : 0;
  const [accountMsg, setAccountMsg] = useState("");
  function showMsg(msg, duration = 2800) {
    setAccountMsg(msg);
    setTimeout(() => setAccountMsg(""), duration);
  }
  function handleExportPDF() {
    if (!PLAN_LIMITS[plan].reportPdf) return;
    showMsg("📄 Export PDF avviato — funzionalità in arrivo.");
  }
  function handleExportExcel() {
    if (!PLAN_LIMITS[plan].exportExcel) return;
    showMsg("📊 Export Excel avviato — funzionalità in arrivo.");
  }
  function handleGestisci() {
    showMsg("🔒 Gestione sicurezza account — funzionalità in arrivo.");
  }

  const planDefs = [
    {
      id: "free", label: "Free", price: "€ 0", priceNote: "per sempre",
      features: ["1 simulazione / mese","Orizzonte 10 anni","Solo scenario realistico","Score finanziario base","Dashboard 30 giorni","AI Coach limitato","— Pensione, PDF, Excel","— Confronto scelte di vita"],
    },
    {
      id: "pro", label: "Pro", price: "€ 9,99", priceNote: "/ mese", popular: true,
      features: ["5 simulazioni / mese","Orizzonte 30 anni","Ottimistico, realistico, pessimistico","Score finanziario avanzato","Dashboard 1 anno","AI Coach completo","Simulazione pensione","Report PDF & Excel","Confronto scelte di vita"],
    },
    {
      id: "premium", label: "Premium", price: "€ 19,99", priceNote: "/ mese",
      features: ["20 simulazioni / mese","Orizzonte 70 anni","Ottimistico, realistico, pessimistico","Score finanziario professionale","Dashboard storica illimitata","AI Coach avanzato","Simulazione pensione","Report PDF & Excel","Confronto scelte di vita","Aggiornamento automatico dati"],
    },
  ];

  return (
    <div style={styles.page}>
      {accountMsg && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "rgba(30,30,50,0.97)", border: "1px solid rgba(255,255,255,0.15)", color: "white", padding: "12px 24px", borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 99999, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", whiteSpace: "nowrap" }}>
          {accountMsg}
        </div>
      )}
      <div style={styles.pageHeader}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Account</div>
          <h2 style={styles.pageTitle}>WealthFuture {PLAN_LIMITS[plan]?.label}</h2>
          <div style={{ opacity: 0.5, fontSize: 14 }}>Profilo di simulazione finanziaria avanzata</div>
        </div>
      </div>

      <div style={styles.kpiStrip}>
        <div style={styles.kpiItem}><div style={styles.kpiLabel}>Scenari creati</div><div style={styles.kpiValue}>{total}</div></div>
        <div style={styles.kpiItem}><div style={styles.kpiLabel}>Patrimonio simulato</div><div style={styles.kpiValue}>€ {totalWealth.toFixed(0)}</div></div>
        <div style={styles.kpiItem}><div style={styles.kpiLabel}>Stipendio medio</div><div style={styles.kpiValue}>€ {avgSalary.toFixed(0)}</div></div>
        <div style={styles.kpiItem}><div style={styles.kpiLabel}>Health medio</div><div style={styles.kpiValue}>{avgHealth.toFixed(0)}<span style={styles.kpiUnit}>/100</span></div></div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Piano attivo</span></div>
        <p style={{ opacity: 0.45, fontSize: 13, margin: "0 0 24px" }}>Scegli il piano più adatto alle tue esigenze.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {planDefs.map((p) => {
            const isActive = plan === p.id;
            const accentColor = p.id === "premium" ? "#f59e0b" : p.id === "pro" ? "#3b82f6" : "rgba(255,255,255,0.4)";
            const accentBg    = p.id === "premium" ? "rgba(245,158,11,0.08)" : p.id === "pro" ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.03)";
            return (
              <div key={p.id} onClick={() => setPlan(p.id)} style={{ padding: "24px 22px", background: isActive ? accentBg : "rgba(255,255,255,0.03)", border: isActive ? `1.5px solid ${accentColor}` : "1px solid rgba(255,255,255,0.08)", cursor: "pointer", position: "relative", transition: "all 0.25s", borderRadius: 16, boxShadow: isActive ? `0 0 24px ${accentColor}22` : "none" }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}}
              >
                {p.popular && (
                  <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#3b82f6,#ec4899)", color: "white", fontSize: 10, padding: "3px 14px", borderRadius: 20, fontWeight: 800, whiteSpace: "nowrap", letterSpacing: "0.06em" }}>PIÙ POPOLARE</div>
                )}
                {isActive && (
                  <div style={{ position: "absolute", top: 14, right: 14, width: 20, height: 20, borderRadius: "50%", background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#000" }}>✓</div>
                )}
                <span style={planBadgeStyle(p.id)}>{p.label}</span>
                <div style={{ fontSize: 26, fontWeight: 900, margin: "12px 0 2px", letterSpacing: "-0.03em", color: isActive ? accentColor : "white" }}>{p.price}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 18 }}>{p.priceNote}</div>
                {p.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: f.startsWith("—") ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.72)", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}>{f.startsWith("—") ? "✗" : "✓"}</span>
                    <span>{f.replace("—", "")}</span>
                  </div>
                ))}
                {!isActive && (
                  <button style={{ ...styles.smallButton, marginTop: 18, width: "100%", borderColor: accentColor, color: accentColor }} onClick={(e) => { e.stopPropagation(); setPlan(p.id); }}>
                    {plan === "premium" && p.id !== "premium" ? "Passa a " + p.label : "Attiva " + p.label}
                  </button>
                )}
                {isActive && <div style={{ marginTop: 18, fontSize: 13, color: accentColor, fontWeight: 700 }}>✓ Piano attivo</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>📈 Insights finanziari</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Miglior scenario</span><span style={{ ...styles.dataValue, color: "#34d399" }}>{bestScenario ? `€ ${bestScenario.pension.toFixed(0)}` : "—"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Scenario dominante</span><span style={styles.dataValue}>{last ? `${last.country} · ${last.sector}` : "—"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Capacità finanziaria</span><span style={styles.dataValue}>{avgSalary > 4000 ? "🔥 Alta" : "📊 Media"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Livello utente</span><span style={{ ...styles.dataValue, color: total > 10 ? "#f59e0b" : "white" }}>{total > 10 ? "⭐ Power user" : "Base user"}</span></div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>⚙️ Azioni account</span></div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Esporta dati PDF {!PLAN_LIMITS[plan].reportPdf && <span style={{ fontSize: 11, color: "#f59e0b", marginLeft: 6 }}>Pro+</span>}</span>
          <button style={{ ...styles.smallButton, opacity: PLAN_LIMITS[plan].reportPdf ? 1 : 0.45, cursor: PLAN_LIMITS[plan].reportPdf ? "pointer" : "not-allowed" }} disabled={!PLAN_LIMITS[plan].reportPdf} onClick={handleExportPDF}>
            {PLAN_LIMITS[plan].reportPdf ? "PDF" : "🔒 PDF"}
          </button>
        </div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Esporta Excel {!PLAN_LIMITS[plan].exportExcel && <span style={{ fontSize: 11, color: "#f59e0b", marginLeft: 6 }}>Pro+</span>}</span>
          <button style={{ ...styles.smallButton, opacity: PLAN_LIMITS[plan].exportExcel ? 1 : 0.45, cursor: PLAN_LIMITS[plan].exportExcel ? "pointer" : "not-allowed" }} disabled={!PLAN_LIMITS[plan].exportExcel} onClick={handleExportExcel}>
            {PLAN_LIMITS[plan].exportExcel ? "Excel" : "🔒 Excel"}
          </button>
        </div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Sicurezza account</span>
          <button style={styles.smallButton} onClick={handleGestisci}>Gestisci</button>
        </div>
      </div>
    </div>
  );
}

//#endregion

//#region SETTINGS

function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div onClick={() => setOn(!on)} style={{ width: 44, height: 24, borderRadius: 99, background: on ? "#10b981" : "rgba(255,255,255,0.12)", border: on ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.15)", cursor: "pointer", position: "relative", transition: "background 0.25s, border-color 0.25s", flexShrink: 0, boxShadow: on ? "0 0 10px rgba(16,185,129,0.4)" : "none" }}>
      <div style={{ position: "absolute", top: 2, left: on ? 22 : 2, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
    </div>
  );
}

function Settings() {
  const [settingsMsg, setSettingsMsg] = useState("");
  const [resetConfirm, setResetConfirm] = useState(false);
  function showMsg(msg, duration = 2800) {
    setSettingsMsg(msg);
    setTimeout(() => setSettingsMsg(""), duration);
  }
  function handleCambiaPassword() {
    showMsg("🔑 Cambio password — funzionalità in arrivo.");
  }
  function handleAttiva2FA() {
    showMsg("🛡️ Autenticazione 2FA — funzionalità in arrivo.");
  }
  function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 4000);
    } else {
      setResetConfirm(false);
      showMsg("🗑️ Account resettato — tutti i dati locali eliminati.");
    }
  }
  return (
    <div style={styles.page}>
      {settingsMsg && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "rgba(30,30,50,0.97)", border: "1px solid rgba(255,255,255,0.15)", color: "white", padding: "12px 24px", borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 99999, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", whiteSpace: "nowrap" }}>
          {settingsMsg}
        </div>
      )}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Impostazioni</h2>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>🎨 Interfaccia</span></div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Dark Mode avanzata</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Glass fintech UI</div></div>
          <Toggle defaultOn={true} />
        </div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Animazioni fluide</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Micro-interazioni stile banking</div></div>
          <Toggle defaultOn={true} />
        </div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Modalità compatta</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Riduce spacing UI</div></div>
          <Toggle defaultOn={false} />
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>🧠 Motore di simulazione</span></div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Modello AI avanzato</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Crescita + rischio realistico</div></div>
          <Toggle defaultOn={true} />
        </div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Volatilità mercato</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Simulazione realistica</div></div>
          <Toggle defaultOn={true} />
        </div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Proiezione pensione</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Calcolo a 67 anni con SWR 4%</div></div>
          <Toggle defaultOn={true} />
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>🔔 Notifiche</span></div>
        <div style={styles.dataRow}><div><div style={{ fontWeight: 600, fontSize: 14 }}>Email report mensile</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Riepilogo del mese via email</div></div><Toggle defaultOn={true} /></div>
        <div style={styles.dataRow}><div><div style={{ fontWeight: 600, fontSize: 14 }}>Alert crescita patrimonio</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Notifica quando raggiungi soglie</div></div><Toggle defaultOn={true} /></div>
        <div style={styles.dataRow}><div><div style={{ fontWeight: 600, fontSize: 14 }}>Riepilogo settimanale</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Report ogni domenica</div></div><Toggle defaultOn={false} /></div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>🔒 Sicurezza</span></div>
        <div style={styles.dataRow}><div><div style={{ fontWeight: 600, fontSize: 14 }}>Cambia password</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Aggiorna le credenziali di accesso</div></div><button style={styles.smallButton} onClick={handleCambiaPassword}>Apri</button></div>
        <div style={styles.dataRow}><div><div style={{ fontWeight: 600, fontSize: 14 }}>Autenticazione 2FA</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Protezione in due passaggi</div></div><button style={{ ...styles.smallButton, borderColor: "rgba(16,185,129,0.4)", color: "#34d399" }} onClick={handleAttiva2FA}>Attiva</button></div>
        <div style={styles.dataRow}><div><div style={{ fontWeight: 600, fontSize: 14 }}>Reset account</div><div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 3 }}>Elimina tutti i dati salvati</div></div><button style={{ ...styles.smallButton, borderColor: resetConfirm ? "rgba(239,68,68,0.8)" : "rgba(239,68,68,0.4)", color: resetConfirm ? "#ef4444" : "rgba(239,68,68,0.9)", background: resetConfirm ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.08)", fontWeight: resetConfirm ? 800 : 700 }} onClick={handleReset}>{resetConfirm ? "⚠️ Conferma reset" : "Reset"}</button></div>
      </div>
    </div>
  );
}

//#endregion

//#region COMPONENTS

function Background({ page }) {
  const themes = {
    home:      "radial-gradient(ellipse 70% 55% at 15% 35%, rgba(37,99,235,0.30), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 70%, rgba(124,58,237,0.22), transparent 60%)",
    dashboard: "radial-gradient(ellipse 70% 55% at 10% 20%, rgba(16,185,129,0.22), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.18), transparent 60%)",
    scenario:  "radial-gradient(ellipse 65% 50% at 75% 20%, rgba(245,158,11,0.22), transparent 60%), radial-gradient(ellipse 55% 50% at 20% 75%, rgba(239,68,68,0.18), transparent 60%)",
    history:   "radial-gradient(ellipse 65% 55% at 20% 20%, rgba(99,102,241,0.24), transparent 60%), radial-gradient(ellipse 60% 50% at 75% 70%, rgba(168,85,247,0.18), transparent 60%)",
    account:   "radial-gradient(ellipse 65% 55% at 80% 25%, rgba(234,179,8,0.22), transparent 60%), radial-gradient(ellipse 55% 50% at 20% 70%, rgba(249,115,22,0.18), transparent 60%)",
    settings:  "radial-gradient(ellipse 60% 55% at 50% 20%, rgba(100,116,139,0.22), transparent 60%), radial-gradient(ellipse 55% 55% at 50% 80%, rgba(71,85,105,0.18), transparent 60%)",
  };
  return <div style={{ ...styles.bg, background: themes[page] || themes.home }} />;
}

//#endregion

//#region TOPBAR
function TopBar({ page, setPage }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setMobileMenu(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    ["home", "Home"], ["dashboard", "Dashboard"], ["scenario", "Nuovo Scenario"],
    ["history", "Storico"], ["account", "Account"], ["settings", "Impostazioni"],
  ];

  const NavItem = ({ id, label }) => {
    const isActive = page === id;
    return (
      <div
        onClick={() => setPage(id)}
        style={{
          display: "flex", alignItems: "center",
          padding: "6px 13px", cursor: "pointer", position: "relative",
          borderRadius: 8,
          color: isActive ? "#f8fafc" : "rgba(248,250,252,0.45)",
          fontWeight: isActive ? 600 : 400,
          fontSize: 13, whiteSpace: "nowrap",
          background: isActive ? "rgba(37,99,235,0.12)" : "transparent",
          border: isActive ? "1px solid rgba(37,99,235,0.25)" : "1px solid transparent",
          transition: "all .2s ease",
        }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "rgba(248,250,252,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "rgba(248,250,252,0.45)"; e.currentTarget.style.background = "transparent"; }}}
      >
        {label}
      </div>
    );
  };

  return (
    <>
      <div style={{
        position: "sticky", top: 0, zIndex: 1000,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 20px", height: 62,
        backdropFilter: "blur(24px)",
        background: "rgba(5,8,16,0.90)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: "white" }}>W</span>
          </div>
          <span style={{
            fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em",
            background: "linear-gradient(90deg,#60a5fa,#a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>WealthFuture</span>
        </div>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {menuItems.map(([id, label]) => <NavItem key={id} id={id} label={label} />)}
          </div>
        )}

        {isMobile && (
          <div
            onClick={() => setMobileMenu(!mobileMenu)}
            style={{ cursor: "pointer", padding: "8px", userSelect: "none", display: "flex", flexDirection: "column", gap: 5, borderRadius: 8, background: mobileMenu ? "rgba(255,255,255,0.08)" : "transparent", transition: "background 0.2s" }}
          >
            <div style={{ width: 20, height: 1.5, borderRadius: 2, background: "rgba(255,255,255,0.75)", transition: "transform 0.25s, opacity 0.25s", transform: mobileMenu ? "translateY(6.5px) rotate(45deg)" : "none" }} />
            <div style={{ width: 20, height: 1.5, borderRadius: 2, background: "rgba(255,255,255,0.75)", opacity: mobileMenu ? 0 : 1, transition: "opacity 0.2s" }} />
            <div style={{ width: 20, height: 1.5, borderRadius: 2, background: "rgba(255,255,255,0.75)", transition: "transform 0.25s, opacity 0.25s", transform: mobileMenu ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
          </div>
        )}
      </div>

      {/* Overlay */}
      <div onClick={() => setMobileMenu(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", zIndex: 9998, opacity: mobileMenu ? 1 : 0, visibility: mobileMenu ? "visible" : "hidden", transition: "opacity .3s ease, visibility .3s ease" }} />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0,
        right: mobileMenu ? 0 : -300,
        width: 270, height: "100vh",
        background: "linear-gradient(180deg, rgba(7,9,26,0.99), rgba(5,7,18,0.99))",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        zIndex: 9999,
        opacity: mobileMenu ? 1 : 0,
        transform: mobileMenu ? "translateX(0)" : "translateX(24px)",
        transition: "right .35s cubic-bezier(.4,0,.2,1), opacity .3s ease, transform .3s ease",
        paddingTop: 72,
      }}>
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
          <div style={{ fontSize: 10, opacity: 0.35, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>Navigazione</div>
          <div style={{ fontWeight: 800, fontSize: 17, color: "white" }}>WealthFuture</div>
        </div>

        {menuItems.map(([id, label], index) => (
          <div
            key={id}
            onClick={() => { setPage(id); setMobileMenu(false); }}
            style={{
              padding: "13px 20px", margin: "3px 10px", cursor: "pointer",
              borderRadius: 10,
              color: page === id ? "#f8fafc" : "rgba(248,250,252,0.55)",
              fontWeight: page === id ? 600 : 400,
              fontSize: 14,
              background: page === id ? "rgba(37,99,235,0.12)" : "transparent",
              border: page === id ? "1px solid rgba(37,99,235,0.22)" : "1px solid transparent",
              transition: `all .25s ease ${index * 0.04}s`,
            }}
          >
            {label}
          </div>
        ))}

        <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: "white" }}>W</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 13, background: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WealthFuture</span>
        </div>
      </div>
    </>
  );
}
//#endregion

//#region Helpers

function planBadgeStyle(plan) {
  const colors = {
    free:    { bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.12)", color: "rgba(248,250,252,0.50)" },
    pro:     { bg: "rgba(37,99,235,0.12)",   border: "rgba(37,99,235,0.28)",   color: "#93c5fd" },
    premium: { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.28)",  color: "#fcd34d" },
  };
  const c = colors[plan] || colors.free;
  return {
    background: c.bg, border: `1px solid ${c.border}`, color: c.color,
    fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
    letterSpacing: "0.07em", textTransform: "uppercase", display: "inline-block",
  };
}

//#endregion

//#region STYLES

const styles = {
  app: {
    height: "100vh",
    overflow: "hidden",
    background: T.base,
    color: T.text,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    overflowX: "hidden",
  },
  bg: {
    position: "fixed", inset: 0,
    filter: "blur(140px) saturate(1.2)",
    zIndex: 0, opacity: 0.55,
  },
  container: {
    position: "relative", zIndex: 2,
    paddingTop: 62,
    height: "calc(100vh - 62px)",
    overflowY: "auto", overflowX: "hidden",
  },
  page: {
    padding: "40px 28px 120px",
    maxWidth: 1100, margin: "0 auto",
  },
  pageHeader: {
    marginBottom: 32, paddingBottom: 24,
    borderBottom: `1px solid ${T.border}`,
  },
  pageTitle: {
    fontSize: 28, fontWeight: 800, margin: "0 0 12px",
    letterSpacing: "-0.03em",
    background: "linear-gradient(135deg,#fff 55%,rgba(255,255,255,0.45))",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  planBar: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 },
  kpiStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
    gap: 10, margin: "20px 0",
  },
  kpiItem: {
    padding: "18px 20px",
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    backdropFilter: "blur(12px)",
    transition: "border-color 0.2s, background 0.2s",
  },
  kpiLabel: {
    fontSize: 10, color: T.hint,
    textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10,
    fontWeight: 700,
  },
  kpiValue: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: T.text },
  kpiUnit:  { fontSize: 12, fontWeight: 400, opacity: 0.38, marginLeft: 2 },
  divider:  { height: 1, background: T.border, margin: "6px 0 28px" },
  section:  { marginBottom: 28 },
  sectionHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  sectionTitle: {
    fontSize: 10, fontWeight: 800,
    textTransform: "uppercase", letterSpacing: "0.1em",
    color: T.hint,
    display: "flex", alignItems: "center", gap: 6,
  },
  dataRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "13px 0",
    borderBottom: `1px solid ${T.border}`,
    transition: "background 0.15s",
  },
  dataLabel: { fontSize: 14, color: T.muted },
  dataValue: { fontSize: 14, fontWeight: 700, color: T.text },
  center: {
    display: "flex", justifyContent: "center", alignItems: "flex-start",
    minHeight: "70vh", padding: "32px 20px",
  },
  narrowCard: { width: "100%", maxWidth: 520, padding: "32px 0" },
  input: {
    width: "100%", height: 46, padding: "0 14px",
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: "rgba(255,255,255,0.05)",
    color: T.text, boxSizing: "border-box", outline: "none",
    fontSize: 14, WebkitTextFillColor: T.text, opacity: 1,
    transition: "border-color 0.2s, background 0.2s",
    fontFamily: "inherit",
  },
  button: {
    width: "100%", marginTop: 14, padding: "13px 20px",
    borderRadius: 11, border: "none",
    background: `linear-gradient(90deg,${T.blue},${T.violet})`,
    color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
    letterSpacing: "0.01em",
    boxShadow: "0 4px 22px rgba(37,99,235,0.30)",
    transition: "filter 0.15s, transform 0.12s",
  },
  topBar: {
    position: "fixed", top: 0, width: "100%", height: 62,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0 20px",
    background: "rgba(5,8,16,0.88)",
    backdropFilter: "blur(22px)",
    borderBottom: `1px solid ${T.border}`,
    zIndex: 10, boxSizing: "border-box", gap: 16,
  },
  smallButton: {
    padding: "7px 15px", borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: "rgba(255,255,255,0.06)",
    color: T.text, cursor: "pointer",
    fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
    transition: "background 0.2s, border-color 0.2s",
    fontFamily: "inherit",
  },
  loginWrapper: {
    height: "100vh", display: "flex", justifyContent: "center",
    alignItems: "center", position: "relative", zIndex: 2,
  },
  loginCard: {
    width: "min(400px, 92vw)", padding: "44px 36px",
    borderRadius: 20,
    background: "rgba(12,16,35,0.96)",
    border: `1px solid ${T.borderHi}`,
    backdropFilter: "blur(28px)",
    display: "flex", flexDirection: "column", gap: 12, alignItems: "center",
    boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
  },
  loginLogo: { width: 120, height: 120, objectFit: "contain", marginBottom: 8 },
  loginSlogan: { fontStyle: "italic", opacity: 0.45, fontSize: 14, textAlign: "center", marginBottom: 8 },
  field: { display: "flex", flexDirection: "column", width: "100%", marginBottom: 18 },
  label: {
    color: T.hint, fontSize: 10, fontWeight: 700,
    marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em",
  },
  fieldError: { display: "flex", alignItems: "center", gap: 5, color: "rgba(239,68,68,0.9)", fontSize: 11, marginTop: 6 },
};
  