#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { randomBytes } from 'crypto';

const args = process.argv.slice(2);
const getArg = (key, fallback) => {
  const index = args.indexOf(key);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
};

const rawBaseUrl = getArg('--base-url', 'http://localhost:3000');
const normalizeBaseUrl = (url) => (url.endsWith('/') ? url.slice(0, -1) : url);
let baseUrl = normalizeBaseUrl(rawBaseUrl);
const adminEmail = getArg('--admin-email', 'admin@campus.local');
const adminPassword = getArg('--admin-password', 'Admin123!');

const reportPath = 'MAP/FINAL_VERIFICATION_REPORT.md';

const results = [];
const evidence = [];
let connectionErrors = 0;
let preflightFailed = false;

const now = new Date().toISOString();

const truncate = (text, max = 200) => {
  if (!text) return '';
  const cleaned = String(text).replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  return cleaned.length > max ? `${cleaned.slice(0, max)}...` : cleaned;
};

const safeJsonParse = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const request = async (method, path, token, body) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const data = safeJsonParse(text);
    return { status: res.status, data, text, error: null };
  } catch (err) {
    connectionErrors += 1;
    return { status: 0, data: null, text: '', error: err?.message || String(err) };
  }
};

const responseSnippet = (res) => {
  if (!res) return '';
  if (res.error) return truncate(`Hata: ${res.error} | baseUrl: ${baseUrl}`);
  return truncate(res.text);
};

const addCheck = ({ name, expected, actual, ok, endpoint, note, failSnippet }) => {
  const result = ok ? 'PASS' : 'FAIL';
  results.push({ name, expected, actual, result });

  const parts = [
    `${name} | ${endpoint} | beklenen: ${expected} | gercek: ${actual} | sonuc: ${result}`,
  ];
  if (note) parts.push(`not: ${note}`);
  if (!ok && failSnippet) parts.push(`yanit: ${failSnippet}`);

  evidence.push(`- ${parts.join(' | ')}`);
};

const randomEmail = () => {
  const suffix = randomBytes(4).toString('hex');
  return `uye_${Date.now()}_${suffix}@campus.test`;
};

const extractTagNames = (data) => {
  const names = new Set();
  if (!data) return [];

  const directTags = Array.isArray(data.tags) ? data.tags : [];
  directTags.forEach((tag) => {
    if (tag?.name) names.add(tag.name);
  });

  const eventTags = Array.isArray(data.eventTags) ? data.eventTags : [];
  eventTags.forEach((item) => {
    if (item?.tag?.name) names.add(item.tag.name);
    if (item?.name) names.add(item.name);
  });

  const nestedTags = Array.isArray(data.data?.tags) ? data.data.tags : [];
  nestedTags.forEach((tag) => {
    if (tag?.name) names.add(tag.name);
  });

  const nestedEventTags = Array.isArray(data.data?.eventTags) ? data.data.eventTags : [];
  nestedEventTags.forEach((item) => {
    if (item?.tag?.name) names.add(item.tag.name);
    if (item?.name) names.add(item.name);
  });

  return Array.from(names);
};

const extractRegistrationList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const extractCommentList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const isSuccessStatus = (status) => status >= 200 && status < 300;

const replaceHost = (url, host) => {
  try {
    const parsed = new URL(url);
    parsed.hostname = host;
    return normalizeBaseUrl(parsed.toString());
  } catch {
    return url;
  }
};

const runPreflight = async () => {
  const originalBaseUrl = baseUrl;
  const attempts = [];

  const attempt = async (urlToUse) => {
    baseUrl = urlToUse;
    const res = await request('GET', '/health', null);
    attempts.push({ url: urlToUse, res });
    return res;
  };

  const firstRes = await attempt(originalBaseUrl);
  if (isSuccessStatus(firstRes.status)) {
    addCheck({
      name: 'On kontrol: /health',
      expected: '200-299',
      actual: String(firstRes.status),
      ok: true,
      endpoint: 'GET /health',
      note: `baseUrl: ${originalBaseUrl}`,
      failSnippet: '',
    });
    return true;
  }

  let fallbackRes = null;
  let fallbackBaseUrl = '';
  try {
    const parsed = new URL(originalBaseUrl);
    if (parsed.hostname === 'localhost') {
      fallbackBaseUrl = replaceHost(originalBaseUrl, '127.0.0.1');
      if (fallbackBaseUrl !== originalBaseUrl) {
        fallbackRes = await attempt(fallbackBaseUrl);
        if (isSuccessStatus(fallbackRes.status)) {
          addCheck({
            name: 'On kontrol: /health',
            expected: '200-299',
            actual: String(fallbackRes.status),
            ok: true,
            endpoint: 'GET /health',
            note: `localhost yerine 127.0.0.1 kullanildi | baseUrl: ${fallbackBaseUrl}`,
            failSnippet: '',
          });
          return true;
        }
      }
    }
  } catch {
    // URL parse failure, continue to fail check
  }

  const lastRes = fallbackRes || firstRes;
  const attempted = fallbackBaseUrl
    ? `denenen baseUrl: ${originalBaseUrl}, ${fallbackBaseUrl}`
    : `denenen baseUrl: ${originalBaseUrl}`;

  preflightFailed = true;
  addCheck({
    name: 'On kontrol: /health',
    expected: '200-299',
    actual: String(lastRes.status),
    ok: false,
    endpoint: 'GET /health',
    note: `Sunucuya erisilemiyor | ${attempted}`,
    failSnippet: responseSnippet(lastRes),
  });
  console.error(`On kontrol basarisiz: Sunucuya erisilemiyor. ${attempted}`);

  return false;
};

const buildFixSuggestions = () => {
  const lines = ['## Ne yapmali?'];
  const failedNames = results.filter((r) => r.result === 'FAIL').map((r) => r.name.toLowerCase());
  const has = (keyword) => failedNames.some((name) => name.includes(keyword));

  if (connectionErrors > 0 || preflightFailed) {
    lines.push('- Backend calisiyor mu kontrol edin.');
    lines.push('- Dogru port kullaniliyor mu kontrol edin.');
    lines.push('- WSL/konteyner icindeyseniz 127.0.0.1 veya host.docker.internal deneyin.');
    lines.push('- CORS, sunucu-sunucu fetch icin engel degildir.');
  }
  if (has('giris') || has('kayit')) {
    lines.push('- Auth sorunlari icin: `backend/src/auth/auth.service.ts` (login/register).');
  }
  if (has('admin') || has('yetki') || has('admin endpointlerine')) {
    lines.push('- Rol/izin sorunlari icin: `backend/src/auth/guards` ve ilgili controller dekoratorleri.');
  }
  if (has('etiket') || has('etkinlik')) {
    lines.push('- Etkinlik/etiket islemleri icin: `backend/src/events` ve `backend/src/tags` servisleri.');
  }
  if (has('kayit olur') || has('kaydini')) {
    lines.push('- Kayit islemleri icin: `backend/src/registrations/registrations.service.ts`.');
  }
  if (has('yorum')) {
    lines.push('- Yorum islemleri icin: `backend/src/comments/comments.service.ts`.');
  }

  if (lines.length === 1) {
    lines.push('- Kanitlar bolumundeki hata mesajlarini inceleyin ve ilgili endpointi kontrol edin.');
  }

  return lines.join('\n');
};

const run = async () => {
  const memberPassword = 'Member123!';
  let adminToken = '';
  let member1Token = '';
  let member2Token = '';
  let eventId = null;
  let registrationId = null;
  let commentId = null;
  let tagIds = [];

  const tagName1 = `Etiket_${Date.now()}_1`;
  const tagName2 = `Etiket_${Date.now()}_2`;

  // 1) Admin login
  const adminLogin = await request('POST', '/auth/login', null, {
    email: adminEmail,
    password: adminPassword,
  });
  const adminRole = adminLogin.data?.user?.role || adminLogin.data?.user?.roleName || adminLogin.data?.role;
  const adminHasToken = Boolean(adminLogin.data?.accessToken);
  const adminOkStatus = [200, 201].includes(adminLogin.status);
  const adminOk = adminOkStatus && adminHasToken && Boolean(adminRole);
  if (adminHasToken) adminToken = adminLogin.data.accessToken;
  addCheck({
    name: 'Admin giris (seed admin)',
    expected: '200/201',
    actual: String(adminLogin.status),
    ok: adminOk,
    endpoint: 'POST /auth/login',
    note: `token:${adminHasToken ? 'var' : 'yok'}, rol:${adminRole ? 'var' : 'yok'}`,
    failSnippet: adminOk ? '' : responseSnippet(adminLogin),
  });

  const registerAndLogin = async (label) => {
    const email = randomEmail();
    const registerRes = await request('POST', '/auth/register', null, {
      name: label,
      email,
      password: memberPassword,
    });
    const loginRes = await request('POST', '/auth/login', null, {
      email,
      password: memberPassword,
    });
    const okRegister = [200, 201].includes(registerRes.status);
    const okLogin = [200, 201].includes(loginRes.status);
    const token = loginRes.data?.accessToken || '';
    const role = loginRes.data?.user?.role || loginRes.data?.user?.roleName || loginRes.data?.role;
    const ok = okRegister && okLogin && Boolean(token) && Boolean(role);
    const failSource = !okRegister ? registerRes : loginRes;

    return {
      email,
      token,
      role,
      ok,
      actual: `${registerRes.status}/${loginRes.status}`,
      note: `token:${token ? 'var' : 'yok'}, rol:${role ? 'var' : 'yok'}`,
      failSnippet: ok ? '' : responseSnippet(failSource),
      registerRes,
      loginRes,
    };
  };

  // 2) Register member1 + login
  const member1 = await registerAndLogin('Uye1');
  if (member1.token) member1Token = member1.token;
  addCheck({
    name: 'Uye1 kayit + giris',
    expected: '200/201 + 200/201',
    actual: member1.actual,
    ok: member1.ok,
    endpoint: 'POST /auth/register, POST /auth/login',
    note: member1.note,
    failSnippet: member1.failSnippet,
  });

  // 3) Register member2 + login
  const member2 = await registerAndLogin('Uye2');
  if (member2.token) member2Token = member2.token;
  addCheck({
    name: 'Uye2 kayit + giris',
    expected: '200/201 + 200/201',
    actual: member2.actual,
    ok: member2.ok,
    endpoint: 'POST /auth/register, POST /auth/login',
    note: member2.note,
    failSnippet: member2.failSnippet,
  });

  // 4) Admin creates 2 tags
  if (!adminToken) {
    addCheck({
      name: 'Admin 2 etiket olusturur',
      expected: '200/201 + 200/201',
      actual: '0/0',
      ok: false,
      endpoint: 'POST /tags (x2)',
      note: 'admin token yok',
      failSnippet: '',
    });
  } else {
    const tag1 = await request('POST', '/tags', adminToken, { name: tagName1 });
    const tag2 = await request('POST', '/tags', adminToken, { name: tagName2 });
    if (tag1.data?.id) tagIds.push(tag1.data.id);
    if (tag2.data?.id) tagIds.push(tag2.data.id);

    if (tagIds.length < 2) {
      const listRes = await request('GET', '/tags', adminToken);
      if (Array.isArray(listRes.data)) {
        listRes.data.forEach((tag) => {
          if (tag?.name === tagName1 && tag?.id) tagIds.push(tag.id);
          if (tag?.name === tagName2 && tag?.id) tagIds.push(tag.id);
        });
      }
    }

    const okStatus = [200, 201].includes(tag1.status) && [200, 201].includes(tag2.status);
    const ok = okStatus && tagIds.length >= 2;
    const failSource = !okStatus ? (tag1.status === 200 || tag1.status === 201 ? tag2 : tag1) : tag1;

    addCheck({
      name: 'Admin 2 etiket olusturur',
      expected: '200/201 + 200/201',
      actual: `${tag1.status}/${tag2.status}`,
      ok,
      endpoint: 'POST /tags (x2)',
      note: `etiketId:${tagIds.length}/2`,
      failSnippet: ok ? '' : responseSnippet(failSource),
    });
  }

  // 5) Admin creates 1 event
  if (!adminToken) {
    addCheck({
      name: 'Admin 1 etkinlik olusturur',
      expected: '200/201',
      actual: '0',
      ok: false,
      endpoint: 'POST /events',
      note: 'admin token yok',
      failSnippet: '',
    });
  } else {
    const startAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const endAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const eventRes = await request('POST', '/events', adminToken, {
      title: `Test Etkinlik ${Date.now()}`,
      description: 'Test aciklama',
      location: 'Test Konum',
      startAt,
      endAt,
      capacity: 25,
    });
    const okStatus = [200, 201].includes(eventRes.status);
    if (eventRes.data?.id) eventId = eventRes.data.id;
    const ok = okStatus && Boolean(eventId);
    addCheck({
      name: 'Admin 1 etkinlik olusturur',
      expected: '200/201',
      actual: String(eventRes.status),
      ok,
      endpoint: 'POST /events',
      note: eventId ? 'etkinlikId var' : 'etkinlikId yok',
      failSnippet: ok ? '' : responseSnippet(eventRes),
    });
  }

  // 6) Admin updates event tags
  if (!adminToken || !eventId || tagIds.length < 2) {
    addCheck({
      name: 'Admin etkinlik etiketlerini gunceller',
      expected: '200/204',
      actual: '0',
      ok: false,
      endpoint: 'PUT /events/:id/tags',
      note: 'gerekli veri yok',
      failSnippet: '',
    });
  } else {
    const updateTagsRes = await request('PUT', `/events/${eventId}/tags`, adminToken, { tagIds });
    const ok = [200, 204].includes(updateTagsRes.status);
    addCheck({
      name: 'Admin etkinlik etiketlerini gunceller',
      expected: '200/204',
      actual: String(updateTagsRes.status),
      ok,
      endpoint: 'PUT /events/:id/tags',
      note: `etiketId:${tagIds.length}`,
      failSnippet: ok ? '' : responseSnippet(updateTagsRes),
    });
  }

  // 7) Member1 lists events and checks tags
  if (!member1Token || !eventId) {
    addCheck({
      name: 'Uye1 etkinlik liste + detay + etiket dogrular',
      expected: '200 + 200 (etiketler var)',
      actual: '0/0',
      ok: false,
      endpoint: 'GET /events, GET /events/:id',
      note: 'gerekli veri yok',
      failSnippet: '',
    });
  } else {
    const listRes = await request('GET', '/events', member1Token);
    const detailRes = await request('GET', `/events/${eventId}`, member1Token);
    const listOk = listRes.status === 200;
    const detailOk = detailRes.status === 200;
    const tagNames = extractTagNames(detailRes.data);
    const hasTag1 = tagNames.includes(tagName1);
    const hasTag2 = tagNames.includes(tagName2);
    const ok = listOk && detailOk && hasTag1 && hasTag2;
    const note = `etiket1:${hasTag1 ? 'var' : 'yok'}, etiket2:${hasTag2 ? 'var' : 'yok'}`;
    const failSnippet = ok ? '' : responseSnippet(detailRes.status === 200 ? detailRes : listRes);

    addCheck({
      name: 'Uye1 etkinlik liste + detay + etiket dogrular',
      expected: '200 + 200 (etiketler var)',
      actual: `${listRes.status}/${detailRes.status}`,
      ok,
      endpoint: 'GET /events, GET /events/:id',
      note,
      failSnippet,
    });
  }

  // 8) Member1 creates registration and verifies
  if (!member1Token || !eventId) {
    addCheck({
      name: 'Uye1 kayit olur + /registrations/me dogrular',
      expected: '200/201 + 200',
      actual: '0/0',
      ok: false,
      endpoint: 'POST /registrations, GET /registrations/me',
      note: 'gerekli veri yok',
      failSnippet: '',
    });
  } else {
    const regRes = await request('POST', '/registrations', member1Token, { eventId });
    if (regRes.data?.id) registrationId = regRes.data.id;
    const meRes = await request('GET', '/registrations/me', member1Token);
    const list = extractRegistrationList(meRes.data);
    const found = list.find((item) => item?.eventId === eventId || item?.event?.id === eventId);
    if (!registrationId && found?.id) registrationId = found.id;
    const ok = [200, 201].includes(regRes.status) && meRes.status === 200 && Boolean(found);
    const failSnippet = ok ? '' : responseSnippet(regRes.status === 200 || regRes.status === 201 ? meRes : regRes);

    addCheck({
      name: 'Uye1 kayit olur + /registrations/me dogrular',
      expected: '200/201 + 200',
      actual: `${regRes.status}/${meRes.status}`,
      ok,
      endpoint: 'POST /registrations, GET /registrations/me',
      note: found ? 'kayit bulundu' : 'kayit bulunamadi',
      failSnippet,
    });
  }

  // 9) Member2 attempts to delete member1 registration
  if (!member2Token || !registrationId) {
    addCheck({
      name: 'Uye2 baskasinin kaydini silemez',
      expected: '401/403',
      actual: '0',
      ok: false,
      endpoint: 'DELETE /registrations/:id',
      note: 'gerekli veri yok',
      failSnippet: '',
    });
  } else {
    const delRes = await request('DELETE', `/registrations/${registrationId}`, member2Token);
    const ok = [401, 403].includes(delRes.status);
    addCheck({
      name: 'Uye2 baskasinin kaydini silemez',
      expected: '401/403',
      actual: String(delRes.status),
      ok,
      endpoint: 'DELETE /registrations/:id',
      note: '',
      failSnippet: ok ? '' : responseSnippet(delRes),
    });
  }

  // 10) Member1 deletes own registration
  if (!member1Token || !registrationId) {
    addCheck({
      name: 'Uye1 kendi kaydini silebilir',
      expected: '200/204',
      actual: '0',
      ok: false,
      endpoint: 'DELETE /registrations/:id',
      note: 'gerekli veri yok',
      failSnippet: '',
    });
  } else {
    const delRes = await request('DELETE', `/registrations/${registrationId}`, member1Token);
    const ok = [200, 204].includes(delRes.status);
    addCheck({
      name: 'Uye1 kendi kaydini silebilir',
      expected: '200/204',
      actual: String(delRes.status),
      ok,
      endpoint: 'DELETE /registrations/:id',
      note: '',
      failSnippet: ok ? '' : responseSnippet(delRes),
    });
  }

  // 11) Member1 creates a comment
  const commentContent = `Test yorum ${Date.now()}`;
  if (!member1Token || !eventId) {
    addCheck({
      name: 'Uye1 yorum ekler',
      expected: '200/201',
      actual: '0',
      ok: false,
      endpoint: 'POST /comments',
      note: 'gerekli veri yok',
      failSnippet: '',
    });
  } else {
    const commentRes = await request('POST', '/comments', member1Token, { eventId, content: commentContent });
    if (commentRes.data?.id) commentId = commentRes.data.id;
    if (!commentId) {
      const listRes = await request('GET', `/events/${eventId}/comments`, member1Token);
      const list = extractCommentList(listRes.data);
      const found = list.find((item) => item?.content === commentContent);
      if (found?.id) commentId = found.id;
    }

    const ok = [200, 201].includes(commentRes.status) && Boolean(commentId);
    addCheck({
      name: 'Uye1 yorum ekler',
      expected: '200/201',
      actual: String(commentRes.status),
      ok,
      endpoint: 'POST /comments',
      note: commentId ? 'yorumId var' : 'yorumId yok',
      failSnippet: ok ? '' : responseSnippet(commentRes),
    });
  }

  // 12) Member2 attempts to delete member1 comment
  if (!member2Token || !commentId) {
    addCheck({
      name: 'Uye2 baskasinin yorumunu silemez',
      expected: '401/403',
      actual: '0',
      ok: false,
      endpoint: 'DELETE /comments/:id',
      note: 'gerekli veri yok',
      failSnippet: '',
    });
  } else {
    const delRes = await request('DELETE', `/comments/${commentId}`, member2Token);
    const ok = [401, 403].includes(delRes.status);
    addCheck({
      name: 'Uye2 baskasinin yorumunu silemez',
      expected: '401/403',
      actual: String(delRes.status),
      ok,
      endpoint: 'DELETE /comments/:id',
      note: '',
      failSnippet: ok ? '' : responseSnippet(delRes),
    });
  }

  // 13) Admin deletes comment
  if (!adminToken || !commentId) {
    addCheck({
      name: 'Admin yorum silebilir',
      expected: '200/204',
      actual: '0',
      ok: false,
      endpoint: 'DELETE /comments/:id',
      note: 'gerekli veri yok',
      failSnippet: '',
    });
  } else {
    const delRes = await request('DELETE', `/comments/${commentId}`, adminToken);
    const ok = [200, 204].includes(delRes.status);
    addCheck({
      name: 'Admin yorum silebilir',
      expected: '200/204',
      actual: String(delRes.status),
      ok,
      endpoint: 'DELETE /comments/:id',
      note: '',
      failSnippet: ok ? '' : responseSnippet(delRes),
    });
  }

  // 14) Member tries admin-only endpoints
  if (!member1Token) {
    addCheck({
      name: 'Uye admin endpointlerine erisemez (events/tags)',
      expected: '401/403 + 401/403',
      actual: '0/0',
      ok: false,
      endpoint: 'POST /events, POST /tags',
      note: 'uye token yok',
      failSnippet: '',
    });
  } else {
    const denyEvent = await request('POST', '/events', member1Token, {
      title: 'Yetkisiz',
      description: 'Yetkisiz',
      location: 'Yetkisiz',
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      capacity: 1,
    });
    const denyTag = await request('POST', '/tags', member1Token, { name: `Yetkisiz_${Date.now()}` });
    const ok = [401, 403].includes(denyEvent.status) && [401, 403].includes(denyTag.status);
    const failSnippet = ok ? '' : responseSnippet([401, 403].includes(denyEvent.status) ? denyTag : denyEvent);

    addCheck({
      name: 'Uye admin endpointlerine erisemez (events/tags)',
      expected: '401/403 + 401/403',
      actual: `${denyEvent.status}/${denyTag.status}`,
      ok,
      endpoint: 'POST /events, POST /tags',
      note: '',
      failSnippet,
    });
  }
};

const writeReport = () => {
  const tableRows = results
    .map((r) => `| ${r.name} | ${r.expected} | ${r.actual} | ${r.result} |`)
    .join('\n');

  const hasFail = results.some((r) => r.result === 'FAIL');
  const fixSection = hasFail ? buildFixSuggestions() : '';

  const report = [
    '# Final Dogrulama Raporu',
    '',
    `Tarih: ${now}`,
    `Base URL: ${baseUrl}`,
    '',
    '## Ozet Tablo',
    '| Kontrol | Beklenen | Gercek | Sonuc |',
    '| --- | --- | --- | --- |',
    tableRows || '| (Bos) | - | - | - |',
    '',
    '## Kanitlar',
    evidence.length > 0 ? evidence.join('\n') : '- (Kanit yok)',
    '',
    fixSection,
  ]
    .filter(Boolean)
    .join('\n');

  writeFileSync(reportPath, report, 'utf-8');

  const passCount = results.filter((r) => r.result === 'PASS').length;
  const failCount = results.filter((r) => r.result === 'FAIL').length;
  console.log(`Dogrulama tamamlandi: ${passCount} PASS, ${failCount} FAIL. Rapor: ${reportPath}`);
  process.exitCode = failCount > 0 ? 1 : 0;
};

const main = async () => {
  try {
    const preflightOk = await runPreflight();
    if (!preflightOk) {
      return;
    }
    await run();
  } catch (err) {
    addCheck({
      name: 'Script calistirma',
      expected: 'Basarili',
      actual: '0',
      ok: false,
      endpoint: 'tools/verify_api.mjs',
      note: 'Beklenmeyen hata',
      failSnippet: truncate(err?.message || 'Bilinmeyen hata'),
    });
  } finally {
    writeReport();
  }
};

main();
