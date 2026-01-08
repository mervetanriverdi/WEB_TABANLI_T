# API Dogrulama (Otomatik)

## Lokal Calistirma
```bash
node tools/verify_api.mjs --base-url http://localhost:3000
```

## Deploy Edilmis Backend Uzerinde
```bash
node tools/verify_api.mjs --base-url https://YOUR_BACKEND_URL
```

## Opsiyonel Parametreler
- `--admin-email` (varsayilan: admin@campus.local)
- `--admin-password` (varsayilan: Admin123!)

## Cikti
- Rapor dosyasi: `MAP/FINAL_VERIFICATION_REPORT.md`
- Tum adimlar PASS/FAIL olarak raporlanir.
