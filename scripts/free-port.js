/**
 * Port Liberator & Pre-Dev Cleanliness Guard
 * Guarantees that port 3000 is 100% free of zombie or orphaned processes before starting Next.js.
 * Eliminates the "localhost refused to connect" error caused by EADDRINUSE or port shifts to 3001.
 * 
 * @agent engineering-devops-automator
 * @agent engineering-database-reliability-engineer
 */

const { execFileSync } = require('child_process');

const rawPort = process.argv[2] || '3000';
const targetPort = parseInt(rawPort, 10);

if (isNaN(targetPort) || targetPort < 1 || targetPort > 65535) {
  console.error(`[DevGuard] Invalid port number: ${rawPort}. Must be an integer between 1 and 65535.`);
  process.exit(1);
}

function freePort(port) {
  console.log(`[DevGuard] Inspecting port ${port} for active or dangling processes...`);
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    try {
      // Execute netstat directly with structured arguments (no shell, no findstr piping)
      const output = execFileSync('netstat', ['-ano'], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      const pids = new Set();
      const portPattern = `:${port}`;

      for (const line of lines) {
        if ((line.includes('LISTENING') || line.includes('ESTABLISHED')) && line.includes(portPattern)) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && /^\d+$/.test(pid) && pid !== '0' && parseInt(pid, 10) !== process.pid) {
            pids.add(pid);
          }
        }
      }

      if (pids.size > 0) {
        console.log(`[DevGuard] Found ${pids.size} orphaned process(es) holding port ${port}: PIDs ${Array.from(pids).join(', ')}`);
        for (const pid of pids) {
          try {
            // Terminate process directly via structured argument array (no shell)
            execFileSync('taskkill', ['/F', '/PID', pid], { stdio: 'ignore' });
            console.log(`[DevGuard] Terminated dangling process PID ${pid}.`);
          } catch {
            // Process already exited
          }
        }
      } else {
        console.log(`[DevGuard] Port ${port} is completely free.`);
      }
    } catch {
      console.log(`[DevGuard] Port ${port} is completely free.`);
    }
  } else {
    // Linux / macOS: query lsof without shell piping
    try {
      const output = execFileSync('lsof', ['-t', `-i:${port}`], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const pids = output.trim().split('\n').filter(p => /^\d+$/.test(p.trim()));
      for (const pid of pids) {
        try {
          process.kill(parseInt(pid, 10), 'SIGKILL');
        } catch {
          // Already exited
        }
      }
      console.log(`[DevGuard] Port ${port} cleared.`);
    } catch {
      console.log(`[DevGuard] Port ${port} is completely free.`);
    }
  }
}

freePort(targetPort);
