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

GitHub Actions builds frontend and backend images, pushes them to GHCR, copies `docker-compose.yml` to the target host, and runs:

```sh
IMAGE_TAG=<commit-sha> docker compose pull
IMAGE_TAG=<commit-sha> docker compose up -d --remove-orphans
```

The remote host owns runtime secrets in `/srv/apps/jackhales-testing/.env`.

