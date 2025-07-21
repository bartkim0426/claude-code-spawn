const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);
const appendFile = promisify(fs.appendFile);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

class Logger {
  constructor(options = {}) {
    this.logDir = options.logDir || path.join(process.cwd(), 'claude-spawn-logs');
    this.logLevel = options.logLevel || 'full';
    this.saveLog = options.saveLog !== false;
    this.logToConsole = options.logToConsole !== false;
    this.sessionId = `${Date.now()}-${process.pid}`;
    this.logFile = null;
    this.startTime = Date.now();
  }

  async initialize(command, args) {
    if (!this.saveLog) return;

    const date = new Date().toISOString().split('T')[0];
    const dateDir = path.join(this.logDir, date);
    
    await mkdir(dateDir, { recursive: true });
    
    this.logFile = path.join(dateDir, `session-${this.sessionId}.log`);
    
    await this.writeLog({
      type: 'session_start',
      sessionId: this.sessionId,
      command,
      args,
      cwd: process.cwd(),
      timestamp: new Date().toISOString(),
      pid: process.pid,
      nodeVersion: process.version
    });
  }

  async writeLog(data) {
    if (!this.saveLog || !this.logFile) return;
    
    const line = JSON.stringify({
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      elapsed: Date.now() - this.startTime
    }) + '\n';
    
    await appendFile(this.logFile, line);
  }

  logStdout(data) {
    const text = data.toString();
    
    if (this.logToConsole) {
      process.stdout.write(`[stdout] ${text}`);
    }
    
    if (this.logLevel === 'full') {
      this.writeLog({
        type: 'stdout',
        data: text
      }).catch(err => console.error('Log write error:', err));
    }
  }

  logStderr(data) {
    const text = data.toString();
    
    if (this.logToConsole) {
      process.stderr.write(`[stderr] ${text}`);
    }
    
    if (this.logLevel === 'full') {
      this.writeLog({
        type: 'stderr',
        data: text
      }).catch(err => console.error('Log write error:', err));
    }
  }

  async logExit(code, signal) {
    await this.writeLog({
      type: 'session_end',
      code,
      signal,
      duration: Date.now() - this.startTime
    });
  }

  async logError(error) {
    await this.writeLog({
      type: 'error',
      message: error.message,
      stack: error.stack
    });
  }

  static async getRecentSessions(logDir, limit = 10) {
    const logsPath = logDir || path.join(process.cwd(), 'claude-spawn-logs');
    const sessions = [];
    
    try {
      const dates = await readdir(logsPath);
      
      for (const date of dates.sort().reverse()) {
        const dateDir = path.join(logsPath, date);
        const files = await readdir(dateDir);
        
        for (const file of files.sort().reverse()) {
          if (file.endsWith('.log')) {
            const logPath = path.join(dateDir, file);
            const firstLine = await readFirstLine(logPath);
            
            if (firstLine) {
              try {
                const sessionStart = JSON.parse(firstLine);
                if (sessionStart.type === 'session_start') {
                  sessions.push({
                    sessionId: sessionStart.sessionId,
                    command: sessionStart.command,
                    args: sessionStart.args,
                    timestamp: sessionStart.timestamp,
                    logFile: logPath
                  });
                  
                  if (sessions.length >= limit) {
                    return sessions;
                  }
                }
              } catch (e) {
                // Skip invalid log files
              }
            }
          }
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    
    return sessions;
  }

  static async viewLog(sessionId, logDir) {
    const logsPath = logDir || path.join(process.cwd(), 'claude-spawn-logs');
    const sessions = await Logger.getRecentSessions(logsPath, 100);
    
    const session = sessions.find(s => s.sessionId === sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const content = await readFile(session.logFile, 'utf8');
    const lines = content.trim().split('\n');
    const logs = [];
    
    for (const line of lines) {
      try {
        logs.push(JSON.parse(line));
      } catch (e) {
        // Skip invalid lines
      }
    }
    
    return logs;
  }
}

async function readFirstLine(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  
  return new Promise((resolve, reject) => {
    let firstLine = '';
    
    stream.on('data', chunk => {
      const lines = chunk.split('\n');
      firstLine += lines[0];
      
      if (lines.length > 1) {
        stream.destroy();
        resolve(firstLine);
      }
    });
    
    stream.on('end', () => resolve(firstLine));
    stream.on('error', reject);
  });
}

module.exports = Logger;