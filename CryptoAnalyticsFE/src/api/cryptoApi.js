const BASE_URL = "http://localhost:3001";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export async function fetchCryptos(page = 0, size = 10) {
  const response = await fetch(
    `${BASE_URL}/cryptos?page=${page}&size=${size}`,
    { headers: authHeaders() }
  );
  if (!response.ok) throw new Error("Failed to fetch cryptos");
  return response.json();
}

export async function getCryptoById(id) {
  const response = await fetch(`${BASE_URL}/cryptos/${id}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch coin detail");
  return response.json();
}

export async function login(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
}

export async function register(fields) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

// ---- Watchlist ----
export async function getWatchlist() {
  const res = await fetch(`${BASE_URL}/watchlist`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch watchlist");
  return res.json();
}

export async function addToWatchlist(cryptoId) {
  const res = await fetch(`${BASE_URL}/watchlist/${cryptoId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to add to watchlist");
  return res.json();
}

export async function removeFromWatchlist(cryptoId) {
  const res = await fetch(`${BASE_URL}/watchlist/${cryptoId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to remove from watchlist");
  return res.json();
}

// ---- Profile ----
export async function getMe() {
  const res = await fetch(`${BASE_URL}/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function changePassword(oldPassword, newPassword) {
  const res = await fetch(`${BASE_URL}/me/password`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to change password");
  }
  return res.json();
}
