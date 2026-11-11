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

Accounts are stored temporarily in `backend/instance/users.json` (gitignored, passwords hashed). Delete that file to reset all accounts. This will be replaced by Firebase Auth.

### project structure

```
backend/
├── run.py              # entry point
├── requirements.txt
├── .env.example
└── app/
    ├── __init__.py     # create_app() factory
    ├── config.py
    ├── users.py        # temporary JSON-file user store (until Firebase)
    ├── routes/
    │   ├── __init__.py # registers blueprints
    │   ├── main.py     # page routes (/, /viewer, /streamer)
    │   ├── auth.py     # /signup, /login, /logout
    │   └── api.py      # JSON API routes (/api/...)
    ├── templates/
    └── static/
```
