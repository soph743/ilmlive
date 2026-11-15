### ilm live

ilm live is a livestreaming platform for Islamic education. 

### hackathon

this project was created for the 2026 Tech Sisters hackathon.

### dev setup

The repo has two apps: a Flask JSON API (`backend/`) and the React website (`frontend/`). Run both, in two terminals.

#### backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

The API runs on http://localhost:5001 (health check: http://localhost:5001/api/health). There are no pages on Flask; the website is the React frontend.

Set `PORT` in `.env` to change ports if needed.

Accounts are stored in Firebase Authentication (see below).

#### frontend

Requires [Node.js](https://nodejs.org) 20+.

```bash
cd frontend
npm install     # once
npm run dev     # http://localhost:5173 (forwards /api/... to Flask on 5001)
npm test        # recommender + schedule tests
```

Open http://localhost:5173. If you change Flask's `PORT`, update the proxy in `frontend/vite.config.js` too.

### accounts

- **Viewers** (learners) can sign up any time.
- **Streamers** (teachers) need an invite code once, when they first create their account. Codes are set in `STREAMER_INVITE_CODES` in `backend/.env` (comma-separated) and checked on the server.
- Signing in never needs a code.
- Passwords must be at least 8 characters (checked in the frontend and enforced by Flask). Firebase stores and verifies them.

Teachers, circles, chat, notes, and profile extras (bio, interests, follows…) are still demo data in the browser. See `frontend/README.md` for what's left to connect.

### firebase setup

1. In the [Firebase console](https://console.firebase.google.com), open the project (or create one).
2. **Build > Authentication > Get started**, then under **Sign-in method** enable **Email/Password**.
3. **Project settings (gear icon) > General**: if there's no web app yet, click the `</>` icon to register one (no hosting needed). Copy the **Web API key** into `FIREBASE_API_KEY` in `backend/.env`.
4. **Project settings > Service accounts > Generate new private key**. Save the downloaded file as `backend/firebase-service-account.json` and set `FIREBASE_CREDENTIALS=firebase-service-account.json` in `backend/.env`. This file is a secret: it's gitignored, never commit it, and share it with teammates privately.

The app won't start until both values are set. Users show up under **Authentication > Users** in the console; each user's role (viewer/streamer) is stored as a custom claim.

### project structure

```
backend/
├── run.py              # entry point
├── requirements.txt
├── .env.example
└── app/
    ├── __init__.py     # create_app() factory
    ├── config.py
    ├── firebase.py     # Firebase Auth: sign up, log in, roles, updates
    └── routes/
        ├── __init__.py # registers blueprints
        ├── auth.py     # /api/auth/... (signup, login, logout, me, credentials)
        └── api.py      # other JSON API routes (/api/health)

frontend/               # React + Vite (see frontend/README.md)
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── pages/          # Auth, Home, Discover, Account, Live
    ├── components/
    ├── hooks/
    ├── lib/            # pure logic (schedule, recommend, feed) + tests
    └── services/       # data layer (auth.js calls Flask; the rest is still demo data)
```
