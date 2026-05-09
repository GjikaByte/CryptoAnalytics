import { useState, useMemo } from "react";
import "./Compare.css";

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
function fmtNum(v) {
  if (v == null) return "-";
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toFixed(2);
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

const MAX_COMPARE = 3;

const ROWS = [
  { label: "Price",        get: c => c.currentPrice,                fmt: fmtPrice, higher: true  },
  { label: "24h Change %", get: c => c.priceChangePercentage24h,    fmt: v => v != null ? (v > 0 ? "+" : "") + v.toFixed(2) + "%" : "—", higher: true },
  { label: "Market Cap",   get: c => c.marketCap,                   fmt: fmtLarge, higher: true  },
  { label: "Volume 24h",   get: c => c.totalVolume,                 fmt: fmtLarge, higher: true  },
  { label: "Mkt Cap Rank", get: c => c.marketCapRank,               fmt: v => v != null ? "#" + v : "—", higher: false },
  { label: "High 24h",     get: c => c.high24h,                     fmt: fmtPrice, higher: true  },
  { label: "Low 24h",      get: c => c.low24h,                      fmt: fmtPrice, higher: true  },
  { label: "ATH",          get: c => c.ath,                         fmt: fmtPrice, higher: true  },
  { label: "ATH Δ %",      get: c => c.athChangePercentage,         fmt: v => v != null ? v.toFixed(2) + "%" : "—", higher: true },
  { label: "Circulating",  get: c => c.circulatingSupply,           fmt: fmtNum,   higher: null  },
  { label: "Max Supply",   get: c => c.maxSupply,                   fmt: v => v ? fmtNum(v) : "∞", higher: null },
];

export default function Compare({ data, onSelectCoin }) {
  const [picked, setPicked] = useState([]);
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const matches = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return data
      .filter(c => c.name?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q))
      .filter(c => !picked.find(p => p.id === c.id))
      .slice(0, 8);
  }, [data, search, picked]);

  function add(c) {
    if (picked.length >= MAX_COMPARE) return;
    setPicked([...picked, c]);
    setSearch("");
    setPickerOpen(false);
  }
  function remove(id) {
    setPicked(picked.filter(c => c.id !== id));
  }

  function rowExtremes(row) {
    if (row.higher == null || picked.length < 2) return { best: null, worst: null };
    const vals = picked.map(c => row.get(c)).filter(v => v != null);
    if (vals.length < 2) return { best: null, worst: null };
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return row.higher
      ? { best: max, worst: min }
      : { best: min, worst: max };
  }

  return (
    <div className="cmp-page">
      <div className="cmp-header">
        <div>
          <h1>Com<span>pare</span></h1>
          <p>Pick up to {MAX_COMPARE} coins to compare side-by-side</p>
        </div>
      </div>

      <div className="cmp-picker">
        {picked.map(c => (
          <div key={c.id} className="cmp-chip" onClick={() => onSelectCoin(c.id)}>
            <div className="cmp-chip-icon" style={iconStyle(c.symbol)}>
              {c.symbol?.slice(0, 2).toUpperCase()}
            </div>
            <span className="cmp-chip-name">{c.name}</span>
            <button className="cmp-chip-x" onClick={(e) => { e.stopPropagation(); remove(c.id); }}>✕</button>
          </div>
        ))}
        {picked.length < MAX_COMPARE && (
          <div className="cmp-search-wrap">
            <input
              className="cmp-search"
              placeholder={picked.length === 0 ? "Search a coin to start…" : "Add another coin…"}
              value={search}
              onChange={e => { setSearch(e.target.value); setPickerOpen(true); }}
              onFocus={() => setPickerOpen(true)}
            />
            {pickerOpen && matches.length > 0 && (
              <div className="cmp-dropdown">
                {matches.map(c => (
                  <button key={c.id} className="cmp-dropdown-item" onClick={() => add(c)}>
                    <div className="cmp-icon-sm" style={iconStyle(c.symbol)}>{c.symbol?.slice(0, 2).toUpperCase()}</div>
                    <span className="cmp-dd-name">{c.name}</span>
                    <span className="cmp-dd-sym">{c.symbol?.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {picked.length === 0 ? (
        <div className="cmp-empty">Search above to add your first coin.</div>
      ) : (
        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <th></th>
                {picked.map(c => (
                  <th key={c.id}>
                    <div className="cmp-th-coin" onClick={() => onSelectCoin(c.id)}>
                      <div className="cmp-icon-sm" style={iconStyle(c.symbol)}>{c.symbol?.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <strong>{c.name}</strong>
                        <span>{c.symbol?.toUpperCase()}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(row => {
                const { best, worst } = rowExtremes(row);
                return (
                  <tr key={row.label}>
                    <td className="cmp-row-label">{row.label}</td>
                    {picked.map(c => {
                      const val = row.get(c);
                      let cls = "";
                      if (val != null && best != null && picked.length >= 2) {
                        if (val === best) cls = "cell-best";
                        else if (val === worst) cls = "cell-worst";
                      }
                      return <td key={c.id} className={`cmp-cell ${cls}`}>{row.fmt(val)}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
