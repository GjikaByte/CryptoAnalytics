import "./Welcome.css";

export default function Welcome({ onLogin, onRegister }) {
  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <div className="welcome-badge">
          <span className="welcome-dot" />
          Live market data
        </div>

        <h1>Crypto<span>Analytics</span></h1>

        <p>
          Track thousands of cryptocurrencies in real time.<br />
          Prices, rankings, volume and 24h changes — all in one place.
        </p>

        <div className="welcome-actions">
          <button className="btn-primary" onClick={onRegister}>
            Create account →
          </button>
          <button className="btn-secondary" onClick={onLogin}>
            Sign in
          </button>
        </div>
      </div>

      <div className="welcome-stats">
        <div className="welcome-stat">
          <div className="stat-value">10<span>K</span></div>
          <div className="stat-label">Assets tracked</div>
        </div>
        <div className="welcome-stat">
          <div className="stat-value">24<span>/7</span></div>
          <div className="stat-label">Live updates</div>
        </div>
        <div className="welcome-stat">
          <div className="stat-value">$<span>∞</span></div>
          <div className="stat-label">Market coverage</div>
        </div>
      </div>
    </div>
  );
}