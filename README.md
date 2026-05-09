# 🚀 CryptoBets — Full Stack Crypto Market Platform

CryptoBets is a full-stack cryptocurrency tracking platform with real-time market data, user authentication, and a responsive dashboard. It aggregates data from multiple external APIs and provides a clean interface for monitoring crypto markets.

---

## 🧱 Architecture Overview

- **Frontend:** React 19 + Vite (Crypto dashboard UI)  
- **Backend:** Spring Boot 4 (REST API + data aggregation)  
- **Database:** PostgreSQL  
- **Auth:** JWT-based stateless authentication  
- **Data Sources:** CoinGecko + CoinLore APIs  

---

## ✨ Key Features

### 📊 Market Dashboard
- Live cryptocurrency prices
- Auto-refresh every 30–60 seconds
- Search by name or symbol
- Advanced filtering:
  - Price range
  - Market cap
  - 24h change
  - Volume (supports 1M / 1B / 1T shorthand)
- Sorting by price, market cap, volume, or 24h change
- Detailed modal view:
  - ATH / ATL
  - Supply metrics
  - Fully diluted valuation

---

### 🔐 Authentication System
- User registration & login
- JWT token authentication
- Role-based access (USER / ORGANIZER)
- Secure password hashing (BCrypt)

---

### 📡 Real-Time Data Pipeline
- CoinGecko: up to 10,000 coins (refreshed every 60s)
- CoinLore: up to 2,000 coins (refreshed every 5 min)
- Automatic retry & rate-limit handling
- Async startup data initialization

---

### 📱 Responsive UI
- Table layout on desktop
- Card layout on mobile
- Fully responsive dashboard

---

## 🖥️ Frontend (React + Vite)

### Tech Stack
- React 19
- Vite 7
- JavaScript (ES Modules)
- CSS (component-scoped styles)

### Features
- Live crypto dashboard
- Login/register flow
- JWT stored in localStorage
- API integration layer
- Responsive UI components

### Project Structure
```plaintext
src/
├── api/
│   └── cryptoApi.js
├── components/
│   ├── Welcome.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── CryptoTable.jsx
└── App.jsx
