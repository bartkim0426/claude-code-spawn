/**
 * Basic usage example for claude-code-spawn
 */

const { runCommand, runClaude, testSimpleCommand } = require('../index');

async function basicExample() {
  console.log('=== Claude Code Spawn - Basic Usage Example ===\n');

  // 1. Test basic functionality
  console.log('1. Running test suite...');
  const testResults = await testSimpleCommand();
  console.log('Test results:', testResults);

  console.log('\n---\n');

  // 2. Simple command execution
  console.log('2. Running simple command...');
  try {
    const result = await runCommand('ls', ['-la'], { 
      logging: true,
      timeout: 5000 
    });
    console.log('✓ Command executed successfully');
    console.log('Files found:', result.stdout.split('\n').length - 1, 'entries');
  } catch (error) {
    console.error('✗ Command failed:', error.message);
  }

  console.log('\n---\n');

  // 3. Claude CLI execution
  console.log('3. Running Claude CLI...');
  try {
    const result = await runClaude('What is the capital of France? Answer briefly.', {
      timeout: 15000,
      logging: true
    });
    console.log('✓ Claude responded successfully');
  } catch (error) {
    console.error('✗ Claude execution failed:', error.message);
    if (error.message.includes('Credit balance')) {
      console.log('  💡 This is likely due to running inside Claude Code environment');
      console.log('     Try running from a regular terminal or server');
    }
  }

  console.log('\n=== Example Complete ===');
}

// Run the example
if (require.main === module) {
  basicExample().catch(console.error);
}

module.exports = { basicExample };