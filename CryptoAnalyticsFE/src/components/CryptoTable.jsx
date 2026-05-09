import React, { useState, useMemo } from "react";
import "./CryptoTable.css";
import Watchlist from "./Watchlist";
import Compare from "./Compare";
import Profile from "./Profile";

function formatPrice(value) {
  if (value == null) return "-";
  if (value < 0.000001) return "$" + value.toFixed(10);
  if (value < 0.01) return "$" + value.toFixed(6);
  if (value < 1)    return "$" + value.toFixed(4);
  return "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatLarge(value) {
  if (value == null) return "-";
  if (value >= 1_000_000_000) return "$" + (value / 1_000_000_000).toFixed(2) + "B";
  if (value >= 1_000_000)     return "$" + (value / 1_000_000).toFixed(2) + "M";
  if (value >= 1_000)         return "$" + (value / 1_000).toFixed(1) + "K";
  return "$" + value;
}

function formatNum(value) {
  if (value == null) return "-";
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + "B";
  if (value >= 1_000_000)     return (value / 1_000_000).toFixed(2) + "M";
  if (value >= 1_000)         return (value / 1_000).toFixed(1) + "K";
  return value.toFixed(2);
}

function fmtDate(instant) {
  if (!instant) return "-";
  return new Date(instant).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function getIconStyle(symbol) {
  const colors = [
    ["#06b6d4","#003322"], ["#6366f1","#1e1b4b"], ["#f59e0b","#2d1f00"],
    ["#ec4899","#2d0019"], ["#06b6d4","#001a1f"], ["#8b5cf6","#1a0f2e"],
    ["#10b981","#022c1a"], ["#f97316","#2d1000"],
  ];
  const idx = (symbol?.charCodeAt(0) || 0) % colors.length;
  return { color: colors[idx][0], background: colors[idx][1] };
}

function avgChange(arr) {
  const valid = arr.filter(c => c.priceChangePercentage24h != null);
  if (!valid.length) return null;
  return valid.reduce((s, c) => s + c.priceChangePercentage24h, 0) / valid.length;
}

const SORT_OPTIONS = [
  { key: "currentPrice",             label: "Price",   dir: "desc" },
  { key: "priceChangePercentage24h", label: "24h %",   dir: "desc" },
  { key: "marketCap",                label: "Mkt Cap", dir: "desc" },
  { key: "totalVolume",              label: "Volume",  dir: "desc" },
];

const PAGE_SIZE = 50;

const NAV = [
  { id: "market",    icon: "◈", label: "Market"     },
  { id: "analytics", icon: "◉", label: "Analytics"  },
  { id: "movers",    icon: "▲", label: "Top Movers" },
  { id: "watchlist", icon: "★", label: "Watchlist"  },
  { id: "compare",   icon: "⇆", label: "Compare"    },
  { id: "profile",   icon: "◍", label: "Profile"    },
];

function parseRangeInput(val) {
  if (val === "" || val == null) return null;
  const s = val.trim().toUpperCase();
  const num = parseFloat(s);
  if (isNaN(num)) return null;
  if (s.endsWith("B")) return num * 1_000_000_000;
  if (s.endsWith("M")) return num * 1_000_000;
  if (s.endsWith("K")) return num * 1_000;
  return num;
}

function RangeFilter({ label, minVal, maxVal, onMin, onMax, placeholder = ["Min", "Max"] }) {
  return (
    <div className="range-filter">
      <span className="range-label">{label}</span>
      <input className="range-input" placeholder={placeholder[0]} value={minVal} onChange={e => onMin(e.target.value)} />
      <span className="range-sep">–</span>
      <input className="range-input" placeholder={placeholder[1]} value={maxVal} onChange={e => onMax(e.target.value)} />
    </div>
  );
}

// ─── Live Badge ───────────────────────────────────────────────────────────────

function LiveBadge({ isRefreshing, lastUpdated, onManualRefresh }) {
  return (
    <div className="live-badge-wrap">
      <button
        className={`refresh-btn ${isRefreshing ? "spinning" : ""}`}
        onClick={onManualRefresh}
        title="Refresh now"
        disabled={isRefreshing}
      >
        ↻
      </button>
      <div className="live-badge">
        <span className="live-dot" />
        {isRefreshing ? "UPDATING…" : "LIVE"}
      </div>
      {lastUpdated && (
        <span className="last-updated">
          {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      )}
    </div>
  );
}

// ─── DetailPanel ─────────────────────────────────────────────────────────────

function DetailPanel({ crypto, onClose }) {
  if (!crypto) return null;
  const change      = crypto.priceChangePercentage24h;
  const changeClass = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>✕</button>
        <div className="detail-header">
          <div className="detail-icon" style={getIconStyle(crypto.symbol)}>
            {crypto.symbol?.slice(0, 2).toUpperCase()}
          </div>
          <div className="detail-title">
            <h2>{crypto.name}</h2>
            <span>{crypto.symbol?.toUpperCase()} · Rank #{crypto.marketCapRank ?? "—"}</span>
          </div>
        </div>
        <div className="detail-price">
          {formatPrice(crypto.currentPrice)}
          <small>
            <span className={`change ${changeClass}`}>
              {change != null ? (change > 0 ? "+" : "") + change.toFixed(2) + "%" : "-"}
            </span>
          </small>
        </div>
        <div className="detail-grid">
          {[
            ["Market Cap",    formatLarge(crypto.marketCap)],
            ["Volume 24h",    formatLarge(crypto.totalVolume)],
            ["High 24h",      formatPrice(crypto.high24h)],
            ["Low 24h",       formatPrice(crypto.low24h)],
            ["Price Δ 24h",   formatPrice(crypto.priceChange24h)],
            ["Mkt Cap Δ 24h", formatLarge(crypto.marketCapChange24h)],
            ["Mkt Cap Δ %",   crypto.marketCapChangePercentage24h != null ? crypto.marketCapChangePercentage24h.toFixed(2) + "%" : "-"],
            ["Fully Diluted", formatLarge(crypto.fullyDilutedValuation)],
            ["Circulating",   formatNum(crypto.circulatingSupply)],
            ["Total Supply",  formatNum(crypto.totalSupply)],
            ["Max Supply",    crypto.maxSupply ? formatNum(crypto.maxSupply) : "∞"],
            ["ATH",           formatPrice(crypto.ath)],
            ["ATH Δ %",       crypto.athChangePercentage != null ? crypto.athChangePercentage.toFixed(2) + "%" : "-"],
            ["ATH Date",      fmtDate(crypto.athDate)],
            ["ATL",           formatPrice(crypto.atl)],
            ["ATL Date",      fmtDate(crypto.atlDate)],
          ].map(([label, val]) => (
            <div key={label} className="detail-item">
              <div className="d-label">{label}</div>
              <div className="d-value">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MarketPage ───────────────────────────────────────────────────────────────

function MarketPage({ data, onSelect, lastUpdated, isRefreshing, onManualRefresh }) {
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState("marketCapRank");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage]       = useState(0);
  const [priceMin,  setPriceMin]  = useState("");
  const [priceMax,  setPriceMax]  = useState("");
  const [chgMin,    setChgMin]    = useState("");
  const [chgMax,    setChgMax]    = useState("");
  const [capMin,    setCapMin]    = useState("");
  const [capMax,    setCapMax]    = useState("");
  const [volMin,    setVolMin]    = useState("");
  const [volMax,    setVolMax]    = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  function handleSort(opt) {
    if (sortKey === opt.key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(opt.key); setSortDir(opt.dir); }
    setPage(0);
  }

  function clearFilters() {
    setPriceMin(""); setPriceMax("");
    setChgMin("");   setChgMax("");
    setCapMin("");   setCapMax("");
    setVolMin("");   setVolMax("");
    setSearch("");
    setPage(0);
  }

  const hasActiveFilters = priceMin || priceMax || chgMin || chgMax || capMin || capMax || volMin || volMax;

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const prMin = parseRangeInput(priceMin), prMax = parseRangeInput(priceMax);
    const cMin  = parseRangeInput(chgMin),   cMax  = parseRangeInput(chgMax);
    const mcMin = parseRangeInput(capMin),   mcMax = parseRangeInput(capMax);
    const vMin  = parseRangeInput(volMin),   vMax  = parseRangeInput(volMax);

    const list = data.filter(c => {
      if (!(c.name?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q))) return false;
      if (prMin != null && (c.currentPrice ?? 0) < prMin) return false;
      if (prMax != null && (c.currentPrice ?? 0) > prMax) return false;
      if (cMin  != null && (c.priceChangePercentage24h ?? 0) < cMin) return false;
      if (cMax  != null && (c.priceChangePercentage24h ?? 0) > cMax) return false;
      if (mcMin != null && (c.marketCap ?? 0) < mcMin) return false;
      if (mcMax != null && (c.marketCap ?? 0) > mcMax) return false;
      if (vMin  != null && (c.totalVolume ?? 0) < vMin) return false;
      if (vMax  != null && (c.totalVolume ?? 0) > vMax) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? (sortDir === "asc" ? Infinity : -Infinity);
      const bv = b[sortKey] ?? (sortDir === "asc" ? Infinity : -Infinity);
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [data, search, sortKey, sortDir, priceMin, priceMax, chgMin, chgMax, capMin, capMax, volMin, volMax]);

  const averages = useMemo(() => {
    const avg = (key) => {
      const valid = sorted.filter(c => c[key] != null);
      return valid.length ? valid.reduce((s, c) => s + c[key], 0) / valid.length : null;
    };
    return {
      price: avg("currentPrice"),
      chg:   avg("priceChangePercentage24h"),
      cap:   avg("marketCap"),
      vol:   avg("totalVolume"),
      high:  avg("high24h"),
      low:   avg("low24h"),
    };
  }, [sorted]);

  const totalPages  = Math.ceil(sorted.length / PAGE_SIZE);
  const slice       = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const gainers     = data.filter(c => c.priceChangePercentage24h > 0).length;
  const losers      = data.filter(c => c.priceChangePercentage24h < 0).length;
  const totalMktCap = data.reduce((s, c) => s + (c.marketCap || 0), 0);
  const avgChgClass = averages.chg > 0 ? "positive" : averages.chg < 0 ? "negative" : "neutral";

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Crypto<span>Analytics</span></h1>
          <p>
            {sorted.length < data.length
              ? <><strong style={{color:"#e2e8f0"}}>{sorted.length.toLocaleString()}</strong> filtered · </>
              : null}
            {data.length.toLocaleString()} assets · p.{page + 1}/{Math.max(totalPages, 1)}
          </p>
        </div>
        <LiveBadge isRefreshing={isRefreshing} lastUpdated={lastUpdated} onManualRefresh={onManualRefresh} />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="s-label">Total Assets</div>
          <div className="s-value">{data.length.toLocaleString()}</div>
          {sorted.length < data.length && <div className="s-sub">Filtered: {sorted.length.toLocaleString()}</div>}
        </div>
        <div className="stat-card">
          <div className="s-label">Gainers</div>
          <div className="s-value" style={{color:"#06b6d4"}}>{gainers}</div>
          <div className="s-sub">{((gainers/data.length)*100).toFixed(1)}% of market</div>
        </div>
        <div className="stat-card">
          <div className="s-label">Losers</div>
          <div className="s-value" style={{color:"#ff4d6d"}}>{losers}</div>
          <div className="s-sub">{((losers/data.length)*100).toFixed(1)}% of market</div>
        </div>
        <div className="stat-card">
          <div className="s-label">Total Mkt Cap</div>
          <div className="s-value" style={{fontSize:18}}>{formatLarge(totalMktCap)}</div>
        </div>
      </div>

      <div className="controls">
        <div className="search-bar">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Search by name or symbol..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <div className="controls-right">
          <div className="filter-group">
            {SORT_OPTIONS.map(opt => {
              const isActive = sortKey === opt.key;
              return (
                <button key={opt.key} className={`filter-btn ${isActive ? "active" : ""}`} onClick={() => handleSort(opt)}>
                  {opt.label}
                  {isActive && <span className="arrow">{sortDir === "asc" ? "↑" : "↓"}</span>}
                </button>
              );
            })}
          </div>
          <button
            className={`filter-toggle-btn ${filtersOpen || hasActiveFilters ? "active" : ""}`}
            onClick={() => setFiltersOpen(o => !o)}
          >
            ⚙{hasActiveFilters ? " •" : ""}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="range-filters">
          <RangeFilter label="Price ($)"  minVal={priceMin} maxVal={priceMax} onMin={v=>{setPriceMin(v);setPage(0);}} onMax={v=>{setPriceMax(v);setPage(0);}} placeholder={["Min","Max"]} />
          <RangeFilter label="24h % Chg" minVal={chgMin}   maxVal={chgMax}   onMin={v=>{setChgMin(v);setPage(0);}}  onMax={v=>{setChgMax(v);setPage(0);}}  placeholder={["-50","+50"]} />
          <RangeFilter label="Mkt Cap"   minVal={capMin}   maxVal={capMax}   onMin={v=>{setCapMin(v);setPage(0);}}  onMax={v=>{setCapMax(v);setPage(0);}}  placeholder={["1M","1T"]} />
          <RangeFilter label="Volume"    minVal={volMin}   maxVal={volMax}   onMin={v=>{setVolMin(v);setPage(0);}}  onMax={v=>{setVolMax(v);setPage(0);}}  placeholder={["500K","1B"]} />
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>✕ Clear</button>
          )}
        </div>
      )}

      {/* Desktop table */}
      <div className="table-wrapper desktop-table">
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th className="right">Price</th>
              <th className="right">24h %</th>
              <th className="right">High 24h</th>
              <th className="right">Low 24h</th>
              <th className="right">Market Cap</th>
              <th className="right">Volume</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 && (
              <tr className="averages-row">
                <td><span className="avg-label">⌀ avg · {sorted.length.toLocaleString()} assets</span></td>
                <td className="right avg-val">{averages.price != null ? formatPrice(averages.price) : "-"}</td>
                <td className="right">
                  {averages.chg != null
                    ? <span className={`change ${avgChgClass}`}>{averages.chg > 0 ? "+" : ""}{averages.chg.toFixed(2)}%</span>
                    : "-"}
                </td>
                <td className="right avg-val">{averages.high != null ? formatPrice(averages.high) : "-"}</td>
                <td className="right avg-val">{averages.low  != null ? formatPrice(averages.low)  : "-"}</td>
                <td className="right avg-val">{averages.cap  != null ? formatLarge(averages.cap)  : "-"}</td>
                <td className="right avg-val">{averages.vol  != null ? formatLarge(averages.vol)  : "-"}</td>
              </tr>
            )}
            {slice.length === 0 ? (
              <tr><td colSpan={7} className="empty">No assets found</td></tr>
            ) : slice.map((c, i) => {
              const change = c.priceChangePercentage24h;
              const cc     = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
              return (
                <tr key={c.id} style={{animationDelay:`${Math.min(i,30)*0.03}s`}} onClick={() => onSelect(c)}>
                  <td>
                    <div className="crypto-name">
                      <div className="crypto-icon" style={getIconStyle(c.symbol)}>{c.symbol?.slice(0,2).toUpperCase()}</div>
                      <div className="name-text">
                        <strong>{c.name}</strong>
                        <span>{c.symbol?.toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="right price">{formatPrice(c.currentPrice)}</td>
                  <td className="right"><span className={`change ${cc}`}>{change != null ? (change>0?"+":"") + change.toFixed(2)+"%" : "-"}</span></td>
                  <td className="right mktcap">{formatPrice(c.high24h)}</td>
                  <td className="right mktcap">{formatPrice(c.low24h)}</td>
                  <td className="right mktcap">{formatLarge(c.marketCap)}</td>
                  <td className="right volume">{formatLarge(c.totalVolume)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mobile-cards">
        {sorted.length > 0 && (
          <div className="mobile-avg-card">
            <div className="mac-title">⌀ Averages · {sorted.length.toLocaleString()} assets</div>
            <div className="mac-grid">
              <div className="mac-item">
                <span className="mac-label">Avg Price</span>
                <span className="mac-val">{averages.price != null ? formatPrice(averages.price) : "-"}</span>
              </div>
              <div className="mac-item">
                <span className="mac-label">Avg 24h %</span>
                <span className={`mac-val change ${avgChgClass}`}>
                  {averages.chg != null ? (averages.chg>0?"+":"") + averages.chg.toFixed(2)+"%" : "-"}
                </span>
              </div>
              <div className="mac-item">
                <span className="mac-label">Avg Mkt Cap</span>
                <span className="mac-val">{averages.cap != null ? formatLarge(averages.cap) : "-"}</span>
              </div>
              <div className="mac-item">
                <span className="mac-label">Avg Volume</span>
                <span className="mac-val volume">{averages.vol != null ? formatLarge(averages.vol) : "-"}</span>
              </div>
            </div>
          </div>
        )}

        {slice.length === 0 ? (
          <div className="empty" style={{padding:32, textAlign:"center"}}>No assets found</div>
        ) : slice.map((c, i) => {
          const change = c.priceChangePercentage24h;
          const cc = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
          return (
            <div key={c.id} className="mobile-card" style={{animationDelay:`${Math.min(i,20)*0.04}s`}} onClick={() => onSelect(c)}>
              <div className="mc-top">
                <div className="crypto-name">
                  <div className="crypto-icon" style={{...getIconStyle(c.symbol), width:34, height:34, fontSize:11}}>
                    {c.symbol?.slice(0,2).toUpperCase()}
                  </div>
                  <div className="name-text">
                    <strong>{c.name}</strong>
                    <span>{c.symbol?.toUpperCase()}</span>
                  </div>
                </div>
                <div className="mc-price-col">
                  <div className="price">{formatPrice(c.currentPrice)}</div>
                  <span className={`change ${cc}`}>{change != null ? (change>0?"+":"") + change.toFixed(2)+"%" : "-"}</span>
                </div>
              </div>
              <div className="mc-bottom">
                <div className="mc-stat"><span className="mc-sl">Mkt Cap</span><span className="mc-sv">{formatLarge(c.marketCap)}</span></div>
                <div className="mc-stat"><span className="mc-sl">Volume</span><span className="mc-sv volume">{formatLarge(c.totalVolume)}</span></div>
                <div className="mc-stat"><span className="mc-sl">High</span><span className="mc-sv">{formatPrice(c.high24h)}</span></div>
                <div className="mc-stat"><span className="mc-sl">Low</span><span className="mc-sv">{formatPrice(c.low24h)}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(0)} disabled={page===0}>«</button>
          <button className="page-btn" onClick={() => setPage(p=>p-1)} disabled={page===0}>‹</button>
          {Array.from({length: totalPages}, (_,i) => {
            if (i===0 || i===totalPages-1 || Math.abs(i-page)<=2)
              return <button key={i} className={`page-btn ${i===page?"active":""}`} onClick={()=>setPage(i)}>{i+1}</button>;
            if (Math.abs(i-page)===3) return <span key={i} className="page-ellipsis">…</span>;
            return null;
          })}
          <button className="page-btn" onClick={() => setPage(p=>p+1)} disabled={page>=totalPages-1}>›</button>
          <button className="page-btn" onClick={() => setPage(totalPages-1)} disabled={page>=totalPages-1}>»</button>
        </div>
      )}
    </>
  );
}

// ─── AnalyticsPage ────────────────────────────────────────────────────────────

function AnalyticsPage({ data }) {
  const withCap   = data.filter(c => c.marketCap > 0);
  const withVol   = data.filter(c => c.totalVolume > 0);
  const withPrice = data.filter(c => c.currentPrice > 0);

  const totalMktCap = withCap.reduce((s,c) => s + c.marketCap, 0);
  const totalVolume = withVol.reduce((s,c) => s + c.totalVolume, 0);
  const avgPrice    = withPrice.length ? withPrice.reduce((s,c)=>s+c.currentPrice,0)/withPrice.length : 0;
  const gainers     = data.filter(c => c.priceChangePercentage24h > 0).length;
  const losers      = data.filter(c => c.priceChangePercentage24h < 0).length;
  const neutral     = data.length - gainers - losers;

  const top8    = [...withCap].sort((a,b) => b.marketCap - a.marketCap).slice(0,8);
  const maxCap  = top8[0]?.marketCap || 1;
  const top8vol = [...withVol].sort((a,b) => b.totalVolume - a.totalVolume).slice(0,8);
  const maxVol  = top8vol[0]?.totalVolume || 1;

  const gPct = (gainers / data.length) * 100;
  const lPct = (losers  / data.length) * 100;
  const nPct = 100 - gPct - lPct;
  const donutStyle = {
    background: `conic-gradient(#06b6d4 0% ${gPct}%, #ff4d6d ${gPct}% ${gPct+lPct}%, #1e293b ${gPct+lPct}% 100%)`,
  };

  const buckets = [
    { label: "<$0.01",   coins: data.filter(c=>c.currentPrice>0 && c.currentPrice<0.01) },
    { label: "$0.01–$1", coins: data.filter(c=>c.currentPrice>=0.01 && c.currentPrice<1) },
    { label: "$1–$10",   coins: data.filter(c=>c.currentPrice>=1 && c.currentPrice<10) },
    { label: "$10–$100", coins: data.filter(c=>c.currentPrice>=10 && c.currentPrice<100) },
    { label: "$100–$1k", coins: data.filter(c=>c.currentPrice>=100 && c.currentPrice<1000) },
    { label: ">$1k",     coins: data.filter(c=>c.currentPrice>=1000) },
  ].map(b => ({ ...b, count: b.coins.length, avg24h: avgChange(b.coins) }));
  const maxBucket = Math.max(...buckets.map(b=>b.count));

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Market <span>Analytics</span></h1>
          <p>Aggregated stats across {data.length.toLocaleString()} assets</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          ["Total Market Cap", formatLarge(totalMktCap), "all tracked assets"],
          ["Total Volume 24h", formatLarge(totalVolume), "combined"],
          ["Avg Price",        formatPrice(avgPrice),    `across ${withPrice.length} priced assets`],
          ["Gainers / Losers", `${gainers} / ${losers}`, `${neutral} neutral`],
        ].map(([label, val, sub]) => (
          <div key={label} className="stat-card">
            <div className="s-label">{label}</div>
            <div className="s-value" style={{fontSize:18}}>{val}</div>
            <div className="s-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Top 8 by Market Cap + 24h</h3>
          <div className="bar-chart">
            {top8.map(c => {
              const chg = c.priceChangePercentage24h;
              const chgClass = chg > 0 ? "positive" : chg < 0 ? "negative" : "neutral";
              return (
                <div key={c.id} className="bar-row">
                  <span className="bar-label">{c.symbol?.toUpperCase()}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{width:`${(c.marketCap/maxCap)*100}%`, background:getIconStyle(c.symbol).color}} />
                  </div>
                  <span className="bar-val">{formatLarge(c.marketCap)}</span>
                  <span className={`change ${chgClass}`} style={{fontSize:10, padding:"2px 7px"}}>
                    {chg != null ? (chg > 0 ? "+" : "") + chg.toFixed(2) + "%" : "-"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <h3>Market Sentiment</h3>
          <div className="donut-wrap">
            <div className="donut" style={donutStyle} />
            <div className="donut-legend">
              {[
                ["#06b6d4", "Gainers", gainers, gPct],
                ["#ff4d6d", "Losers",  losers,  lPct],
                ["#1e293b", "Neutral", neutral, nPct],
              ].map(([color, label, count, pct]) => (
                <div key={label} className="legend-item">
                  <div className="legend-dot" style={{background:color, border: color==="#1e293b" ? "1px solid #334155" : "none"}} />
                  <span className="legend-label">{label}</span>
                  <span className="legend-val">{count} ({pct.toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Top 8 by Volume + 24h</h3>
          <div className="bar-chart">
            {top8vol.map(c => {
              const chg = c.priceChangePercentage24h;
              const chgClass = chg > 0 ? "positive" : chg < 0 ? "negative" : "neutral";
              return (
                <div key={c.id} className="bar-row">
                  <span className="bar-label">{c.symbol?.toUpperCase()}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{width:`${(c.totalVolume/maxVol)*100}%`, background:"#6366f1"}} />
                  </div>
                  <span className="bar-val">{formatLarge(c.totalVolume)}</span>
                  <span className={`change ${chgClass}`} style={{fontSize:10, padding:"2px 7px"}}>
                    {chg != null ? (chg > 0 ? "+" : "") + chg.toFixed(2) + "%" : "-"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <h3>Price Distribution + Avg 24h</h3>
          <div className="bar-chart">
            {buckets.map(b => {
              const chgClass = b.avg24h > 0 ? "positive" : b.avg24h < 0 ? "negative" : "neutral";
              return (
                <div key={b.label} className="bar-row">
                  <span className="bar-label" style={{width:80}}>{b.label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{width:`${(b.count/maxBucket)*100}%`, background:"#f59e0b"}} />
                  </div>
                  <span className="bar-val">{b.count}</span>
                  {b.avg24h != null && (
                    <span className={`change ${chgClass}`} style={{fontSize:10, padding:"2px 7px"}}>
                      {b.avg24h > 0 ? "+" : ""}{b.avg24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── MoversPage ───────────────────────────────────────────────────────────────

function MoversPage({ data, onSelect }) {
  const withChange = data.filter(c => c.priceChangePercentage24h != null);
  const topGainers = [...withChange].sort((a,b) => b.priceChangePercentage24h - a.priceChangePercentage24h).slice(0,20);
  const topLosers  = [...withChange].sort((a,b) => a.priceChangePercentage24h - b.priceChangePercentage24h).slice(0,20);
  const topVolume  = [...data.filter(c=>c.totalVolume>0)].sort((a,b) => b.totalVolume - a.totalVolume).slice(0,20);

  const MoverRow = ({ c, colorClass }) => (
    <div className="gl-row" onClick={() => onSelect(c)} style={{cursor:"pointer"}}>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <div className="crypto-icon" style={{...getIconStyle(c.symbol), width:30, height:30, fontSize:10}}>
          {c.symbol?.slice(0,2).toUpperCase()}
        </div>
        <div>
          <div className="gl-name">{c.name}</div>
          <div className="gl-sym">{c.symbol?.toUpperCase()}</div>
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:"'Space Mono',monospace", fontSize:13, color:"#e2e8f0"}}>{formatPrice(c.currentPrice)}</div>
        <span className={`change ${colorClass}`} style={{fontSize:11}}>
          {c.priceChangePercentage24h > 0 ? "+" : ""}{c.priceChangePercentage24h?.toFixed(2)}%
        </span>
        <div style={{fontFamily:"'Space Mono',monospace", fontSize:11, color:"#6366f1", marginTop:2}}>
          Vol: {formatLarge(c.totalVolume)}
        </div>
      </div>
    </div>
  );

  const VolumeRow = ({ c }) => (
    <div className="gl-row" onClick={() => onSelect(c)} style={{cursor:"pointer"}}>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <div className="crypto-icon" style={{...getIconStyle(c.symbol), width:30, height:30, fontSize:10}}>
          {c.symbol?.slice(0,2).toUpperCase()}
        </div>
        <div>
          <div className="gl-name">{c.name}</div>
          <div className="gl-sym">{c.symbol?.toUpperCase()}</div>
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:"'Space Mono',monospace", fontSize:12, color:"#6366f1"}}>{formatLarge(c.totalVolume)}</div>
        <div style={{fontFamily:"'Space Mono',monospace", fontSize:11, color:"#475569"}}>{formatPrice(c.currentPrice)}</div>
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Top <span>Movers</span></h1>
          <p>Best and worst performers in the last 24 hours</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3>🟢 Top 20 Gainers</h3>
          <div className="gl-list">
            {topGainers.map(c => <MoverRow key={c.id} c={c} colorClass="positive" />)}
          </div>
        </div>

        <div className="chart-card">
          <h3>🔴 Top 20 Losers</h3>
          <div className="gl-list">
            {topLosers.map(c => <MoverRow key={c.id} c={c} colorClass="negative" />)}
          </div>
        </div>

        <div className="chart-card full">
          <h3>🔵 Top 20 by Volume 24h</h3>
          <div className="gl-list">
            {topVolume.map(c => <VolumeRow key={c.id} c={c} />)}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function CryptoTable({
  data,
  onLogout,
  lastUpdated,
  isRefreshing,
  onManualRefresh,
  onSelectCoin,
  watchlistedIds,
  onWatchlistChange,
}) {
  const [activePage, setActivePage] = useState("market");

  const selectByCrypto = (c) => onSelectCoin(c.id);

  return (
    <div className="app-shell">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <h2 className="mobile-logo">Crypto<span>Analytics</span></h2>
        <button className="signout-btn-mobile" onClick={onLogout}>Sign out</button>
      </div>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Crypto<span>Analytics</span></h2>
          <p>Live data</p>
        </div>
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-item ${activePage === n.id ? "active" : ""}`}
            onClick={() => setActivePage(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
        <div className="sidebar-bottom">
          <button className="signout-btn" onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">
        {activePage === "market" && (
          <MarketPage
            data={data}
            onSelect={selectByCrypto}
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onManualRefresh={onManualRefresh}
          />
        )}
        {activePage === "analytics" && <AnalyticsPage data={data} />}
        {activePage === "movers"    && <MoversPage    data={data} onSelect={selectByCrypto} />}
        {activePage === "watchlist" && (
          <Watchlist
            onSelectCoin={onSelectCoin}
            onWatchlistChange={onWatchlistChange}
          />
        )}
        {activePage === "compare"   && <Compare data={data} onSelectCoin={onSelectCoin} />}
        {activePage === "profile"   && <Profile onLogout={onLogout} />}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="mobile-bottom-nav">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`mobile-nav-btn ${activePage === n.id ? "active" : ""}`}
            onClick={() => setActivePage(n.id)}
          >
            <span className="mobile-nav-icon">{n.icon}</span>
            <span className="mobile-nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}