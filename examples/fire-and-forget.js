/**
 * Fire-and-forget mode example for claude-code-spawn
 * Demonstrates running Claude in background mode
 */

const { runClaude, runClaudeTask } = require('../index');
const path = require('path');

async function fireAndForgetExample() {
  console.log('=== Fire-and-Forget Mode Example ===\n');

  // 1. Simple fire-and-forget
  console.log('1. Starting Claude in fire-and-forget mode...');
  try {
    const result = await runClaude('Create a simple "Hello World" example in Python', {
      fireAndForget: true,
      logging: true
    });
    
    console.log('✓ Claude process started in background');
    console.log('Process ID:', result.pid);
    console.log('Detached:', result.detached);
    console.log('Message:', result.message);
    
  } catch (error) {
    console.error('✗ Failed to start Claude:', error.message);
  }

  console.log('\n---\n');

  // 2. Task-specific fire-and-forget
  console.log('2. Starting Claude task in specific directory...');
  try {
    const taskResult = await runClaudeTask(
      'Analyze the current directory structure and create a summary',
      process.cwd(),
      { logging: true }
    );
    
    console.log('✓ Claude task started successfully');
    console.log('Task PID:', taskResult.pid);
    
  } catch (error) {
    console.error('✗ Failed to start Claude task:', error.message);
  }

  console.log('\n---\n');

  // 3. Multiple parallel tasks
  console.log('3. Starting multiple Claude tasks...');
  const tasks = [
    'What is 2+2?',
    'What is the current date format?',
    'List 3 programming languages'
  ];

  const promises = tasks.map(async (prompt, index) => {
    try {
      const result = await runClaude(prompt, {
        fireAndForget: true,
        logging: false  // Disable logging for cleaner output
      });
      console.log(`✓ Task ${index + 1} started (PID: ${result.pid})`);
      return result;
    } catch (error) {
      console.error(`✗ Task ${index + 1} failed:`, error.message);
      return null;
    }
  });

  const results = await Promise.all(promises);
  const successful = results.filter(r => r !== null);
  
  console.log(`\n📊 Started ${successful.length}/${tasks.length} tasks successfully`);

  console.log('\n💡 Note: These tasks are running in background');
  console.log('   You can continue with other work while they execute');
  console.log('   Check your system processes to see them running');

  console.log('\n=== Example Complete ===');
}

// Utility function to check running processes
async function checkRunningClaude() {
  const { runCommand } = require('../index');
  
  console.log('Checking for running Claude processes...');
  try {
    const result = await runCommand('ps', ['aux'], { logging: false });
    const claudeProcesses = result.stdout
      .split('\n')
      .filter(line => line.includes('claude') && !line.includes('grep'));
    
    if (claudeProcesses.length > 0) {
      console.log(`Found ${claudeProcesses.length} Claude processes:`);
      claudeProcesses.forEach((proc, i) => {
        console.log(`  ${i + 1}. ${proc.trim()}`);
      });
    } else {
      console.log('No Claude processes found');
    }
  } catch (error) {
    console.error('Failed to check processes:', error.message);
  }
}

// Run the example
if (require.main === module) {
  fireAndForgetExample()
    .then(() => {
      console.log('\n🔍 Checking running processes...');
      return checkRunningClaude();
    })
    .catch(console.error);
}

module.exports = { fireAndForgetExample, checkRunningClaude };