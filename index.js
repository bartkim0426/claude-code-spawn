/**
 * Claude Code Spawn
 * A Node.js module for spawning and managing Claude CLI processes 
 * with proper error handling and logging
 * 
 * @author bartkim0426
 * @version 1.0.0
 */

const { spawn } = require('child_process');
const path = require('path');

// Check for nested Claude execution
if (process.env.CLAUDECODE) {
  console.warn('⚠️  Warning: Running inside Claude Code environment');
  console.warn('   This may cause "Credit balance is too low" errors');
  console.warn('   Consider running from a regular terminal or deploying to a server');
}

/**
 * Run a generic command with options
 * @param {string} command - Command to run
 * @param {string[]} args - Command arguments
 * @param {Object} options - Execution options
 * @param {string} options.cwd - Working directory
 * @param {Object} options.env - Environment variables
 * @param {boolean} options.detached - Run process detached
 * @param {string|Array} options.stdio - Stdio configuration
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {boolean} options.logging - Enable logging
 * @returns {Promise<Object>} Promise that resolves with the result
 */
async function runCommand(command, args = [], options = {}) {
  const {
    cwd = process.cwd(),
    env = process.env,
    detached = false,
    stdio = 'pipe',
    timeout = null,
    logging = true
  } = options;

  return new Promise((resolve, reject) => {
    if (logging) {
      console.log(`[Claude Spawn] Executing: ${command} ${args.join(' ')}`);
      console.log(`[Claude Spawn] Working directory: ${cwd}`);
    }

    const childProcess = spawn(command, args, {
      cwd,
      env,
      detached,
      stdio
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // Set timeout if specified
    let timeoutId;
    if (timeout) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        childProcess.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);
    }

    // Handle stdio if not ignored
    if (stdio === 'pipe') {
      childProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
        if (logging) {
          process.stdout.write(`[stdout] ${data}`);
        }
      });

      childProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
        if (logging) {
          process.stderr.write(`[stderr] ${data}`);
        }
      });
    }

    childProcess.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (logging) {
        console.error(`[Claude Spawn] Process error: ${error.message}`);
      }
      reject(error);
    });

    childProcess.on('exit', (code, signal) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (timedOut) return; // Already rejected

      if (logging) {
        console.log(`[Claude Spawn] Process exited with code ${code} and signal ${signal}`);
      }

      if (code === 0) {
        resolve({
          success: true,
          stdout,
          stderr,
          code,
          pid: childProcess.pid
        });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    // If detached, unref the process
    if (detached) {
      childProcess.unref();
      // For detached processes, resolve immediately with PID
      resolve({
        success: true,
        pid: childProcess.pid,
        detached: true,
        message: 'Process started in background'
      });
    }
  });
}

/**
 * Run Claude CLI with specific options
 * @param {string} prompt - The prompt to send to Claude
 * @param {Object} options - Execution options
 * @param {string} options.cwd - Working directory
 * @param {boolean} options.dangerouslySkipPermissions - Skip permission prompts
 * @param {boolean} options.detached - Run process detached
 * @param {boolean} options.fireAndForget - Run in fire-and-forget mode
 * @param {boolean} options.logging - Enable logging
 * @param {number} options.timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Promise that resolves with the result
 */
async function runClaude(prompt, options = {}) {
  const {
    cwd = process.cwd(),
    dangerouslySkipPermissions = true,
    detached = false,
    fireAndForget = false,
    logging = true,
    ...otherOptions
  } = options;

  const args = [];
  
  if (dangerouslySkipPermissions) {
    args.push('--dangerously-skip-permissions');
  }
  
  args.push(prompt);

  if (fireAndForget) {
    // For fire-and-forget mode, use detached with ignored stdio
    return runCommand('claude', args, {
      cwd,
      detached: true,
      stdio: 'ignore',
      logging,
      ...otherOptions
    });
  }

  // For normal mode, use default options
  return runCommand('claude', args, {
    cwd,
    detached,
    logging,
    ...otherOptions
  });
}

/**
 * Test simple commands to verify spawn functionality
 * @param {Object} options - Test options
 * @param {boolean} options.logging - Enable logging
 * @returns {Promise<Object>} Test results
 */
async function testSimpleCommand(options = {}) {
  const { logging = true } = options;
  const results = {};

  if (logging) {
    console.log('=== Testing Simple Commands ===\n');
  }

  // Test 1: Echo command
  try {
    if (logging) console.log('Test 1: Echo command');
    const echoResult = await runCommand('echo', ['Hello, World!'], { logging });
    results.echo = { success: true, output: echoResult.stdout.trim() };
    if (logging) console.log('✓ Echo test passed:', echoResult.stdout.trim());
  } catch (error) {
    results.echo = { success: false, error: error.message };
    if (logging) console.error('✗ Echo test failed:', error.message);
  }

  if (logging) console.log('\n---\n');

  // Test 2: Claude version
  try {
    if (logging) console.log('Test 2: Claude --version');
    const versionResult = await runCommand('claude', ['--version'], { timeout: 5000, logging });
    results.claudeVersion = { success: true, output: versionResult.stdout.trim() };
    if (logging) console.log('✓ Claude version test passed:', versionResult.stdout.trim());
  } catch (error) {
    results.claudeVersion = { success: false, error: error.message };
    if (logging) console.error('✗ Claude version test failed:', error.message);
  }

  if (logging) console.log('\n---\n');

  // Test 3: Claude with simple prompt
  try {
    if (logging) console.log('Test 3: Claude with simple prompt');
    const promptResult = await runClaude('echo "Testing Claude"', { timeout: 10000, logging });
    results.claudePrompt = { success: true };
    if (logging) console.log('✓ Claude prompt test passed');
  } catch (error) {
    results.claudePrompt = { success: false, error: error.message };
    if (logging) console.error('✗ Claude prompt test failed:', error.message);
  }

  return results;
}

/**
 * Run Claude in fire-and-forget mode for long-running tasks
 * @param {string} prompt - The prompt to send to Claude
 * @param {string} projectDir - The project directory
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Promise that resolves with the process info
 */
async function runClaudeTask(prompt, projectDir, options = {}) {
  const { logging = true } = options;
  
  if (logging) {
    console.log('[Claude Spawn] Starting background task...');
  }
  
  return runClaude(prompt, {
    cwd: projectDir,
    fireAndForget: true,
    dangerouslySkipPermissions: true,
    logging,
    ...options
  });
}

// Export main functions
module.exports = {
  runCommand,
  runClaude,
  runClaudeTask,
  testSimpleCommand,
  
  // Legacy aliases for backwards compatibility
  runClaudeImprovement: runClaudeTask
};