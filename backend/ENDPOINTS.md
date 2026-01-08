# Backend Endpointleri

## Auth
- `POST /auth/register` (PUBLIC)
  - Amac: Yeni kullanici kaydi (varsayilan rol: MEMBER).
  - Zorunlu alanlar: `name`, `email`, `password`.
- `POST /auth/login` (PUBLIC)
  - Amac: Giris yapip JWT access token almak.
  - Zorunlu alanlar: `email`, `password`.
  - Donus: `accessToken`, `user` (id, name, email, role).

## Events
- `GET /events` (ADMIN, MEMBER)
  - Amac: Etkinlik listesini almak.
  - Not: ADMIN kullanicilar sadece kendi olusturduklari veya yetkilendirildikleri etkinlikleri gorur.
- `GET /events/:id` (ADMIN, MEMBER)
  - Amac: Etkinlik detayini almak.
  - Not: ADMIN kullanicilar sadece kendi olusturduklari veya yetkilendirildikleri etkinlikleri gorur.
- `POST /events` (ADMIN)
  - Amac: Etkinlik olusturmak.
  - Zorunlu alanlar: `title`, `description`, `location`, `startAt`, `endAt`, `capacity`.
  - Opsiyonel alanlar: `adminIds` (dizi) - Etkinlik bazli admin yetkilendirmesi icin.
- `PATCH /events/:id` (ADMIN)
  - Amac: Etkinlik guncellemek.
  - Opsiyonel alanlar: `title`, `description`, `location`, `startAt`, `endAt`, `capacity`, `adminIds` (dizi).
  - Not: Sadece etkinligi olusturan veya yetkilendirilmis admin'ler guncelleyebilir.
- `DELETE /events/:id` (ADMIN)
  - Amac: Etkinlik silmek.
  - Not: Sadece etkinligi olusturan veya yetkilendirilmis admin'ler silebilir.
- `PUT /events/:id/tags` (ADMIN)
  - Amac: Etkinlige ait etiketleri guncellemek (N-N).
  - Zorunlu alanlar: `tagIds` (dizi).
  - Not: Sadece etkinligi olusturan veya yetkilendirilmis admin'ler degistirebilir.

## Tags
- `GET /tags` (ADMIN, MEMBER)
  - Amac: Etiket listesini almak.
- `POST /tags` (ADMIN)
  - Amac: Etiket olusturmak.
  - Zorunlu alanlar: `name`.
- `PATCH /tags/:id` (ADMIN)
  - Amac: Etiket guncellemek.
  - Opsiyonel alanlar: `name`.
- `DELETE /tags/:id` (ADMIN)
  - Amac: Etiket silmek.

## Registrations
- `POST /registrations` (MEMBER)
  - Amac: Etkinlige kayit olmak.
  - Zorunlu alanlar: `eventId`.
- `DELETE /registrations/:id` (MEMBER)
  - Amac: Kendi kaydini iptal etmek.
- `GET /registrations/me` (MEMBER)
  - Amac: Kullanicinin kendi kayitlarini listelemek.
- `GET /registrations` (ADMIN)
  - Amac: Tum kayitlari listelemek.

## Comments
- `GET /events/:id/comments` (ADMIN, MEMBER)
  - Amac: Etkinlige ait yorumlari listelemek.
- `POST /comments` (MEMBER)
  - Amac: Etkinlige yorum eklemek.
  - Zorunlu alanlar: `eventId`, `content`.
- `DELETE /comments/:id` (ADMIN, MEMBER)
  - Amac: ADMIN her yorumu, MEMBER sadece kendi yorumunu silebilir.
- `GET /comments` (ADMIN)
  - Amac: Tum yorumlari listelemek.

## Users (Admin)
- `GET /users` (ADMIN)
  - Amac: Tum kullanicilari listelemek.
- `PATCH /users/:id/role` (ADMIN)
  - Amac: Kullanici rolunu guncellemek.
  - Zorunlu alanlar: `roleName` (ADMIN | MEMBER).
