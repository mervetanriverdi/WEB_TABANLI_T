#!/usr/bin/env node
import { spawn } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { cwd, platform, version } from 'process';

const args = process.argv.slice(2);
const getArg = (key, fallback) => {
  const index = args.indexOf(key);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
};

const normalizeBaseUrl = (url) => (url.endsWith('/') ? url.slice(0, -1) : url);
const baseUrl = normalizeBaseUrl(getArg('--base-url', 'http://127.0.0.1:3000'));
const reportPath = 'MAP/BACKEND_STARTUP_LOG.md';

const now = new Date().toISOString();
const maxLogLines = 80;

const truncate = (text, max = 300) => {
  if (!text) return '';
  const cleaned = String(text).replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  return cleaned.length > max ? `${cleaned.slice(0, max)}...` : cleaned;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, timeoutMs = 2000) => {
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

const createLogBuffer = (limit) => {
  const lines = [];
  const push = (source, chunk) => {
    const text = String(chunk || '');
    const parts = text.split(/\r?\n/).filter(Boolean);
    for (const part of parts) {
      lines.push(`[${source}] ${part}`);
      if (lines.length > limit) lines.shift();
    }
  };
  return { lines, push };
};

const selectCommand = () => {
  const distPath = 'backend/dist/main.js';
  const hasDist = existsSync(distPath);
  if (hasDist) {
    return { command: 'node', args: ['dist/main.js'], cwd: 'backend', mode: 'prod' };
  }
  const npmCmd = platform === 'win32' ? 'npm.cmd' : 'npm';
  return { command: npmCmd, args: ['--prefix', 'backend', 'run', 'start:dev'], cwd: cwd(), mode: 'dev' };
};

const report = {
  timestamp: now,
  cwd: cwd(),
  nodeVersion: version,
  baseUrl,
  command: null,
  mode: null,
  exitCode: null,
  exitSignal: null,
  attempts: [],
  reachable: false,
  logs: [],
  errors: [],
};

const addAttempt = (url, res) => {
  report.attempts.push({
    url,
    ok: res.ok,
    status: res.status,
    error: res.error,
  });
};

const analyzeLogs = () => {
  const joined = report.logs.join(' ').toLowerCase();
  const lines = [];
  if (report.reachable) {
    lines.push('Sunucu /health uzerinden erisilebilir hale geldi.');
    return lines;
  }
  if (report.exitCode !== null) {
    lines.push('Backend erken kapandi; loglari kontrol edin.');
  }
  if (joined.includes('database_url')) {
    lines.push('DATABASE_URL eksik veya hatali olabilir.');
  }
  if (joined.includes('password authentication failed')) {
    lines.push('DB sifresi hatali olabilir (POSTGRES_PASSWORD).');
  }
  if (joined.includes('connect econnrefused') || joined.includes('econnrefused')) {
    lines.push('DB portuna baglanti reddedildi; Postgres calisiyor mu kontrol edin.');
  }
  if (joined.includes('does not exist')) {
    lines.push('DB veya tablo bulunamadi; veritabani adi dogru mu kontrol edin.');
  }
  if (joined.includes('timeout') || joined.includes('timed out')) {
    lines.push('Zaman asimi; DB host/port erisilebilir mi kontrol edin.');
  }
  if (lines.length === 0) {
    lines.push('Genel: backend calismiyor veya port/host yanlis.');
  }
  lines.push('PORT degeri dogru mu kontrol edin.');
  lines.push('/health route uzerinden erisim olmalidir.');
  return lines;
};

const main = async () => {
  console.log(`Backend erisim testi basladi. Base URL: ${baseUrl}`);
  let child = null;
  const logBuffer = createLogBuffer(maxLogLines);

  try {
    const { command, args: cmdArgs, cwd: cmdCwd, mode } = selectCommand();
    report.command = `${command} ${cmdArgs.join(' ')}`;
    report.mode = mode;

    child = spawn(command, cmdArgs, {
      cwd: cmdCwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (data) => logBuffer.push('stdout', data));
    child.stderr.on('data', (data) => logBuffer.push('stderr', data));
    child.on('exit', (code, signal) => {
      report.exitCode = code;
      report.exitSignal = signal;
    });
    child.on('error', (err) => {
      report.errors.push(`Backend baslatma hatasi: ${truncate(err?.message || String(err))}`);
    });

    for (let i = 0; i < 10; i += 1) {
      const healthUrl = `${baseUrl}/health`;
      const res = await fetchWithTimeout(healthUrl, 1500);
      addAttempt(healthUrl, res);
      if (res.ok) {
        report.reachable = true;
        break;
      }
      await sleep(1000);
    }
  } catch (err) {
    report.errors.push(truncate(err?.message || String(err)));
  } finally {
    report.logs = logBuffer.lines;
    if (child && !child.killed) {
      child.kill();
    }

    const lines = [];
    lines.push('# Backend Baslangic Raporu');
    lines.push('');
    lines.push(`Tarih: ${report.timestamp}`);
    lines.push(`Calisma dizini: ${report.cwd}`);
    lines.push(`Node surumu: ${report.nodeVersion}`);
    lines.push(`Base URL: ${report.baseUrl}`);
    lines.push(`Komut: ${report.command || 'yok'}`);
    lines.push(`Mod: ${report.mode || 'bilinmiyor'}`);

    if (report.exitCode !== null || report.exitSignal) {
      lines.push(`Cikis kodu: ${report.exitCode ?? 'yok'}`);
      lines.push(`Sinyal: ${report.exitSignal ?? 'yok'}`);
    }

    lines.push('');
    lines.push('## /health Denemeleri');
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
    lines.push('## Backend Loglari (son 80 satir)');
    if (report.logs.length === 0) {
      lines.push('- Log yok.');
    } else {
      report.logs.forEach((line) => lines.push(`- ${truncate(line, 400)}`));
    }

    if (report.errors.length > 0) {
      lines.push('');
      lines.push('## Hatalar');
      report.errors.forEach((error) => lines.push(`- ${error}`));
    }

    lines.push('');
    lines.push('## Neden Calismiyor?');
    analyzeLogs().forEach((line) => lines.push(`- ${line}`));

    writeFileSync(reportPath, lines.join('\n'), 'utf-8');

    if (report.reachable) {
      process.exit(0);
    }
    process.exit(1);
  }
};

main();
