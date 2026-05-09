import { useEffect, useState, useMemo } from "react";
import { getWatchlist, removeFromWatchlist } from "../api/cryptoApi";
import "./Watchlist.css";

function fmtPrice(v) {
  if (v == null) return "-";
  if (v < 0.01) return "$" + v.toFixed(4);
  return "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}
function fmtLarge(v) {
  if (v == null) return "-";
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return "$" + (v / 1e3).toFixed(1) + "K";
  return "$" + v;
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

export default function Watchlist({ onSelectCoin, onWatchlistChange }) {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getWatchlist()
      .then((d) => { if (!cancelled) setItems(d); })
      .catch((e) => { if (!cancelled) setErr(e.message); });
    return () => { cancelled = true; };
  }, []);

  async function handleRemove(id) {
    const updated = await removeFromWatchlist(id);
    setItems(updated);
    onWatchlistChange?.(new Set(updated.map(c => c.id)));
  }

  const sorted = useMemo(() => {
    if (!items) return [];
    return [...items].sort((a, b) => (a.marketCapRank ?? 9999) - (b.marketCapRank ?? 9999));
  }, [items]);

  if (err) {
    return <div className="wl-page"><div className="wl-error">Failed to load watchlist: {err}</div></div>;
  }
  if (items === null) {
    return <div className="wl-page"><div className="wl-loading">Loading watchlist…</div></div>;
  }

  return (
    <div className="wl-page">
      <div className="wl-header">
        <div>
          <h1>Watch<span>list</span></h1>
          <p>{items.length} coin{items.length !== 1 ? "s" : ""} starred</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty-icon">★</div>
          <h3>No coins yet</h3>
          <p>Open a coin from the Market tab and tap the star to add it here.</p>
        </div>
      ) : (
        <div className="wl-grid">
          {sorted.map((c) => {
            const change = c.priceChangePercentage24h;
            const cc = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
            return (
              <div key={c.id} className="wl-card" onClick={() => onSelectCoin(c.id)}>
                <div className="wl-row">
                  <div className="wl-icon" style={iconStyle(c.symbol)}>
                    {c.symbol?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="wl-name">
                    <strong>{c.name}</strong>
                    <span>{c.symbol?.toUpperCase()}</span>
                  </div>
                  <button
                    className="wl-remove"
                    onClick={(e) => { e.stopPropagation(); handleRemove(c.id); }}
                    title="Remove from watchlist"
                  >
                    ★
                  </button>
                </div>
                <div className="wl-stats">
                  <div className="wl-stat">
                    <span className="wl-label">Price</span>
                    <span className="wl-value">{fmtPrice(c.currentPrice)}</span>
                  </div>
                  <div className="wl-stat">
                    <span className="wl-label">24h</span>
                    <span className={`wl-value change ${cc}`}>
                      {change != null ? (change > 0 ? "+" : "") + change.toFixed(2) + "%" : "—"}
                    </span>
                  </div>
                  <div className="wl-stat">
                    <span className="wl-label">Mkt Cap</span>
                    <span className="wl-value">{fmtLarge(c.marketCap)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
