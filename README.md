🚀 CryptoBets — Full Stack Crypto Market Platform

CryptoBets is a full-stack cryptocurrency tracking platform with real-time market data, user authentication, and a responsive dashboard. It aggregates data from multiple external APIs and provides a clean interface for monitoring crypto markets.

🧱 Architecture Overview
Frontend: React 19 + Vite (Crypto dashboard UI)
Backend: Spring Boot 4 (REST API + data aggregation)
Database: PostgreSQL
Auth: JWT-based stateless authentication
Data Sources: CoinGecko + CoinLore APIs
✨ Key Features
📊 Market Dashboard
Live cryptocurrency prices
Auto-refresh every 30–60 seconds
Search by name or symbol
Advanced filtering:
Price range
Market cap
24h change
Volume (supports 1M / 1B / 1T shorthand)
Sorting by:
Price
Market cap
Volume
24h change
Detailed modal view:
ATH / ATL
Supply metrics
Fully diluted valuation
🔐 Authentication System
User registration & login
JWT token authentication
Role-based access (USER / ORGANIZER)
Secure password hashing (BCrypt)
📡 Real-Time Data Pipeline
CoinGecko: up to 10,000 coins (refreshed every 60s)
CoinLore: up to 2,000 coins (refreshed every 5 min)
Automatic retry & rate-limit handling
Async startup data initialization
📱 Responsive UI
Table layout on desktop
Card layout on mobile
Fully responsive dashboard experience
🖥️ Frontend (React + Vite)
Tech Stack
React 19
Vite 7
JavaScript (ES Modules)
CSS (component-scoped)
Features
Live crypto dashboard
Login/register flow
JWT stored in localStorage
API integration layer
Responsive UI components
Project Structure
src/
├── api/
│   └── cryptoApi.js
├── components/
│   ├── Welcome.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── CryptoTable.jsx
└── App.jsx
Run Frontend
npm install
npm run dev

Build:

npm run build
⚙️ Backend (Spring Boot)
Tech Stack
Java 21
Spring Boot 4
Spring Security + JWT
Spring Data JPA
WebFlux (WebClient)
PostgreSQL
Maven
🔐 Security
JWT authentication (stateless)
BCrypt password hashing (strength 12)
Token expiration: 7 days
CORS enabled for frontend (localhost:5173)
📡 API Endpoints
Authentication
Method	Endpoint	Description
POST	/auth/register	Register user
POST	/auth/login	Login & get JWT
DELETE	/auth/{id}	Delete user
Crypto Data
CoinGecko
GET /cryptos
Pagination + sorting
Requires JWT
CoinLore
GET /cryptos/coinlore
Pagination + sorting
Requires JWT
🧩 Data Models
User
id (UUID)
username
name / surname
email (unique)
password (encrypted)
role (USER / ORGANIZER)
Crypto Data

Includes:

price
market cap
volume
24h change
ATH / ATL
circulating & total supply
🗂️ Backend Structure
src/main/java/.../
├── controllers/
├── services/
├── repositories/
├── entities/
├── DTOs/
├── security/
├── config/
└── exceptions/
🗄️ Setup Instructions
1. Clone repo
git clone <repo-url>
cd CryptoBets
2. Create PostgreSQL DB
CREATE DATABASE cryptobets;
3. Configure environment

Create env.properties:

PORT=3001
PG_DB_NAME=cryptobets
PG_USERNAME=your_user
PG_PASSWORD=your_password
JWT_SECRET=your_secret
jwt.expiration=3600000
4. Run backend
mvn spring-boot:run
🔄 System Behavior
On startup → crypto data is fetched automatically
Backend continuously syncs external APIs
Frontend polls backend for updated market data
JWT required for all crypto endpoints
📌 Notes
Frontend base URL is hardcoded in src/api/cryptoApi.js
Backend runs on http://localhost:3001
Ensure backend is running before starting frontend
🧠 Summary

CryptoBets is a full-stack crypto analytics platform combining:

Real-time market aggregation
Secure authentication system
Responsive React dashboard
Scalable Spring Boot backend
