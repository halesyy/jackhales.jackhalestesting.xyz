MONGODB_URL=mongodb://127.0.0.1:27017 \
MONGODB_DATABASE=jackhales_dev \
ADMIN_ALLOWED_IPS=127.0.0.1,::1 \
ADMIN_BOOTSTRAP_IP=127.0.0.1 \
CORS_ORIGINS=http://localhost:3000 \
PUBLIC_SITE_URL=http://localhost:3000 \
SESSION_SECRET=local-dev-only \
uvicorn app.main:app --reload
