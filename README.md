# StudioSpace Server 🎬 | RESTful API Engine

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-4EA94B?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![JWT & JWKS](https://img.shields.io/badge/Security-JWT_/_JWKS-red?style=for-the-badge&logo=json-web-tokens)](https://github.com/panva/jose)
[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

This repository powers the backend RESTful API services for **StudioSpace**—a peer-to-peer creative marketplace for photography cyc walls, cinema sound stages, podcast recording suites, and artist workshops. It handles database persistence, listing operations, booking workflows, conflict detection, and secure token authorization.

---

## 🌐 Live URLs & Repositories

- **Live Server API URL:** [https://studiospace-server-olive.vercel.app](https://studiospace-server-olive.vercel.app)
- **Live Client Web App:** [https://studiospace-eight.vercel.app](https://studiospace-eight.vercel.app)
- **Client-Side Repository:** [https://github.com/Nasir-Uddin-Mollah/StudioSpace](https://github.com/Nasir-Uddin-Mollah/StudioSpace)
- **Server-Side Repository:** [https://github.com/Nasir-Uddin-Mollah/StudioSpace-Server](https://github.com/Nasir-Uddin-Mollah/StudioSpace-Server)

---

## ⚡ Core Highlights & Capabilities

- **High-Performance MongoDB Atlas Driver:** Built with native MongoDB driver v7+ utilizing connection pooling and optimized database queries.
- **JWT & Remote JWKS Security Middleware:** Protects all write/mutation operations through the `VerifyToken` middleware, cryptographically verifying Bearer tokens against the client's JWKS endpoint (`/api/auth/jwks`).
- **Double-Booking Collision Prevention:** Checks the database for overlapping reservations on the requested studio date/slot before allowing insertions, rejecting duplicates with HTTP 409 Conflict.
- **Full CRUD Management:** Complete endpoint suites for creative studio listings, reservations, and creator wishlists.
- **CORS Enabled:** Cross-Origin Resource Sharing configuration supporting both local development and production Vercel environments.

---

## 📡 REST API Endpoints Specification

### 🏢 Studio Listings (`/studios`, `/studio`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Root API health status check |
| `GET` | `/studios` | Public | Retrieve all published workspace listings |
| `GET` | `/featured-studios` | Public | Retrieve top 6 newest/featured workspaces (`.limit(6)`) |
| `GET` | `/studio/:id` | Public | Retrieve comprehensive studio details by MongoDB `_id` |
| `POST` | `/studios` | **Protected (JWT)** | Publish a new studio listing |
| `PATCH` | `/studio/:id` | **Protected (JWT)** | Update existing workspace specifications |
| `DELETE` | `/studios/:id` | **Protected (JWT)** | Permanently delete studio listing |
| `GET` | `/my-listings` | **Protected (JWT)** | Fetch all studio listings belonging to authenticated user |

### 📅 Booking & Reservation Management (`/bookings`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/bookings` | **Protected (JWT)** | Submit new reservation (with collision & overlap check) |
| `GET` | `/bookings` | **Protected (JWT)** | Retrieve all bookings for a user (`?email=...`) |
| `PATCH` | `/bookings/:id` | **Protected (JWT)** | Update booking status (e.g., Cancelled, Confirmed) |

### 💖 Wishlist Management (`/wishlist`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/wishlist` | **Protected (JWT)** | Save a workspace to the user's wishlist |
| `GET` | `/wishlist` | **Protected (JWT)** | Retrieve all wishlisted studios for a user (`?email=...`) |
| `DELETE` | `/wishlist` | **Protected (JWT)** | Remove a workspace from wishlist (`?email=...&studioId=...`) |

---

## 🛠️ Tech Stack & Dependencies

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 5.x
- **Database:** MongoDB Atlas (native driver `mongodb: ^7.8.0`)
- **Authentication & Security:** `jose` (JWKS remote key set verification)
- **Environment & Utilities:** `cors`, `dotenv`
- **Hosting Platform:** Vercel Serverless

---

## 💻 Local Setup & Installation

### 1. Clone the Server Repository
```bash
git clone https://github.com/Nasir-Uddin-Mollah/StudioSpace-Server.git
cd StudioSpace-Server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
node index.js
# Or with automatic reload:
# npx nodemon index.js
```
The server will run on `http://localhost:5000`. Test the health check endpoint at [http://localhost:5000/](http://localhost:5000/).

