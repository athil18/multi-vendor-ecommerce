/**
 * Nexus Autonomous Commerce Grid - Local Development Supervisor Engine
 * 
 * Provides persistent process supervision, single-instance port locking,
 * health readiness verification, non-blocking log redirection, and automatic
 * crash recovery with exponential backoff.
 * 
 * @agent engineering-devops-automator
 * @agent engineering-infrastructure-maintainer
 * @agent engineering-backend-architect
 * @agent engineering-developer-tooling-engineer
 * @agent security-secrets-credential-engineer
 * @agent testing-qa-automation-engineer
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');

// Paths
const ROOT_DIR = path.resolve(__dirname, '../..');
const APPS_DIR = fs.existsSync(path.join(ROOT_DIR, 'apps')) ? path.join(ROOT_DIR, 'apps') : ROOT_DIR;
const LOGS_DIR = path.join(ROOT_DIR, 'logs');
const STATE_FILE = path.join(ROOT_DIR, '.dev-state.json');
const NEXTJS_LOG = path.join(LOGS_DIR, 'nextjs.log');
const SUPERVISOR_LOG = path.join(LOGS_DIR, 'supervisor.log');

const PORT_NEXT = 3000;
const PORT_POSTGRES = 5432;
const HEALTH_URL = `http://localhost:${PORT_NEXT}/api/health/live`;
const MAX_RESTARTS = 3;
const RESTART_WINDOW_MS = 60000; // 60 seconds

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function logSupervisor(message) {
  const timestamp = new Date().toISOString();
  // Sanitize any secrets/credentials matching key patterns
  const sanitized = message
    .replace(/(password|jwt_secret|stripe_secret_key)=[^&\s]+/gi, '$1=***REDACTED***')
    .replace(/(Bearer\s+)[A-Za-z0-9\-_.]+/gi, '$1***REDACTED***');
  const line = `[${timestamp}] [Supervisor] ${sanitized}\n`;
  try {
    fs.appendFileSync(SUPERVISOR_LOG, line);
  } catch (e) {
    // Ignore write errors
  }
  if (process.env.VERBOSE || !process.env.DAEMON_MODE) {
    process.stdout.write(line);
  }
}

function checkPort(port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      resolve(false);
    });

    socket.connect(port, '127.0.0.1');
  });
}

function checkHttpHealth(url, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          ok: res.statusCode === 200,
          statusCode: res.statusCode,
          data: data.trim()
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'TIMEOUT' });
    });

    req.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });
  });
}

function isPidAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function readState() {
  if (!fs.existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    logSupervisor(`Error writing state: ${e.message}`);
  }
}

function clearState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      fs.unlinkSync(STATE_FILE);
    } catch (e) {
      // Ignore
    }
  }
}

async function killProcessTree(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /T /PID ${pid} 2>nul`);
    } else {
      process.kill(-pid, 'SIGKILL');
    }
  } catch (e) {
    // Process might already be dead
  }
}

async function killPortProcesses(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING 2>nul`, { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid) && parseInt(pid, 10) !== process.pid) {
          logSupervisor(`Releasing port ${port} occupied by PID ${pid}...`);
          try {
            execSync(`taskkill /F /T /PID ${pid} 2>nul`);
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    // Netstat found nothing
  }
}

// -------------------------------------------------------------
// Core Actions
// -------------------------------------------------------------

async function getStatus() {
  const state = readState();
  const nextPortOpen = await checkPort(PORT_NEXT);
  const postgresPortOpen = await checkPort(PORT_POSTGRES);
  const health = nextPortOpen ? await checkHttpHealth(HEALTH_URL) : { ok: false, error: 'PORT_CLOSED' };

  const supervisorAlive = state && state.supervisorPid ? isPidAlive(state.supervisorPid) : false;
  const nextAlive = state && state.nextPid ? isPidAlive(state.nextPid) : false;

  return {
    state,
    supervisorAlive,
    nextAlive,
    nextPortOpen,
    postgresPortOpen,
    health,
    isReady: nextPortOpen && health.ok
  };
}

async function printStatus() {
  console.log('\n===============================================================');
  console.log('  🚀 NEXUS MULTI-VENDOR E-COMMERCE - LOCAL PLATFORM STATUS');
  console.log('===============================================================');
  
  const status = await getStatus();
  
  console.log(`  Target URL         : http://localhost:${PORT_NEXT}`);
  console.log(`  Next.js (Port ${PORT_NEXT}) : ${status.nextPortOpen ? '🟢 ACTIVE & LISTENING' : '🔴 INACTIVE / CLOSED'}`);
  console.log(`  PostgreSQL (${PORT_POSTGRES}) : ${status.postgresPortOpen ? '🟢 CONNECTED (Port 5432)' : '🔴 DISCONNECTED'}`);
  console.log(`  Liveness Probe     : ${status.health.ok ? '🟢 HTTP 200 { status: "live" }' : `🔴 FAILED (${status.health.error || status.health.statusCode})`}`);
  console.log(`  Supervisor Daemon  : ${status.supervisorAlive ? `🟢 RUNNING (PID: ${status.state.supervisorPid})` : '⚪ IDLE / STOPPED'}`);
  console.log(`  Next.js Process    : ${status.nextAlive ? `🟢 RUNNING (PID: ${status.state.nextPid})` : (status.nextPortOpen ? '🟡 ACTIVE (External PID)' : '⚪ STOPPED')}`);
  
  if (status.state) {
    console.log(`  Uptime Started     : ${status.state.startTime || 'N/A'}`);
    console.log(`  Recent Restarts    : ${status.state.restarts || 0}`);
  }
  
  console.log(`  Logs               : ${NEXTJS_LOG}`);
  console.log('===============================================================\n');

  return status;
}

async function runDaemon() {
  process.env.DAEMON_MODE = '1';
  logSupervisor('Starting Nexus Local Dev Supervisor Daemon...');

  // Check if already running
  const existing = await getStatus();
  if (existing.isReady && existing.supervisorAlive) {
    logSupervisor(`Supervisor is already active (PID: ${existing.state.supervisorPid}). Exiting daemon launch.`);
    process.exit(0);
  }

  // If port 3000 is occupied but supervisor is dead, clean up old process
  if (existing.nextPortOpen && !existing.supervisorAlive) {
    logSupervisor('Port 3000 occupied by stale process. Clearing port before launch...');
    await killPortProcesses(PORT_NEXT);
    await new Promise(r => setTimeout(r, 1000));
  }

  let restartTimestamps = [];
  let nextChild = null;

  function spawnNext() {
    const isProd = process.env.PROD_MODE === '1' || process.argv.includes('--prod');
    const nextScript = isProd ? 'start' : 'dev';
    logSupervisor(`Spawning Next.js [${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}] server in ${APPS_DIR}...`);

    const outLog = fs.openSync(NEXTJS_LOG, 'a');
    const errLog = fs.openSync(NEXTJS_LOG, 'a');

    // Launch npm run dev or start
    const isWin = process.platform === 'win32';
    const npmCmd = isWin ? 'npm.cmd' : 'npm';

    nextChild = spawn(npmCmd, ['run', nextScript], {
      cwd: APPS_DIR,
      env: { ...process.env, PORT: `${PORT_NEXT}`, NODE_ENV: isProd ? 'production' : 'development' },
      stdio: ['ignore', outLog, errLog],
      detached: false,
      shell: isWin
    });

    const state = {
      supervisorPid: process.pid,
      nextPid: nextChild.pid,
      status: 'STARTING',
      port: PORT_NEXT,
      startTime: new Date().toISOString(),
      restarts: restartTimestamps.length,
      url: `http://localhost:${PORT_NEXT}`
    };
    writeState(state);
    logSupervisor(`Next.js child spawned with PID ${nextChild.pid}`);

    nextChild.on('exit', (code, signal) => {
      logSupervisor(`Next.js process exited with code=${code} signal=${signal}`);
      if (state.status === 'STOPPING') {
        logSupervisor('Graceful termination confirmed.');
        return;
      }

      const now = Date.now();
      restartTimestamps = restartTimestamps.filter(t => now - t < RESTART_WINDOW_MS);
      restartTimestamps.push(now);

      if (restartTimestamps.length > MAX_RESTARTS) {
        logSupervisor(`[CRITICAL] Next.js exceeded max restarts (${MAX_RESTARTS} in ${RESTART_WINDOW_MS / 1000}s). Stopping supervisor.`);
        state.status = 'CRASHED';
        writeState(state);
        process.exit(1);
      } else {
        const delay = Math.min(1000 * Math.pow(2, restartTimestamps.length), 8000);
        logSupervisor(`Restarting Next.js in ${delay}ms (restart #${restartTimestamps.length})...`);
        setTimeout(() => {
          spawnNext();
        }, delay);
      }
    });
  }

  // Graceful shutdown signals
  const cleanup = async () => {
    logSupervisor('Termination signal received. Shutting down supervisor and application...');
    const state = readState() || {};
    state.status = 'STOPPING';
    writeState(state);

    if (nextChild && nextChild.pid) {
      await killProcessTree(nextChild.pid);
    }
    await killPortProcesses(PORT_NEXT);
    clearState();
    logSupervisor('Nexus Local Dev Supervisor cleanly stopped.');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  spawnNext();

  // Polling loop for health readiness
  let isMarkedReady = false;
  const pollInterval = setInterval(async () => {
    const health = await checkHttpHealth(HEALTH_URL);
    if (health.ok) {
      if (!isMarkedReady) {
        isMarkedReady = true;
        logSupervisor(`🟢 Nexus Platform is READY and HEALTHY at http://localhost:${PORT_NEXT}`);
        const state = readState() || {};
        state.status = 'READY';
        state.lastHealthCheck = new Date().toISOString();
        writeState(state);
      }
    } else {
      if (isMarkedReady) {
        logSupervisor(`🟡 Health probe warning: ${health.error || health.statusCode}`);
        const state = readState() || {};
        state.status = 'UNHEALTHY';
        writeState(state);
      }
    }
  }, 3000);
}

async function startSupervisorBg(isProd = false) {
  if (args.includes('--prod') || args.includes('-p')) {
    isProd = true;
  }
  console.log(`🚀 Initializing Nexus Local ${isProd ? 'Production' : 'Dev'} Background Supervisor...`);

  const status = await getStatus();
  if (status.isReady) {
    console.log(`✅ Nexus Platform is already running and healthy at http://localhost:${PORT_NEXT}`);
    return;
  }

  // Spawn background daemon process
  const daemonArgs = isProd ? [__filename, 'daemon', '--prod'] : [__filename, 'daemon'];
  const child = spawn(process.execPath, daemonArgs, {
    detached: true,
    stdio: 'ignore',
    cwd: ROOT_DIR,
    windowsHide: true,
    env: { ...process.env, PROD_MODE: isProd ? '1' : '0' }
  });

  child.unref();
  console.log(`Supervisor daemon detached with PID ${child.pid}.`);
  console.log(`Waiting for service readiness on port ${PORT_NEXT}...`);

  // Wait up to 35 seconds for health probe
  const startTime = Date.now();
  const maxWait = 35000;
  let ready = false;

  while (Date.now() - startTime < maxWait) {
    process.stdout.write('.');
    const probe = await checkHttpHealth(HEALTH_URL, 1500);
    if (probe.ok) {
      ready = true;
      break;
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('');

  if (ready) {
    console.log(`🎉 SUCCESS: Nexus Platform is live at http://localhost:${PORT_NEXT}`);
  } else {
    console.log(`⚠️ Service is still initializing in background. Check logs at: ${NEXTJS_LOG}`);
  }
}

async function stopSupervisor() {
  console.log('🛑 Stopping Nexus Local Development Environment...');
  const state = readState();

  if (state) {
    if (state.supervisorPid && isPidAlive(state.supervisorPid)) {
      console.log(`Terminating supervisor daemon (PID: ${state.supervisorPid})...`);
      await killProcessTree(state.supervisorPid);
    }
    if (state.nextPid && isPidAlive(state.nextPid)) {
      console.log(`Terminating Next.js process (PID: ${state.nextPid})...`);
      await killProcessTree(state.nextPid);
    }
  }

  // Ensure port 3000 is released
  await killPortProcesses(PORT_NEXT);
  clearState();

  console.log('✅ Nexus Local Development Environment has been cleanly stopped.');
}

async function openBrowser() {
  const status = await getStatus();
  if (!status.isReady) {
    console.log('Service not running or still compiling. Starting background daemon first...');
    await startSupervisorBg();
  }

  const url = `http://localhost:${PORT_NEXT}`;
  console.log(`🌐 Opening browser at ${url}...`);

  try {
    if (process.platform === 'win32') {
      execSync(`start ${url}`);
    } else if (process.platform === 'darwin') {
      execSync(`open ${url}`);
    } else {
      execSync(`xdg-open ${url}`);
    }
  } catch (e) {
    console.log(`Unable to auto-launch browser. Please visit ${url} directly.`);
  }
}

// -------------------------------------------------------------
// CLI Dispatcher
// -------------------------------------------------------------

const args = process.argv.slice(2);
const command = args[0] || 'status';

(async () => {
  switch (command) {
    case 'daemon':
      await runDaemon();
      break;
    case 'up':
    case 'start':
      if (args.includes('--daemon') || args.includes('-d')) {
        await runDaemon();
      } else {
        await startSupervisorBg(args.includes('--prod') || args.includes('-p'));
      }
      break;
    case 'prod':
      await startSupervisorBg(true);
      break;
    case 'down':
    case 'stop':
      await stopSupervisor();
      break;
    case 'restart':
      await stopSupervisor();
      await new Promise(r => setTimeout(r, 2000));
      await startSupervisorBg();
      break;
    case 'status':
      await printStatus();
      break;
    case 'open':
      await openBrowser();
      break;
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Usage: node dev-supervisor.js [up|down|status|restart|open|daemon]');
      process.exit(1);
  }
})();
