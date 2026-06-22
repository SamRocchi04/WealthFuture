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

//#region APP

export default function App() {
  const [users, setUsers] = useState([]);
  const [logged, setLogged] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("home");
  const [authPage, setAuthPage] = useState(null);
  const [history, setHistory] = useState([]);
  const [plan, setPlan] = useState("free");

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
      <Background page={page} />
      <TopBar page={page} setPage={setPage} />

      <div style={styles.container}>
        {page === "home" && (
          <PageTransition key="home">
            <Home setPage={setPage} />
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
              { label: "Patrimonio simulato",   val: "€ 2.4 mld", sub: "tra tutti gli utenti" },
              { label: "Simulazioni generate",  val: "340k+",      sub: "ultimi 12 mesi" },
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
            <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}`, background: C.greenDim }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.green, marginBottom: 6 }}>Patrimonio stimato a 30 anni</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.green, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>€ 436.000</div>
            </div>
            <div style={{ padding: "18px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.hint, marginBottom: 14 }}>Crescita patrimoniale</div>
              <BarChart />
            </div>
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
            }}>Crea account gratuito →</button>
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

  const FieldError = ({ field }) =>
  fieldMessages[field] ? (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12,
      color: "rgba(255,255,255,0.92)",
      background: "rgba(239,68,68,0.22)",
      border: "1px solid rgba(239,68,68,0.4)",
      borderRadius: 7,
      padding: "5px 10px",
      marginTop: -4,
      marginBottom: 2,
      lineHeight: 1.4,
      animation: "fadeInDown 0.25s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <span style={{ fontSize: 13 }}>⚠️</span>
      {fieldMessages[field]}
    </div>
    ) : null;

  return (
    <div style={styles.app}>
      <div style={{
        ...styles.bg,
        ...bgAnimStyle,
        background: "radial-gradient(circle at 30% 40%, rgba(15,118,110,0.85), transparent 60%), radial-gradient(circle at 75% 65%, rgba(30,58,138,0.75), transparent 55%)"
      }} />

      <div style={styles.loginWrapper}>
        <div style={{ ...styles.loginCard, ...cardAnimStyle }}>

          {/* ── Logo (più grande, gap ridotto) ── */}
          <img
            src="/logo.png"
            style={{
              ...fieldAnim(0),
              width: 300,
              height: "auto",
              marginBottom: 4,
            }}
            alt="WealthFuture"
            onError={(e) => { e.target.style.display = "none"; }}
          />

          <div style={{
  ...styles.loginSlogan,
  ...fieldAnim(1),
  fontStyle: "normal",
  opacity: 1,
  fontSize: 20,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  marginBottom: 20,
  marginTop: 0,
}}>
  {isRegister ? "Crea il tuo account" : "Bentornato"}
</div>

          {/* ── Global error banner ── */}
          
            {error && (
  <div style={{
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    background: "rgba(239,68,68,0.18)",
    border: "1px solid rgba(239,68,68,0.55)",
    color: "rgba(255,100,100,1)",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.5,
    textAlign: "center",
    animation: "fadeInDown 0.3s cubic-bezier(0.22,1,0.36,1)",
    textShadow: "0 0 12px rgba(239,68,68,0.4)",
  }}>
    {error}
  </div>
          )}

          {/* ── Register-only fields ── */}
          {isRegister && (
            <>
              <input
                placeholder="Nome"
                style={{ ...inputStyle("nome"), ...fieldAnim(2) }}
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setFieldErrors(p => ({ ...p, nome: false }));
                  setFieldMessages(p => ({ ...p, nome: "" }));
                }}
                onBlur={handleBlurNome}
              />
              <FieldError field="nome" />

              <input
                placeholder="Cognome"
                style={{ ...inputStyle("cognome"), ...fieldAnim(3) }}
                value={cognome}
                onChange={(e) => {
                  setCognome(e.target.value);
                  setFieldErrors(p => ({ ...p, cognome: false }));
                  setFieldMessages(p => ({ ...p, cognome: "" }));
                }}
                onBlur={handleBlurCognome}
              />
              <FieldError field="cognome" />
            </>
          )}

          {/* ── Email ── */}
          <input
            placeholder="Email"
            type="email"
            style={{ ...inputStyle("email"), ...fieldAnim(isRegister ? 4 : 2) }}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors(p => ({ ...p, email: false }));
              setFieldMessages(p => ({ ...p, email: "" }));
            }}
            onBlur={handleBlurEmail}
          />
          <FieldError field="email" />

          {/* ── Password + strength bar ── */}
          <input
            placeholder="Password"
            type="password"
            style={{ ...inputStyle("password"), ...fieldAnim(isRegister ? 5 : 3), marginBottom: 6 }}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors(p => ({ ...p, password: false }));
              setFieldMessages(p => ({ ...p, password: "" }));
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          />

          {/* Strength bar (always visible when typing) */}
          {password.length > 0 && (
            <div style={{ ...fieldAnim(isRegister ? 6 : 4), width: "100%", marginBottom: 6 }}>
              {/* Track */}
              <div style={{
                width: "100%",
                height: 4,
                borderRadius: 99,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}>
                {/* Fill */}
                <div style={{
                  height: "100%",
                  borderRadius: 99,
                  width: strength.width,
                  background: strength.color,
                  boxShadow: `0 0 8px ${strength.color}`,
                  transition: "width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.4s ease, box-shadow 0.4s ease",
                }} />
              </div>
              {/* Label */}
              <div style={{
  marginTop: 4,
  fontSize: 12,
  color: strength.color,
  textAlign: "right",
  transition: "color 0.3s ease",
  letterSpacing: "0.03em",
  fontWeight: 700,
  textShadow: `0 0 10px ${strength.color}`,
}}>
  {strength.label}
</div>
              {/* Requirements hint */}
              {isRegister && (
  <div style={{
    marginTop: 3,
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.6,
  }}>
    Richiesti: maiuscola · minuscola · numero · carattere speciale
  </div>
)}
            </div>
          )}

          <FieldError field="password" />

          {/* ── Submit ── */}
          <button
            style={{ ...styles.button, ...fieldAnim(isRegister ? 7 : 5) }}
            onClick={handleSubmit}
          >
            {isRegister ? "Crea account" : "Accedi"}
          </button>

          <button
            onClick={onBack}
            style={{
              ...fieldAnim(isRegister ? 8 : 6),
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            Torna indietro
          </button>
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

function Home({ setPage }) {
  const [visible, setVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const openModal = (item) => {
  setSelectedNews(item);
  setTimeout(() => setModalVisible(true), 10);
};

const closeModal = () => {
  setModalVisible(false);
  setTimeout(() => setSelectedNews(null), 300);
};
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
              <button style={{ padding: "12px 24px", borderRadius: 14, border: "none", background: "linear-gradient(90deg,#3b82f6,#ec4899)", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 24px rgba(59,130,246,0.4)" }} onClick={() => setPage("scenario")}>
                Inizia ora
              </button>
              <button style={{ padding: "12px 24px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "white", fontWeight: 600, fontSize: 15, cursor: "pointer", backdropFilter: "blur(10px)" }} onClick={() => setPage("dashboard")}>
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

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Novità & Aggiornamenti</h2>
          <div style={{ marginLeft: 8, background: "linear-gradient(90deg,#3b82f6,#ec4899)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "white" }}>NUOVO</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1 }}>
          {news.map((item, i) => (
  <div
    key={i}
    onClick={() => openModal(item)}
    style={{
      padding: "24px 20px",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      transition: "background 0.2s",
      cursor: "pointer",
      borderRadius: 12,
    }}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >
    <div style={{ fontSize: 11, opacity: 0.4, marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.date}</div>
    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "white" }}>{item.title}</div>
    <div style={{ fontSize: 13, opacity: 0.55, lineHeight: 1.7 }}>{item.desc}</div>
    <div style={{ marginTop: 10, fontSize: 12, color: "#60a5fa", opacity: 0.7 }}>Leggi di più →</div>
  </div>
))}
        </div>
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
      zIndex: 9999,
      transition: "background 0.3s ease, backdrop-filter 0.3s ease",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "640px",
        maxWidth: "90%",
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
      <div style={{
        display: "inline-block",
        background: "linear-gradient(90deg,#3b82f6,#ec4899)",
        borderRadius: 20,
        padding: "3px 12px",
        fontSize: 11,
        fontWeight: 700,
        color: "white",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 16,
      }}>
        {selectedNews.date}
      </div>

      <h2 style={{
        margin: "0 0 16px 0",
        fontSize: 24,
        fontWeight: 800,
        color: "white",
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
      }}>
        {selectedNews.title}
      </h2>

      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 20 }} />

      <p style={{
        margin: 0,
        fontSize: 15,
        lineHeight: 1.8,
        color: "rgba(255,255,255,0.65)",
      }}>
        {selectedNews.longDesc}
      </p>

      <button
        onClick={closeModal}
        style={{
          marginTop: 32,
          padding: "10px 24px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.07)",
          color: "white",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}
      >
        Chiudi
      </button>
    </div>
  </div>
)}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Solo simulazioni</div>
            <div style={{ fontSize: 12, opacity: 0.45, lineHeight: 1.7 }}>Tutti i dati, i calcoli e le proiezioni mostrati su questa piattaforma sono puramente simulativi e a scopo educativo. Non costituiscono consulenza finanziaria, fiscale o legale.</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Privacy & Cookie</div>
            <div style={{ fontSize: 12, opacity: 0.45, lineHeight: 1.7 }}>I dati inseriti non vengono condivisi con terze parti. Utilizziamo cookie tecnici essenziali per il funzionamento del servizio. Non utilizziamo cookie di profilazione.</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#f472b6", textTransform: "uppercase", letterSpacing: "0.06em" }}>Termini d'uso</div>
            <div style={{ fontSize: 12, opacity: 0.45, lineHeight: 1.7 }}>L'uso della piattaforma implica l'accettazione dei termini di servizio. I risultati delle simulazioni hanno finalità esclusivamente illustrativa e non hanno valore legale o contrattuale.</div>
          </div>
          <div style={{ gridColumn: "1 / -1", fontSize: 11, opacity: 0.25, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            © 2025 WealthFuture — Piattaforma di simulazione finanziaria. Tutti i diritti riservati. I rendimenti passati non garantiscono quelli futuri.
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
    { label: "Miglior scenario", value: bestScenario ? `€ ${bestScenario.pension.toFixed(0)}` : "—", unit: "" },
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
          <span style={styles.sectionTitle}>AI Coach Finanziario</span>
          <span style={{ ...planBadgeStyle(plan), marginLeft: 10 }}>
            {PLAN_LIMITS[plan].aiCoach === "limitato" ? "Limitato" : PLAN_LIMITS[plan].aiCoach === "completo" ? "Completo" : "Avanzato"}
          </span>
        </div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Trend reddito</span><span style={styles.dataValue}>{avgSalary > 3500 ? "Crescita stabile" : "Fase di accumulo"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Capacità risparmio</span><span style={styles.dataValue}>{avgSalary > 4000 ? "Alta capacità" : "Media capacità"}</span></div>
        {plan !== "free" && (<div style={styles.dataRow}><span style={styles.dataLabel}>Stabilità portfolio</span><span style={styles.dataValue}>{avgHealth > 70 ? "Portafoglio stabile" : "Alta volatilità"}</span></div>)}
        {plan !== "free" && (<div style={styles.dataRow}><span style={styles.dataLabel}>Scenario dominante</span><span style={styles.dataValue}>{last ? `${last.country} · ${last.sector}` : "Nessun dato"}</span></div>)}
        {plan === "premium" && (<div style={styles.dataRow}><span style={styles.dataLabel}>Aggiornamento automatico dati</span><span style={{ ...styles.dataValue, color: "#22c55e" }}>Attivo</span></div>)}
        {plan === "free" && (<div style={{ fontSize: 12, opacity: 0.4, marginTop: 12 }}>Sblocca insight avanzati con il piano Pro o Premium</div>)}
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Azioni rapide</span></div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Crea nuovo scenario</span>
          <button style={styles.smallButton} onClick={() => setPage("scenario")}>Nuovo</button>
        </div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Report PDF {!PLAN_LIMITS[plan].reportPdf && <span style={{ opacity: 0.4, fontSize: 11 }}> — Pro+</span>}</span>
          <button style={{ ...styles.smallButton, opacity: PLAN_LIMITS[plan].reportPdf ? 1 : 0.35, cursor: PLAN_LIMITS[plan].reportPdf ? "pointer" : "not-allowed" }} disabled={!PLAN_LIMITS[plan].reportPdf}>Scarica</button>
        </div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Esporta Excel {!PLAN_LIMITS[plan].exportExcel && <span style={{ opacity: 0.4, fontSize: 11 }}> — Pro+</span>}</span>
          <button style={{ ...styles.smallButton, opacity: PLAN_LIMITS[plan].exportExcel ? 1 : 0.35, cursor: PLAN_LIMITS[plan].exportExcel ? "pointer" : "not-allowed" }} disabled={!PLAN_LIMITS[plan].exportExcel}>Esporta</button>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Attività recente</span>
          <span style={{ fontSize: 12, opacity: 0.4 }}>
            {PLAN_LIMITS[plan].dashboardStorica === 0 ? "Storico illimitato" : PLAN_LIMITS[plan].dashboardStorica >= 365 ? `Storico ${Math.round(PLAN_LIMITS[plan].dashboardStorica / 365)} anno` : `Storico ${PLAN_LIMITS[plan].dashboardStorica} giorni`}
          </span>
        </div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Ultimo scenario creato</span><span style={styles.dataValue}>{last ? last.date : "—"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Utilizzo piattaforma</span><span style={styles.dataValue}>{totalScenarios > 5 ? "Attivo" : "Iniziale"}</span></div>
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

  function projectFinancialSituation(currentSalary, currentSavings, years, growthRate) {
    let salary = currentSalary;
    let savings = currentSavings;
    for (let i = 0; i < years; i++) {
      salary *= 1 + growthRate;
      savings = savings * 1.04 + salary * 12 * 0.20;
    }
    return { salary: Math.round(salary), savings: Math.round(savings) };
  }

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

    const salary = Number(data.salary || 0);
    const savings = Number(data.savings || 0);
    const age = Number(data.age || 30);
    const homeAge = data.hasHome ? Number(data.age) : Number(data.homeAge || age);
const carAge = data.hasCar ? Number(data.age) : Number(data.carAge || age);

    if (age < 16 || age > 100) { alert("Età non valida"); return; }
    if (homeAge < age || homeAge > 100) { alert("L'età di acquisto casa deve essere maggiore o uguale all'età attuale"); return; }
    if (carAge < age || carAge > 100) { alert("L'età di acquisto auto deve essere maggiore o uguale all'età attuale"); return; }
    if (!salary || !savings || !age) return;

    const growth = { Tecnologia: 0.05, Finanza: 0.04, Sanità: 0.03, Ingegneria: 0.035, Istruzione: 0.02, Altro: 0.025 }[data.sector] || 0.03;
    const retirementAge = 67;
    const yearsToRetirement = Math.max(0, retirementAge - age);

    function projectCapital(years, annualReturn) {
      let currentSalary = salary;
      let capital = savings;
      for (let i = 0; i < years; i++) {
        currentSalary *= 1 + growth;
        capital = capital * (1 + annualReturn) + currentSalary * 12 * 0.20;
      }
      return Math.round(capital);
    }

    const wealth = {
      10: { pess: projectCapital(10, 0.04), norm: projectCapital(10, 0.06), real: projectCapital(10, 0.08) },
      20: { pess: projectCapital(20, 0.04), norm: projectCapital(20, 0.06), real: projectCapital(20, 0.08) },
      30: { pess: projectCapital(30, 0.04), norm: projectCapital(30, 0.06), real: projectCapital(30, 0.08) },
    };

    const pension = projectCapital(yearsToRetirement, 0.06);
    const yearsToHome = Math.max(0, homeAge - age);
    const homeProjection = projectFinancialSituation(salary, savings, yearsToHome, growth);
    const futureHomeSalary = homeProjection.salary;
    const futureHomeSavings = homeProjection.savings;
    const maxMortgageRate = Math.round(futureHomeSalary * 0.33);
    const mortgageCapacity = Math.round(futureHomeSalary * 12 * 4.5);
    const affordableHousePrice = Math.round(mortgageCapacity + futureHomeSavings * 0.8);
    const yearsToCar = Math.max(0, carAge - age);
    const carProjection = projectFinancialSituation(salary, savings, yearsToCar, growth);
    const futureCarSalary = carProjection.salary;
    const maxLoanRate = Math.round(futureCarSalary * 0.15);
    const carLoanCapacity = Math.round(futureCarSalary * 10);
    const annualSalary = salary * 12;
    const savingsRatio = savings / Math.max(annualSalary, 1);
    const health = Math.min(100, Math.round(savingsRatio * 30 + (salary / 5000) * 40 + (age < 40 ? 30 : 20)));
    const monthlyExpenses = Number(data.expenses || 0);
    const monthlySurplus = salary - monthlyExpenses;
    const annualSurplus = monthlySurplus * 12;
    const savingsRate = salary > 0 ? Math.round((monthlySurplus / salary) * 100) : 0;
    const yearsToFinancialIndependence = monthlySurplus > 0 ? Math.ceil(savings / annualSurplus + (pension / annualSurplus)) : null;
    const breakEvenRetirement = salary > 0 ? Math.round((pension / (salary * 12)) * 100) : 0;

    const res = {
      id: Date.now(), date: new Date().toLocaleDateString(),
      age, country: data.country, sector: data.sector, salary, savings,
      growth, health, pension, wealth,
      homeAge, carAge, maxMortgageRate, mortgageCapacity, maxLoanRate, carLoanCapacity,
      monthlyExpenses, monthlySurplus, savingsRate, yearsToFinancialIndependence, breakEvenRetirement, affordableHousePrice,
      hasHome: data.hasHome, hasCar: data.hasCar,
    };

    setResult(res);
    setHistory((prev) => [res, ...prev]);
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
    { years: 40, pessimistico: result?.wealth[30].pess * 1.1,  normale: result?.wealth[30].norm * 1.2,  ottimistico: result?.wealth[30].real * 1.5 },
    { years: 50, pessimistico: result?.wealth[30].pess * 1.2,  normale: result?.wealth[30].norm * 1.35, ottimistico: result?.wealth[30].real * 1.7 },
    { years: 60, pessimistico: result?.wealth[30].pess * 1.25, normale: result?.wealth[30].norm * 1.5,  ottimistico: result?.wealth[30].real * 2 },
    { years: 70, pessimistico: result?.wealth[30].pess * 1.3,  normale: result?.wealth[30].norm * 1.7,  ottimistico: result?.wealth[30].real * 2.3 },
    { years: 80, pessimistico: result?.wealth[30].pess * 1.35, normale: result?.wealth[30].norm * 2,    ottimistico: result?.wealth[30].real * 2.8 },
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

          {[
  { key: "age", label: "Età", type: "number", min: 16, max: 100 },
  { key: "salary", label: "Stipendio netto mensile (€)", type: "number" },
  { key: "savings", label: "Risparmi attuali (€)", type: "number" },
  { key: "expenses", label: "Spese mensili (€)", type: "number", min: 0, step: 50 },
].map(({ key, label, type, min, max, step }) => (
  <div key={key} style={styles.field}>
    <label style={styles.label}>{label}</label>
    <input type={type} min={min} max={max} step={step}
      style={{ ...styles.input, borderColor: errors[key] ? "rgba(239,68,68,0.8)" : undefined }}
      value={data[key] || ""}
      onChange={(e) => setData({ ...data, [key]: e.target.value })} />
    {errors[key] && <div style={styles.fieldError}>Campo obbligatorio</div>}
  </div>
))}

<div style={styles.field}>
  <label style={styles.label}>Possiedi una casa?</label>
  <div style={{ display: "flex", gap: 10 }}>
    {["Sì", "No"].map((opt) => (
      <button key={opt} type="button"
        onClick={() => setData({ ...data, hasHome: opt === "Sì", homeAge: opt === "Sì" ? data.age : data.homeAge })}
        style={{ flex: 1, padding: "10px", borderRadius: 10, border: data.hasHome === (opt === "Sì") ? "1px solid rgba(59,130,246,0.8)" : "1px solid rgba(255,255,255,0.12)", background: data.hasHome === (opt === "Sì") ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
        {opt}
      </button>
    ))}
  </div>
</div>

{data.hasHome === false && (
  <div style={styles.field}>
    <label style={styles.label}>Età prevista acquisto casa</label>
    <input type="number" min={data.age || 16} max={100}
      style={{ ...styles.input, borderColor: errors.homeAge ? "rgba(239,68,68,0.8)" : undefined }}
      value={data.homeAge || ""}
      onChange={(e) => setData({ ...data, homeAge: e.target.value })} />
    {errors.homeAge && <div style={styles.fieldError}>Campo obbligatorio</div>}
  </div>
)}

<div style={styles.field}>
  <label style={styles.label}>Possiedi una macchina?</label>
  <div style={{ display: "flex", gap: 10 }}>
    {["Sì", "No"].map((opt) => (
      <button key={opt} type="button"
        onClick={() => setData({ ...data, hasCar: opt === "Sì", carAge: opt === "Sì" ? data.age : data.carAge })}
        style={{ flex: 1, padding: "10px", borderRadius: 10, border: data.hasCar === (opt === "Sì") ? "1px solid rgba(59,130,246,0.8)" : "1px solid rgba(255,255,255,0.12)", background: data.hasCar === (opt === "Sì") ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
        {opt}
      </button>
    ))}
  </div>
</div>

{data.hasCar === false && (
  <div style={styles.field}>
    <label style={styles.label}>Età prevista acquisto macchina</label>
    <input type="number" min={data.age || 16} max={100}
      style={{ ...styles.input, borderColor: errors.carAge ? "rgba(239,68,68,0.8)" : undefined }}
      value={data.carAge || ""}
      onChange={(e) => setData({ ...data, carAge: e.target.value })} />
    {errors.carAge && <div style={styles.fieldError}>Campo obbligatorio</div>}
  </div>
)}

<div style={styles.field}>
  <label style={styles.label}>Paese di residenza</label>
  <select style={{ ...styles.input, borderColor: errors.country ? "rgba(239,68,68,0.8)" : undefined }}
    value={data.country || ""} onChange={(e) => setData({ ...data, country: e.target.value })}>
    <option style={{ color: "#000" }}></option>
    {countries.map((c) => <option key={c} value={c} style={{ color: "#000", background: "#fff" }}>{c}</option>)}
  </select>
  {errors.country && <div style={styles.fieldError}>Campo obbligatorio</div>}
</div>

<div style={styles.field}>
  <label style={styles.label}>Settore lavorativo</label>
  <select style={{ ...styles.input, borderColor: errors.sector ? "rgba(239,68,68,0.8)" : undefined }}
    value={data.sector || ""} onChange={(e) => setData({ ...data, sector: e.target.value })}>
    <option style={{ color: "#000" }}></option>
    {sectors.map((s) => <option key={s} value={s} style={{ color: "#000", background: "#fff" }}>{s}</option>)}
  </select>
  {errors.sector && <div style={styles.fieldError}>Campo obbligatorio</div>}
</div>

          <button style={styles.button} onClick={run}>Calcola</button>
        </div>
      ) : (
        <div style={{ ...styles.narrowCard, maxWidth: 700 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>Risultato</h2>
            <div style={{ fontSize: 13, opacity: 0.45 }}>{result.country} · {result.sector} · {result.age} anni</div>
          </div>

          <div style={styles.kpiStrip}>
  <div style={styles.kpiItem}>
    <div style={styles.kpiLabel}>Score finanziario</div>
    <div style={styles.kpiValue}>{result.health}<span style={styles.kpiUnit}>/100</span></div>
    <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>{plan === "free" ? "Base" : plan === "pro" ? "Avanzato" : "Professionale"}</div>
  </div>
  {!result.hasHome && (
    <div style={styles.kpiItem}>
      <div style={styles.kpiLabel}>Mutuo max mensile</div>
      <div style={styles.kpiValue}>€ {result.maxMortgageRate}<span style={styles.kpiUnit}>/m</span></div>
    </div>
  )}
  {!result.hasCar && (
    <div style={styles.kpiItem}>
      <div style={styles.kpiLabel}>Finanziamento auto</div>
      <div style={styles.kpiValue}>€ {result.maxLoanRate}<span style={styles.kpiUnit}>/m</span></div>
    </div>
  )}
</div>

          <div style={styles.divider} />

          {PLAN_LIMITS[plan].simulazionePensione ? (
            <div style={styles.section}>
              <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Pensione stimata</span></div>
              <div style={styles.dataRow}>
                <span style={styles.dataLabel}>Patrimonio a 67 anni</span>
                <span style={{ ...styles.dataValue, color: "#22c55e", fontWeight: 700 }}>€ {result.pension.toFixed(0)}</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.4, padding: "12px 0" }}>Simulazione pensione disponibile dal piano Pro</div>
          )}

          {plan !== "free" && (
            <>
              <div style={styles.divider} />
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionTitle}>{plan === "premium" ? "Analisi Premium" : "Analisi Pro"}</span>
                </div>
                <div style={styles.dataRow}><span style={styles.dataLabel}>Surplus mensile</span><span style={styles.dataValue}>€ {result.monthlySurplus.toFixed(0)}</span></div>
                <div style={styles.dataRow}><span style={styles.dataLabel}>Tasso di risparmio</span><span style={styles.dataValue}>{result.savingsRate}%</span></div>
                {PLAN_LIMITS[plan].confrontoScelte && (
                  <>
                    <div style={styles.dataRow}><span style={styles.dataLabel}>Casa acquistabile (stima)</span><span style={styles.dataValue}>€ {result.affordableHousePrice?.toFixed(0) ?? "—"}</span></div>
                    <div style={styles.dataRow}><span style={styles.dataLabel}>Auto finanziabile (stima)</span><span style={styles.dataValue}>€ {result.carLoanCapacity.toFixed(0)}</span></div>
                  </>
                )}
                <div style={styles.dataRow}><span style={styles.dataLabel}>Copertura pensione</span><span style={styles.dataValue}>{result.breakEvenRetirement}% stipendio attuale</span></div>
                {result.yearsToFinancialIndependence && (
                  <div style={styles.dataRow}><span style={styles.dataLabel}>Anni all'indipendenza finanziaria</span><span style={styles.dataValue}>{result.yearsToFinancialIndependence} anni</span></div>
                )}
              </div>
            </>
          )}

          <div style={styles.divider} />

          <div style={{ marginBottom: 20 }}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>Patrimonio stimato</span>
              <span style={{ fontSize: 12, opacity: 0.4 }}>fino a {orizzonteAnni} anni</span>
            </div>
            {plan === "free" && (
              <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 8 }}>Scenari pessimistico e ottimistico disponibili dal piano Pro</div>
            )}
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="years" type="number" domain={[10, orizzonteAnni]}
                    ticks={allChartPoints.filter(p => p.years <= orizzonteAnni).map(p => p.years)}
                    label={{ value: "Anni", position: "insideBottom", offset: -10 }}
                    stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => new Intl.NumberFormat("it-IT", { notation: "compact", maximumFractionDigits: 1 }).format(v)}
                    stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = payload.find((p) => p.dataKey === activeLine);
                    if (!item) return null;
                    return (
                      <div style={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: 10, color: "white" }}>
                        <div style={{ color: item.stroke, fontWeight: 700, marginBottom: 4, fontSize: 12 }}>{item.dataKey}</div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>€ {Number(item.value).toFixed(0)}</div>
                        <div style={{ opacity: 0.45, marginTop: 4, fontSize: 11 }}>{label} anni</div>
                      </div>
                    );
                  }} />
                  <Legend verticalAlign="bottom" height={40} wrapperStyle={{ paddingTop: 25 }} />
                  {allowedLines.includes("pessimistico") && (
                    <Line type="monotone" dataKey="pessimistico" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 7 }} onMouseEnter={() => setActiveLine("pessimistico")} />
                  )}
                  <Line type="monotone" dataKey="normale" stroke="#9ca3af" strokeWidth={2} activeDot={{ r: 7 }} onMouseEnter={() => setActiveLine("normale")} />
                  {allowedLines.includes("ottimistico") && (
                    <Line type="monotone" dataKey="ottimistico" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 7 }} onMouseEnter={() => setActiveLine("ottimistico")} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {(PLAN_LIMITS[plan].reportPdf || PLAN_LIMITS[plan].exportExcel) && (
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {PLAN_LIMITS[plan].reportPdf && <button style={{ ...styles.smallButton, padding: "8px 16px" }}>Scarica PDF</button>}
              {PLAN_LIMITS[plan].exportExcel && <button style={{ ...styles.smallButton, padding: "8px 16px" }}>Esporta Excel</button>}
            </div>
          )}
          {plan === "free" && (
            <div style={{ fontSize: 12, opacity: 0.35, marginBottom: 12 }}>Report PDF ed Esportazione Excel disponibili dal piano Pro</div>
          )}

          <button style={styles.button} onClick={() => { setResult(null); setData({}); setErrors({}); }}>Nuovo Scenario</button>
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
        <div style={{ opacity: 0.4, fontSize: 14, padding: "40px 0" }}>Nessuno scenario ancora. Creane uno dalla sezione Nuovo Scenario.</div>
      )}

      <div style={{ maxWidth: 680 }}>
        {history.filter(Boolean).map((h) => {
          if (!h) return null;
          const open = openId === h.id;
          const pension = Number(h?.pension ?? 0);
          const mortgage = Number(h?.maxMortgageRate ?? 0);
          const health = Number(h?.health ?? 0);

          return (
            <div key={h.id} style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "18px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{h?.country || "—"} · {h?.sector || "—"}</div>
                  <div style={{ fontSize: 12, opacity: 0.4 }}>{h?.date}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, opacity: 0.5 }}>Score {health}/100</span>
                  <div onClick={() => setOpenId(open ? null : h.id)} style={{ cursor: "pointer", opacity: 0.5, fontSize: 18, userSelect: "none", padding: "2px 6px" }}>
                    {open ? "−" : "+"}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setHistory((prev) => prev.filter((s) => s.id !== h.id)); if (openId === h.id) setOpenId(null); }}
                    style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)", color: "rgba(239,68,68,0.8)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
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
                      { label: "Pensione stimata", value: `€ ${pension.toFixed(0)}`, highlight: true },
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1 }}>
          {planDefs.map((p) => {
            const isActive = plan === p.id;
            return (
              <div key={p.id} onClick={() => setPlan(p.id)} style={{ padding: "24px 20px", background: isActive ? "rgba(59,130,246,0.08)" : "transparent", border: isActive ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer", position: "relative", transition: "all 0.2s", margin: 4, borderRadius: 12 }}>
                {p.popular && (
                  <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#3b82f6,#ec4899)", color: "white", fontSize: 10, padding: "3px 12px", borderRadius: 20, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: "0.05em" }}>PIÙ POPOLARE</div>
                )}
                {isActive && (
                  <div style={{ position: "absolute", top: 12, right: 12, width: 18, height: 18, borderRadius: "50%", background: "rgba(59,130,246,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</div>
                )}
                <span style={planBadgeStyle(p.id)}>{p.label}</span>
                <div style={{ fontSize: 22, fontWeight: 800, margin: "10px 0 2px", letterSpacing: "-0.02em" }}>{p.price}</div>
                <div style={{ fontSize: 12, opacity: 0.45, marginBottom: 16 }}>{p.priceNote}</div>
                {p.features.map((f, i) => (
                  <div key={i} style={{ fontSize: 12, opacity: f.startsWith("—") ? 0.35 : 0.75, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{f}</div>
                ))}
                {!isActive && (
                  <button style={{ ...styles.smallButton, marginTop: 16, width: "100%" }} onClick={(e) => { e.stopPropagation(); setPlan(p.id); }}>
                    {plan === "premium" && p.id !== "premium" ? "Passa a " + p.label : "Attiva " + p.label}
                  </button>
                )}
                {isActive && <div style={{ marginTop: 16, fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>Piano attivo</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Insights finanziari</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Miglior scenario</span><span style={styles.dataValue}>{bestScenario ? `€ ${bestScenario.pension.toFixed(0)}` : "—"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Scenario dominante</span><span style={styles.dataValue}>{last ? `${last.country} · ${last.sector}` : "—"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Capacità finanziaria</span><span style={styles.dataValue}>{avgSalary > 4000 ? "Alta" : "Media"}</span></div>
        <div style={styles.dataRow}><span style={styles.dataLabel}>Livello utente</span><span style={styles.dataValue}>{total > 10 ? "Power user" : "Base user"}</span></div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Azioni account</span></div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Esporta dati PDF {!PLAN_LIMITS[plan].reportPdf && <span style={{ opacity: 0.35, fontSize: 11 }}> — Pro+</span>}</span>
          <button style={{ ...styles.smallButton, opacity: PLAN_LIMITS[plan].reportPdf ? 1 : 0.35, cursor: PLAN_LIMITS[plan].reportPdf ? "pointer" : "not-allowed" }} disabled={!PLAN_LIMITS[plan].reportPdf}>PDF</button>
        </div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Esporta Excel {!PLAN_LIMITS[plan].exportExcel && <span style={{ opacity: 0.35, fontSize: 11 }}> — Pro+</span>}</span>
          <button style={{ ...styles.smallButton, opacity: PLAN_LIMITS[plan].exportExcel ? 1 : 0.35, cursor: PLAN_LIMITS[plan].exportExcel ? "pointer" : "not-allowed" }} disabled={!PLAN_LIMITS[plan].exportExcel}>Excel</button>
        </div>
        <div style={styles.dataRow}>
          <span style={styles.dataLabel}>Sicurezza account</span>
          <button style={styles.smallButton}>Gestisci</button>
        </div>
      </div>
    </div>
  );
}

//#endregion

//#region SETTINGS

function Settings() {
  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Impostazioni</h2>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Interfaccia</span></div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Dark Mode avanzata</div><div style={{ opacity: 0.4, fontSize: 12, marginTop: 2 }}>Glass fintech UI</div></div>
          <input type="checkbox" defaultChecked />
        </div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Animazioni fluide</div><div style={{ opacity: 0.4, fontSize: 12, marginTop: 2 }}>Micro-interazioni stile banking</div></div>
          <input type="checkbox" defaultChecked />
        </div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Modalità compatta</div><div style={{ opacity: 0.4, fontSize: 12, marginTop: 2 }}>Riduce spacing UI</div></div>
          <input type="checkbox" />
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Motore di simulazione</span></div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Modello AI avanzato</div><div style={{ opacity: 0.4, fontSize: 12, marginTop: 2 }}>Crescita + rischio realistico</div></div>
          <input type="checkbox" defaultChecked />
        </div>
        <div style={styles.dataRow}>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Volatilità mercato</div><div style={{ opacity: 0.4, fontSize: 12, marginTop: 2 }}>Simulazione realistica</div></div>
          <input type="checkbox" defaultChecked />
        </div>
        <div style={styles.dataRow}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Proiezione pensione</div>
          <input type="checkbox" defaultChecked />
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Notifiche</span></div>
        <div style={styles.dataRow}><div style={{ fontWeight: 600, fontSize: 14 }}>Email report mensile</div><input type="checkbox" defaultChecked /></div>
        <div style={styles.dataRow}><div style={{ fontWeight: 600, fontSize: 14 }}>Alert crescita patrimonio</div><input type="checkbox" defaultChecked /></div>
        <div style={styles.dataRow}><div style={{ fontWeight: 600, fontSize: 14 }}>Riepilogo settimanale</div><input type="checkbox" /></div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Sicurezza</span></div>
        <div style={styles.dataRow}><div style={{ fontWeight: 600, fontSize: 14 }}>Cambia password</div><button style={styles.smallButton}>Apri</button></div>
        <div style={styles.dataRow}><div style={{ fontWeight: 600, fontSize: 14 }}>Autenticazione 2FA</div><button style={styles.smallButton}>Attiva</button></div>
        <div style={styles.dataRow}><div style={{ fontWeight: 600, fontSize: 14 }}>Reset account</div><button style={{ ...styles.smallButton, background: "rgba(239,68,68,0.7)" }}>Reset</button></div>
      </div>
    </div>
  );
}

//#endregion

//#region COMPONENTS

function Background({ page }) {
  const themes = {
    home:      "radial-gradient(circle at 15% 40%, rgba(59,130,246,0.85), transparent 55%), radial-gradient(circle at 85% 65%, rgba(139,92,246,0.7), transparent 55%)",
    dashboard: "radial-gradient(circle at 10% 20%, rgba(16,185,129,0.8), transparent 55%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.65), transparent 55%)",
    scenario:  "radial-gradient(circle at 70% 20%, rgba(245,158,11,0.8), transparent 55%), radial-gradient(circle at 20% 75%, rgba(239,68,68,0.6), transparent 55%)",
    history:   "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.8), transparent 55%), radial-gradient(circle at 75% 70%, rgba(168,85,247,0.65), transparent 55%)",
    account:   "radial-gradient(circle at 80% 25%, rgba(234,179,8,0.8), transparent 55%), radial-gradient(circle at 20% 70%, rgba(249,115,22,0.65), transparent 55%)",
    settings:  "radial-gradient(circle at 50% 20%, rgba(100,116,139,0.7), transparent 55%), radial-gradient(circle at 50% 80%, rgba(71,85,105,0.6), transparent 55%)",
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

  const underlineColors = {
    home: "#1f427d", dashboard: "#074f39", scenario: "#7a4c06",
    history: "#452569", account: "#bd8f19", settings: "#272e37",
  };

  const NavItem = ({ id, label }) => {
    const isActive = page === id;
    return (
      <div onClick={() => setPage(id)} style={{ display: "flex", alignItems: "center", padding: "6px 14px", cursor: "pointer", position: "relative", color: isActive ? "white" : "rgba(255,255,255,0.55)", fontWeight: isActive ? 600 : 400, fontSize: 13, whiteSpace: "nowrap", transition: "all .2s ease" }}>
        {label}
        {isActive && <div style={{ position: "absolute", bottom: -6, left: 8, right: 8, height: 2, borderRadius: 999, background: underlineColors[id] }} />}
      </div>
    );
  };

  const menuItems = [
    ["home", "Home"], ["dashboard", "Dashboard"], ["scenario", "Nuovo Scenario"],
    ["history", "Storico"], ["account", "Account"], ["settings", "Impostazioni"],
  ];

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 1000, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", backdropFilter: "blur(20px)", background: "rgba(10,10,20,0.65)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <img src="/logo.png" alt="" style={{ width: 32, height: 32, objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
          <span style={{ fontWeight: 800, fontSize: 15, background: "linear-gradient(90deg,#3b82f6,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WealthFuture</span>
        </div>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {menuItems.map(([id, label]) => <NavItem key={id} id={id} label={label} />)}
          </div>
        )}

        {isMobile && (
          <div onClick={() => setMobileMenu(!mobileMenu)} style={{ fontSize: 18, color: "white", cursor: "pointer", padding: "4px 8px", userSelect: "none" }}>☰</div>
        )}
      </div>

      <div onClick={() => setMobileMenu(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", zIndex: 9998, opacity: mobileMenu ? 1 : 0, visibility: mobileMenu ? "visible" : "hidden", transition: "opacity .3s ease, visibility .3s ease" }} />

      <div style={{ position: "fixed", top: 0, right: mobileMenu ? 0 : -280, width: 260, height: "100vh", background: "linear-gradient(180deg, rgba(12,12,20,0.98), rgba(8,8,14,0.98))", borderLeft: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", zIndex: 9999, opacity: mobileMenu ? 1 : 0, transform: mobileMenu ? "translateX(0)" : "translateX(30px)", transition: "right .35s cubic-bezier(.4,0,.2,1), opacity .35s ease, transform .35s ease", paddingTop: 80 }}>
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 10 }}>
          <div style={{ fontSize: 11, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Navigazione</div>
          <div style={{ marginTop: 6, fontWeight: 700, fontSize: 18, color: "white" }}>WealthFuture</div>
        </div>

        {menuItems.map(([id, label], index) => (
          <div key={id} onClick={() => { setPage(id); setMobileMenu(false); }} style={{ padding: "14px 22px", margin: "4px 12px", cursor: "pointer", position: "relative", color: page === id ? "white" : "rgba(255,255,255,0.65)", fontWeight: page === id ? 600 : 400, fontSize: 14, transition: `all .3s ease ${index * 0.05}s` }}>
            {label}
            {page === id && <div style={{ position: "absolute", bottom: 6, left: 22, right: 22, height: 2, borderRadius: 999, background: underlineColors[id] }} />}
          </div>
        ))}

        <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src="/logo.png" alt="" style={{ width: 44, height: 44, objectFit: "contain", marginBottom: 10 }} onError={(e) => { e.target.style.display = "none"; }} />
          <span style={{ fontWeight: 800, fontSize: 16, background: "linear-gradient(90deg,#3b82f6,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WealthFuture</span>
        </div>
      </div>
    </>
  );
}

//#endregion

//#region Helpers

function planBadgeStyle(plan) {
  const colors = {
    free:    { bg: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.6)" },
    pro:     { bg: "rgba(59,130,246,0.2)",   color: "#60a5fa" },
    premium: { bg: "rgba(234,179,8,0.2)",    color: "#fbbf24" },
  };
  const c = colors[plan] || colors.free;
  return { background: c.bg, color: c.color, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.07em", textTransform: "uppercase" };
}

//#endregion

//#region STYLES

const styles = {
  app: { minHeight: "100vh", background: "#000", color: "white", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif", overflowX: "hidden" },
  bg: { position: "fixed", inset: 0, filter: "blur(120px)", zIndex: 0 },
  container: { position: "relative", zIndex: 2, paddingTop: 70, overflowX: "hidden" },
  page: { padding: "32px 20px 80px", maxWidth: 1100, margin: "0 auto" },
  pageHeader: { marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.07)" },
  pageTitle: { fontSize: 26, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.02em" },
  planBar: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 },
  kpiStrip: { display: "flex", gap: 0, flexWrap: "wrap", margin: "24px 0" },
  kpiItem: { flex: "1 1 120px", padding: "0 16px 0 0", borderRight: "1px solid rgba(255,255,255,0.07)", marginRight: 16, marginBottom: 20 },
  kpiLabel: { fontSize: 11, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 },
  kpiValue: { fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "white" },
  kpiUnit: { fontSize: 14, fontWeight: 400, opacity: 0.5 },
  divider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0 24px" },
  section: { marginBottom: 24 },
  sectionHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5 },
  dataRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  dataLabel: { fontSize: 14, opacity: 0.75 },
  dataValue: { fontSize: 14, fontWeight: 600, color: "white" },
  center: { display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "70vh", padding: "32px 20px" },
  narrowCard: { width: "100%", maxWidth: 520, padding: "32px 0" },
  input: { width: "100%", height: 44, padding: "0 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#fff", boxSizing: "border-box", outline: "none", fontSize: 14, WebkitTextFillColor: "#fff", opacity: 1, transition: "border-color 0.2s" },
  button: { width: "100%", marginTop: 12, padding: "13px 20px", borderRadius: 12, border: "none", background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", letterSpacing: "0.01em" },
  topBar: { position: "fixed", top: 0, width: "100%", height: 60, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 10, boxSizing: "border-box", gap: 16 },
  smallButton: { padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", transition: "background 0.2s" },
  loginWrapper: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 2 },
  loginCard: { width: "min(400px, 92vw)", padding: "44px 32px", borderRadius: 20, background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(24px)", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" },
  loginLogo: { width: 120, height: 120, objectFit: "contain", marginBottom: 8 },
  loginSlogan: { fontStyle: "italic", opacity: 0.55, fontSize: 14, textAlign: "center", marginBottom: 8 },
  field: { display: "flex", flexDirection: "column", width: "100%", marginBottom: 16 },
  label: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" },
  fieldError: { color: "rgba(239,68,68,0.9)", fontSize: 11, marginTop: 5 },
};

//#endregion