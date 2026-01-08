# Final Dogrulama Raporu
Tarih: 2025-12-29T18:03:18.470Z
Base URL: http://127.0.0.1:3000
## Ozet Tablo
| Kontrol | Beklenen | Gercek | Sonuc |
| --- | --- | --- | --- |
| On kontrol: /health | 200-299 | 200 | PASS |
| Admin giris (seed admin) | 200/201 | 201 | PASS |
| Uye1 kayit + giris | 200/201 + 200/201 | 201/201 | PASS |
| Uye2 kayit + giris | 200/201 + 200/201 | 201/201 | PASS |
| Admin 2 etiket olusturur | 200/201 + 200/201 | 201/201 | PASS |
| Admin 1 etkinlik olusturur | 200/201 | 201 | PASS |
| Admin etkinlik etiketlerini gunceller | 200/204 | 200 | PASS |
| Uye1 etkinlik liste + detay + etiket dogrular | 200 + 200 (etiketler var) | 200/200 | PASS |
| Uye1 kayit olur + /registrations/me dogrular | 200/201 + 200 | 201/200 | PASS |
| Uye2 baskasinin kaydini silemez | 401/403 | 403 | PASS |
| Uye1 kendi kaydini silebilir | 200/204 | 200 | PASS |
| Uye1 yorum ekler | 200/201 | 201 | PASS |
| Uye2 baskasinin yorumunu silemez | 401/403 | 403 | PASS |
| Admin yorum silebilir | 200/204 | 200 | PASS |
| Uye admin endpointlerine erisemez (events/tags) | 401/403 + 401/403 | 403/403 | PASS |
## Kanitlar
- On kontrol: /health | GET /health | beklenen: 200-299 | gercek: 200 | sonuc: PASS | not: baseUrl: http://127.0.0.1:3000
- Admin giris (seed admin) | POST /auth/login | beklenen: 200/201 | gercek: 201 | sonuc: PASS | not: token:var, rol:var
- Uye1 kayit + giris | POST /auth/register, POST /auth/login | beklenen: 200/201 + 200/201 | gercek: 201/201 | sonuc: PASS | not: token:var, rol:var
- Uye2 kayit + giris | POST /auth/register, POST /auth/login | beklenen: 200/201 + 200/201 | gercek: 201/201 | sonuc: PASS | not: token:var, rol:var
- Admin 2 etiket olusturur | POST /tags (x2) | beklenen: 200/201 + 200/201 | gercek: 201/201 | sonuc: PASS | not: etiketId:2/2
- Admin 1 etkinlik olusturur | POST /events | beklenen: 200/201 | gercek: 201 | sonuc: PASS | not: etkinlikId var
- Admin etkinlik etiketlerini gunceller | PUT /events/:id/tags | beklenen: 200/204 | gercek: 200 | sonuc: PASS | not: etiketId:2
- Uye1 etkinlik liste + detay + etiket dogrular | GET /events, GET /events/:id | beklenen: 200 + 200 (etiketler var) | gercek: 200/200 | sonuc: PASS | not: etiket1:var, etiket2:var
- Uye1 kayit olur + /registrations/me dogrular | POST /registrations, GET /registrations/me | beklenen: 200/201 + 200 | gercek: 201/200 | sonuc: PASS | not: kayit bulundu
- Uye2 baskasinin kaydini silemez | DELETE /registrations/:id | beklenen: 401/403 | gercek: 403 | sonuc: PASS
- Uye1 kendi kaydini silebilir | DELETE /registrations/:id | beklenen: 200/204 | gercek: 200 | sonuc: PASS
- Uye1 yorum ekler | POST /comments | beklenen: 200/201 | gercek: 201 | sonuc: PASS | not: yorumId var
- Uye2 baskasinin yorumunu silemez | DELETE /comments/:id | beklenen: 401/403 | gercek: 403 | sonuc: PASS
- Admin yorum silebilir | DELETE /comments/:id | beklenen: 200/204 | gercek: 200 | sonuc: PASS
- Uye admin endpointlerine erisemez (events/tags) | POST /events, POST /tags | beklenen: 401/403 + 401/403 | gercek: 403/403 | sonuc: PASS