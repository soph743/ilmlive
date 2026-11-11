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

### project structure

```
backend/
├── run.py              # entry point
├── requirements.txt
├── .env.example
└── app/
    ├── __init__.py     # create_app() factory
    ├── config.py
    ├── routes/
    │   ├── __init__.py # registers blueprints
    │   ├── main.py     # page routes (/)
    │   └── api.py      # JSON API routes (/api/...)
    ├── templates/
    └── static/
```
