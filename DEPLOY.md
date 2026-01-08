# Deploy Rehberi (CampusEvent)

## 1) PostgreSQL (Neon)
- Neon uzerinden yeni bir Postgres veritabani olusturun.
- Baglanti bilgisini alin (DATABASE_URL).
- Bu URL backend deploy ortam degiskeni olarak tanimlanacak.

## 2) Backend Deploy (Render)
- Render uzerinde yeni Web Service olusturun.
- Repo: bu monorepo
- Root: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Ortam degiskenleri:
  - `DATABASE_URL`: Neon baglanti stringi
  - `JWT_SECRET`: guclu bir gizli anahtar
  - `JWT_EXPIRES_IN`: ornek `1d`
- CORS notu:
  - Frontend domainini backend tarafinda izin verilen origin listesine ekleyin.

## 3) Frontend Deploy (Vercel)
- Vercel uzerinde yeni proje olusturun.
- Root: `frontend`
- Build command: `npm install && npm run build`
- Output: `dist`
- Ortam degiskenleri:
  - `VITE_API_URL`: Render backend URL (HTTPS)

## 4) Paylasim Linkleri (Rapor Icin)
- FRONTEND_URL: <PUT_HERE>
- BACKEND_URL: <PUT_HERE>
