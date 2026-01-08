# Komutlar

## A) Veritabani (Postgres + Docker)
```bash
docker run --name campusevent-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=campusevent -p 5432:5432 -d postgres:16
```

Docker notlari:
```bash
docker start campusevent-db
docker stop campusevent-db
docker rm -f campusevent-db
```

## B) Backend kurulum ve calistirma
```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

## C) Frontend kurulum ve calistirma
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Backend erisim testi
```bash
curl http://127.0.0.1:3000/health
```

```bash
node tools/backend_doctor.mjs --base-url http://127.0.0.1:3000
```

## Baglanti sorunu teshisi
```bash
node tools/doctor.mjs --base-url http://127.0.0.1:3000
```

```bash
node tools/verify_api.mjs --base-url http://127.0.0.1:3000
```

## Seed / Migration
- Seed otomatik calisir (uygulama ilk acildiginda rol ve admin kullanici olusturulur).
- Migration komutu kullanilmiyor (TypeORM synchronize = true).

## Build (Deploy)
```bash
cd backend
npm run build
```

```bash
cd frontend
npm run build
```

## Not
Bu repo auth, roller, CRUD, iliski yonetimi ve deploy dokumanlariyla tamamlanmistir.
