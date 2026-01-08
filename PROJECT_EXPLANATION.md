# CampusEvent - Odev Aciklamasi, Kullanim ve Deploy

## 1) Proje Nedir / Islevi Nedir?
CampusEvent, kampus etkinliklerini olusturma, etiketleme, kayit alma ve yorum yonetimi icin gelistirilmis bir web uygulamasidir.
- ADMIN rolunde kullanicilar etkinlik, etiket, kullanici, kayit ve yorumlari yonetir.
- MEMBER rolunde kullanicilar etkinlikleri gorur, kayit olur/iptal eder ve kendi yorumlarini ekler/siler.

## 2) Odev Gereksinimlerine Uygunluk
- Frontend: React (Vite + TypeScript)
- Backend: NestJS (TypeORM + PostgreSQL)
- Kullanici sistemi, kayit, giris ve JWT yetkilendirme
- En az 2 rol: ADMIN ve MEMBER
- Role gore farkli sayfalar
- En az 4 entity: Role, User, Event, Tag, Registration, Comment
- Iliskiler:
  - 1-N: User -> Event (createdBy)
  - N-N: Event <-> Tag (EventTag)
- Iliskiler frontend uzerinden yonetilir:
  - Admin etkinlik formunda etiket coklu secim
  - Member kayit olma/iptal
  - Member yorum ekleme/silme

## 3) Uygulama Nasil Kullanilir?
### Admin girisi
- E-posta: admin@campus.local
- Sifre: Admin123!
- Admin panelinden etkinlik, etiket, kullanici, kayit ve yorumlar yonetilir.

### Member kaydi
- /register sayfasindan yeni bir e-posta ve en az 6 karakterli sifre ile kayit olunur.
- Kayit sonrasi /login ile giris yapilir.

### Member islemleri
- Etkinlik listesi ve detay goruntuleme
- Etkinlige kayit olma / iptal etme
- Yorum ekleme / kendi yorumunu silme

## 4) Buluta Deploy ve Public Paylasim (Detayli)
### A) PostgreSQL (Neon)
1. Neon uzerinde yeni Postgres veritabani olusturun.
2. DATABASE_URL bilgisini alin (backend icin kullanilacak).

### B) Backend Deploy (Render)
1. Render'da yeni Web Service olusturun.
2. Repo: bu monorepo
3. Root: backend
4. Build command:
   - npm install && npm run build
5. Start command:
   - npm run start
6. Ortam degiskenleri:
   - DATABASE_URL: Neon baglanti stringi
   - JWT_SECRET: guclu bir gizli anahtar
   - JWT_EXPIRES_IN: 1d
7. Deploy sonrasi Render backend URL'ini alin (BACKEND_URL).

### C) Frontend Deploy (Vercel)
1. Vercel'de yeni proje olusturun.
2. Root: frontend
3. Build command:
   - npm install && npm run build
4. Output: dist
5. Ortam degiskenleri:
   - VITE_API_URL: Render backend URL (HTTPS)
6. Deploy sonrasi frontend URL'ini alin (FRONTEND_URL).

### D) Public Paylasim
- FRONTEND_URL ve BACKEND_URL linklerini rapora ekleyin.
- PDF raporunu sisteme yukleyin (kod eklenmeyecek).
