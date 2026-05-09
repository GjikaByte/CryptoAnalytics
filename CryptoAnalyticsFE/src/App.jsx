import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchCryptos, login, register,
  getWatchlist, addToWatchlist, removeFromWatchlist,
} from "./api/cryptoApi";
import CryptoTable from "./components/CryptoTable";
import Login from "./components/Login";
import Register from "./components/Register";
import Welcome from "./components/Welcome";
import CoinDetail from "./components/CoinDetail";

const POLL_INTERVAL_MS = 30_000;

// page states: "welcome" | "login" | "register" | "dashboard" | "coinDetail"

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "welcome"
  );
  const [cryptos, setCryptos]         = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCryptoId, setSelectedCryptoId] = useState(null);
  const [returnPage, setReturnPage] = useState("dashboard");
  const [watchlistedIds, setWatchlistedIds] = useState(new Set());
  const intervalRef = useRef(null);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const result = await fetchCryptos(0, 10000);
      setCryptos(result.content);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch cryptos:", err);
    } finally {
      if (showRefreshing) setIsRefreshing(false);
    }
  }, []);

  const loadWatchlist = useCallback(async () => {
    try {
      const items = await getWatchlist();
      setWatchlistedIds(new Set(items.map(c => c.id)));
    } catch (err) {
      console.error("Failed to fetch watchlist:", err);
    }
  }, []);

  useEffect(() => {
    if (page !== "dashboard" && page !== "coinDetail") {
      clearInterval(intervalRef.current);
      return;
    }
    if (page === "dashboard") {
      loadData();
      loadWatchlist();
      intervalRef.current = setInterval(() => loadData(true), POLL_INTERVAL_MS);
      return () => clearInterval(intervalRef.current);
    }
  }, [page, loadData, loadWatchlist]);

  async function handleLogin(email, password) {
    const data = await login(email, password);
    localStorage.setItem("token", data.accessToken);
    setPage("dashboard");
  }

  async function handleRegister(fields) {
    await register(fields);
    setPage("login");
  }

  function handleLogout() {
    clearInterval(intervalRef.current);
    localStorage.removeItem("token");
    setPage("welcome");
    setCryptos([]);
    setLastUpdated(null);
    setWatchlistedIds(new Set());
  }

  function handleSelectCoin(id) {
    setSelectedCryptoId(id);
    setReturnPage(page === "dashboard" ? "dashboard" : returnPage);
    setPage("coinDetail");
  }

  function handleBackFromDetail() {
    setSelectedCryptoId(null);
    setPage(returnPage);
  }

  async function handleToggleStar(cryptoId) {
    const isStarred = watchlistedIds.has(cryptoId);
    // optimistic update
    setWatchlistedIds(prev => {
      const next = new Set(prev);
      if (isStarred) next.delete(cryptoId); else next.add(cryptoId);
      return next;
    });
    try {
      if (isStarred) await removeFromWatchlist(cryptoId);
      else await addToWatchlist(cryptoId);
    } catch (err) {
      console.error("Watchlist toggle failed:", err);
      // revert
      setWatchlistedIds(prev => {
        const next = new Set(prev);
        if (isStarred) next.add(cryptoId); else next.delete(cryptoId);
        return next;
      });
    }
  }

  if (page === "welcome")
    return <Welcome onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;

  if (page === "login")
    return <Login onLogin={handleLogin} onRegister={() => setPage("register")} />;

  if (page === "register")
    return <Register onRegister={handleRegister} onLogin={() => setPage("login")} />;

  if (page === "coinDetail")
    return (
      <CoinDetail
        cryptoId={selectedCryptoId}
        onBack={handleBackFromDetail}
        isStarred={watchlistedIds.has(selectedCryptoId)}
        onToggleStar={() => handleToggleStar(selectedCryptoId)}
      />
    );

  return (
    <CryptoTable
      data={cryptos}
      onLogout={handleLogout}
      lastUpdated={lastUpdated}
      isRefreshing={isRefreshing}
      onManualRefresh={() => loadData(true)}
      onSelectCoin={handleSelectCoin}
      watchlistedIds={watchlistedIds}
      onWatchlistChange={setWatchlistedIds}
    />
  );
}

export default App;
