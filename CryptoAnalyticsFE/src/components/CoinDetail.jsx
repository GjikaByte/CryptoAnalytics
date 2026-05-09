import { useEffect, useState } from "react";
import { getCryptoById } from "../api/cryptoApi";
import StarButton from "./StarButton";
import "./CoinDetail.css";

function fmtPrice(v) {
  if (v == null) return "-";
  if (v < 0.000001) return "$" + v.toFixed(10);
  if (v < 0.01) return "$" + v.toFixed(6);
  if (v < 1) return "$" + v.toFixed(4);
  return "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}
function fmtLarge(v) {
  if (v == null) return "-";
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return "$" + (v / 1e3).toFixed(1) + "K";
  return "$" + v;
}
function fmtNum(v) {
  if (v == null) return "-";
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toFixed(2);
}
function fmtDate(instant) {
  if (!instant) return "-";
  return new Date(instant).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function iconStyle(symbol) {
  const colors = [
    ["#06b6d4", "#003322"], ["#6366f1", "#1e1b4b"], ["#f59e0b", "#2d1f00"],
    ["#ec4899", "#2d0019"], ["#06b6d4", "#001a1f"], ["#8b5cf6", "#1a0f2e"],
    ["#10b981", "#022c1a"], ["#f97316", "#2d1000"],
  ];
  const idx = (symbol?.charCodeAt(0) || 0) % colors.length;
  return { color: colors[idx][0], background: colors[idx][1] };
}

export default function CoinDetail({ cryptoId, onBack, isStarred, onToggleStar }) {
  const [c, setC] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setC(null); setErr(null);
    getCryptoById(cryptoId)
      .then((d) => { if (!cancelled) setC(d); })
      .catch((e) => { if (!cancelled) setErr(e.message); });
    return () => { cancelled = true; };
  }, [cryptoId]);

  if (err) {
    return (
      <div className="coin-detail-page">
        <button className="cd-back" onClick={onBack}>← Back</button>
        <div className="cd-error">Failed to load coin: {err}</div>
      </div>
    );
  }
  if (!c) {
    return (
      <div className="coin-detail-page">
        <button className="cd-back" onClick={onBack}>← Back</button>
        <div className="cd-loading">Loading…</div>
      </div>
    );
  }

  const change = c.priceChangePercentage24h;
  const cc = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
  const rangePct = (c.high24h && c.low24h && c.currentPrice)
    ? Math.min(100, Math.max(0, ((c.currentPrice - c.low24h) / (c.high24h - c.low24h)) * 100))
    : 50;

  return (
    <div className="coin-detail-page">
      <div className="cd-toolbar">
        <button className="cd-back" onClick={onBack}>← Back</button>
        <StarButton isStarred={isStarred} onToggle={onToggleStar} size="lg" />
      </div>

      <div className="cd-header">
        <div className="cd-icon" style={iconStyle(c.symbol)}>
          {c.symbol?.slice(0, 2).toUpperCase()}
        </div>
        <div className="cd-title">
          <h1>{c.name}</h1>
          <div className="cd-sub">
            <span className="cd-symbol">{c.symbol?.toUpperCase()}</span>
            <span className="cd-rank">Rank #{c.marketCapRank ?? "—"}</span>
          </div>
        </div>
        <div className="cd-price-block">
          <div className="cd-price">{fmtPrice(c.currentPrice)}</div>
          <div className={`cd-change change ${cc}`}>
            {change != null ? (change > 0 ? "+" : "") + change.toFixed(2) + "%" : "—"}
          </div>
        </div>
      </div>

      <div className="cd-range-card">
        <div className="cd-range-row">
          <span className="cd-range-label">Low {fmtPrice(c.low24h)}</span>
          <span className="cd-range-label">High {fmtPrice(c.high24h)}</span>
        </div>
        <div className="cd-range-bar">
          <div className="cd-range-fill" style={{ width: rangePct + "%" }} />
          <div className="cd-range-marker" style={{ left: rangePct + "%" }} />
        </div>
        <div className="cd-range-current">Current {fmtPrice(c.currentPrice)}</div>
      </div>

      <div className="cd-grid">
        {[
          ["Market Cap", fmtLarge(c.marketCap)],
          ["Volume 24h", fmtLarge(c.totalVolume)],
          ["Fully Diluted", fmtLarge(c.fullyDilutedValuation)],
          ["Mkt Cap Δ 24h", fmtLarge(c.marketCapChange24h)],
          ["Mkt Cap Δ %", c.marketCapChangePercentage24h != null ? c.marketCapChangePercentage24h.toFixed(2) + "%" : "-"],
          ["Price Δ 24h", fmtPrice(c.priceChange24h)],
          ["Circulating", fmtNum(c.circulatingSupply)],
          ["Total Supply", fmtNum(c.totalSupply)],
          ["Max Supply", c.maxSupply ? fmtNum(c.maxSupply) : "∞"],
          ["ATH", fmtPrice(c.ath)],
          ["ATH Δ %", c.athChangePercentage != null ? c.athChangePercentage.toFixed(2) + "%" : "-"],
          ["ATH Date", fmtDate(c.athDate)],
          ["ATL", fmtPrice(c.atl)],
          ["ATL Δ %", c.atlChangePercentage != null ? c.atlChangePercentage.toFixed(2) + "%" : "-"],
          ["ATL Date", fmtDate(c.atlDate)],
          ["Last Updated", fmtDate(c.lastUpdated)],
        ].map(([label, val]) => (
          <div key={label} className="cd-stat">
            <div className="cd-stat-label">{label}</div>
            <div className="cd-stat-value">{val}</div>
          </div>
        ))}
      </div>

      {(c.roiTimes != null || c.roiPercentage != null) && (
        <div className="cd-roi-card">
          <h3>ROI</h3>
          <div className="cd-roi-row">
            <div><span className="cd-stat-label">Times</span><span className="cd-stat-value">{c.roiTimes != null ? c.roiTimes.toFixed(2) + "x" : "-"}</span></div>
            <div><span className="cd-stat-label">Currency</span><span className="cd-stat-value">{c.roiCurrency ?? "-"}</span></div>
            <div><span className="cd-stat-label">Percentage</span><span className="cd-stat-value">{c.roiPercentage != null ? c.roiPercentage.toFixed(2) + "%" : "-"}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
