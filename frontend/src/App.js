import { useEffect, useState } from "react";

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
  base:      "#080c20",
  surface:   "#0e1428",
  card:      "#131c30",
  cardHover: "#182135",
  border:    "rgba(255,255,255,0.09)",
  borderHi:  "rgba(255,255,255,0.16)",
  blue:      "#2563eb",
  blueDim:   "rgba(37,99,235,0.15)",
  blueGlow:  "rgba(37,99,235,0.28)",
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
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>+200 utenti attivi</div>
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
    date: "Settmbre 2025",
    desc: "Algoritmi aggiornati con dati di mercato reali.",
    longDesc: "La versione 2.0 introduce un nuovo motore di simulazione finanziaria basato su dati storici di mercato, crescita salariale dinamica e modelli di investimento più accurati. Le proiezioni sono ora più realistiche sia nel breve che nel lungo periodo."
  },
  {
    title: "Scenari multi-paese disponibili",
    date: "Dicembre 2025",
    desc: "Simulazioni disponibili in oltre 20 paesi.",
    longDesc: "È ora possibile confrontare il proprio futuro finanziario in differenti paesi. Il sistema tiene conto di stipendi medi, costo della vita e fiscalità locale per offrire proiezioni personalizzate e confrontabili."
  },
  {
    title: "Piano Premium: nuova analisi indipendenza finanziaria",
    date: "Gennaio 2026",
    desc: "I nuovi insight premium includono il calcolo degli anni all'indipendenza finanziaria e la copertura pensione.",
    longDesc: "Il piano Premium introduce strumenti avanzati per calcolare quanti anni mancano alla tua indipendenza finanziaria, basandosi sul tasso di risparmio attuale, rendimento degli investimenti e spese previste. Inclusa anche un'analisi dettagliata della copertura pensionistica."
  },
  {
    title: "Sicurezza avanzata: autenticazione 2FA",
    date: "Aprile 2026",
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
      © 2026 WealthFuture — Piattaforma di simulazione finanziaria. Tutti i diritti riservati.
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

    // ── Crescita salariale REALE per settore (già al netto inflazione ~2.1%) ──
    // Valori conservativi basati su dati ISTAT/OCSE per l'Italia
    const sectorGrowth = {
      "IT e Software":         0.025,
      "Banche e Finanza":      0.020,
      "Energia":               0.018,
      "Sanità":                0.015,
      "Architettura e Design": 0.012,
      "Costruzioni":           0.012,
      "Commercio":             0.010,
      "Logistica":             0.010,
      "Comunicazione":         0.010,
      "Educazione":            0.008,
      "Arte e Cultura":        0.008,
      "Turismo":               0.008,
      "Agricoltura":           0.007,
      "Altro":                 0.010,
    };
    const growth = sectorGrowth[data.sector] ?? 0.010;
    const INFLATION = 0.021; // inflazione media italiana storica

    // ── RATE MENSILI CASA E AUTO ─────────────────────────────────
    // Mutuo: 3.5% annuo, 25 anni, 80% LTV
    const MORTGAGE_RATE_Y  = 0.035;
    const MORTGAGE_YEARS   = 25;
    const mortgageRateM    = MORTGAGE_RATE_Y / 12;
    const mortgageMonths   = MORTGAGE_YEARS * 12;
    const pvMortgage       = (1 - Math.pow(1 + mortgageRateM, -mortgageMonths)) / mortgageRateM;
    // Rata mutuo = 30% stipendio ATTUALE (al momento dell'acquisto, stimato con crescita)
    // Per semplicità usiamo lo stipendio proiettato all'anno di acquisto
    const yearsToHome      = data.hasHome ? 0 : Math.max(0, homeAge - age);
    const salAtHomeYear    = salary * Math.pow(1 + growth, yearsToHome);
    const monthlyMortgage  = data.hasHome ? 0 : Math.round(salAtHomeYear * 0.28); // 28% del reddito
    const mortgageCapacity = Math.round(monthlyMortgage * pvMortgage);
    const affordableHousePrice = Math.round(mortgageCapacity / 0.80 + savings * 0.50);
    const maxMortgageRate  = Math.round(salary * 0.30); // KPI "rata max attuale"

    // Auto: 6% annuo, 5 anni
    const CAR_RATE_Y   = 0.06;
    const CAR_YEARS    = 5;
    const carRateM     = CAR_RATE_Y / 12;
    const carMonthsN   = CAR_YEARS * 12;
    const pvCar        = (1 - Math.pow(1 + carRateM, -carMonthsN)) / carRateM;
    const yearsToCarP  = data.hasCar ? 0 : Math.max(0, carAge - age);
    const salAtCarYear = salary * Math.pow(1 + growth, yearsToCarP);
    const monthlyCar   = data.hasCar ? 0 : Math.round(salAtCarYear * 0.12); // 12% del reddito
    const carLoanCapacity = Math.round(monthlyCar * pvCar);
    const maxLoanRate  = Math.round(salary * 0.15); // KPI "rata auto max attuale"

    // Anni in cui le rate sono attive (calcolati dall'anno 0 = oggi)
    const homeStartYear = data.hasHome ? -1 : yearsToHome;   // -1 = già pagata (non aggiungiamo rata)
    const homeEndYear   = data.hasHome ? -1 : yearsToHome + MORTGAGE_YEARS;
    const carStartYear  = data.hasCar  ? -1 : yearsToCarP;
    const carEndYear    = data.hasCar  ? -1 : yearsToCarP + CAR_YEARS;

    // ── Helper: spese mensili effettive all'anno i (0-based) ────
    // Le spese base crescono con inflazione.
    // Dal anno di acquisto in poi si aggiungono le rate (anche le rate
    // crescono lievemente con l'inflazione per approssimare costi fissi reali).
    function expensesAtYear(i, baseExp) {
      let exp = baseExp * Math.pow(1 + INFLATION, i);
      if (homeStartYear >= 0 && i >= homeStartYear && i < homeEndYear) {
        exp += monthlyMortgage * Math.pow(1 + INFLATION, homeStartYear);
      }
      if (carStartYear >= 0 && i >= carStartYear && i < carEndYear) {
        exp += monthlyCar * Math.pow(1 + INFLATION, carStartYear);
      }
      return exp;
    }

    // ── 1. SCORE FINANZIARIO (0–100) ─────────────────────────────
    // Calcolato sulla situazione OGGI (anno 0), incluso impatto rate se già presenti
    const expNow         = expensesAtYear(0, expenses);
    const monthlySurplus = salary - expNow;
    const surplusRate    = salary > 0 ? monthlySurplus / salary : 0;
    const emergencyMonths = expNow > 0 ? savings / expNow : 0;
    const debtCapacity   = salary > 0 ? Math.max(1 - expNow / salary, 0) : 0;
    const ageBonus       = age < 35 ? 10 : age < 50 ? 5 : 0;
    const surplusScore   = Math.min(surplusRate / 0.50, 1) * 40;
    const emergencyScore = (Math.min(emergencyMonths, 12) / 12) * 30;
    const debtScore      = Math.min(debtCapacity / 0.50, 1) * 20;
    const health         = Math.round(Math.min(surplusScore + emergencyScore + debtScore + ageBonus, 100));
    const savingsRate    = salary > 0 ? Math.round((monthlySurplus / salary) * 100) : 0;

    // ── 4. PENSIONE PUBBLICA (sistema contributivo italiano) ─────
    // Input: stipendio netto → stima RAL lorda (inversa IRPEF semplificata)
    // Aliquota contributiva INPS: 33% della RAL
    // Rivalutazione montante: legata alla crescita del PIL reale (~0.8% medio Italia)
    // Coefficiente di trasformazione a 67 anni: 5.7%
    // Tassazione pensione: aliquota media ~25% (IRPEF progressiva)

    const retirementAge     = 67;
    const yearsToRetirement = Math.max(0, retirementAge - age);

    // Stima RAL lorda dal netto mensile (approssimazione IRPEF + contributi dipendente ~10%)
    // netto ≈ RAL × 0.72 (cuneo fiscale medio italiano)
    const ralLordaAnnua = (salary * 12) / 0.72;

    // Crescita nominale dello stipendio = crescita reale + inflazione
    const growthNominale = growth + INFLATION;

    // Rivalutazione montante INPS: media PIL reale italiano ~0.8% (conservativa)
    const ALIQUOTA_CONTRIBUTIVA = 0.33;
    const RIVALUTAZIONE_MONTANTE = 0.008;
    const COEFFICIENTE_TRASFORMAZIONE = 0.057;

    let montante = 0;
    let ralCorrente = ralLordaAnnua;
    for (let i = 0; i < yearsToRetirement; i++) {
      ralCorrente = ralCorrente * (1 + growthNominale);
      const contributiAnno = ralCorrente * ALIQUOTA_CONTRIBUTIVA;
      montante = montante * (1 + RIVALUTAZIONE_MONTANTE) + contributiAnno;
    }

    // Deflaziona il montante nominale al potere d'acquisto attuale
    const deflatore = Math.pow(1 + INFLATION, yearsToRetirement);
    const montanteReale = montante / deflatore;

    const pensioneLordaAnnua  = Math.round(montanteReale * COEFFICIENTE_TRASFORMAZIONE);
    const pensioneLordaMensile = Math.round(pensioneLordaAnnua / 13); // 13 mensilità
    // Tassazione media stimata sulla pensione (~25% per pensioni medie)
    const aliquotaTassazione = pensioneLordaAnnua > 50000 ? 0.30 : pensioneLordaAnnua > 28000 ? 0.25 : 0.20;
    const pensioneNettaMensile = Math.round(pensioneLordaMensile * (1 - aliquotaTassazione));

    // Alias per compatibilità con il resto del codice
    const pension        = montanteReale;
    const pensioneMensile = pensioneNettaMensile;

    // ── 5. COPERTURA PENSIONE ────────────────────────────────────
    const breakEvenRetirement = salary > 0
      ? Math.round((pensioneMensile / salary) * 100)
      : 0;

    // ── 7. ANNI AL FIRE ───────────────────────────────────────────
    // Tutto in termini REALI (potere d'acquisto odierno)
    // Rendimento reale portafoglio: ~4% (6% nominale - 2% inflazione, conservativo)
    // Stipendio cresce solo in termini reali (già deflazionato nel growth)
    // Spese reali: costanti in termini reali (expNow già al potere d'acquisto oggi)
    const REAL_RETURN = 0.04;
    const targetFIRE = expNow * 12 * 25;
    let anniFIRE = null;
    if (monthlySurplus > 0) {
      let cap = savings;
      let sal2 = salary;
      let anni = 0;
      while (cap < targetFIRE && anni < 100) {
        sal2 = sal2 * (1 + growth); // growth è già reale
        const exp2 = expensesAtYear(anni, expenses) / Math.pow(1 + INFLATION, anni); // spese reali
        const surplusAnno = Math.max(sal2 - exp2, 0) * 12;
        cap = cap * (1 + REAL_RETURN) + surplusAnno;
        anni++;
      }
      anniFIRE = cap >= targetFIRE ? anni : null;
    }

    const res = {
      id: Date.now(), date: new Date().toLocaleDateString(),
      age, country: data.country, sector: data.sector, salary, savings,
      growth, health, pension, pensioneMensile,
      homeAge, carAge, maxMortgageRate, mortgageCapacity, affordableHousePrice,
      maxLoanRate, carLoanCapacity,
      monthlyExpenses: expenses, monthlySurplus, savingsRate,
      breakEvenRetirement,
      yearsToFinancialIndependence: anniFIRE,
      hasHome: data.hasHome, hasCar: data.hasCar,
      // Dati pensione dettagliati
      montanteContributivo: Math.round(montanteReale),
      pensioneLordaMensile,
      pensioneNettaMensile,
      ralLordaAnnua: Math.round(ralLordaAnnua),
      yearsToRetirement,
      // Parametri rate per uso nel grafico liquidità
      monthlyMortgage,
      monthlyCar,
      homeStartYear,
      homeEndYear,
      carStartYear,
      carEndYear,
      // Crescita salariale attesa (solo Premium)
      salaryProjections: plan === "premium" ? {
        y10: Math.round(salary * Math.pow(1 + growth, 10)),
        y20: Math.round(salary * Math.pow(1 + growth, 20)),
        y30: Math.round(salary * Math.pow(1 + growth, 30)),
        growthPct: Math.round(growth * 100 * 10) / 10,
      } : null,
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
          {/* ── Header risultato ── */}
<div style={{ marginBottom: 24, padding: "20px 22px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 16 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Risultato simulazione</h2>
  </div>
  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{result.country} · {result.sector} · {result.age} anni</div>
</div>

{/* ── Insight card ── */}
{(() => {
  const h = result.health;
  const sr = result.savingsRate ?? 0;
  let msg, color, bg, border;
  if (h >= 80 && sr >= 30) {
    msg = "🔥 Profilo eccellente — sei sulla strada giusta per l'indipendenza finanziaria.";
    color = "#34d399"; bg = "rgba(16,185,129,0.07)"; border = "rgba(16,185,129,0.22)";
  } else if (h >= 60) {
    msg = "📈 Buon profilo — ottimizza le spese mensili per accelerare la crescita del patrimonio.";
    color = "#60a5fa"; bg = "rgba(37,99,235,0.07)"; border = "rgba(37,99,235,0.22)";
  } else if (h >= 40) {
    msg = "⚠️ Profilo medio — considera di aumentare il tasso di risparmio per migliorare la proiezione.";
    color = "#fbbf24"; bg = "rgba(245,158,11,0.07)"; border = "rgba(245,158,11,0.22)";
  } else {
    msg = "🚨 Profilo a rischio — le spese superano la soglia consigliata. Rivedi il budget mensile.";
    color = "#f87171"; bg = "rgba(239,68,68,0.07)"; border = "rgba(239,68,68,0.22)";
  }
  return (
    <div style={{ marginBottom: 20, padding: "14px 18px", background: bg, border: `1px solid ${border}`, borderRadius: 12, fontSize: 13, color, fontWeight: 600, lineHeight: 1.6 }}>
      {msg}
    </div>
  );
})()}

{/* ── KPI strip ── */}
<div style={styles.kpiStrip}>
  {/* Score con colore semantico */}
  <div style={{ ...styles.kpiItem, borderColor: result.health >= 70 ? "rgba(16,185,129,0.35)" : result.health >= 40 ? "rgba(245,158,11,0.35)" : "rgba(239,68,68,0.35)" }}>
    <div style={styles.kpiLabel}>Score finanziario</div>
    <div style={{ ...styles.kpiValue, color: result.health >= 70 ? "#34d399" : result.health >= 40 ? "#fbbf24" : "#f87171" }}>
      {result.health}<span style={styles.kpiUnit}>/100</span>
    </div>
    <div style={{ marginTop: 8, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${result.health}%`, borderRadius: 99, background: result.health >= 70 ? "#34d399" : result.health >= 40 ? "#fbbf24" : "#f87171", transition: "width 1s ease" }} />
    </div>
    <div style={{ fontSize: 10, opacity: 0.4, marginTop: 5 }}>
      {plan === "free" ? "Base" : plan === "pro" ? "Avanzato" : "Professionale"}
    </div>
  </div>

  {/* Montante contributivo */}
  <div style={styles.kpiItem}>
    <div style={styles.kpiLabel}>Montante contributivo a 67 anni</div>
    <div style={{ ...styles.kpiValue, fontSize: 18, color: "#a78bfa" }}>
      € {result.montanteContributivo.toLocaleString("it-IT")}
    </div>
    <div style={{ fontSize: 10, opacity: 0.4, marginTop: 5 }}>
      sistema contributivo INPS
    </div>
  </div>

  {/* Pensione lorda mensile */}
  <div style={styles.kpiItem}>
    <div style={styles.kpiLabel}>Pensione lorda mensile</div>
    <div style={{ ...styles.kpiValue, color: "#22c55e" }}>
      € {result.pensioneLordaMensile.toLocaleString("it-IT")}
    </div>
    <div style={{ fontSize: 10, opacity: 0.4, marginTop: 5 }}>
      13 mensilità · coeff. 5.7%
    </div>
  </div>

  {/* Anni al FIRE */}
  {result.yearsToFinancialIndependence && (
    <div style={{ ...styles.kpiItem, borderColor: "rgba(37,99,235,0.30)" }}>
      <div style={styles.kpiLabel}>Anni al FIRE</div>
      <div style={{ ...styles.kpiValue, color: "#60a5fa" }}>{result.yearsToFinancialIndependence}<span style={styles.kpiUnit}> anni</span></div>
      <div style={{ fontSize: 10, opacity: 0.4, marginTop: 5 }}>indipendenza finanziaria</div>
    </div>
  )}
</div>

{/* ── Scenari temporali per orizzonte ── */}
{(() => {
  const INFL = 0.021;
  const g = result.growth ?? 0.025;
  const salary0 = result.salary;
  const exp0 = result.monthlyExpenses;
  const sav0 = result.savings;
  const age0 = result.age;
  const hsy = result.homeStartYear;  // anni dall'oggi
  const hey = result.homeEndYear;
  const csy = result.carStartYear;
  const cey = result.carEndYear;
  const mm = result.monthlyMortgage ?? 0;
  const mc = result.monthlyCar ?? 0;
  const MORTGAGE_YEARS = 25;
  const CAR_YEARS = 5;

  // Calcola spese totali mensili all'anno i
  function totalExpAtYear(i) {
    let exp = exp0 * Math.pow(1 + INFL, i);
    if (hsy >= 0 && i >= hsy && i < hey) exp += mm * Math.pow(1 + INFL, hsy);
    if (csy >= 0 && i >= csy && i < cey) exp += mc * Math.pow(1 + INFL, csy);
    return exp;
  }

  // Calcola liquidità cumulata fino all'anno i (non si azzera, si accumula)
  function liquiditaCumulataAdAnno(yearN) {
    let cap = sav0;
    for (let i = 0; i < yearN; i++) {
      const sal = salary0 * Math.pow(1 + g, i + 1);
      const exp = totalExpAtYear(i);
      const surplus = Math.max(sal - exp, 0);
      cap = cap + surplus * 12;
    }
    return Math.round(cap);
  }

  // Calcola patrimonio investito cumulato (rendimento 5%/anno sul surplus investito)
  function patrimonioCumulatoAdAnno(yearN) {
    let cap = sav0;
    for (let i = 0; i < yearN; i++) {
      const sal = salary0 * Math.pow(1 + g, i + 1);
      const exp = totalExpAtYear(i);
      const surplus = Math.max(sal - exp, 0);
      cap = cap * 1.05 + surplus * 12;
    }
    return Math.round(cap);
  }

  // Determina gli anni-chiave degli scenari in base agli eventi
  // Ogni scenario = periodo tra due eventi che cambiano le spese mensili
  const events = [{ year: 0, age: age0, label: "Situazione attuale", type: "start" }];

  if (hsy > 0) {
    events.push({ year: hsy, age: age0 + hsy, label: `Acquisto casa (mutuo 25 anni)`, type: "home_start" });
  }
  if (csy > 0) {
    events.push({ year: csy, age: age0 + csy, label: `Acquisto auto (finanziamento 5 anni)`, type: "car_start" });
  }
  if (hey > 0) {
    events.push({ year: hey, age: age0 + hey, label: `Mutuo estinto`, type: "home_end" });
  }
  if (cey > 0) {
    events.push({ year: cey, age: age0 + cey, label: `Finanziamento auto estinto`, type: "car_end" });
  }
  // Aggiungi sempre un evento pensione
  events.push({ year: result.yearsToRetirement, age: 67, label: `Pensione (67 anni)`, type: "pension" });
  events.sort((a, b) => a.year - b.year);
  // De-duplica anni uguali
  const uniqueEvents = events.filter((e, i, arr) => i === 0 || e.year !== arr[i-1].year);

  // Allocazione investimenti in base al surplus/sal ratio
  function getAlloc(surplus, sr) {
    if (surplus <= 0) return [];
    if (sr >= 30) return [
      { label: "ETF azionari globali (MSCI World)", pct: 50, color: "#34d399" },
      { label: "ETF obbligazionari", pct: 20, color: "#60a5fa" },
      { label: "Liquidità / Fondo emergenza", pct: 15, color: "#a78bfa" },
      { label: "ETF tematici / Small cap", pct: 10, color: "#fbbf24" },
      { label: "Crypto (opzionale)", pct: 5, color: "#f97316" },
    ];
    if (sr >= 15) return [
      { label: "ETF azionari globali (MSCI World)", pct: 40, color: "#34d399" },
      { label: "ETF obbligazionari", pct: 25, color: "#60a5fa" },
      { label: "Liquidità / Fondo emergenza", pct: 25, color: "#a78bfa" },
      { label: "ETF tematici", pct: 10, color: "#fbbf24" },
    ];
    return [
      { label: "Liquidità / Fondo emergenza", pct: 50, color: "#a78bfa" },
      { label: "ETF obbligazionari (basso rischio)", pct: 30, color: "#60a5fa" },
      { label: "ETF azionari globali", pct: 20, color: "#34d399" },
    ];
  }

  // Palette coerente con la landing: blu → viola → verde → amber → pink → teal
  const scenarioColors = ["#3b82f6", "#7c3aed", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];
  const scenarioGlows  = [
    "rgba(59,130,246,0.40)",  "rgba(124,58,237,0.38)", "rgba(16,185,129,0.36)",
    "rgba(245,158,11,0.36)",  "rgba(236,72,153,0.36)", "rgba(6,182,212,0.36)",
  ];
  const scenarioGrads  = [
    "linear-gradient(135deg,rgba(37,99,235,0.55) 0%,rgba(124,58,237,0.32) 100%)",
    "linear-gradient(135deg,rgba(124,58,237,0.55) 0%,rgba(236,72,153,0.30) 100%)",
    "linear-gradient(135deg,rgba(16,185,129,0.50) 0%,rgba(37,99,235,0.28) 100%)",
    "linear-gradient(135deg,rgba(245,158,11,0.50) 0%,rgba(236,72,153,0.28) 100%)",
    "linear-gradient(135deg,rgba(236,72,153,0.48) 0%,rgba(124,58,237,0.30) 100%)",
    "linear-gradient(135deg,rgba(6,182,212,0.48) 0%,rgba(37,99,235,0.28) 100%)",
  ];
  const scenarioIcons  = ["🚀", "🏠", "🚗", "🏁", "🌅", "🏦"];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>📅 Proiezione per orizzonte temporale</span>
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 20, padding: "10px 14px", background: "linear-gradient(135deg,rgba(37,99,235,0.10) 0%,rgba(124,58,237,0.07) 100%)", border: "1px solid rgba(59,130,246,0.20)", borderRadius: 10, lineHeight: 1.7 }}>
        Ogni fase rappresenta un periodo della tua vita finanziaria, tenendo conto della crescita salariale <strong style={{ color: "#3b82f6" }}>{(g * 100).toFixed(1)}%/anno</strong>, inflazione <strong style={{ color: "#7c3aed" }}>{(INFL * 100).toFixed(1)}%/anno</strong> e degli eventi previsti. La liquidità cumulata non si azzera tra uno scenario e l'altro.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {uniqueEvents.map((ev, idx) => {
          const nextEv = uniqueEvents[idx + 1];
          const yearStart = ev.year;
          const yearEnd = nextEv ? nextEv.year : ev.year;
          const isLast = !nextEv;
          const color = scenarioColors[idx % scenarioColors.length];
          const glow  = scenarioGlows[idx % scenarioGlows.length];
          const grad  = scenarioGrads[idx % scenarioGrads.length];
          const icon  = scenarioIcons[idx % scenarioIcons.length];

          const salAtStart = Math.round(salary0 * Math.pow(1 + g, yearStart));
          const expAtStart = Math.round(totalExpAtYear(yearStart));
          const surplusAtStart = Math.max(salAtStart - expAtStart, 0);
          const srAtStart = salAtStart > 0 ? Math.round((surplusAtStart / salAtStart) * 100) : 0;
          const liquiditaStart = liquiditaCumulataAdAnno(yearStart);
          const liquiditaEnd = !isLast ? liquiditaCumulataAdAnno(yearEnd) : null;
          const patrimonioEnd = !isLast ? patrimonioCumulatoAdAnno(yearEnd) : null;

          // Rate attive in questo periodo
          const mortgageActive = hsy >= 0 && yearStart >= hsy && yearStart < hey;
          const carActive = csy >= 0 && yearStart >= csy && yearStart < cey;
          const mortgageRataAttuale = mortgageActive ? Math.round(mm * Math.pow(1 + INFL, hsy)) : 0;
          const carRataAttuale = carActive ? Math.round(mc * Math.pow(1 + INFL, csy)) : 0;

          const alloc = getAlloc(surplusAtStart, srAtStart);

          // Label sezione interna colorata col glow della card
          const secLabel = (label) => (
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", color, opacity: 0.7, marginBottom: 10 }}>{label}</div>
          );

          return (
            <div key={idx} style={{
              background: `${glow.replace("0.40","0.14").replace("0.38","0.13").replace("0.36","0.12")}`,
              border: `1px solid ${color}55`,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: `0 4px 32px ${glow}`,
            }}>
              {/* ── Header scenario ── */}
              <div style={{
                padding: "18px 22px",
                background: grad,
                borderBottom: `1px solid ${color}30`,
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: `${color}30`, border: `1.5px solid ${color}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                  boxShadow: `0 0 16px ${glow}`,
                }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color, letterSpacing: "-0.01em", textShadow: `0 0 20px ${glow}` }}>
                    Fase {idx + 1} — {ev.label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                    Età {ev.age}{!isLast ? ` → ${nextEv.age} anni` : "+"} · {!isLast ? `${yearEnd - yearStart} anni di durata` : "in poi"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: "-0.02em" }}>€ {salAtStart.toLocaleString("it-IT")}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>stipendio netto/mese</div>
                </div>
              </div>

              <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

                {/* ── Rate attive ── */}
                {(mortgageActive || carActive) && (
                  <div>
                    {secLabel("Rate attive")}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                      {mortgageActive && (
                        <div style={{ padding: "12px 14px", background: "linear-gradient(135deg,rgba(37,99,235,0.30) 0%,rgba(124,58,237,0.18) 100%)", border: "1px solid rgba(59,130,246,0.45)", borderRadius: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>🏠 Mutuo (finisce età {age0 + hey})</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#3b82f6" }}>€ {mortgageRataAttuale.toLocaleString("it-IT")}/mese</span>
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 5 }}>
                            Rimangono {Math.max(0, hey - yearStart)} anni · cap. totale € {result.mortgageCapacity.toLocaleString("it-IT")}
                          </div>
                        </div>
                      )}
                      {carActive && (
                        <div style={{ padding: "12px 14px", background: "linear-gradient(135deg,rgba(245,158,11,0.30) 0%,rgba(236,72,153,0.16) 100%)", border: "1px solid rgba(245,158,11,0.45)", borderRadius: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>🚗 Auto (finisce età {age0 + cey})</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#f59e0b" }}>€ {carRataAttuale.toLocaleString("it-IT")}/mese</span>
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 5 }}>
                            Rimangono {Math.max(0, cey - yearStart)} anni · cap. auto € {result.carLoanCapacity.toLocaleString("it-IT")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Impegni futuri in questa fase ── */}
                {(() => {
                  const items = [];
                  if (hsy > yearStart && (isLast || hsy < yearEnd) && !result.hasHome) {
                    const salAtHome = Math.round(salary0 * Math.pow(1 + g, hsy));
                    items.push(
                      <div key="home_future" style={{ padding: "12px 14px", background: "linear-gradient(135deg,rgba(37,99,235,0.26) 0%,rgba(124,58,237,0.14) 100%)", border: "1px dashed rgba(59,130,246,0.50)", borderRadius: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>🏠 Futuro acquisto casa (età {age0 + hsy})</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#3b82f6" }}>+€ {mm.toLocaleString("it-IT")}/mese</span>
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 5 }}>
                          Stipendio previsto: € {salAtHome.toLocaleString("it-IT")}/mese · mutuo 25 anni · casa € {result.affordableHousePrice?.toLocaleString("it-IT") ?? "—"}
                        </div>
                        {carActive && <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4 }}>⚠ Finanziamento auto ancora attivo all'acquisto</div>}
                      </div>
                    );
                  }
                  if (csy > yearStart && (isLast || csy < yearEnd) && !result.hasCar) {
                    const salAtCar = Math.round(salary0 * Math.pow(1 + g, csy));
                    items.push(
                      <div key="car_future" style={{ padding: "12px 14px", background: "linear-gradient(135deg,rgba(245,158,11,0.26) 0%,rgba(236,72,153,0.14) 100%)", border: "1px dashed rgba(245,158,11,0.50)", borderRadius: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>🚗 Futuro acquisto auto (età {age0 + csy})</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>+€ {mc.toLocaleString("it-IT")}/mese</span>
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 5 }}>
                          Stipendio previsto: € {salAtCar.toLocaleString("it-IT")}/mese · 5 anni · auto € {result.carLoanCapacity.toLocaleString("it-IT")}
                          {mortgageActive && " · ⚠ mutuo ancora attivo"}
                        </div>
                      </div>
                    );
                  }
                  if (items.length === 0) return null;
                  return (
                    <div>
                      {secLabel("Impegni previsti in questa fase")}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{items}</div>
                    </div>
                  );
                })()}

                {/* ── Investimenti ── */}
                <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.06)", border: `1px solid ${color}30`, borderRadius: 14 }}>
                  {secLabel("Investimenti")}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 14 }}>
                    <div style={{ padding: "10px 12px", background: surplusAtStart > 0 ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.20)", border: `1px solid ${surplusAtStart > 0 ? "rgba(16,185,129,0.45)" : "rgba(239,68,68,0.40)"}`, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.50)", marginBottom: 4 }}>Surplus mensile</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: surplusAtStart > 0 ? "#10b981" : "#f87171" }}>€ {surplusAtStart.toLocaleString("it-IT")}</div>
                    </div>
                    <div style={{ padding: "10px 12px", background: srAtStart >= 20 ? "rgba(16,185,129,0.20)" : srAtStart >= 10 ? "rgba(245,158,11,0.20)" : "rgba(239,68,68,0.18)", border: `1px solid ${srAtStart >= 20 ? "rgba(16,185,129,0.42)" : srAtStart >= 10 ? "rgba(245,158,11,0.42)" : "rgba(239,68,68,0.38)"}`, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.50)", marginBottom: 4 }}>Tasso di risparmio</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: srAtStart >= 20 ? "#10b981" : srAtStart >= 10 ? "#f59e0b" : "#f87171" }}>{srAtStart}%</div>
                    </div>
                    <div style={{ padding: "10px 12px", background: "rgba(124,58,237,0.22)", border: "1px solid rgba(124,58,237,0.42)", borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.50)", marginBottom: 4 }}>Spese mensili totali</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#a78bfa" }}>€ {expAtStart.toLocaleString("it-IT")}</div>
                    </div>
                  </div>

                  {alloc.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {alloc.map((a, ai) => (
                        <div key={ai}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 9, height: 9, borderRadius: 3, background: a.color, flexShrink: 0, boxShadow: `0 0 6px ${a.color}` }} />
                              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>{a.label}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>€ {Math.round(surplusAtStart * a.pct / 100).toLocaleString("it-IT")}/mese</span>
                              <span style={{ fontSize: 13, fontWeight: 800, color: a.color, minWidth: 30, textAlign: "right" }}>{a.pct}%</span>
                            </div>
                          </div>
                          <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 99, width: `${a.pct}%`, background: `linear-gradient(90deg,${a.color},${a.color}bb)`, boxShadow: `0 0 8px ${a.color}60` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.30)", fontStyle: "italic" }}>
                      Surplus non disponibile — le spese superano lo stipendio in questa fase.
                    </div>
                  )}
                </div>

                {/* ── Liquidità cumulata ── */}
                <div style={{ padding: "14px 16px", background: `linear-gradient(135deg,${glow.replace("0.40","0.22").replace("0.38","0.20").replace("0.36","0.18")} 0%,rgba(255,255,255,0.05) 100%)`, border: `1px solid ${color}35`, borderRadius: 14 }}>
                  {secLabel("Liquidità cumulata")}
                  <div style={{ display: "grid", gridTemplateColumns: liquiditaEnd !== null ? "1fr 1fr" : "1fr", gap: 10 }}>
                    <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: `1px solid ${color}40`, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.50)", marginBottom: 5 }}>All'inizio (età {ev.age})</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color }}>€ {liquiditaStart.toLocaleString("it-IT")}</div>
                    </div>
                    {liquiditaEnd !== null && (
                      <div style={{ padding: "10px 14px", background: liquiditaEnd > liquiditaStart ? "rgba(16,185,129,0.20)" : "rgba(239,68,68,0.18)", border: `1px solid ${liquiditaEnd > liquiditaStart ? "rgba(16,185,129,0.45)" : "rgba(239,68,68,0.40)"}`, borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.50)", marginBottom: 5 }}>Fine fase (età {nextEv.age})</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: liquiditaEnd > liquiditaStart ? "#10b981" : "#f87171" }}>
                          € {liquiditaEnd.toLocaleString("it-IT")}
                          <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.45)", marginLeft: 6 }}>
                            {liquiditaEnd > liquiditaStart ? "▲" : "▼"} {Math.abs(Math.round((liquiditaEnd - liquiditaStart) / Math.max(1, liquiditaStart) * 100))}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {patrimonioEnd !== null && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(124,58,237,0.22)", border: "1px solid rgba(124,58,237,0.38)", borderRadius: 8, fontSize: 11, color: "rgba(255,255,255,0.60)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Patrimonio investito a fine fase (5%/anno)</span>
                      <span style={{ fontWeight: 800, color: "#a78bfa", fontSize: 13 }}>€ {patrimonioEnd.toLocaleString("it-IT")}</span>
                    </div>
                  )}
                </div>

                {/* ── Box pensione ── */}
                {ev.type === "pension" && PLAN_LIMITS[plan].simulazionePensione && (
                  <div style={{ padding: "16px 18px", background: "linear-gradient(135deg,rgba(16,185,129,0.28) 0%,rgba(37,99,235,0.18) 100%)", border: "1px solid rgba(16,185,129,0.50)", borderRadius: 14, boxShadow: "0 2px 20px rgba(16,185,129,0.20)" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", color: "#10b981", marginBottom: 12 }}>🏦 Pensione pubblica INPS</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                      {[
                        { label: "Anni contribuzione", value: `${result.yearsToRetirement} anni`, c: "rgba(255,255,255,0.90)" },
                        { label: "Montante contributivo", value: `€ ${result.montanteContributivo.toLocaleString("it-IT")}`, c: "#a78bfa" },
                        { label: "Pensione lorda mensile", value: `€ ${result.pensioneLordaMensile.toLocaleString("it-IT")}/mese`, c: "#34d399" },
                        { label: "Pensione netta mensile", value: `€ ${result.pensioneNettaMensile.toLocaleString("it-IT")}/mese`, c: "#10b981" },
                      ].map(({ label, value, c }) => (
                        <div key={label} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(16,185,129,0.28)", borderRadius: 10 }}>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.50)", marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: c }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.30)", marginTop: 12, lineHeight: 1.7 }}>
                      Sistema contributivo italiano · aliquota 33% · rivalutazione 1.5%/anno · coeff. 5.7% a 67 anni. Stima a scopo educativo.
                    </div>
                  </div>
                )}
                {ev.type === "pension" && !PLAN_LIMITS[plan].simulazionePensione && (
                  <div style={{ fontSize: 13, opacity: 0.4, fontStyle: "italic" }}>
                    Simulazione pensione disponibile dal piano Pro
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* ── GRAFICI ── */}
      {(() => {
        const maxYear = Math.min(result.yearsToRetirement || 40, 45);
        const years = Array.from({ length: maxYear + 1 }, (_, i) => i);

        // Dati per ogni anno
        const salaryData = years.map(i => salary0 * Math.pow(1 + g, i));
        const expData = years.map(i => totalExpAtYear(i));
        const liquidData = years.map(i => {
          let cap = sav0;
          for (let j = 0; j < i; j++) {
            const sal = salary0 * Math.pow(1 + g, j + 1);
            const exp = totalExpAtYear(j);
            cap += Math.max(sal - exp, 0) * 12;
          }
          return cap;
        });

        // Helper SVG line chart
        function LineChart({ datasets, yLabel, colorLines, height = 180 }) {
          const W = 560, H = height, PL = 64, PR = 16, PT = 12, PB = 36;
          const cW = W - PL - PR, cH = H - PT - PB;
          const allVals = datasets.flatMap(d => d);
          const minV = Math.min(...allVals, 0);
          const maxV = Math.max(...allVals);
          const rangeV = maxV - minV || 1;
          const toX = i => PL + (i / (years.length - 1)) * cW;
          const toY = v => PT + cH - ((v - minV) / rangeV) * cH;

          // Y axis ticks
          const ticks = 4;
          const tickVals = Array.from({ length: ticks + 1 }, (_, i) => minV + (rangeV / ticks) * i);

          function makePath(data) {
            return data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
          }
          function makeArea(data, color) {
            const p = makePath(data);
            return `${p} L${toX(data.length - 1).toFixed(1)},${(PT + cH).toFixed(1)} L${toX(0).toFixed(1)},${(PT + cH).toFixed(1)} Z`;
          }

          // X axis labels every ~10 years
          const xLabels = years.filter(i => i % Math.max(1, Math.floor(maxYear / 5)) === 0 || i === maxYear);

          return (
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
              {/* Grid */}
              {tickVals.map((v, i) => (
                <g key={i}>
                  <line x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <text x={PL - 6} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.35)">
                    {v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v.toFixed(0)}`}
                  </text>
                </g>
              ))}
              {/* X labels */}
              {xLabels.map(i => (
                <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)">
                  +{i}a
                </text>
              ))}
              {/* Areas (subtle) */}
              {datasets.map((data, di) => (
                <path key={`area-${di}`} d={makeArea(data)} fill={colorLines[di]} opacity="0.08" />
              ))}
              {/* Lines */}
              {datasets.map((data, di) => (
                <path key={`line-${di}`} d={makePath(data)} fill="none" stroke={colorLines[di]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {/* Dots at last point */}
              {datasets.map((data, di) => (
                <circle key={`dot-${di}`} cx={toX(data.length - 1)} cy={toY(data[data.length - 1])} r="3.5" fill={colorLines[di]} />
              ))}
            </svg>
          );
        }

        const fmt = v => v >= 1000 ? `€ ${(v / 1000).toFixed(1)}k` : `€ ${v.toFixed(0)}`;

        const ChartCard = ({ title, icon, children, legend }) => (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(255,255,255,0.55)" }}>{icon} {title}</div>
              {legend && (
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {legend.map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                      <div style={{ width: 18, height: 2.5, borderRadius: 99, background: l.color }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {children}
          </div>
        );

        return (
          <div style={{ marginTop: 28 }}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>📊 Grafici proiettivi</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", marginBottom: 18 }}>
              Proiezione su {maxYear} anni · valori in termini nominali
            </div>

            {/* 1 — Liquidità cumulata */}
            <ChartCard title="Crescita liquidità cumulata" icon="💧" legend={[{ color: "#3b82f6", label: "Liquidità accumulata" }]}>
              <LineChart datasets={[liquidData]} colorLines={["#3b82f6"]} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                <span>Oggi: {fmt(liquidData[0])}</span>
                <span>Tra {maxYear} anni: <strong style={{ color: "#3b82f6" }}>{fmt(liquidData[maxYear])}</strong></span>
              </div>
            </ChartCard>

            {/* 2 — Stipendio */}
            <ChartCard title="Crescita salariale prevista" icon="📈" legend={[{ color: "#10b981", label: "Stipendio mensile netto" }]}>
              <LineChart datasets={[salaryData]} colorLines={["#10b981"]} height={160} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                <span>Oggi: {fmt(salaryData[0])}/mese</span>
                <span>Tra {maxYear} anni: <strong style={{ color: "#10b981" }}>{fmt(salaryData[maxYear])}/mese</strong></span>
              </div>
            </ChartCard>

            {/* 3 — Spese */}
            <ChartCard title="Andamento spese mensili" icon="🧾" legend={[{ color: "#f59e0b", label: "Spese base + inflazione" }, { color: "#ec4899", label: "Rate mutuo/auto" }]}>
              {(() => {
                const baseExp = years.map(i => expData[0] * Math.pow(1 + INFL, i));
                return (
                  <>
                    <LineChart datasets={[baseExp, expData]} colorLines={["#f59e0b", "#ec4899"]} height={160} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                      <span>Oggi: {fmt(expData[0])}/mese</span>
                      <span>Picco stimato: <strong style={{ color: "#ec4899" }}>{fmt(Math.max(...expData))}/mese</strong></span>
                    </div>
                  </>
                );
              })()}
            </ChartCard>
          </div>
        );
      })()}

      <div style={{ marginTop: 22, padding: "12px 16px", background: "linear-gradient(135deg,rgba(37,99,235,0.22) 0%,rgba(124,58,237,0.16) 100%)", border: "1px solid rgba(59,130,246,0.35)", borderRadius: 12, fontSize: 11, color: "rgba(248,250,252,0.60)", lineHeight: 1.8 }}>
        💡 Proiezioni basate su crescita salariale settoriale <strong style={{ color: "#3b82f6" }}>{(g * 100).toFixed(1)}%/anno</strong>, inflazione <strong style={{ color: "#7c3aed" }}>{(INFL * 100).toFixed(1)}%/anno</strong>. La liquidità cumulata è la somma dei surplus annuali. Il patrimonio investito assume un rendimento del 5%/anno. Non costituisce consulenza finanziaria.
      </div>
    </div>
  );
})()}

{(PLAN_LIMITS[plan].reportPdf || PLAN_LIMITS[plan].exportExcel) && (
  <div style={{ display: "flex", gap: 10, margin: "20px 0 12px" }}>
    {PLAN_LIMITS[plan].reportPdf   && <button style={{ ...styles.smallButton, padding: "8px 16px" }}>Scarica PDF</button>}
    {PLAN_LIMITS[plan].exportExcel && <button style={{ ...styles.smallButton, padding: "8px 16px" }}>Esporta Excel</button>}
  </div>
)}
{plan === "free" && (
  <div style={{ fontSize: 12, opacity: 0.35, margin: "20px 0 12px" }}>
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
      color: "rgba(255,255,255,0.40)",
      features: [
        { label: "Simulazioni al mese", value: "1", ok: true },
        { label: "Orizzonte temporale", value: "10 anni", ok: true },
        { label: "Scenari di simulazione", value: "Solo realistico", ok: true },
        { label: "Score finanziario", value: "Base", ok: true },
        { label: "Dashboard storica", value: "30 giorni", ok: true },
        { label: "AI Coach finanziario", value: "Limitato", ok: true },
        { label: "Grafici proiettivi", value: "Liquidità, stipendio, spese", ok: true },
        { label: "Simulazione pensione INPS", value: null, ok: false },
        { label: "Scenari pessimistico/ottimistico", value: null, ok: false },
        { label: "Confronto scelte di vita", value: null, ok: false },
        { label: "Report PDF", value: null, ok: false },
        { label: "Esportazione Excel", value: null, ok: false },
        { label: "Crescita salariale attesa", value: null, ok: false },
        { label: "Aggiornamento automatico dati", value: null, ok: false },
      ],
    },
    {
      id: "pro", label: "Pro", price: "€ 9,99", priceNote: "/ mese", popular: true,
      color: "#3b82f6",
      features: [
        { label: "Simulazioni al mese", value: "5", ok: true },
        { label: "Orizzonte temporale", value: "30 anni", ok: true },
        { label: "Scenari di simulazione", value: "Pessimistico, realistico, ottimistico", ok: true },
        { label: "Score finanziario", value: "Avanzato", ok: true },
        { label: "Dashboard storica", value: "1 anno", ok: true },
        { label: "AI Coach finanziario", value: "Completo", ok: true },
        { label: "Grafici proiettivi", value: "Liquidità, stipendio, spese", ok: true },
        { label: "Simulazione pensione INPS", value: "Sistema contributivo", ok: true },
        { label: "Scenari pessimistico/ottimistico", value: "Inclusi", ok: true },
        { label: "Confronto scelte di vita", value: "Casa, auto, FIRE", ok: true },
        { label: "Report PDF", value: "Download illimitati", ok: true },
        { label: "Esportazione Excel", value: "Download illimitati", ok: true },
        { label: "Crescita salariale attesa", value: null, ok: false },
        { label: "Aggiornamento automatico dati", value: null, ok: false },
      ],
    },
    {
      id: "premium", label: "Premium", price: "€ 19,99", priceNote: "/ mese",
      color: "#f59e0b",
      features: [
        { label: "Simulazioni al mese", value: "20", ok: true },
        { label: "Orizzonte temporale", value: "70 anni", ok: true },
        { label: "Scenari di simulazione", value: "Pessimistico, realistico, ottimistico", ok: true },
        { label: "Score finanziario", value: "Professionale", ok: true },
        { label: "Dashboard storica", value: "Illimitata", ok: true },
        { label: "AI Coach finanziario", value: "Avanzato + consigli personalizzati", ok: true },
        { label: "Grafici proiettivi", value: "Liquidità, stipendio, spese", ok: true },
        { label: "Simulazione pensione INPS", value: "Sistema contributivo", ok: true },
        { label: "Scenari pessimistico/ottimistico", value: "Inclusi", ok: true },
        { label: "Confronto scelte di vita", value: "Casa, auto, FIRE", ok: true },
        { label: "Report PDF", value: "Download illimitati", ok: true },
        { label: "Esportazione Excel", value: "Download illimitati", ok: true },
        { label: "Crescita salariale attesa", value: "Proiezione a 10/20/30 anni", ok: true },
        { label: "Aggiornamento automatico dati", value: "Dati mercato in tempo reale", ok: true },
      ],
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {planDefs.map((p) => {
            const isActive = plan === p.id;
            const accentColor = p.color;
            const accentBg = p.id === "premium" ? "rgba(245,158,11,0.08)" : p.id === "pro" ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.03)";
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

                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, flex: 1, minWidth: 0 }}>
                        <span style={{ flexShrink: 0, fontSize: 12, marginTop: 1, color: f.ok ? accentColor : "rgba(255,255,255,0.20)" }}>
                          {f.ok ? "✓" : "✗"}
                        </span>
                        <span style={{ fontSize: 12, color: f.ok ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.22)", lineHeight: 1.45 }}>{f.label}</span>
                      </div>
                      {f.ok && f.value && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: accentColor, background: `${accentColor}18`, border: `1px solid ${accentColor}30`, padding: "2px 7px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0, marginLeft: 4 }}>
                          {f.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

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
    home:      "radial-gradient(ellipse 75% 60% at 15% 35%, rgba(37,99,235,0.55), transparent 60%), radial-gradient(ellipse 65% 55% at 85% 70%, rgba(124,58,237,0.42), transparent 60%), radial-gradient(ellipse 50% 45% at 55% 95%, rgba(16,185,129,0.22), transparent 55%)",
    dashboard: "radial-gradient(ellipse 75% 60% at 10% 20%, rgba(16,185,129,0.48), transparent 60%), radial-gradient(ellipse 65% 55% at 80% 80%, rgba(6,182,212,0.40), transparent 60%), radial-gradient(ellipse 45% 40% at 50% 50%, rgba(37,99,235,0.18), transparent 55%)",
    scenario:  "radial-gradient(ellipse 70% 55% at 75% 20%, rgba(245,158,11,0.48), transparent 60%), radial-gradient(ellipse 60% 55% at 20% 75%, rgba(239,68,68,0.38), transparent 60%), radial-gradient(ellipse 50% 45% at 50% 50%, rgba(124,58,237,0.20), transparent 55%)",
    history:   "radial-gradient(ellipse 70% 60% at 20% 20%, rgba(99,102,241,0.52), transparent 60%), radial-gradient(ellipse 65% 55% at 75% 70%, rgba(168,85,247,0.42), transparent 60%), radial-gradient(ellipse 45% 40% at 50% 50%, rgba(59,130,246,0.20), transparent 55%)",
    account:   "radial-gradient(ellipse 70% 60% at 80% 25%, rgba(234,179,8,0.48), transparent 60%), radial-gradient(ellipse 60% 55% at 20% 70%, rgba(249,115,22,0.42), transparent 60%), radial-gradient(ellipse 45% 40% at 50% 55%, rgba(239,68,68,0.18), transparent 55%)",
    settings:  "radial-gradient(ellipse 65% 60% at 50% 20%, rgba(100,116,139,0.50), transparent 60%), radial-gradient(ellipse 60% 55% at 50% 80%, rgba(71,85,105,0.42), transparent 60%), radial-gradient(ellipse 50% 45% at 20% 55%, rgba(37,99,235,0.22), transparent 55%)",
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
        background: "rgba(8,12,32,0.82)",
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
        background: "linear-gradient(180deg, rgba(8,12,32,0.98), rgba(6,9,24,0.98))",
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
    background: "#080c20",
    color: T.text,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    overflowX: "hidden",
  },
  bg: {
    position: "fixed", inset: 0,
    filter: "blur(90px) saturate(1.6)",
    zIndex: 0, opacity: 0.85,
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
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    backdropFilter: "blur(16px)",
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
    background: "rgba(8,12,32,0.82)",
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
    background: "rgba(14,20,40,0.95)",
    border: `1px solid ${T.borderHi}`,
    backdropFilter: "blur(28px)",
    display: "flex", flexDirection: "column", gap: 12, alignItems: "center",
    boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
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