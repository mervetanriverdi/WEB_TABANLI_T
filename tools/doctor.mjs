#!/usr/bin/env node
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { execSync, spawn } from 'child_process';
import { platform, version, cwd } from 'process';
import { createConnection } from 'net';

const args = process.argv.slice(2);
const getArg = (key, fallback) => {
  const index = args.indexOf(key);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
};

const parseBool = (value) => {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  return ['true', '1', 'yes', 'y'].includes(normalized);
};

const normalizeBaseUrl = (url) => (url.endsWith('/') ? url.slice(0, -1) : url);
const inputBaseUrl = normalizeBaseUrl(getArg('--base-url', 'http://127.0.0.1:3000'));
const autoStartBackend = parseBool(getArg('--auto-start-backend', 'false'));
const reportPath = 'MAP/CONNECTIVITY_DIAGNOSIS.md';

const now = new Date().toISOString();

const truncate = (text, max = 200) => {
  if (!text) return '';
  const cleaned = String(text).replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  return cleaned.length > max ? `${cleaned.slice(0, max)}...` : cleaned;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, timeoutMs = 4000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, error: null };
  } catch (err) {
    return { ok: false, status: 0, text: '', error: err?.message || String(err) };
  } finally {
    clearTimeout(timer);
  }
};

const readEnvPort = () => {
  const envPath = 'backend/.env';
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const [key, value] = line.split('=');
    if (key?.trim() === 'PORT') {
      const portValue = Number((value || '').trim());
      if (Number.isFinite(portValue) && portValue > 0) return portValue;
    }
  }
  return null;
};

const buildCandidateBaseUrls = () => {
  const candidates = [];
  const add = (url) => {
    const normalized = normalizeBaseUrl(url);
    if (!candidates.includes(normalized)) candidates.push(normalized);
  };

  add(inputBaseUrl);
  add('http://localhost:3000');

  const envPort = readEnvPort();
  if (envPort) {
    try {
      const parsed = new URL(inputBaseUrl);
      parsed.port = String(envPort);
      add(parsed.toString());
    } catch {
      add(`http://127.0.0.1:${envPort}`);
    }
    add(`http://localhost:${envPort}`);
  }

  return { candidates, envPort };
};

const parseHostPort = (baseUrl) => {
  try {
    const parsed = new URL(baseUrl);
    const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
    return { host: parsed.hostname, port: Number(port) };
  } catch {
    return { host: null, port: null };
  }
};

const probeTcp = (host, port, timeoutMs = 2000) =>
  new Promise((resolve) => {
    if (!host || !port) {
      resolve({ ok: false, error: 'Host veya port bulunamadi.' });
      return;
    }
    const socket = createConnection({ host, port });
    const onError = (err) => {
      socket.destroy();
      resolve({ ok: false, error: err?.message || String(err) });
    };
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ ok: false, error: 'Zaman asimi' });
    }, timeoutMs);

    socket.once('connect', () => {
      clearTimeout(timer);
      socket.end();
      resolve({ ok: true, error: '' });
    });

    socket.once('error', onError);
  });

const runOsPortCommand = (port) => {
  if (!port) {
    return { ok: false, command: '', output: '', error: 'Port bulunamadi.' };
  }
  try {
    if (platform === 'win32') {
      const command = `netstat -ano | findstr :${port}`;
      const output = execSync(command, { stdio: 'pipe' }).toString();
      return { ok: true, command, output, error: '' };
    }
    const command = `lsof -i :${port}`;
    const output = execSync(command, { stdio: 'pipe' }).toString();
    return { ok: true, command, output, error: '' };
  } catch (err) {
    const command = platform === 'win32' ? `netstat -ano | findstr :${port}` : `lsof -i :${port}`;
    return { ok: false, command, output: '', error: err?.message || String(err) };
  }
};

const createLogger = (limit) => {
  const lines = [];
  const push = (chunk, source) => {
    const text = String(chunk || '');
    const parts = text.split(/\r?\n/).filter(Boolean);
    for (const part of parts) {
      lines.push(`[${source}] ${part}`);
      if (lines.length > limit) lines.shift();
    }
  };
  return { lines, push };
};

const startBackend = () => {
  const distPath = 'backend/dist/main.js';
  const hasDist = existsSync(distPath);
  const npmCmd = platform === 'win32' ? 'npm.cmd' : 'npm';
  const command = hasDist ? 'node' : npmCmd;
  const argsToUse = hasDist ? ['dist/main.js'] : ['--prefix', 'backend', 'run', 'start:dev'];
  const childCwd = hasDist ? 'backend' : cwd();

  const child = spawn(command, argsToUse, {
    cwd: childCwd,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return { child, command: `${command} ${argsToUse.join(' ')}`, mode: hasDist ? 'prod' : 'dev' };
};

const report = {
  timestamp: now,
  cwd: cwd(),
  nodeVersion: version,
  baseUrlInput: inputBaseUrl,
  attempts: [],
  tcpProbe: null,
  osPortCommand: null,
  summary: { reachable: false, successUrl: '' },
  autoStart: {
    enabled: autoStartBackend,
    attempted: false,
    mode: 'none',
    command: '',
    exitCode: null,
    exitSignal: null,
    logs: [],
  },
  errors: [],
};

const addAttempt = (url, res, source) => {
  report.attempts.push({
    url,
    source,
    ok: res.ok,
    status: res.status,
    error: res.error,
  });
};

const buildGuidance = () => {
  const lines = [];
  const statuses = report.attempts.map((a) => a.status).filter((s) => s > 0);
  const errors = report.attempts.map((a) => a.error).filter(Boolean).join(' ');
  const has404 = statuses.includes(404);
  const has401 = statuses.includes(401) || statuses.includes(403);
  const has500 = statuses.some((s) => s >= 500);
  const allFailed = report.attempts.length > 0 && report.attempts.every((a) => !a.ok);
  const tcpOk = report.tcpProbe?.ok === true;

  if (!report.summary.reachable) {
    if (allFailed && !tcpOk) {
      lines.push('- Backend calismiyor olabilir veya port/host yanlis olabilir.');
    }
    if (allFailed && tcpOk) {
      lines.push('- TCP baglanti var ama /health yanit vermiyor; global prefix veya route farkli olabilir.');
    }
    if (has404) {
      lines.push('- /health bulunamadi (global prefix veya route ismi farkli olabilir).');
    }
    if (has401) {
      lines.push('- /health korumali olabilir; public olmali.');
    }
    if (has500) {
      lines.push('- 5xx hata; DB/ENV veya uygulama baslatma sorunu olabilir.');
    }
    if (/ENOTFOUND/i.test(errors)) {
      lines.push('- Host cozulmuyor; base-url host degerini kontrol edin.');
    }
    if (/ECONNREFUSED/i.test(errors)) {
      lines.push('- Port reddedildi; backend calismiyor olabilir.');
    }
    if (/ETIMEDOUT|timeout/i.test(errors)) {
      lines.push('- Zaman asimi; firewall veya yanlis host/port olabilir.');
    }
    if (report.autoStart.attempted && report.autoStart.exitCode !== null) {
      lines.push('- Auto-start sirasinda backend erken kapandi; loglari kontrol edin.');
    }

    lines.push('- WSL/konteyner icindeyseniz 127.0.0.1 veya host.docker.internal deneyin.');
    lines.push('- CORS, sunucu-sunucu fetch icin engel degildir.');
  } else {
    lines.push('- /health erisilebilir; diger hatalar icin endpoint ve auth kontrollerini yapin.');
  }

  return lines;
};

const main = async () => {
  let exitCode = 1;
  const { candidates, envPort } = buildCandidateBaseUrls();

  try {
    for (const base of candidates) {
      const healthUrl = `${base}/health`;
      const res = await fetchWithTimeout(healthUrl);
      addAttempt(healthUrl, res, 'ilk');
      if (res.ok) {
        report.summary.reachable = true;
        report.summary.successUrl = healthUrl;
        exitCode = 0;
        break;
      }
    }

    if (!report.summary.reachable && autoStartBackend) {
      report.autoStart.attempted = true;
      const { child, command, mode } = startBackend();
      report.autoStart.command = command;
      report.autoStart.mode = mode;

      const logger = createLogger(60);
      report.autoStart.logs = logger.lines;

      let exited = false;
      child.on('exit', (code, signal) => {
        exited = true;
        report.autoStart.exitCode = code;
        report.autoStart.exitSignal = signal;
      });
      child.on('error', (err) => {
        const message = truncate(err?.message || String(err));
        report.errors.push(`Backend baslatma hatasi: ${message}`);
        logger.push(message, 'stderr');
      });
      child.stdout.on('data', (data) => logger.push(data, 'stdout'));
      child.stderr.on('data', (data) => logger.push(data, 'stderr'));

      for (let i = 0; i < 8; i += 1) {
        const healthUrl = `${inputBaseUrl}/health`;
        const res = await fetchWithTimeout(healthUrl, 1500);
        addAttempt(healthUrl, res, 'auto-start');
        if (res.ok) {
          report.summary.reachable = true;
          report.summary.successUrl = healthUrl;
          exitCode = 0;
          break;
        }
        if (exited) break;
        await sleep(1000);
      }

      if (!exited) {
        child.kill();
        await sleep(500);
      }
    }

    const { host, port } = parseHostPort(inputBaseUrl);
    report.tcpProbe = {
      host: host || 'bilinmiyor',
      port: port || envPort || 0,
      ...(await probeTcp(host, port || envPort)),
    };

    report.osPortCommand = runOsPortCommand(port || envPort);
  } catch (err) {
    report.errors.push(truncate(err?.message || String(err)));
  } finally {
    const lines = [];
    lines.push('# Baglanti Teshisi Raporu');
    lines.push('');
    lines.push(`Tarih: ${report.timestamp}`);
    lines.push(`Calisma dizini: ${report.cwd}`);
    lines.push(`Node surumu: ${report.nodeVersion}`);
    lines.push(`Girilen Base URL: ${report.baseUrlInput}`);
    lines.push('');

    lines.push('## Denenen URLler');
    if (report.attempts.length === 0) {
      lines.push('- Deneme yok.');
    } else {
      report.attempts.forEach((attempt) => {
        const statusText = attempt.status ? String(attempt.status) : '0';
        const result = attempt.ok ? 'PASS' : 'FAIL';
        const errorText = attempt.ok ? '' : ` | hata: ${truncate(attempt.error) || 'Yok'}`;
        lines.push(`- ${result} | ${attempt.url} | durum: ${statusText}${errorText}`);
      });
    }

    lines.push('');
    lines.push('## TCP Port Kontrolu');
    if (!report.tcpProbe) {
      lines.push('- Port kontrolu yapilamadi.');
    } else {
      lines.push(`- Hedef: ${report.tcpProbe.host}:${report.tcpProbe.port}`);
      lines.push(`- Sonuc: ${report.tcpProbe.ok ? 'PASS' : 'FAIL'}`);
      if (!report.tcpProbe.ok && report.tcpProbe.error) {
        lines.push(`- Hata: ${truncate(report.tcpProbe.error)}`);
      }
    }

    lines.push('');
    lines.push('## OS Port Komutu');
    if (!report.osPortCommand) {
      lines.push('- Komut calistirilamadi.');
    } else if (report.osPortCommand.ok) {
      lines.push(`- Komut: ${report.osPortCommand.command}`);
      lines.push(`- Cikti: ${truncate(report.osPortCommand.output) || 'Bos'}`);
    } else {
      lines.push(`- Komut: ${report.osPortCommand.command}`);
      lines.push(`- Hata: ${truncate(report.osPortCommand.error)}`);
    }

    if (report.autoStart.enabled) {
      lines.push('');
      lines.push('## Auto-Start');
      lines.push(`- Etkin: ${report.autoStart.enabled ? 'evet' : 'hayir'}`);
      lines.push(`- Denendi: ${report.autoStart.attempted ? 'evet' : 'hayir'}`);
      lines.push(`- Mod: ${report.autoStart.mode}`);
      lines.push(`- Komut: ${report.autoStart.command || 'yok'}`);
      if (report.autoStart.exitCode !== null || report.autoStart.exitSignal) {
        lines.push(`- Cikis kodu: ${report.autoStart.exitCode ?? 'yok'}`);
        lines.push(`- Sinyal: ${report.autoStart.exitSignal ?? 'yok'}`);
      }
      if (report.autoStart.logs.length > 0) {
        lines.push('');
        lines.push('### Backend Loglari (son 60 satir)');
        report.autoStart.logs.forEach((line) => lines.push(`- ${truncate(line, 300)}`));
      }
    }

    lines.push('');
    lines.push('## Ozet');
    if (report.summary.reachable) {
      lines.push('- Durum: ERISILEBILIR');
      lines.push(`- Basarili URL: ${report.summary.successUrl}`);
    } else {
      lines.push('- Durum: ERISILEMIYOR');
      lines.push('- Not: Sunucuya erisilemiyor.');
    }

    if (report.errors.length > 0) {
      lines.push('');
      lines.push('## Hatalar');
      report.errors.forEach((error) => lines.push(`- ${error}`));
    }

    lines.push('');
    lines.push('## Ne yapmali?');
    buildGuidance().forEach((line) => lines.push(`- ${line}`));

    writeFileSync(reportPath, lines.join('\n'), 'utf-8');

    if (report.summary.reachable) {
      exitCode = 0;
    }
    process.exit(exitCode);
  }
};

main();
