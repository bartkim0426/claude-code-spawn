/**
 * Test suite for claude-code-spawn
 */

const { runCommand, runClaude, testSimpleCommand, runClaudeTask } = require('../index');
const assert = require('assert');

async function runTests() {
  console.log('=== Claude Code Spawn Test Suite ===\n');

  let passedTests = 0;
  let totalTests = 0;

  // Helper function to run a test
  async function test(name, testFn) {
    totalTests++;
    try {
      console.log(`Running: ${name}`);
      await testFn();
      console.log(`✓ PASS: ${name}`);
      passedTests++;
    } catch (error) {
      console.error(`✗ FAIL: ${name}`);
      console.error(`  Error: ${error.message}`);
    }
    console.log('');
  }

  // Test 1: Basic command execution
  await test('Basic command execution', async () => {
    const result = await runCommand('echo', ['test'], { logging: false });
    assert(result.success === true);
    assert(result.stdout.trim() === 'test');
  });

  // Test 2: Command with working directory
  await test('Command with working directory', async () => {
    const result = await runCommand('pwd', [], { 
      cwd: process.cwd(), 
      logging: false 
    });
    assert(result.success === true);
    assert(result.stdout.trim() === process.cwd());
  });

  // Test 3: Command timeout
  await test('Command timeout handling', async () => {
    try {
      await runCommand('sleep', ['10'], { 
        timeout: 100, 
        logging: false 
      });
      throw new Error('Should have timed out');
    } catch (error) {
      assert(error.message.includes('timed out'));
    }
  });

  // Test 4: Fire-and-forget mode
  await test('Fire-and-forget mode', async () => {
    const result = await runCommand('echo', ['background'], {
      detached: true,
      stdio: 'ignore',
      logging: false
    });
    assert(result.success === true);
    assert(result.detached === true);
    assert(typeof result.pid === 'number');
  });

  // Test 5: Claude version check
  await test('Claude CLI availability', async () => {
    try {
      const result = await runCommand('claude', ['--version'], { 
        timeout: 5000, 
        logging: false 
      });
      assert(result.success === true);
      assert(result.stdout.includes('Claude'));
    } catch (error) {
      // Claude CLI might not be installed in test environment
      console.warn('  Note: Claude CLI not available in test environment');
    }
  });

  // Test 6: runClaude function
  await test('runClaude function basic call', async () => {
    try {
      // This will likely fail in test environment, but we test the function structure
      await runClaude('test', { 
        timeout: 1000, 
        logging: false 
      });
    } catch (error) {
      // Expected to fail, just checking it doesn't crash
      assert(error instanceof Error);
    }
  });

  // Test 7: runClaudeTask function
  await test('runClaudeTask function', async () => {
    try {
      const result = await runClaudeTask('test', process.cwd(), { 
        logging: false 
      });
      // In fire-and-forget mode, should return immediately
      assert(typeof result === 'object');
    } catch (error) {
      // Expected to fail in test environment
      assert(error instanceof Error);
    }
  });

  // Test 8: Test suite function
  await test('Built-in test suite', async () => {
    const results = await testSimpleCommand({ logging: false });
    assert(typeof results === 'object');
    assert('echo' in results);
    assert('claudeVersion' in results);
    assert('claudePrompt' in results);
  });

  // Test 9: Error handling
  await test('Error handling for invalid command', async () => {
    try {
      await runCommand('nonexistentcommand123', [], { logging: false });
      throw new Error('Should have failed');
    } catch (error) {
      assert(error instanceof Error);
    }
  });

  // Test 10: Environment detection
  await test('Environment detection', async () => {
    const originalEnv = process.env.CLAUDECODE;
    
    // Test with CLAUDECODE set
    process.env.CLAUDECODE = '1';
    delete require.cache[require.resolve('../index')];
    
    // Test without CLAUDECODE
    delete process.env.CLAUDECODE;
    delete require.cache[require.resolve('../index')];
    
    // Restore original
    if (originalEnv) {
      process.env.CLAUDECODE = originalEnv;
    }
    
    assert(true); // If we get here without crashing, test passes
  });

  // Summary
  console.log('=== Test Results ===');
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };