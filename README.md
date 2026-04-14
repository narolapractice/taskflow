# TaskFlow — Full Stack Kanban Task Manager

A full-stack task management app built with **React + Node.js + MongoDB**.

```
taskflow/
├── backend/                 ← Node.js + Express REST API
│   ├── src/
│   │   ├── server.js        ← Entry point
│   │   ├── models/          ← Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Board.js
│   │   │   └── Task.js
│   │   ├── routes/          ← Express route handlers
│   │   │   ├── auth.js
│   │   │   ├── boards.js
│   │   │   ├── tasks.js
│   │   │   └── users.js
│   │   └── middleware/
│   │       └── auth.js      ← JWT protect middleware
│   ├── .env                 ← ⚠️ Your secrets (never commit this)
│   ├── .env.example         ← Template — safe to commit
│   └── package.json
│
└── frontend/                ← React SPA
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js         ← React entry
    │   ├── App.js           ← Router + providers
    │   ├── context/
    │   │   ├── AuthContext.js    ← Auth state
    │   │   └── ToastContext.js   ← Notifications
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Toast.jsx
    │   │   ├── TaskCard.jsx      ← Draggable task card
    │   │   ├── TaskModal.jsx     ← Full task editor
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── AuthPage.jsx      ← Login / Register
    │   │   ├── Dashboard.jsx     ← Home with stats
    │   │   ├── BoardsPage.jsx    ← All boards
    │   │   ├── BoardPage.jsx     ← Kanban board view
    │   │   └── ProfilePage.jsx
    │   ├── services/
    │   │   └── api.js            ← All Axios calls
    │   └── styles/
    │       └── global.css
    ├── .env                 ← REACT_APP_ variables
    └── package.json
```

## ✨ Features

- **JWT Authentication** — Register, login, persistent sessions
- **Kanban Board** — Drag & drop tasks between columns
- **Task Detail Modal** — Edit title, description, priority, due date, tags, checklist, comments
- **Multi-board Support** — Create, edit, delete boards with custom colors
- **Priority System** — Low / Medium / High / Urgent with visual indicators
- **Checklist** — Sub-tasks with progress bar
- **Search** — Filter tasks in real-time
- **Dark UI** — Polished dark theme throughout
- **Responsive** — Works on mobile, tablet, desktop
- **Toast Notifications** — Global feedback for every action

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- npm or yarn

### 1 — Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm run dev        # Starts on http://localhost:5000
```

### 2 — Frontend Setup

```bash
cd frontend
npm install
npm start          # Starts on http://localhost:3000
```

### 3 — Open the app
Visit `http://localhost:3000` — register an account or use the demo credentials shown on the login page.

## 🔌 API Endpoints

| Method | Endpoint                   | Description              | Auth |
|--------|---------------------------|--------------------------|------|
| POST   | /api/auth/register         | Create account           | ✗    |
| POST   | /api/auth/login            | Log in, get JWT          | ✗    |
| GET    | /api/auth/me               | Get current user         | ✓    |
| PUT    | /api/auth/me               | Update profile           | ✓    |
| GET    | /api/boards                | List all boards          | ✓    |
| POST   | /api/boards                | Create board             | ✓    |
| GET    | /api/boards/:id            | Get single board         | ✓    |
| PUT    | /api/boards/:id            | Update board             | ✓    |
| DELETE | /api/boards/:id            | Delete board + tasks     | ✓    |
| GET    | /api/boards/:id/tasks      | All tasks for board      | ✓    |
| POST   | /api/tasks                 | Create task              | ✓    |
| GET    | /api/tasks/:id             | Get task detail          | ✓    |
| PUT    | /api/tasks/:id             | Update task              | ✓    |
| DELETE | /api/tasks/:id             | Delete task              | ✓    |
| PUT    | /api/tasks/:id/move        | Move to column           | ✓    |
| POST   | /api/tasks/:id/comments    | Add comment              | ✓    |
| GET    | /api/users/stats           | Dashboard stats          | ✓    |
| GET    | /api/health                | Health check             | ✗    |

## 🌐 Deploy to GitHub Pages / Vercel / Render

### Backend (Render / Railway)
1. Push to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set environment variables from `.env.example`
4. Build command: `npm install` | Start command: `node src/server.js`

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend.onrender.com/api` in `.env`
2. Run `npm run build`
3. Deploy the `build/` folder

## 🔐 Environment Variables

### Backend `.env`
| Variable        | Description                  | Example                        |
|----------------|------------------------------|-------------------------------|
| PORT            | Server port                  | 5000                          |
| MONGO_URI       | MongoDB connection string    | mongodb://localhost:27017/tf   |
| JWT_SECRET      | Secret for signing JWTs      | min 32 random characters       |
| JWT_EXPIRES_IN  | Token expiry                 | 7d                            |
| CLIENT_URL      | Frontend URL for CORS        | http://localhost:3000          |

### Frontend `.env`
| Variable            | Description        | Example                          |
|--------------------|--------------------|----------------------------------|
| REACT_APP_API_URL   | Backend API URL    | http://localhost:5000/api        |
| REACT_APP_APP_NAME  | App display name   | TaskFlow                         |

## 🛠 Tech Stack

| Layer      | Technology                     |
|-----------|-------------------------------|
| Frontend  | React 18, React Router 6       |
| Drag & Drop | @hello-pangea/dnd            |
| HTTP      | Axios                          |
| Backend   | Node.js, Express 4             |
| Database  | MongoDB + Mongoose             |
| Auth      | JWT + bcryptjs                 |
| Styling   | Pure CSS (no framework)        |

## 📄 License

MIT — free to use, modify, and deploy.

---
Built with ♥ — Full Stack TaskFlow App
