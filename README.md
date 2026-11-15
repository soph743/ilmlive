### ilm live

ilm live is a livestreaming platform for Islamic education. 

### hackathon

this project was created for the 2026 Tech Sisters hackathon.

### dev setup

The repo has two apps: a Flask backend (`backend/`) and a React frontend (`frontend/`). They don't talk to each other yet (see [frontend status](#frontend-status)).

#### backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

Then open http://localhost:5001 (health check: http://localhost:5001/api/health).

Set `PORT` in `.env` to change ports if needed.

Accounts are stored in Firebase Authentication (see below). Passwords must be at least 6 characters (Firebase's default).

#### frontend

Requires [Node.js](https://nodejs.org) 20+.

```bash
cd frontend
npm install     # once
npm run dev     # http://localhost:5173
npm test        # recommender + schedule tests
```

Open it from `http://localhost…` (not by double-clicking `index.html`): the demo's password hashing only works on localhost or https. Sign up with a referral code: **`1STTEACHERS`** or **`CREATOR`**.

### frontend status

The React frontend (Home, Discover, Account, Live room with chat + notes) currently runs entirely in the browser on demo data stored in `localStorage`. It is **not** connected to Flask or Firebase yet. To connect it, rewrite the functions in `frontend/src/services/` (`auth.js`, `streams.js`, `liveRoom.js`) and keep their names and return shapes. To forward `/api/...` calls to Flask on port 5001, uncomment the `proxy` line in `frontend/vite.config.js`. See `frontend/README.md` for details.

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
    ├── firebase.py     # Firebase Auth: sign up, log in, roles
    ├── routes/
    │   ├── __init__.py # registers blueprints
    │   ├── main.py     # page routes (/, /viewer, /streamer)
    │   ├── auth.py     # /signup, /login, /logout
    │   └── api.py      # JSON API routes (/api/...)
    ├── templates/
    └── static/

frontend/               # React + Vite (see frontend/README.md)
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── pages/          # Auth, Home, Discover, Account, Live
    ├── components/
    ├── hooks/
    ├── lib/            # pure logic (schedule, recommend, feed) + tests
    └── services/       # data layer: replace to connect a real backend
```
