import { useEffect, useState, useRef } from "react";
import Plotly from "plotly.js-dist-min";

const COLORS = [
  "#4ea8ff","#f97316","#22d3ee","#a78bfa",
  "#34d399","#fb7185","#fbbf24","#60a5fa",
  "#e879f9","#4ade80"
];

const LAYOUT = (yLabel) => ({
  paper_bgcolor: "transparent",
  plot_bgcolor: "#111",
  font: { color: "#aaa" },
  xaxis: { gridcolor: "#2a2a2a", zerolinecolor: "#333" },
  yaxis: { title: yLabel, gridcolor: "#2a2a2a", zerolinecolor: "#333" },
  legend: { bgcolor: "transparent", font: { color: "#aaa" } },
  margin: { t: 30, r: 20, b: 60, l: 60 },
  hovermode: "closest",
  autosize: true,
});

const CONFIG = { responsive: true, displayModeBar: false };

function PlotlyChart({ traces, yLabel }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    Plotly.newPlot(ref.current, traces, LAYOUT(yLabel), CONFIG);
    return () => Plotly.purge(ref.current);
  }, [traces, yLabel]);
  return <div ref={ref} style={{ width: "100%", height: 400 }} />;
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/covid_data.json")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — make sure covid_data.json is in public/`);
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e.message));
  }, []);

  if (error) return (
    <div style={styles.center}>
      <p style={{ color: "#f87171" }}>⚠️ {error}</p>
      <p style={{ color: "#888", marginTop: 8, fontSize: "0.85rem" }}>
        Run your Python script to generate <code>public/covid_data.json</code>
      </p>
    </div>
  );

  if (!data) return <div style={styles.center}>Loading data…</div>;

  const lineTraces = data.cases.map((c, i) => ({
    type: "scatter",
    mode: "lines",
    name: c.country,
    x: c.dates,
    y: c.values,
    line: { color: COLORS[i % COLORS.length], width: 2 },
  }));

  const sorted = [...data.deaths.countries.map((c, i) => ({
    country: c, value: data.deaths.values[i]
  }))].sort((a, b) => b.value - a.value);

  const barTrace = {
    type: "bar",
    x: sorted.map(d => d.country),
    y: sorted.map(d => d.value),
    marker: { color: sorted.map((_, i) => COLORS[i % COLORS.length]) },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>🦠 COVID-19 Global Dashboard</h1>
        <p style={styles.subtitle}>
          Data: <a href="https://ourworldindata.org/covid-cases" style={styles.link}
            target="_blank" rel="noreferrer">Our World in Data</a>
          &nbsp;·&nbsp; 10 countries compared
        </p>
      </header>

      <div style={styles.grid}>
        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <h2 style={styles.cardTitle}>New Cases per Million (7-day avg)</h2>
          <p style={styles.hint}>Click legend to toggle countries · drag to zoom · double-click to reset</p>
          <PlotlyChart traces={lineTraces} yLabel="Cases per Million" />
        </div>

        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <h2 style={styles.cardTitle}>Total Deaths per Million by Country</h2>
          <p style={styles.hint}>Sorted by highest deaths per million</p>
          <PlotlyChart traces={[barTrace]} yLabel="Deaths per Million" />
        </div>
      </div>

      <footer style={styles.footer}>
        Built with React + Plotly.js · Source data from OWID
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0f0f0f", color: "#e0e0e0", fontFamily: "Inter, sans-serif", padding: "0 0 40px" },
  header: { padding: "40px 40px 20px", borderBottßom: "1px solid #222" },
  title: { fontSize: "2rem", margin: 0, fontWeight: 700 },
  subtitle: { margin: "8px 0 0", color: "#888", fontSize: "0.95rem" },
  link: { color: "#4ea8ff", textDecoration: "none" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", padding: "32px 40px" },
  card: { background: "#1a1a1a", borderRadius: "12px", padding: "24px", border: "1px solid #2a2a2a" },
  cardTitle: { fontSize: "1.1rem", margin: "0 0 6px", fontWeight: 600 },
  hint: { fontSize: "0.8rem", color: "#666", margin: "0 0 16px" },
  footer: { textAlign: "center", color: "#444", fontSize: "0.85rem", paddingTop: "20px" },
  center: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f0f0f", color: "#888", fontSize: "1.2rem" },
};