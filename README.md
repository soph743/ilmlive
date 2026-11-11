### ilm live

ilm live is a livestreaming platform for Islamic education. 

### hackathon

this project was created for the 2026 Tech Sisters hackathon.

### dev setup
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
```
