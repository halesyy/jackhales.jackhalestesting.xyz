# jackhales.jackhalestesting.xyz

Minimal test rebuild of `jackhales.com` with:

- Next.js pages-directory frontend
- Tailwind CSS
- FastAPI backend
- MongoDB-backed article system
- PIN-protected `/admin`
- Docker Compose deployment behind Dokploy Traefik

## Local Development

```sh
cd frontend
npm install
npm run dev
```

```sh
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Deployment

GitHub Actions builds frontend and backend images and pushes them to GHCR.

The Sydney host also runs a pull-based systemd deploy timer. It pulls `main` from the public repository and runs:

```sh
IMAGE_TAG=local docker compose up -d --build --remove-orphans
```

The remote host owns runtime secrets in `/srv/apps/jackhales-testing/.env`.
