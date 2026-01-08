# Frontend Bilesenleri

## Sayfalar
- `frontend/src/pages/Login.tsx`: Giris formu, login istegi ve rol bazli yonlendirme.
- `frontend/src/pages/Register.tsx`: Kayit formu, kayit istegi ve girise yonlendirme.
- `frontend/src/pages/Events.tsx`: Etkinlik listesi ve etiket filtreleme.
- `frontend/src/pages/EventDetail.tsx`: Etkinlik detayi, kayit ol/iptal, yorum goruntule/ekle/sil.
- `frontend/src/pages/MyRegistrations.tsx`: Uyenin kayit oldugu etkinlikler listesi ve iptal.
- `frontend/src/pages/admin/AdminEvents.tsx`: Admin etkinlik CRUD ve etiket coklu secim.
- `frontend/src/pages/admin/AdminTags.tsx`: Admin etiket CRUD.
- `frontend/src/pages/admin/AdminUsers.tsx`: Admin kullanici listesi ve rol guncelleme.
- `frontend/src/pages/admin/AdminRegistrations.tsx`: Admin tum kayitlar listesi.
- `frontend/src/pages/admin/AdminComments.tsx`: Admin tum yorumlar listesi ve silme.

## Layout ve Guard
- `frontend/src/components/AppLayout.tsx`: Ust menu, rol bazli linkler ve cikis butonu.
- `frontend/src/components/ProtectedRoute.tsx`: Token yoksa protected sayfalari engeller.
- `frontend/src/components/AdminRoute.tsx`: ADMIN degilse admin sayfalarina erisimi engeller.

## Ortak Bilesenler
- `frontend/src/components/TagMultiSelect.tsx`: Etiketleri coklu secim olarak gosterir.

## State
- `frontend/src/state/auth.tsx`: Token ve kullanici bilgisini saklar, giris/cikis islemlerini yonetir.
