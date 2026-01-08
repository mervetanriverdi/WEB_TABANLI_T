# CampusEvent Final Rapor (PDF)

## 1) Proje Ozeti
- CampusEvent, kampus etkinliklerinin olusturulmasi, etiketlenmesi, kayit alinmasi ve yorumlarin yonetilmesi icin gelistirilmis bir web uygulamasidir.
- Uygulama iki rol uzerinden calisir: ADMIN (yonetim) ve MEMBER (katilimci).
- Amac: Etkinlikler uzerinden kayit/iptal, etiketleme ve yorumlama sureclerini tek bir panelden yonetmektir.

## 2) Kayit / Giris / Yetkilendirme Akisi
- Kayit: Kullanici adi, e-posta ve sifre ile kayit olur; varsayilan rol MEMBER olarak atanir.
- Giris: E-posta/sifre dogrulanir ve JWT access token uretilir.
- Yetkilendirme: Token, korumali sayfalara ve endpointlere erisimde zorunludur.
- Rol kontrolu: Admin sayfalari sadece ADMIN rolune aciktir.

## 3) Roller ve Yetkiler
- ADMIN:
  - Etkinlik CRUD, etiket CRUD
  - Kullanici listesi ve rol guncelleme
  - Kayitlari ve yorumlari goruntuleme, yorum silme
- MEMBER:
  - Etkinlik liste/ detay goruntuleme
  - Etkinlige kayit olma / iptal etme
  - Yorum ekleme ve sadece kendi yorumunu silme

## 4) Veritabani Tablolari ve Iliskiler
- Tablolar:
  - Role: (id, name) benzersiz rol adi (ADMIN/MEMBER)
  - User: rol bilgisi ve kimlik alanlari (email benzersiz)
  - Event: etkinlik bilgileri ve olusturan kullanici (createdById)
  - Tag: etiket adi benzersiz
  - EventTag: Event-Tag iliskisi (composite PK)
  - Registration: kullanici-etkinlik kaydi (unique userId+eventId)
  - Comment: yorumlar (kullanici ve etkinlik baglantisi)
- Iliskiler:
  - 1-N: User -> Event (createdBy)
  - N-N: Event <-> Tag (EventTag araciligiyla)
- Unique kurallari:
  - Role.name, User.email, Tag.name benzersiz
  - Registration(userId,eventId) benzersiz
  - EventTag composite PK (eventId, tagId)

## 5) Backend Endpoint Listesi (Kullanim ve Yetki)
Auth:
- POST /auth/register (PUBLIC): Yeni kullanici kaydi (varsayilan MEMBER). Zorunlu: name, email, password.
- POST /auth/login (PUBLIC): Giris ve token alma. Zorunlu: email, password. Donus: accessToken, user.

Events:
- GET /events (ADMIN, MEMBER): Etkinlik listesini getirir.
- GET /events/:id (ADMIN, MEMBER): Etkinlik detayini getirir.
- POST /events (ADMIN): Etkinlik olusturur. Zorunlu: title, description, location, startAt, endAt, capacity.
- PATCH /events/:id (ADMIN): Etkinlik gunceller. Alanlar opsiyoneldir.
- DELETE /events/:id (ADMIN): Etkinlik siler.
- PUT /events/:id/tags (ADMIN): Etkinlige ait etiketleri gunceller. Zorunlu: tagIds dizisi.

Tags:
- GET /tags (ADMIN, MEMBER): Etiket listesini getirir.
- POST /tags (ADMIN): Etiket olusturur. Zorunlu: name.
- PATCH /tags/:id (ADMIN): Etiket gunceller.
- DELETE /tags/:id (ADMIN): Etiket siler.

Registrations:
- POST /registrations (MEMBER): Etkinlige kayit olur. Zorunlu: eventId.
- DELETE /registrations/:id (MEMBER): Sadece kendi kaydini iptal eder.
- GET /registrations/me (MEMBER): Kendi kayitlarini listeler.
- GET /registrations (ADMIN): Tum kayitlari listeler.

Comments:
- GET /events/:id/comments (ADMIN, MEMBER): Etkinlik yorumlarini listeler.
- POST /comments (MEMBER): Yorum ekler. Zorunlu: eventId, content.
- DELETE /comments/:id (ADMIN, MEMBER): ADMIN tum yorumlari, MEMBER sadece kendi yorumunu siler.
- GET /comments (ADMIN): Tum yorumlari listeler.

Users:
- GET /users (ADMIN): Kullanici listesini getirir.
- PATCH /users/:id/role (ADMIN): Kullanici rolunu gunceller. Zorunlu: roleName.

## 6) Frontend Bilesenleri ve Sayfalar
- Sayfa ve bilesen aciklamalari icin `frontend/COMPONENTS.md` temel alinmistir.
- Public sayfalar: Giris, Kayit
- MEMBER sayfalari: Etkinlik listesi, etkinlik detayi (kayit/yorum), benim kayitlarim
- ADMIN sayfalari: Etkinlik, etiket, kullanici, kayit ve yorum yonetimi
- Guard yapisi: Token yoksa korumali sayfalar engellenir; ADMIN olmayanlar admin sayfalarina giremez.

## 7) Deploy Linkleri
- FRONTEND_URL: <PUT_HERE>
- BACKEND_URL: <PUT_HERE>

## 8) Ekran Goruntuleri
- Giris ekrani
- Kayit ekrani
- Etkinlik listesi
- Etkinlik detayi (kayit ve yorum bolumu)
- Admin ekranlari (etkinlik/etiket/kullanici/kayit/yorum)

## 9) DB Diyagrami (dbdiagram.io)
- `DB_DIAGRAM.dbml` dosyasini dbdiagram.io'ya yapistirin.
- Diyagram goruntusunu rapora ekleyin.
- Diyagram baglantisini (varsa) rapora ekleyin.
