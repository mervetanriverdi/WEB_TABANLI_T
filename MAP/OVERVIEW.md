# CampusEvent MAP Overview

## Purpose
- Bu harita, kodu taramadan sistemi hizli anlamak icin rehberdir.
- Modulleri, endpointleri, UI akisini ve veritabani iliskilerini ozetler.

## Scope
- Backend: endpointler, moduller, entity'ler
- Frontend: route'lar, component'ler, state notlari
- Database: tablolar, iliskiler, kisitlar

## Architecture
- Monorepo: `backend/`, `frontend/`, `MAP/`
- Uygulama akisi ilerleyen parcalarda detaylandirilacak.

## Services
- Backend: NestJS API
- Frontend: React (Vite)
- Veritabani: Postgres

## Environments
- Lokal gelistirme odakli iskelet
- Deploy ve paylasim bilgileri sonraki bolumlerde

## Setup Notes
- `backend/.env` ve `frontend/.env` dosyalari gereklidir.
- `DATABASE_URL` ve `VITE_API_URL` ayarlari kritik.

## Backend Map
- `MAP/BACKEND_MAP.json`: endpoint listesi, moduller ve entity ozetleri.

## Backend Module Ozet
- `AppModule`: ana konfigurasyon ve tum moduller
- `AuthModule`: kayit, giris, JWT uretimi
- `UsersModule`: kullanici listeleme ve rol guncelleme (ADMIN)
- `RolesModule`: rol repository yapisi
- `EventsModule`: etkinlik CRUD, etiket guncelleme ve etkinlik bazli admin yetkilendirmesi
- `TagsModule`: etiket CRUD
- `RegistrationsModule`: kayit olma/iptal ve listeleme
- `CommentsModule`: yorum ekleme/silme ve listeleme
- `SeedModule`: ilk calistirmada rol + admin kullanici olusturma

## Frontend Map
- `MAP/FRONTEND_MAP.json`: route'lar, component listesi ve UI notlari.

## Frontend Route Ozeti
- Public: `/login`, `/register`
- Member: `/events`, `/events/:id`, `/my-registrations`
- Admin: `/admin/events`, `/admin/tags`, `/admin/users`, `/admin/registrations`, `/admin/comments`

## Where is what? (Hizli Harita)
- Backend kodlari: `backend/src`
- Frontend kodlari: `frontend/src`
- API listesi: `backend/ENDPOINTS.md`
- Frontend bilesen listesi: `frontend/COMPONENTS.md`
- DB aciklama: `MAP/DB_MAP.md`
- DB diyagrami: `DB_DIAGRAM.dbml`

## Backend: Moduller / Controller / Service Ozeti
- AuthModule: `backend/src/auth` (AuthController, AuthService)
- UsersModule: `backend/src/users` (UsersController, UsersService)
- EventsModule: `backend/src/events` (EventsController, EventsService)
- TagsModule: `backend/src/tags` (TagsController, TagsService)
- RegistrationsModule: `backend/src/registrations` (RegistrationsController, RegistrationsService)
- CommentsModule: `backend/src/comments` (CommentsController, CommentsService)
- SeedModule: `backend/src/seed` (SeedService)

## Frontend: Route -> Page -> Component Ozeti
- /login -> `frontend/src/pages/Login.tsx`
- /register -> `frontend/src/pages/Register.tsx`
- /events -> `frontend/src/pages/Events.tsx`
- /events/:id -> `frontend/src/pages/EventDetail.tsx`
- /my-registrations -> `frontend/src/pages/MyRegistrations.tsx`
- /admin/events -> `frontend/src/pages/admin/AdminEvents.tsx` + `frontend/src/components/TagMultiSelect.tsx`
- /admin/tags -> `frontend/src/pages/admin/AdminTags.tsx`
- /admin/users -> `frontend/src/pages/admin/AdminUsers.tsx`
- /admin/registrations -> `frontend/src/pages/admin/AdminRegistrations.tsx`
- /admin/comments -> `frontend/src/pages/admin/AdminComments.tsx`

## Point-and-Shoot Degisiklik Rehberi
- Etkinlik etiket secimi:
  - Frontend form: `frontend/src/pages/admin/AdminEvents.tsx`
  - API: `PUT /events/:id/tags`
- Etkinlik bazli admin yetkilendirmesi:
  - Frontend form: `frontend/src/pages/admin/AdminEvents.tsx` (adminIds secimi)
  - Backend entity: `backend/src/entities/event-admin.entity.ts`
  - API: `POST /events` ve `PATCH /events/:id` (adminIds parametresi)
- Kayit ol/iptal:
  - Frontend sayfa: `frontend/src/pages/EventDetail.tsx`
  - API: `POST /registrations`, `DELETE /registrations/:id`
- Yorum ekle/sil:
  - Frontend sayfa: `frontend/src/pages/EventDetail.tsx`
  - API: `POST /comments`, `DELETE /comments/:id`

## Database Map
- `MAP/DB_MAP.md`: tablolar, iliskiler ve kisitlarin sozlu aciklamasi.

## Reporting
- PDF rapor bu kaynaklara dayanir:
  - `ENDPOINTS.md`: backend endpoint aciklamalari
  - `COMPONENTS.md`: frontend component aciklamalari
  - `DB_DIAGRAM`: veritabani diyagrami

## Rol -> Endpoint Matrisi (Ozet)
- PUBLIC: `GET /health`, `POST /auth/register`, `POST /auth/login`
- MEMBER: `GET /events`, `GET /events/:id`, `GET /tags`, `POST /registrations`, `DELETE /registrations/:id`, `GET /registrations/me`, `GET /events/:id/comments`, `POST /comments`, `DELETE /comments/:id` (kendi)
- ADMIN: `GET /events`, `POST /events`, `PATCH /events/:id`, `DELETE /events/:id`, `PUT /events/:id/tags`, `GET /tags`, `POST /tags`, `PATCH /tags/:id`, `DELETE /tags/:id`, `GET /registrations`, `GET /comments`, `DELETE /comments/:id`, `GET /users`, `PATCH /users/:id/role`

## Rol -> Sayfa Matrisi (Ozet)
- PUBLIC: `/login`, `/register`
- MEMBER: `/events`, `/events/:id`, `/my-registrations`
- ADMIN: `/admin/events`, `/admin/tags`, `/admin/users`, `/admin/registrations`, `/admin/comments`

## How to use the map
- `BACKEND_MAP.json` ve `FRONTEND_MAP.json` alanlarini doldur.
- `DB_MAP.md`'de tablo/iliski ozetlerini guncelle.
- Rapor oncesi `ENDPOINTS.md`, `COMPONENTS.md`, `DB_DIAGRAM` dosyalarini tamamla.
